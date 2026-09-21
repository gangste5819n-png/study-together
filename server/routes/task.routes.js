import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateTask } from '../middleware/validate.middleware.js';

const router = Router();

// Protect all task endpoints
router.use(requireAuth);

router.get('/', getTasks);
router.post('/', validateTask, createTask);
router.patch('/:id', updateTask);
router.patch('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);

export default router;
