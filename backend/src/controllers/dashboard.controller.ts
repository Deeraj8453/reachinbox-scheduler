import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export const getDashboardStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalCampaigns,
      scheduled,
      sending,
      sent,
      failed
    ] = await Promise.all([
      prisma.emailCampaign.count(),
      prisma.emailJob.count({ where: { status: 'SCHEDULED' } }),
      prisma.emailJob.count({ where: { status: 'PROCESSING' } }),
      prisma.emailJob.count({ where: { status: 'SENT' } }),
      prisma.emailJob.count({ where: { status: 'FAILED' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalCampaigns,
        scheduled,
        sending,
        sent,
        failed,
      }
    });
  } catch (error) {
    next(error);
  }
};
