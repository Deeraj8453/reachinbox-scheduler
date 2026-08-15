import { Worker, Job } from 'bullmq';
import { EMAIL_QUEUE_NAME } from '../queues/email.queue';
import { redisConnection } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { processEmailJob } from '../services/email.service';

let worker: Worker;

export function startWorker() {
  worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job: Job) => {
      logger.info('JOB_STARTED', { jobId: job.id, emailJobId: job.data.emailJobId });
      
      try {
        await processEmailJob(job.data.emailJobId);
        logger.info('JOB_COMPLETED', { jobId: job.id, emailJobId: job.data.emailJobId });
      } catch (error: any) {
        logger.error('JOB_FAILED', { jobId: job.id, emailJobId: job.data.emailJobId, error: error.message });
        throw error; // Let BullMQ handle retries
      }
    },
    {
      connection: redisConnection,
      concurrency: env.WORKER_CONCURRENCY,
    }
  );

  worker.on('ready', () => {
    logger.info(`Worker started with concurrency ${env.WORKER_CONCURRENCY}`);
  });

  worker.on('error', (err) => {
    logger.error('Worker error', { error: err.message });
  });
}

export async function stopWorker() {
  if (worker) {
    await worker.close();
    logger.info('Worker stopped');
  }
}
