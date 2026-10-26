import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@causolve/database';
import { env } from '../infrastructure/keys.js';
import { logger } from '../infrastructure/logger.js';
import { sendError } from '../infrastructure/responseHandler.js';

const isDev = env.NODE_ENV === 'development';

// The session store (connect-pg-simple) talks to Postgres directly via a
// raw `pg` Pool, bypassing Prisma entirely — so a database outage there
// surfaces as a plain Node network error, not a Prisma error class. These
// are the standard Node errno codes for "couldn't reach the host at all"
// (DNS failure, refused connection, timed out), as opposed to a Postgres
// error response (a real connection that returned an error), which would
// have a different shape entirely.
const DATABASE_CONNECTIVITY_ERROR_CODES = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ETIMEDOUT',
]);

const isDatabaseConnectivityError = (err: Error): boolean => {
  const code = (err as NodeJS.ErrnoException).code;
  return typeof code === 'string' && DATABASE_CONNECTIVITY_ERROR_CODES.has(code);
};

export class ErrorResponse extends Error {
  statusCode: number;
  // Machine-readable error code per the API contract, e.g. "UNAUTHENTICATED",
  // "FORBIDDEN", "RECORD_NOT_FOUND" — never a generic string, so the
  // frontend can branch on it without parsing the human-readable message.
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const appErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error({ err }, 'Unhandled error');

  // Defaults for a plain, un-typed Error (e.g. a bug we didn't anticipate) —
  // never leak that it's unhandled, just report it as a generic 500.
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An internal server error occurred.';

  if (err instanceof ErrorResponse) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.[0] ?? 'field';
      statusCode = 409;
      code = 'DUPLICATE_RECORD';
      message = `A record with this ${target} already exists.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = 'RECORD_NOT_FOUND';
      message = 'Requested record not found.';
    }
    // Any other known-request code — including P2039, the driver adapter's
    // fallback for an unmapped database error — falls through to the
    // generic 500 above. Its `meta` can carry the raw driver error
    // (originalCode/originalMessage), which may include real infrastructure
    // details (our Neon hostname included), so it must never reach the
    // response body.
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    // Any failure to even establish a database connection. Never surface
    // `err.message` here — it names our actual Neon host.
    statusCode = 503;
    code = 'SERVICE_UNAVAILABLE';
    message =
      "We're having trouble reaching our database right now. Please try again in a moment.";
  } else if (isDatabaseConnectivityError(err)) {
    // Same underlying situation as PrismaClientInitializationError above —
    // just reached through the session store's own raw pg connection
    // instead of Prisma. Never surface `err.message` here either, for the
    // same reason: it names our actual Neon host.
    statusCode = 503;
    code = 'SERVICE_UNAVAILABLE';
    message =
      "We're having trouble reaching our database right now. Please try again in a moment.";
  }

  sendError(res, statusCode, code, message, isDev && err.stack ? { stack: err.stack } : undefined);
};

export const notFoundRoutes = (req: Request, res: Response): void => {
  sendError(
    res,
    404,
    'ROUTE_NOT_FOUND',
    `Cannot find route - ${req.originalUrl} on this server. Please check the URL and try again.`,
  );
};
