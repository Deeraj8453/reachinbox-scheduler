import { Router } from 'express';
import { 
  scheduleEmailController, 
  getScheduledEmailsController, 
  getSentEmailsController, 
  getEmailJobController 
} from '../controllers/email.controller';
import { validate } from '../middleware/validation.middleware';
import { scheduleEmailSchema } from '../schemas/email.schema';

const router = Router();

router.post('/schedule', validate(scheduleEmailSchema), scheduleEmailController);
router.get('/scheduled', getScheduledEmailsController);
router.get('/sent', getSentEmailsController);
router.get('/:id', getEmailJobController);

export default router;
