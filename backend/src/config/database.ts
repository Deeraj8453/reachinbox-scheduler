import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error', { error: e.message });
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning', { warning: e.message });
});

export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL Database');
  } catch (error) {
    logger.error('Database connection failed', { error });
    process.exit(1);
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
  logger.info('Disconnected from PostgreSQL Database');
}
