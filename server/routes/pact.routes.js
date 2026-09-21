import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getTomorrowPact,
  getTodayPact,
  createPact,
  updatePact,
  addCommitment,
  updateCommitment,
  deleteCommitment,
  confirmPact,
  finalizePact,
  activatePact,
  completeCommitment,
} from '../controllers/pact.controller.js';

import { validateCommitment } from '../middleware/validate.middleware.js';

const router = Router();

// All pact routes require authentication
router.use(requireAuth);

router.get('/tomorrow', getTomorrowPact);
router.get('/today', getTodayPact);
router.post('/', createPact);
router.patch('/:id', updatePact);
router.post('/:id/commitments', validateCommitment, addCommitment);

router.patch('/:id/commitments/:commitmentId', updateCommitment);
router.delete('/:id/commitments/:commitmentId', deleteCommitment);
router.post('/:id/confirm', confirmPact);
router.post('/:id/finalize', finalizePact);
router.post('/:id/activate', activatePact);
router.post('/:id/commitments/:commitmentId/complete', completeCommitment);

export default router;
