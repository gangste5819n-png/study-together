import { TomorrowPact } from '../models/TomorrowPact.js';
import { PartnerConnection } from '../models/PartnerConnection.js';
import { Task } from '../models/Task.js';
import { dbStatus } from '../config/db.js';

import { getIO } from '../socket/socketHandler.js';
import { createPactNotification, createPartnerNotification } from '../services/notification.service.js';

export const formatDateString = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayDateString = () => formatDateString(new Date());

export const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateString(tomorrow);
};

/**
 * Helper to find active connection for a user
 */
const findActiveConnection = async (userId) => {
  return PartnerConnection.findOne({
    $or: [{ user1: userId }, { user2: userId }],
    status: 'active',
  });
};

/**
 * GET /api/pacts/tomorrow
 * Get or create tomorrow's pact for the user's active partner connection
 */
export const getTomorrowPact = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const connection = await findActiveConnection(userId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'No active partner connection found. Pair with a partner first.',
      });
    }

    const tomorrowDate = getTomorrowDateString();

    let pact = await TomorrowPact.findOne({
      partnerConnectionId: connection._id,
      date: tomorrowDate,
    });

    if (!pact) {
      pact = await TomorrowPact.create({
        partnerConnectionId: connection._id,
        date: tomorrowDate,
        status: 'draft',
        commitments: [],
        confirmations: [],
      });
    }

    res.status(200).json({
      success: true,
      pact,
      roomCode: connection.roomCode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pacts/today
 * Get today's active/locked pact, activating if date reached
 */
export const getTodayPact = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const connection = await findActiveConnection(userId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'No active partner connection found.',
      });
    }

    const todayDate = getTodayDateString();

    // Find today's pact or most recent locked/active pact
    let pact = await TomorrowPact.findOne({
      partnerConnectionId: connection._id,
      date: todayDate,
    });

    // If not found for today, check if there is an existing locked/active pact
    if (!pact) {
      pact = await TomorrowPact.findOne({
        partnerConnectionId: connection._id,
        status: { $in: ['locked', 'active'] },
      }).sort({ date: -1 });
    }

    // If pact is locked and today's date has arrived, activate it!
    if (pact && pact.status === 'locked' && pact.date <= todayDate) {
      pact.status = 'active';
      pact.activatedAt = pact.activatedAt || new Date();
      await pact.save();

      const io = getIO();
      if (io && connection.roomCode) {
        io.to(connection.roomCode).emit('pact_activated', {
          pactId: pact._id,
          date: pact.date,
          status: 'active',
          activatedAt: pact.activatedAt,
        });
      }
    }

    res.status(200).json({
      success: true,
      pact: pact || null,
      roomCode: connection.roomCode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pacts
 * Create or initialize pact for a specific date or tomorrow
 */
export const createPact = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const connection = await findActiveConnection(userId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'No active partner connection found.',
      });
    }

    const targetDate = req.body.date || getTomorrowDateString();

    let pact = await TomorrowPact.findOne({
      partnerConnectionId: connection._id,
      date: targetDate,
    });

    if (!pact) {
      pact = await TomorrowPact.create({
        partnerConnectionId: connection._id,
        date: targetDate,
        status: 'draft',
        commitments: [],
        confirmations: [],
      });
    }

    res.status(201).json({
      success: true,
      pact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/pacts/:id
 * General pact update or add commitment
 */
export const updatePact = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const pact = await TomorrowPact.findById(req.params.id);

    if (!pact) {
      return res.status(404).json({ success: false, message: 'Pact not found.' });
    }

    const connection = await PartnerConnection.findById(pact.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this pact.' });
    }

    // Reject editing if locked or completed
    if (pact.status === 'locked' && !req.body.allowLockedEdit) {
      return res.status(400).json({
        success: false,
        message: 'Tomorrow Pact is locked and cannot be casually edited.',
      });
    }

    // If adding a commitment
    if (req.body.commitment) {
      const c = req.body.commitment;
      pact.commitments.push({
        title: c.title,
        category: c.category || 'CDS',
        ownerId: c.ownerId || userId,
        createdBy: userId,
        estimatedMinutes: Number(c.estimatedMinutes) || 45,
        date: pact.date,
        mandatory: Boolean(c.mandatory),
        status: 'pending',
      });

      // Clear confirmations if drafting changed so partners mutually re-affirm
      pact.confirmations = [];
    }

    await pact.save();

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('pact_updated', {
        pactId: pact._id,
        pact,
        updatedBy: req.user.name,
      });
    }

    res.status(200).json({
      success: true,
      pact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pacts/:id/commitments
 * Add a commitment to the pact
 */
export const addCommitment = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const pact = await TomorrowPact.findById(req.params.id);

    if (!pact) {
      return res.status(404).json({ success: false, message: 'Pact not found.' });
    }

    const connection = await PartnerConnection.findById(pact.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this pact.' });
    }

    if (pact.status === 'locked') {
      return res.status(400).json({
        success: false,
        message: 'Tomorrow Pact is locked and cannot be casually edited.',
      });
    }

    const { title, category, ownerId, estimatedMinutes, mandatory, assignedTo } = req.body;

    // Derive ownerId safely:
    // If assigned to partner, verify partner exists in connection:
    let resolvedOwnerId = userId;
    if (ownerId && ownerId !== 'me' && typeof ownerId === 'string' && ownerId.length === 24) {
      if (connection.user1.equals(ownerId) || connection.user2?.equals(ownerId)) {
        resolvedOwnerId = ownerId;
      }
    } else if (assignedTo === 'partner') {
      const partnerId = connection.user1.equals(userId) ? connection.user2 : connection.user1;
      if (partnerId) {
        resolvedOwnerId = partnerId;
      }
    }

    const newCommitment = {
      title,
      category: category || 'CDS',
      ownerId: resolvedOwnerId,
      createdBy: userId,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      date: pact.date,
      mandatory: Boolean(mandatory),
      status: 'pending',
    };

    pact.commitments.push(newCommitment);
    // Reset confirmations on new commitment so both partners agree to final list
    pact.confirmations = [];
    await pact.save();

    const addedCommitment = pact.commitments[pact.commitments.length - 1];

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('pact_updated', {
        pactId: pact._id,
        pact,
        commitment: addedCommitment,
        action: 'added',
        userName: req.user.name,
      });

      io.to(connection.roomCode).emit('notification_created', {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Tomorrow Pact Updated',
        text: `${req.user.name} added: "${title}"`,
        type: 'plan',
        timestamp: new Date().toISOString(),
        actor: 'partner',
      });
    }

    // Persist partner notification
    await createPartnerNotification({
      currentUserId: userId,
      partnerConnectionId: connection._id,
      type: 'PACT_REMINDER',
      title: 'Commitment Added 📝',
      message: `${req.user.name} added a commitment: "${title}"`,
      category: 'pact',
      relatedEntityId: pact._id,
      relatedEntityType: 'TomorrowPact',
    });

    res.status(201).json({
      success: true,
      pact,
      commitment: addedCommitment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/pacts/:id/commitments/:commitmentId
 * Edit an existing commitment
 */
export const updateCommitment = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const pact = await TomorrowPact.findById(req.params.id);

    if (!pact) {
      return res.status(404).json({ success: false, message: 'Pact not found.' });
    }

    const connection = await PartnerConnection.findById(pact.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this pact.' });
    }

    if (pact.status === 'locked') {
      return res.status(400).json({
        success: false,
        message: 'Tomorrow Pact is locked and cannot be casually edited.',
      });
    }

    const commitment = pact.commitments.id(req.params.commitmentId);
    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found.' });
    }

    const { title, category, estimatedMinutes, mandatory, ownerId } = req.body;
    if (title !== undefined) commitment.title = title;
    if (category !== undefined) commitment.category = category;
    if (estimatedMinutes !== undefined) commitment.estimatedMinutes = Number(estimatedMinutes);
    if (mandatory !== undefined) commitment.mandatory = Boolean(mandatory);
    if (ownerId !== undefined) commitment.ownerId = ownerId;

    pact.confirmations = [];
    await pact.save();

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('pact_updated', {
        pactId: pact._id,
        pact,
        commitment,
        action: 'edited',
        userName: req.user.name,
      });
    }

    res.status(200).json({
      success: true,
      pact,
      commitment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/pacts/:id/commitments/:commitmentId
 * Delete a commitment
 */
export const deleteCommitment = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const pact = await TomorrowPact.findById(req.params.id);

    if (!pact) {
      return res.status(404).json({ success: false, message: 'Pact not found.' });
    }

    const connection = await PartnerConnection.findById(pact.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this pact.' });
    }

    if (pact.status === 'locked') {
      return res.status(400).json({
        success: false,
        message: 'Tomorrow Pact is locked and cannot be casually edited.',
      });
    }

    pact.commitments.pull(req.params.commitmentId);
    pact.confirmations = [];
    await pact.save();

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('pact_updated', {
        pactId: pact._id,
        pact,
        commitmentId: req.params.commitmentId,
        action: 'deleted',
        userName: req.user.name,
      });
    }

    res.status(200).json({
      success: true,
      pact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pacts/:id/confirm
 * Current partner confirms tomorrow's pact. Locks when both confirm!
 */
export const confirmPact = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const pact = await TomorrowPact.findById(req.params.id);

    if (!pact) {
      return res.status(404).json({ success: false, message: 'Pact not found.' });
    }

    const connection = await PartnerConnection.findById(pact.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this pact.' });
    }

    // Add confirmation if not already confirmed
    const existingIndex = pact.confirmations.findIndex((c) => c.userId.equals(userId));
    if (existingIndex === -1) {
      pact.confirmations.push({
        userId,
        userName: req.user.name,
        confirmedAt: new Date(),
      });
    }

    // Check if BOTH partners have confirmed
    const user1Confirmed = pact.confirmations.some((c) => c.userId.equals(connection.user1));
    const user2Confirmed = connection.user2
      ? pact.confirmations.some((c) => c.userId.equals(connection.user2))
      : true; // Single user room (fallback)

    let isLocked = false;
    if (user1Confirmed && user2Confirmed) {
      pact.status = 'locked';
      pact.finalizedAt = new Date();
      isLocked = true;
    }

    await pact.save();

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('pact_confirmed', {
        pactId: pact._id,
        userId,
        userName: req.user.name,
        confirmations: pact.confirmations,
        isLocked,
        pact,
      });

      if (isLocked) {
        io.to(connection.roomCode).emit('pact_finalized', {
          pactId: pact._id,
          status: 'locked',
          finalizedAt: pact.finalizedAt,
          pact,
        });

        io.to(connection.roomCode).emit('accountability_notification', {
          id: `notif-lock-${Date.now()}`,
          title: 'Pact Locked',
          text: "Tomorrow's pact is locked 🔒",
          type: 'plan',
          timestamp: new Date().toISOString(),
        });

        // Persist notification for both partners
        if (connection.user1) {
          await createPactNotification({
            userId: connection.user1,
            partnerConnectionId: connection._id,
            pactId: pact._id,
            type: 'PACT_LOCKED',
            title: 'Tomorrow Pact Locked 🔒',
            message: `Both partners confirmed! Tomorrow's study commitments are locked in.`,
            dedupeKey: `pact-locked-${pact._id}-${connection.user1}`,
          });
        }
        if (connection.user2) {
          await createPactNotification({
            userId: connection.user2,
            partnerConnectionId: connection._id,
            pactId: pact._id,
            type: 'PACT_LOCKED',
            title: 'Tomorrow Pact Locked 🔒',
            message: `Both partners confirmed! Tomorrow's study commitments are locked in.`,
            dedupeKey: `pact-locked-${pact._id}-${connection.user2}`,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      pact,
      isLocked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pacts/:id/finalize
 * Finalize/lock pact
 */
export const finalizePact = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const pact = await TomorrowPact.findById(req.params.id);

    if (!pact) {
      return res.status(404).json({ success: false, message: 'Pact not found.' });
    }

    const connection = await PartnerConnection.findById(pact.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this pact.' });
    }

    pact.status = 'locked';
    pact.finalizedAt = new Date();
    await pact.save();

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('pact_finalized', {
        pactId: pact._id,
        status: 'locked',
        finalizedAt: pact.finalizedAt,
        pact,
      });
    }

    res.status(200).json({
      success: true,
      pact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pacts/:id/activate
 * Activate pact for today
 */
export const activatePact = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const pact = await TomorrowPact.findById(req.params.id);

    if (!pact) {
      return res.status(404).json({ success: false, message: 'Pact not found.' });
    }

    const connection = await PartnerConnection.findById(pact.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this pact.' });
    }

    pact.status = 'active';
    pact.activatedAt = new Date();
    await pact.save();

    // Synchronize commitments to user's daily tasks if not already created
    for (const commitment of pact.commitments) {
      if (!commitment.taskId) {
        try {
          const newTask = await Task.create({
            owner: commitment.ownerId,
            title: `[Pact] ${commitment.title}`,
            category: commitment.category === 'Wellness' ? 'Wellness' : commitment.category,
            priority: commitment.mandatory ? 'high' : 'medium',
            estimatedMinutes: commitment.estimatedMinutes,
            dueDate: pact.date,
            mandatory: commitment.mandatory,
            type: commitment.category === 'Wellness' ? 'wellness' : 'study',
            completed: commitment.status === 'completed',
          });
          commitment.taskId = newTask._id;
        } catch (err) {
          console.warn('[Pact Activation] Could not create linked task:', err.message);
        }
      }
    }
    await pact.save();

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('pact_activated', {
        pactId: pact._id,
        status: 'active',
        date: pact.date,
        pact,
      });
    }

    res.status(200).json({
      success: true,
      pact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pacts/:id/commitments/:commitmentId/complete
 * Toggle or mark a commitment completed
 */
export const completeCommitment = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const pact = await TomorrowPact.findById(req.params.id);

    if (!pact) {
      return res.status(404).json({ success: false, message: 'Pact not found.' });
    }

    const connection = await PartnerConnection.findById(pact.partnerConnectionId);
    if (!connection || (!connection.user1.equals(userId) && !connection.user2?.equals(userId))) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this pact.' });
    }

    const commitment = pact.commitments.id(req.params.commitmentId);
    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found.' });
    }

    const isNowCompleted = commitment.status !== 'completed';
    commitment.status = isNowCompleted ? 'completed' : 'pending';
    commitment.completedAt = isNowCompleted ? new Date() : null;

    // Also update linked Task if exists
    if (commitment.taskId) {
      await Task.findByIdAndUpdate(commitment.taskId, {
        completed: isNowCompleted,
        completedAt: commitment.completedAt,
      });
    }

    await pact.save();

    // Progress calculation for this owner
    const ownerCommitments = pact.commitments.filter((c) => c.ownerId.equals(commitment.ownerId));
    const completedCount = ownerCommitments.filter((c) => c.status === 'completed').length;
    const totalCount = ownerCommitments.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const io = getIO();
    if (io && connection.roomCode) {
      io.to(connection.roomCode).emit('pact_commitment_completed', {
        pactId: pact._id,
        commitmentId: commitment._id,
        status: commitment.status,
        completedAt: commitment.completedAt,
        ownerId: commitment.ownerId,
        completedCount,
        totalCount,
        percentage,
        userName: req.user.name,
      });

      // Notification if all completed or gentle notice
      if (isNowCompleted) {
        if (completedCount === totalCount && totalCount > 0) {
          io.to(connection.roomCode).emit('accountability_notification', {
            id: `notif-done-${Date.now()}`,
            title: 'Pact Finished',
            text: 'Your partner finished their pact 💜',
            type: 'plan',
            timestamp: new Date().toISOString(),
          });
        } else {
          const remaining = totalCount - completedCount;
          if (remaining === 2) {
            io.to(connection.roomCode).emit('accountability_notification', {
              id: `notif-rem-${Date.now()}`,
              title: 'Pact Progress',
              text: 'Your partner still has 2 missions left 👀',
              type: 'plan',
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      pact,
      commitment,
      stats: {
        completedCount,
        totalCount,
        percentage,
      },
    });
  } catch (error) {
    next(error);
  }
};
