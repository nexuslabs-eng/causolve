import { env } from "./infrastructure/keys.js";

import type { Server } from "node:http";
import app from "./app.js";
import { connectDB, gracefulShutdown } from "./infrastructure/database.js";
import { logger, logError } from "./infrastructure/logger.js";
import { setupGlobalErrorHandlers } from "./infrastructure/processErrorHandlers.js";

setupGlobalErrorHandlers();

let server: Server | undefined;
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    server = app.listen(env.PORT, "0.0.0.0", () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`http://localhost:${env.PORT}`);
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      switch (error.code) {
        case "EACCES":
          logger.error(`Port ${env.PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          logger.error(`Port ${env.PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    const handleShutdown = (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`Received ${signal}. Closing HTTP server...`);

      // Force exit after 10 seconds if connections refuse to close
      const forceExitTimer = setTimeout(() => {
        logger.error("Forced shutdown due to timeout");
        process.exit(1);
      }, 10_000);

      server?.close((closeErr) => {
        clearTimeout(forceExitTimer);

        if (closeErr) {
          logError(closeErr, "Error while closing HTTP server");
        } else {
          logger.info("HTTP server closed");
        }

        gracefulShutdown()
          .catch((error: unknown) => logError(error, "Error during graceful shutdown"))
          .finally(() => process.exit(closeErr ? 1 : 0));
      });
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));
  } catch (error: unknown) {
    logError(error, "Failed to start server");
    process.exit(1);
  }
};

void startServer();
