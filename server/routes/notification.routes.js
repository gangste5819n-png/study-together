import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getPreferences,
  updatePreferences,
  triggerScheduler,
} from '../controllers/notification.controller.js';

import { schedulerTriggerLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// All notification endpoints require valid JWT authentication
router.use(requireAuth);

router.get('/', getNotifications);
router.get('/unread', getUnreadNotifications);
router.get('/preferences', getPreferences);
router.post('/trigger-scheduler', schedulerTriggerLimiter, triggerScheduler);

router.patch('/preferences', updatePreferences);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/clear-read', clearReadNotifications);
router.delete('/:id', deleteNotification);

export default router;
