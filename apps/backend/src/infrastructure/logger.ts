import pino, { type Logger } from "pino";
import { env } from "./keys.js";

const isDev = env.NODE_ENV === "development";

export const logger: Logger = pino({
  level: env.LOG_LEVEL,
  base: {
    pid: process.pid,
    env: env.NODE_ENV,
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          messageFormat: "{msg}",
        },
      }
    : undefined,
});

// helper for logging errors from side effects such as tryCatchWrapper
export const logError = (
  error: unknown,
  context?: string,
  metadata?: Record<string, unknown>,
): void => {
  const errorInfo =
    error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : { message: String(error) };

  logger.error({ err: errorInfo, context, ...metadata }, context || "An error occurred");
};
