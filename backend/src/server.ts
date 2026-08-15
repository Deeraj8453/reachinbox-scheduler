import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/database';
import { redisConnection } from './config/redis';
import { startWorker, stopWorker } from './workers/email.worker';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    // 1. Connect DB
    await connectDB();

    // 2. Start BullMQ Worker
    startWorker();

    // 3. Start Express server
    const server = app.listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT}`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        await stopWorker();
        await disconnectDB();
        await redisConnection.quit();
        logger.info('All resources closed cleanly');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start application', { error });
    process.exit(1);
  }
}

bootstrap();
