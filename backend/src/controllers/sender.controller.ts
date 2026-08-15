import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export const getSendersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senders = await prisma.sender.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: senders });
  } catch (error) {
    next(error);
  }
};

export const updateSenderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { hourlyLimit, isActive, displayName } = req.body;

    const sender = await prisma.sender.update({
      where: { id },
      data: {
        ...(hourlyLimit !== undefined && { hourlyLimit: parseInt(hourlyLimit) }),
        ...(isActive !== undefined && { isActive }),
        ...(displayName !== undefined && { displayName })
      }
    });

    res.json({ success: true, data: sender });
  } catch (error) {
    next(error);
  }
};

export const createSenderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, displayName, hourlyLimit } = req.body;

    const sender = await prisma.sender.create({
      data: {
        email,
        displayName,
        hourlyLimit: parseInt(hourlyLimit) || 100,
        etherealUser: 'mock-user-' + Math.random().toString(36).substring(7),
        etherealPassword: 'mock-password',
        isActive: true
      }
    });

    res.status(201).json({ success: true, data: sender });
  } catch (error) {
    next(error);
  }
};

export const deleteSenderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.sender.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Sender deleted successfully' });
  } catch (error) {
    next(error);
  }
};
