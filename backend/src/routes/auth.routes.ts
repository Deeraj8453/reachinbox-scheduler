import { Router } from 'express';
import { googleLoginController, getMeController } from '../controllers/auth.controller';

const router = Router();

router.post('/google', googleLoginController);
router.get('/me', getMeController);
router.post('/logout', (req, res) => res.json({ success: true }));

export default router;
