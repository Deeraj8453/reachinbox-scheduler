import { Router } from 'express';
import { 
  getSendersController, 
  updateSenderController, 
  createSenderController,
  deleteSenderController
} from '../controllers/sender.controller';

const router = Router();

router.get('/', getSendersController);
router.post('/', createSenderController);
router.put('/:id', updateSenderController);
router.delete('/:id', deleteSenderController);

export default router;
