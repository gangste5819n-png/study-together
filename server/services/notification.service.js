import { Notification } from '../models/Notification.js';
import { NotificationPreference } from '../models/NotificationPreference.js';
import { PartnerConnection } from '../models/PartnerConnection.js';
import { getIO } from '../socket/socketHandler.js';

/**
 * Check whether a user has enabled notifications for a given type or category
 */
export const isNotificationEnabledForUser = async (userId, type, category) => {
  try {
    let prefs = await NotificationPreference.findOne({ userId });
    if (!prefs) {
      // Default to all enabled
      prefs = await NotificationPreference.create({ userId });
    }

    if (type === 'TASK_REMINDER') return prefs.taskReminders;
    if (type === 'TASK_DUE') return prefs.taskOverdue;
    if (type === 'STUDY_SESSION') return prefs.studySession;
    if (type === 'PARTNER_CHECKIN' || type === 'PARTNER_TASK_COMPLETED') return prefs.partnerActivity;
    if (type.startsWith('PACT_')) return prefs.pactReminders;
    if (type === 'WELLNESS_REMINDER') return prefs.wellnessReminders;
    if (type === 'DARE_RECEIVED') return prefs.dareNotifications;
    if (type === 'STREAK_REMINDER') return prefs.streakReminders;

    if (category === 'task') return prefs.taskReminders;
    if (category === 'study') return prefs.studySession;
    if (category === 'wellness') return prefs.wellnessReminders;
    if (category === 'pact') return prefs.pactReminders;
    if (category === 'dare') return prefs.dareNotifications;
    if (category === 'partner') return prefs.partnerActivity;

    return true;
  } catch (err) {
    console.warn('[Notification Service] Error checking preferences:', err.message);
    return true;
  }
};

/**
 * Create a persistent notification for a specific user with deduplication and preference check
 */
export const createNotification = async ({
  userId,
  partnerConnectionId = null,
  type,
  title,
  message,
  category = 'system',
  relatedEntityId = null,
  relatedEntityType = null,
  metadata = {},
  dedupeKey = null,
  expiresAt = null,
}) => {
  if (!userId) return null;

  try {
    // 1. Check user preferences
    const isEnabled = await isNotificationEnabledForUser(userId, type, category);
    if (!isEnabled) {
      return null;
    }

    // 2. Anti-spam deduplication check
    const finalDedupeKey = dedupeKey || metadata?.dedupeKey || null;
    if (finalDedupeKey) {
      const existing = await Notification.findOne({
        userId,
        'metadata.dedupeKey': finalDedupeKey,
      });
      if (existing) {
        return existing; // Already sent, skip duplicate
      }
    }

    // 3. Persist notification to MongoDB
    const notification = await Notification.create({
      userId,
      partnerConnectionId,
      type,
      title,
      message,
      category,
      relatedEntityId: relatedEntityId ? String(relatedEntityId) : null,
      relatedEntityType,
      isRead: false,
      expiresAt,
      metadata: {
        ...metadata,
        dedupeKey: finalDedupeKey,
      },
    });

    // 4. Calculate updated unread count for user
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    // 5. Emit real-time socket events directly to the user's private room
    const io = getIO();
    if (io) {
      const userRoom = `user_${userId.toString()}`;
      io.to(userRoom).emit('notification_created', {
        notification,
        unreadCount,
        id: notification._id.toString(),
        title: notification.title,
        text: notification.message,
        type: notification.category || 'partner',
        timestamp: notification.createdAt ? notification.createdAt.toISOString() : new Date().toISOString(),
        actor: 'partner',
      });
      io.to(userRoom).emit('notification_count_updated', {
        userId: userId.toString(),
        unreadCount,
      });
    }

    return notification;
  } catch (err) {
    console.warn('[Notification Service] Error creating notification:', err.message);
    return null;
  }
};

/**
 * Send a notification to the partner of the current user
 */
export const createPartnerNotification = async ({
  currentUserId,
  partnerConnectionId,
  type,
  title,
  message,
  category = 'partner',
  relatedEntityId = null,
  relatedEntityType = null,
  metadata = {},
  dedupeKey = null,
  expiresAt = null,
}) => {
  try {
    let connection = null;
    if (partnerConnectionId) {
      connection = await PartnerConnection.findById(partnerConnectionId);
    } else if (currentUserId) {
      connection = await PartnerConnection.findOne({
        $or: [{ user1: currentUserId }, { user2: currentUserId }],
        status: 'active',
      });
    }

    if (!connection) return null;

    const u1 = connection.user1?.toString();
    const u2 = connection.user2?.toString();
    const curr = currentUserId?.toString();

    const partnerId = u1 === curr ? u2 : u1;
    if (!partnerId) return null;

    return createNotification({
      userId: partnerId,
      partnerConnectionId: connection._id,
      type,
      title,
      message,
      category,
      relatedEntityId,
      relatedEntityType,
      metadata,
      dedupeKey,
      expiresAt,
    });
  } catch (err) {
    console.warn('[Notification Service] Error creating partner notification:', err.message);
    return null;
  }
};

/**
 * Task notification helpers
 */
export const createTaskNotification = async ({
  userId,
  taskId,
  taskTitle,
  type, // 'TASK_REMINDER', 'TASK_DUE', 'TASK_COMPLETED'
  message,
  dedupeKey,
}) => {
  return createNotification({
    userId,
    type,
    title: type === 'TASK_DUE' ? 'Task Overdue ⚠️' : 'Task Reminder ⏰',
    message: message || `Reminder for task: "${taskTitle}"`,
    category: 'task',
    relatedEntityId: taskId,
    relatedEntityType: 'Task',
    dedupeKey,
  });
};

/**
 * Tomorrow Pact notification helpers
 */
export const createPactNotification = async ({
  userId,
  partnerConnectionId,
  pactId,
  type, // 'PACT_REMINDER', 'PACT_LOCKED', 'PACT_ACTIVE', 'PACT_MISSED'
  title,
  message,
  dedupeKey,
}) => {
  return createNotification({
    userId,
    partnerConnectionId,
    type,
    title: title || 'Tomorrow Pact Update 📜',
    message,
    category: 'pact',
    relatedEntityId: pactId,
    relatedEntityType: 'TomorrowPact',
    dedupeKey,
  });
};

/**
 * Wellness notification helpers
 */
export const createWellnessNotification = async ({
  userId,
  title = 'Wellness Check-In 🌸',
  message = 'Remember to hydrate and take an eye rest break.',
  dedupeKey,
}) => {
  return createNotification({
    userId,
    type: 'WELLNESS_REMINDER',
    title,
    message,
    category: 'wellness',
    dedupeKey,
  });
};

/**
 * Dare notification helpers
 */
export const createDareNotification = async ({
  userId,
  partnerConnectionId,
  dareId,
  dareTitle,
  message,
}) => {
  return createNotification({
    userId,
    partnerConnectionId,
    type: 'DARE_RECEIVED',
    title: 'New Fun Dare Waiting 😄',
    message: message || `Your partner sent you a dare: "${dareTitle}"`,
    category: 'dare',
    relatedEntityId: dareId,
    relatedEntityType: 'Dare',
  });
};
