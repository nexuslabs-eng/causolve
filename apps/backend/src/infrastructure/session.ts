import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { prisma } from '@causolve/database';
import { env } from './keys.js';

// Extends express-session's SessionData with our own field. userId is the
// ONLY thing we trust from the session cookie — everything else about the
// user (role, organizationId, etc.) gets re-fetched fresh from Postgres on
// every request by the auth middleware, so a role/org change takes effect
// immediately instead of waiting for the old session to expire.
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    // Transient fields, only ever alive between the redirect to Google and
    // the callback a few seconds later — cleared immediately once the
    // callback consumes them. oauthState guards against CSRF (confirms the
    // callback really followed our own redirect); oauthCodeVerifier is the
    // PKCE secret half, proving the callback's code-exchange request came
    // from the same party that started the flow.
    oauthState?: string;
    oauthCodeVerifier?: string;
    // Set immediately before the redirect back to the frontend on a failed
    // OAuth attempt - read once by getSession's next /auth/session check
    // and cleared there, so it never lands in a URL and never persists
    // past that one check.
    oauthError?: string;
  }
}

const PgSession = connectPgSimple(session);

// Session max age in milliseconds. With rolling: true below, the store's
// `expire` column keeps getting pushed forward to (last touch + this) on
// every request.
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Postgres-backed session store, reusing the same database as Prisma — but
// not through Prisma itself; connect-pg-simple talks to Postgres directly.
// createTableIfMissing is deliberately false: the `session` table is a real
// Prisma model (packages/database/prisma/schema.prisma) so it's tracked by
// migrations instead of appearing as untracked drift later.
const createSessionStore = () => {
  return new PgSession({
    conString: env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: false,
  });
};

export const createSessionMiddleware = () => {
  const isProd = env.NODE_ENV === 'production';

  return session({
    secret: env.SESSION_SECRET,
    name: 'sessionId', // custom cookie name, avoids the default 'connect.sid'
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create a session until something is stored
    store: createSessionStore(),
    cookie: {
      maxAge: SESSION_MAX_AGE,
      httpOnly: true, // not readable from client-side JS
      secure: isProd, // HTTPS only in production
      sameSite: isProd ? 'none' : 'lax', // 'none' requires secure: true, hence the pairing above
    },
    rolling: true, // refresh expiration on every response
  });
};

// Destroys every session belonging to a given user — not just the current
// one. Needed after a password reset: session-based auth never re-checks
// the password on existing requests, so without this, anyone already
// logged in (e.g. an attacker who had the old, compromised password)
// would stay logged in indefinitely even after the password changes.
export const destroyAllSessionsForUser = async (userId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { sess: { path: ['userId'], equals: userId } },
  });
};
