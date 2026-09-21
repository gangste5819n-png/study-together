import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getTodayAnalytics,
  getWeekAnalytics,
  getMonthAnalytics,
  getOverviewAnalytics,
} from '../controllers/analytics.controller.js';

const router = Router();

// All analytics routes require authentication
router.use(requireAuth);

router.get('/today', getTodayAnalytics);
router.get('/week', getWeekAnalytics);
router.get('/month', getMonthAnalytics);
router.get('/overview', getOverviewAnalytics);

export default router;
