import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for sensitive authentication endpoints (login, register)
 * Max 15 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 attempts per 15 mins prevents brute force while accommodating campus NATs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.',
  },
});


export const authRateLimiter = authLimiter;


/**
 * Rate limiter for manual scheduler trigger endpoint
 * Max 5 executions per minute per IP
 */
export const schedulerTriggerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many scheduler trigger requests. Please wait a minute before retrying.',
  },
});

/**
 * General API rate limiter to protect against denial of service and runaway loops
 * Allows 300 requests per 15 minutes per IP (plenty for high-frequency study timer/sync operations)
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests sent to the Study Together API. Please slow down.',
  },
});
