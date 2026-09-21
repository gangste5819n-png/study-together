import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { connectDB, closeDB } from './config/db.js';
import { initSocket } from './socket/socketHandler.js';

// Route imports
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import checkinRoutes from './routes/checkin.routes.js';
import pactRoutes from './routes/pact.routes.js';
import dareRoutes from './routes/dare.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { startReminderScheduler, stopReminderScheduler } from './scheduler/reminderScheduler.js';

// Middleware imports
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { generalApiLimiter } from './middleware/rateLimit.middleware.js';

// Initialize Express app
const app = express();

// Security Headers via Helmet
// Configured to permit cross-origin media/avatars and avoid interfering with WebRTC or Socket.IO
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Handled by host/reverse proxy for WebRTC compatibility
  })
);

// Allowed origins for CORS
const allowedOrigins = config.isProduction
  ? [...config.clientOrigins]
  : [
      ...config.clientOrigins,
      config.clientOrigin,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ];

// Configure production-hardened CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (config.isProduction) {
        return callback(new Error('Origin not allowed by CORS policy.'));
      }
      return callback(null, true); // Permissive in dev mode only
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware with safe payload limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });
}

// General API rate limiter applied to all /api routes
app.use('/api', generalApiLimiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/pacts', pactRoutes);
app.use('/api/dares', dareRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Root fallback
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Study Together API',
    status: 'online',
    healthCheck: '/api/health',
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// Centralized 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(httpServer);

// Coordinated Graceful Shutdown
let isShuttingDown = false;
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);

  // Stop accepting new HTTP requests
  httpServer.close(() => {
    console.log('[Server] HTTP server closed.');
  });

  // Stop background reminder worker
  stopReminderScheduler();

  // Close Socket.IO connections
  if (io) {
    io.close(() => {
      console.log('[Socket.IO] Real-time server connections closed.');
    });
  }

  // Close MongoDB database connection
  await closeDB();

  console.log('[Server] Graceful shutdown complete. Exiting.');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server function
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start background smart reminder scheduler
  startReminderScheduler();

  // Listen on configured port
  httpServer.listen(config.port, () => {
    console.log(`\n==================================================`);
    console.log(`✨ Study Together Backend API is running!`);
    console.log(`📡 Port: ${config.port}`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
    console.log(`⚡ Socket.IO active`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`==================================================\n`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export { app, httpServer, io };
