import { CheckIn } from '../models/CheckIn.js';
import { PartnerConnection } from '../models/PartnerConnection.js';
import { dbStatus } from '../config/db.js';
import { getIO } from '../socket/socketHandler.js';

/**
 * Submit daily mood and energy check-in
 * POST /api/checkin
 */
export const submitCheckIn = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const { mood, energyLevel, reaction, statusMessage } = req.body;

    // Look for active connection
    const connection = await PartnerConnection.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'active',
    });

    const checkIn = await CheckIn.create({
      user: userId,
      partnerConnection: connection ? connection._id : null,
      mood: mood || 'ready',
      energyLevel: Number(energyLevel) || 3,
      reaction: reaction || '✨',
      statusMessage: statusMessage || '',
    });

    // Broadcast check-in update to partner room if paired
    if (connection) {
      const io = getIO();
      if (io) {
        io.to(connection.roomCode).emit('partner_checkin_updated', {
          userId,
          mood: checkIn.mood,
          energyLevel: checkIn.energyLevel,
          reaction: checkIn.reaction,
          statusMessage: checkIn.statusMessage,
          timestamp: new Date().toISOString(),
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Check-in recorded',
      checkIn,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest check-in for user and partner
 * GET /api/checkin/latest
 */
export const getLatestCheckIn = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;

    const myLatest = await CheckIn.findOne({ user: userId }).sort({ createdAt: -1 });

    const connection = await PartnerConnection.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'active',
    });

    let partnerLatest = null;
    if (connection) {
      const partnerId = connection.getPartnerId(userId);
      if (partnerId) {
        partnerLatest = await CheckIn.findOne({ user: partnerId }).sort({ createdAt: -1 });
      }
    }

    res.status(200).json({
      success: true,
      myCheckIn: myLatest,
      partnerCheckIn: partnerLatest,
    });
  } catch (error) {
    next(error);
  }
};
