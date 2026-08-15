import { z } from 'zod';

export const scheduleEmailSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
    recipients: z.union([z.string().min(1, 'Recipients are required'), z.array(z.string()).min(1)]),
    startTime: z.string().datetime({ message: 'Invalid ISO start time' }),
    delaySeconds: z.number().int().min(0),
    hourlyLimit: z.number().int().positive('Hourly limit must be positive'),
  }),
});
