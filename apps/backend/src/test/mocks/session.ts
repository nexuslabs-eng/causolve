import session from "express-session";
import { vi } from "vite-plus/test";

// session.ts's real store (connect-pg-simple) talks to Postgres directly,
// bypassing the Prisma mock — so it needs its own swap-out. Tests get an
// in-memory store instead; app.ts and session.ts stay untouched.
vi.mock("../../infrastructure/session.js", () => ({
  createSessionMiddleware: () =>
    session({
      secret: "test-session-secret-at-least-32-characters-long",
      name: "sessionId",
      resave: false,
      saveUninitialized: false,
    }),
  destroyAllSessionsForUser: vi.fn(),
}));
