import { Request, Response, NextFunction } from 'express';
import { scheduleEmails } from '../services/scheduler.service';
import { prisma } from '../config/database';

export const scheduleEmailController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, body, recipients, startTime, delaySeconds, hourlyLimit } = req.body;
    
    // Convert array of recipients to CSV-like string for parser (if it's array from frontend)
    const csvContent = Array.isArray(recipients) ? recipients.join(',') : recipients;
    
    // Normally userId would come from req.user set by auth middleware
    // Hardcoding a dummy user ID for now to allow progress without auth fully blocking
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: 'test-google-id',
          name: 'Test User',
          email: 'test@reachinbox.com'
        }
      });
    }

    const result = await scheduleEmails(
      user.id,
      subject,
      body,
      csvContent,
      startTime,
      delaySeconds,
      hourlyLimit
    );

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduledEmailsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;
    
    const whereClause: any = { status: { in: ['SCHEDULED', 'PROCESSING'] } };
    if (search) {
      whereClause.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { recipient: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, emails] = await Promise.all([
      prisma.emailJob.count({ where: whereClause }),
      prisma.emailJob.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' }
      })
    ]);

    res.json({ success: true, data: { emails, total, page, limit } });
  } catch (error) {
    next(error);
  }
};

export const getSentEmailsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;
    
    const whereClause: any = { status: { in: ['SENT', 'FAILED'] } };
    if (search) {
      whereClause.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { recipient: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, emails] = await Promise.all([
      prisma.emailJob.count({ where: whereClause }),
      prisma.emailJob.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    res.json({ success: true, data: { emails, total, page, limit } });
  } catch (error) {
    next(error);
  }
};

export const getEmailJobController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.emailJob.findUnique({
      where: { id: req.params.id as string },
      include: { campaign: true }
    });
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};
