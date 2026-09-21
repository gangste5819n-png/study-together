import mongoose from 'mongoose';
import { PartnerConnection } from '../models/PartnerConnection.js';
import { calculateAnalytics } from '../services/analytics.service.js';
import { dbStatus } from '../config/db.js';

/**
 * Helper to retrieve or mock-fallback partner connection for current user
 */
const resolvePartnerConnection = async (userId) => {
  let connection = await PartnerConnection.findOne({
    $or: [{ user1: userId }, { user2: userId }],
    status: 'active',
  });

  if (!connection) {
    // Check if there is a pending connection
    connection = await PartnerConnection.findOne({
      $or: [{ user1: userId }, { user2: userId }],
    });
  }

  if (!connection) {
    // Return a lightweight mock connection object for solo calculation
    return {
      _id: new mongoose.Types.ObjectId(),
      user1: userId,
      user2: null,
      status: 'solo',
    };
  }

  return connection;
};

/**
 * GET /api/analytics/today
 * Returns today's metrics
 */
export const getTodayAnalytics = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const connection = await resolvePartnerConnection(userId);
    const analytics = await calculateAnalytics({
      userId,
      partnerConnection: connection,
      range: 'today',
    });

    res.status(200).json({
      success: true,
      data: {
        ...analytics,
        isPaired: connection.status === 'active' && Boolean(connection.user2),
        connectionId: connection._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/week
 * Returns past 7 days metrics
 */
export const getWeekAnalytics = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const connection = await resolvePartnerConnection(userId);
    const analytics = await calculateAnalytics({
      userId,
      partnerConnection: connection,
      range: '7d',
    });

    res.status(200).json({
      success: true,
      data: {
        ...analytics,
        isPaired: connection.status === 'active' && Boolean(connection.user2),
        connectionId: connection._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/month
 * Returns past 30 days metrics
 */
export const getMonthAnalytics = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const connection = await resolvePartnerConnection(userId);
    const analytics = await calculateAnalytics({
      userId,
      partnerConnection: connection,
      range: '30d',
    });

    res.status(200).json({
      success: true,
      data: {
        ...analytics,
        isPaired: connection.status === 'active' && Boolean(connection.user2),
        connectionId: connection._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/overview?range=7d|30d|today
 * Dynamic range analytics endpoint
 */
export const getOverviewAnalytics = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const range = req.query.range || '7d';
    const connection = await resolvePartnerConnection(userId);
    const analytics = await calculateAnalytics({
      userId,
      partnerConnection: connection,
      range,
    });

    res.status(200).json({
      success: true,
      data: {
        ...analytics,
        isPaired: connection.status === 'active' && Boolean(connection.user2),
        connectionId: connection._id,
      },
    });
  } catch (error) {
    next(error);
  }
};
