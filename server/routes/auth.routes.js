import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRegister, validateLogin } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Public auth endpoints protected by rate limiting and validation
router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);

// Protected auth endpoints
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);

export default router;
