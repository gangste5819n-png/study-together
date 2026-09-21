import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRoomCode } from '../middleware/validate.middleware.js';
import {
  createInvite,
  joinInvite,
  getCurrentPartner,
} from '../controllers/partner.controller.js';

const router = Router();

// All partner routes require authentication
router.use(requireAuth);

router.post('/invite', createInvite);
router.post('/join', validateRoomCode, joinInvite);
router.get('/current', getCurrentPartner);

export default router;
