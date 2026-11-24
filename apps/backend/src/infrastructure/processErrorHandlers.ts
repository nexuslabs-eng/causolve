import { logger } from "./logger.js";

// Process-level safety net — not per-request, so this doesn't belong in
// Express middleware. Call once at process bootstrap (server.ts).
export const setupGlobalErrorHandlers = (): void => {
  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught Exception");
    // Give the logger a moment to flush before the process dies — Node's own
    // guidance after an uncaughtException is to exit, not keep running, since
    // process state past this point is unreliable.
    setTimeout(() => process.exit(1), 1000);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error({ reason, promise }, "Unhandled Rejection");
  });
};
