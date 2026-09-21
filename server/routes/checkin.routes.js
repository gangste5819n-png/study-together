import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  submitCheckIn,
  getLatestCheckIn,
} from '../controllers/checkin.controller.js';

const router = Router();

// All check-in routes require authentication
router.use(requireAuth);

router.post('/', submitCheckIn);
router.get('/latest', getLatestCheckIn);

export default router;
