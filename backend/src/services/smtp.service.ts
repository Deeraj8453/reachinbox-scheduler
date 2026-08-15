import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

export async function getTransporter() {
  if (!transporter) {
    if (!env.ETHEREAL_USER || !env.ETHEREAL_PASSWORD || env.ETHEREAL_USER === 'placeholder_ethereal_user') {
      logger.warn('SMTP Credentials not configured. Creating test account...');
      const testAccount = await nodemailer.createTestAccount();
      env.ETHEREAL_USER = testAccount.user;
      env.ETHEREAL_PASSWORD = testAccount.pass;
    }

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: env.ETHEREAL_USER,
        pass: env.ETHEREAL_PASSWORD,
      },
    });
    
    logger.info('SMTP Transporter configured with Ethereal Email');
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string) {
  const mailer = await getTransporter();
  const info = await mailer.sendMail({
    from: `"ReachInbox Sender" <${env.ETHEREAL_USER}>`,
    to,
    subject,
    text,
  });
  
  logger.info('Email sent', { messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) });
  return info.messageId;
}
