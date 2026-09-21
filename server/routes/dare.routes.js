import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getActiveDares,
  createDare,
  updateDare,
} from '../controllers/dare.controller.js';

import { validateDare } from '../middleware/validate.middleware.js';

const router = Router();

// All dare routes require authentication
router.use(requireAuth);

router.get('/active', getActiveDares);
router.post('/', validateDare, createDare);
router.patch('/:id', updateDare);


export default router;
