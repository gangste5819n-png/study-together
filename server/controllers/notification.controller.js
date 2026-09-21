import { Notification } from '../models/Notification.js';
import { NotificationPreference } from '../models/NotificationPreference.js';
import { dbStatus } from '../config/db.js';
import { getIO } from '../socket/socketHandler.js';

/**
 * GET /api/notifications
 * Get user's notifications sorted newest first
 */
export const getNotifications = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        total,
        unreadCount,
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread
 * Get user's unread notifications and unread count
 */
export const getUnreadNotifications = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const notifications = await Notification.find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or unauthorized.',
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    // Emit socket events
    const io = getIO();
    if (io) {
      const userRoom = `user_${userId.toString()}`;
      io.to(userRoom).emit('notification_read', {
        id: notification._id,
        userId: userId.toString(),
        unreadCount,
      });
      io.to(userRoom).emit('notification_count_updated', {
        userId: userId.toString(),
        unreadCount,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification, unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all unread notifications for current user as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const now = new Date();

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: now } }
    );

    // Emit socket events
    const io = getIO();
    if (io) {
      const userRoom = `user_${userId.toString()}`;
      io.to(userRoom).emit('notification_read_all', {
        userId: userId.toString(),
        unreadCount: 0,
      });
      io.to(userRoom).emit('notification_count_updated', {
        userId: userId.toString(),
        unreadCount: 0,
      });
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      data: {
        modifiedCount: result.modifiedCount,
        unreadCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or unauthorized.',
      });
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    // Emit socket events
    const io = getIO();
    if (io) {
      const userRoom = `user_${userId.toString()}`;
      io.to(userRoom).emit('notification_deleted', {
        id: notificationId,
        userId: userId.toString(),
        unreadCount,
      });
      io.to(userRoom).emit('notification_count_updated', {
        userId: userId.toString(),
        unreadCount,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/clear-read
 * Delete all read notifications for current user
 */
export const clearReadNotifications = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const result = await Notification.deleteMany({ userId, isRead: true });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    // Emit socket events
    const io = getIO();
    if (io) {
      const userRoom = `user_${userId.toString()}`;
      io.to(userRoom).emit('notification_count_updated', {
        userId: userId.toString(),
        unreadCount,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cleared all read notifications.',
      data: {
        deletedCount: result.deletedCount,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/preferences
 * Fetch user notification preferences
 */
export const getPreferences = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = await NotificationPreference.create({ userId });
    }

    res.status(200).json({
      success: true,
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/preferences
 * Update user notification preferences
 */
export const updatePreferences = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const userId = req.user.userId;
    const allowedKeys = [
      'taskReminders',
      'taskOverdue',
      'partnerActivity',
      'studySession',
      'pactReminders',
      'wellnessReminders',
      'dareNotifications',
      'streakReminders',
    ];

    const updates = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        updates[key] = Boolean(req.body[key]);
      }
    }

    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated.',
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications/trigger-scheduler
 * Manually invoke reminder checks (for testing and on-demand triggers)
 */
export const triggerScheduler = async (_req, res, next) => {
  try {
    const { runReminderChecks } = await import('../scheduler/reminderScheduler.js');
    await runReminderChecks();
    res.status(200).json({
      success: true,
      message: 'Reminder checks executed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
