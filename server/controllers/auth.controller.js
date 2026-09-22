import { User } from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service.js';
import { dbStatus } from '../config/db.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please verify MongoDB connection.',
      });
    }

    const { name, email, password, examGoal } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password securely with bcrypt
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await User.create({
      name,
      email,
      passwordHash,
      examGoal: examGoal || 'CDS / Final Year MBBS',
    });

    // Generate authenticated JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please verify MongoDB connection.',
      });
    }

    const { email, password } = req.body;

    // Explicitly select passwordHash for authentication check
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Compare with bcrypt hash
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Update online status
    user.isOnline = true;
    await user.save();

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(200).json({
        success: true,
        user: {
          id: req.user.userId,
          email: req.user.email,
          name: req.user.name,
        },
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current authenticated user profile / settings
 * PATCH /api/auth/me
 */
export const updateMe = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable.',
      });
    }

    const { name, examGoal, targetStudyMinutes, statusMessage, avatar, timezone } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (examGoal !== undefined && typeof examGoal === 'string') {
      user.examGoal = examGoal.trim();
    }
    if (targetStudyMinutes !== undefined) {
      const mins = Number(targetStudyMinutes);
      if (!isNaN(mins) && mins >= 0) {
        user.targetStudyMinutes = mins;
      }
    }
    if (statusMessage !== undefined && typeof statusMessage === 'string') {
      user.statusMessage = statusMessage.trim();
    }
    if (avatar && typeof avatar === 'string') {
      user.avatar = avatar.trim();
    }
    if (timezone && typeof timezone === 'string') {
      user.timezone = timezone.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
