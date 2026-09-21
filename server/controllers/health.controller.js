import { dbStatus } from '../config/db.js';
import { config } from '../config/env.js';

/**
 * Health check endpoint controller
 * GET /api/health
 */
export const getHealth = (_req, res) => {
  const isHealthy = dbStatus.connected;
  const statusCode = isHealthy ? 200 : 503;

  // In production, sanitize database info to avoid leaking internal host topology
  const databasePayload = config.isProduction
    ? {
        connected: dbStatus.connected,
        state: dbStatus.state,
      }
    : {
        connected: dbStatus.connected,
        state: dbStatus.state,
        host: dbStatus.host,
        name: dbStatus.name,
        error: dbStatus.error,
      };

  res.status(statusCode).json({
    success: isHealthy,
    status: isHealthy ? 'ok' : 'degraded',
    message: isHealthy
      ? 'Study Together Backend API is operational'
      : 'Study Together Backend API is running with degraded database connectivity',
    service: 'study-together-api',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: databasePayload,
    realtime: {
      provider: 'Socket.IO',
      status: 'ready',
    },
  });
};
