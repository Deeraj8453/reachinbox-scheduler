import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import senderRoutes from './routes/sender.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/senders', senderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' }); // Extend with DB/Redis status in server.ts
});

// Error handling
app.use(errorMiddleware);

export default app;
