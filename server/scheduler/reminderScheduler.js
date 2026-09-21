import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { CheckIn } from '../models/CheckIn.js';
import { PartnerConnection } from '../models/PartnerConnection.js';
import { TomorrowPact } from '../models/TomorrowPact.js';
import {
  createNotification,
  createTaskNotification,
  createPactNotification,
  createWellnessNotification,
} from '../services/notification.service.js';

let schedulerInterval = null;
let isProcessing = false;

const formatDateKey = (d = new Date()) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Main cycle executing scheduled checks
 */
export const runReminderChecks = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const now = new Date();
    const todayKey = formatDateKey(now);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = formatDateKey(tomorrow);

    // 1. Task Reminders (Due Today, Due Tomorrow, Overdue)
    const pendingTasks = await Task.find({
      completed: false,
      dueDate: { $ne: null },
    }).limit(100);

    for (const task of pendingTasks) {
      if (!task.owner) continue;
      const ownerId = task.owner.toString();

      // Check overdue
      if (task.dueDate < todayKey) {
        await createTaskNotification({
          userId: ownerId,
          taskId: task._id,
          taskTitle: task.title,
          type: 'TASK_DUE',
          message: `Task "${task.title}" is overdue (due: ${task.dueDate}).`,
          dedupeKey: `task-overdue-${task._id}-${todayKey}`,
        });
      }
      // Check due today (1h / day-of reminder)
      else if (task.dueDate === todayKey) {
        await createTaskNotification({
          userId: ownerId,
          taskId: task._id,
          taskTitle: task.title,
          type: 'TASK_REMINDER',
          message: `Task "${task.title}" is scheduled for today!`,
          dedupeKey: `task-due-today-${task._id}-${todayKey}`,
        });
      }
      // Check due tomorrow (24h reminder)
      else if (task.dueDate === tomorrowKey) {
        await createTaskNotification({
          userId: ownerId,
          taskId: task._id,
          taskTitle: task.title,
          type: 'TASK_REMINDER',
          message: `Task "${task.title}" is due tomorrow (${task.dueDate}).`,
          dedupeKey: `task-due-24h-${task._id}-${tomorrowKey}`,
        });
      }
    }

    // 2. Daily Check-In Reminders
    // If it's afternoon/evening (>= 14:00 server local), check users who haven't checked in
    const currentHour = now.getHours();
    if (currentHour >= 14) {
      const activeUsers = await User.find({}).limit(50);
      for (const user of activeUsers) {
        const uid = user._id.toString();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const checkInToday = await CheckIn.findOne({
          user: user._id,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        if (!checkInToday) {
          await createNotification({
            userId: uid,
            type: 'SYSTEM',
            title: 'Daily Check-In 🌸',
            message: 'How is your study focus today? Take a moment to log your mood and energy.',
            category: 'partner',
            dedupeKey: `checkin-reminder-${uid}-${todayKey}`,
          });
        }
      }
    }

    // 3. Tomorrow Pact Evening Planning Reminder
    // If hour >= 20 (8 PM), remind active connections to plan tomorrow's pact if not locked
    if (currentHour >= 20) {
      const activeConnections = await PartnerConnection.find({ status: 'active' });
      for (const conn of activeConnections) {
        const pact = await TomorrowPact.findOne({
          partnerConnectionId: conn._id,
          date: tomorrowKey,
        });

        if (!pact || pact.status !== 'locked') {
          if (conn.user1) {
            await createPactNotification({
              userId: conn.user1.toString(),
              partnerConnectionId: conn._id,
              pactId: pact?._id || null,
              type: 'PACT_REMINDER',
              title: 'Tomorrow Pact Planning 📜',
              message: 'Evening is here! Align on your commitments and finalize tomorrow’s pact.',
              dedupeKey: `pact-evening-reminder-${conn.user1}-${tomorrowKey}`,
            });
          }
          if (conn.user2) {
            await createPactNotification({
              userId: conn.user2.toString(),
              partnerConnectionId: conn._id,
              pactId: pact?._id || null,
              type: 'PACT_REMINDER',
              title: 'Tomorrow Pact Planning 📜',
              message: 'Evening is here! Align on your commitments and finalize tomorrow’s pact.',
              dedupeKey: `pact-evening-reminder-${conn.user2}-${tomorrowKey}`,
            });
          }
        }
      }
    }

    // 4. Midday Routine Wellness Reminder
    if (currentHour >= 12 && currentHour <= 17) {
      const activeUsers = await User.find({}).limit(50);
      for (const user of activeUsers) {
        await createWellnessNotification({
          userId: user._id.toString(),
          title: 'Hydration & Posture Break 💧',
          message: 'Sip some water, rest your eyes from the screen, and stretch your back.',
          dedupeKey: `wellness-reminder-${user._id}-${todayKey}`,
        });
      }
    }
  } catch (err) {
    console.warn('[Reminder Scheduler] Error in scheduler tick:', err.message);
  } finally {
    isProcessing = false;
  }
};

/**
 * Start singleton reminder worker
 */
export const startReminderScheduler = (intervalMs = 60000) => {
  if (schedulerInterval) {
    console.log('[Reminder Scheduler] Scheduler already active.');
    return;
  }

  console.log(`[Reminder Scheduler] Starting background worker (interval: ${intervalMs / 1000}s)`);
  // Run first check shortly after start
  setTimeout(() => {
    runReminderChecks();
  }, 3000);

  schedulerInterval = setInterval(runReminderChecks, intervalMs);
};

/**
 * Stop background reminder worker (for tests or clean shutdowns)
 */
export const stopReminderScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Reminder Scheduler] Scheduler stopped.');
  }
};
