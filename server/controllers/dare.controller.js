import { Dare } from '../models/Dare.js';
import { PartnerConnection } from '../models/PartnerConnection.js';
import { User } from '../models/User.js';
import { dbStatus } from '../config/db.js';
import { getIO } from '../socket/socketHandler.js';
import { createNotification } from '../services/notification.service.js';

/**
 * GET /api/dares/active
 * Get active/recent dares for partner connection
 */
export const getActiveDares = async (req, res, next) => {
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
      return res.status(404).json({ success: false, message: 'No active partner connection.' });
    }

    const dares = await Dare.find({
      partnerConnectionId: connection._id,
      status: { $in: ['proposed', 'accepted', 'completed', 'skipped'] },
    }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      dares,
      roomCode: connection.roomCode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/dares
 * Propose a playful, harmless dare for partner
 */
export const createDare = async (req, res, next) => {
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
      return res.status(404).json({ success: false, message: 'No active partner connection.' });
    }

    const { targetUserId, title, instruction, reason, categoryTag, pactId, commitmentId } = req.body;

    const partnerId = connection.getPartnerId(userId);
    const targetId = targetUserId || partnerId;
    const targetUser = await User.findById(targetId);

    const dare = await Dare.create({
      partnerConnectionId: connection._id,
      pactId: pactId || null,
      commitmentId: commitmentId || null,
      targetUserId: targetId,
      targetUserName: targetUser?.name || 'Partner',
      proposedBy: userId,
      proposedByName: req.user.name,
      title: title || 'Speak like a news reporter for 30 seconds',
      instruction: instruction || 'Give breaking news about today’s study session!',
      reason: reason || 'Missed a non-critical commitment target',
      categoryTag: categoryTag || 'Silly',
      status: 'proposed',
    });

    // Create persistent notification for target partner
    await createNotification({
      userId: targetId,
      partnerConnectionId: connection._id,
      type: 'DARE_RECEIVED',
      title: 'New Fun Dare Waiting 😄',
      message: `${req.user.name} sent you a playful dare: "${dare.title}"`,
      category: 'dare',
      relatedEntityId: dare._id,
      relatedEntityType: 'Dare',
    });

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('dare_created', {
        dare,
        proposedBy: req.user.name,
      });

      io.to(connection.roomCode).emit('accountability_notification', {
        id: `notif-dare-${Date.now()}`,
        title: 'Dare Unlocked',
        text: 'Dare unlocked 🎯',
        type: 'reaction',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      dare,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/dares/:id
 * Accept, skip, or complete dare
 */
export const updateDare = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const dare = await Dare.findById(req.params.id);

    if (!dare) {
      return res.status(404).json({ success: false, message: 'Dare not found.' });
    }

    const connection = await PartnerConnection.findById(dare.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const { status } = req.body;
    if (!['accepted', 'skipped', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid dare status.' });
    }

    dare.status = status;
    if (status === 'accepted') {
      dare.acceptedAt = new Date();
    } else if (status === 'completed') {
      dare.completedAt = new Date();
    }

    await dare.save();

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('dare_updated', {
        dareId: dare._id,
        dare,
        status,
        updatedBy: req.user.name,
      });

      if (status === 'completed') {
        io.to(connection.roomCode).emit('dare_completed', {
          dareId: dare._id,
          dare,
          completedBy: req.user.name,
        });

        io.to(connection.roomCode).emit('accountability_notification', {
          id: `notif-dare-done-${Date.now()}`,
          title: 'Dare Completed! 🎯🎉',
          text: `${dare.targetUserName} conquered their dare: "${dare.title}"!`,
          type: 'reaction',
          timestamp: new Date().toISOString(),
        });

        // Create persistent notification for proposer
        await createNotification({
          userId: dare.proposedBy,
          partnerConnectionId: connection._id,
          type: 'DARE_RECEIVED',
          title: 'Dare Completed! 🏆',
          message: `${req.user.name} fulfilled the dare: "${dare.title}"!`,
          category: 'dare',
          relatedEntityId: dare._id,
          relatedEntityType: 'Dare',
        });
      }
    }

    res.status(200).json({
      success: true,
      dare,
    });
  } catch (error) {
    next(error);
  }
};
