import { prisma } from '@causolve/database';
import { env } from './keys.js';
import { logger, logError } from './logger.js';

// Optional query logging in development. Configured on the shared client
// itself (packages/database), not re-instantiated here — see
// apps/backend/CLAUDE.md: one shared PrismaClient, never a second one.
if (env.NODE_ENV === 'development') {
  prisma.$on('query', (event) => {
    logger.debug(
      { query: event.query, params: event.params, duration: `${event.duration}ms` },
      'Prisma Query',
    );
  });
}

interface DBState {
  isConnected: boolean;
  retryCount: number;
  maxRetries: number;
}

const dbState: DBState = {
  isConnected: false,
  retryCount: 0,
  maxRetries: 5,
};

export const connectDB = async (): Promise<void> => {
  if (dbState.isConnected) {
    logger.info('Using existing Prisma database connection');
    return;
  }

  if (dbState.retryCount >= dbState.maxRetries) {
    logger.fatal('Max database connection retries reached');
    process.exit(1);
  }

  try {
    await prisma.$connect();
    dbState.isConnected = true;
    dbState.retryCount = 0;
    logger.info('Database connected successfully via Prisma');
  } catch (error: unknown) {
    dbState.retryCount++;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';

    logError(
      new Error(
        `Database connection failed (attempt ${dbState.retryCount}/${dbState.maxRetries}): ${errorMessage}`,
      ),
      'Prisma Connection Error',
    );

    if (dbState.retryCount < dbState.maxRetries) {
      logger.info('Retrying connection in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB();
    } else {
      logger.fatal('Max database retries reached. Exiting application process...');
      process.exit(1);
    }
  }
};

export const gracefulShutdown = async (): Promise<void> => {
  try {
    logger.info('Closing Prisma database connection...');
    await prisma.$disconnect();
    dbState.isConnected = false;
    logger.info('Prisma database connection closed cleanly');
  } catch (error) {
    logError(error, 'Error during Prisma database disconnection');
  }
};
