import { Router } from 'express';
import { getDashboardStatsController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', getDashboardStatsController);

export default router;
