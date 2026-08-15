import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleLoginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Credential is required' });
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (e) {
      // For local testing without a real client ID, we can bypass verification if it's a specific dummy token
      // ONLY if in development and configured with placeholder
      if (env.NODE_ENV === 'development' && env.GOOGLE_CLIENT_ID === 'placeholder_client_id') {
        logger.warn('Bypassing Google OAuth verification due to placeholder client ID');
        payload = {
          sub: 'dummy-google-id',
          name: 'Dummy User',
          email: 'dummy@reachinbox.com',
          picture: ''
        };
      } else {
        throw new Error('Invalid Google credential');
      }
    }

    if (!payload) {
      throw new Error('No payload from Google');
    }

    let user = await prisma.user.findUnique({
      where: { googleId: payload.sub }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: payload.sub,
          name: payload.name || 'User',
          email: payload.email || '',
          avatarUrl: payload.picture || ''
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id }, 
      env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};
