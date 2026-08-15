import { prisma } from '../config/database';
import { acquireLock, releaseLock } from './idempotency.service';
import { sendEmail } from './smtp.service';
import { logger } from '../utils/logger';
import { JobStatus } from '@prisma/client';

export async function processEmailJob(emailJobId: string): Promise<void> {
  const lockAcquired = await acquireLock(emailJobId, 120); // 2 minute lock
  if (!lockAcquired) {
    logger.warn('DUPLICATE_JOB_SKIPPED', { emailJobId, reason: 'Lock already held' });
    return;
  }

  try {
    const job = await prisma.emailJob.findUnique({
      where: { id: emailJobId },
      include: { campaign: true, sender: true }
    });

    if (!job) {
      throw new Error(`EmailJob ${emailJobId} not found`);
    }

    if (job.status === JobStatus.SENT) {
      logger.info('DUPLICATE_JOB_SKIPPED', { emailJobId, reason: 'Already SENT' });
      return;
    }

    // Atomically transition from SCHEDULED/FAILED to PROCESSING
    const updatedJob = await prisma.emailJob.update({
      where: { 
        id: emailJobId,
        status: { in: [JobStatus.SCHEDULED, JobStatus.FAILED] } // Only allow from these states
      },
      data: {
        status: JobStatus.PROCESSING,
        processingStartedAt: new Date(),
        attempts: { increment: 1 }
      }
    });

    if (!updatedJob) {
      logger.warn('DUPLICATE_JOB_SKIPPED', { emailJobId, reason: 'State transition failed (might be already processing)' });
      return;
    }

    // Send email via SMTP
    const messageId = await sendEmail(job.recipient, job.subject, job.body);

    // Update job to SENT
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: JobStatus.SENT,
        sentAt: new Date(),
        messageId: messageId,
        error: null
      }
    });

  } catch (error: any) {
    logger.error('SMTP_ERROR', { emailJobId, error: error.message });
    
    // Attempt to update status to FAILED in DB
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: JobStatus.FAILED,
        error: error.message
      }
    }).catch(e => logger.error('Failed to update DB on SMTP_ERROR', { error: e.message }));
    
    throw error; // Re-throw to let BullMQ handle retry
  } finally {
    await releaseLock(emailJobId);
  }
}
