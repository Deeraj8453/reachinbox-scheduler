import { prisma } from '../config/database';
import { emailQueue } from '../queues/email.queue';
import { getNextAvailableSendTime } from './rate-limit.service';
import { parseEmailsFromCsv } from '../utils/csv-parser';
import { JobStatus } from '@prisma/client';
import { logger } from '../utils/logger';

export async function scheduleEmails(
  userId: string,
  subject: string,
  body: string,
  csvOrTextRecipients: string,
  startTimeIso: string,
  delaySeconds: number,
  hourlyLimit: number
) {
  const { valid: recipients } = parseEmailsFromCsv(csvOrTextRecipients);
  
  if (recipients.length === 0) {
    throw new Error('No valid recipients found');
  }

  // Find an active sender (simplified: just grab the first one or create a default for demo)
  let sender = await prisma.sender.findFirst({ where: { isActive: true } });
  if (!sender) {
    sender = await prisma.sender.create({
      data: {
        email: 'default@reachinbox.com',
        displayName: 'Default Sender',
        hourlyLimit: 100
      }
    });
  }

  // Create Campaign
  const campaign = await prisma.emailCampaign.create({
    data: {
      userId,
      subject,
      body,
      startTime: new Date(startTimeIso),
      delaySeconds,
      hourlyLimit,
      totalRecipients: recipients.length,
    }
  });

  const startTimeMs = new Date(startTimeIso).getTime();
  const delayMs = delaySeconds * 1000;
  let currentRequestedTimeMs = startTimeMs;

  const createdJobs = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    // Calculate when this specific email should be sent based on rate limits and previous jobs
    const scheduledTimeMs = await getNextAvailableSendTime(
      sender.id,
      currentRequestedTimeMs,
      delayMs,
      hourlyLimit
    );
    
    // Set the requested time for the NEXT iteration to be at least delayMs after this one
    currentRequestedTimeMs = scheduledTimeMs + delayMs;

    // Create DB record
    const emailJob = await prisma.emailJob.create({
      data: {
        campaignId: campaign.id,
        senderId: sender.id,
        recipient,
        subject,
        body,
        scheduledAt: new Date(scheduledTimeMs),
        status: JobStatus.SCHEDULED,
      }
    });

    // Add to BullMQ with deterministic ID to avoid accidental duplicate insertion
    const bullJobId = `email-${emailJob.id}`;
    
    const delayFromNow = Math.max(0, scheduledTimeMs - Date.now());
    
    await emailQueue.add(
      'send-email',
      { emailJobId: emailJob.id },
      { 
        jobId: bullJobId, // deterministic job ID
        delay: delayFromNow 
      }
    );

    await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: { bullJobId }
    });

    createdJobs.push(emailJob);
  }

  logger.info(`Scheduled ${createdJobs.length} emails for campaign ${campaign.id}`);

  return {
    campaign,
    jobsScheduled: createdJobs.length
  };
}
