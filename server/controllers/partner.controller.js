import { PartnerConnection } from '../models/PartnerConnection.js';
import { User } from '../models/User.js';
import { dbStatus } from '../config/db.js';
import { getIO } from '../socket/socketHandler.js';

/**
 * Helper to generate random 6-character room code
 */
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'STUDY-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate a partner invite / room code
 * POST /api/partner/invite
 */
export const createInvite = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;

    // Check if user already has an active or pending connection
    let connection = await PartnerConnection.findOne({
      $or: [{ user1: userId }, { user2: userId }],
    });

    if (!connection) {
      const roomCode = generateCode();
      connection = await PartnerConnection.create({
        user1: userId,
        roomCode,
        status: 'pending',
      });
    }

    res.status(200).json({
      success: true,
      roomCode: connection.roomCode,
      status: connection.status,
      connectionId: connection._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join an existing partner connection via room code
 * POST /api/partner/join
 */
export const joinInvite = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const { roomCode } = req.body;

    const connection = await PartnerConnection.findOne({
      roomCode: roomCode.toUpperCase(),
      status: 'pending',
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or already used partner room code.',
      });
    }

    if (connection.user1.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot connect with your own room code.',
      });
    }

    connection.user2 = userId;
    connection.status = 'active';
    connection.connectedAt = new Date();
    await connection.save();

    const partner = await User.findById(connection.user1).select('-passwordHash');
    const joiningUser = await User.findById(userId).select('-passwordHash');

    // Broadcast real-time pairing event to partner room
    const io = getIO();
    if (io) {
      io.to(connection.roomCode).emit('partner_paired', {
        connectionId: connection._id,
        roomCode: connection.roomCode,
        partner: joiningUser,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Connected with your study partner!',
      connectionId: connection._id,
      partner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current connected partner profile
 * GET /api/partner/current
 */
export const getCurrentPartner = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;

    const connection = await PartnerConnection.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'active',
    });

    if (!connection) {
      return res.status(200).json({
        success: true,
        connected: false,
        partner: null,
      });
    }

    const partnerId = connection.getPartnerId(userId);
    const partner = partnerId ? await User.findById(partnerId).select('-passwordHash') : null;

    res.status(200).json({
      success: true,
      connected: true,
      connectionId: connection._id,
      roomCode: connection.roomCode,
      partner,
      activeSession: connection.activeSession || null,
    });
  } catch (error) {
    next(error);
  }
};
