import { verifyToken } from '../services/auth.service.js';
import { User } from '../models/User.js';

/**
 * Middleware to protect private API endpoints
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      });
    }

    // Attach basic decoded user identity to request
    req.user = decoded;

    // Optionally check if user exists in database if DB is connected
    try {
      const user = await User.findById(decoded.userId).lean();
      if (user) {
        req.userFull = user;
      }
    } catch {
      // If DB is unavailable, continue with decoded token payload
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message,
    });
  }
};

/**
 * Middleware that extracts user if token is present, but allows guest access
 */
export const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};
