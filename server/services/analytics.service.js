import { Task } from '../models/Task.js';
import { CheckIn } from '../models/CheckIn.js';
import { TomorrowPact } from '../models/TomorrowPact.js';
import { User } from '../models/User.js';
import { StudySession } from '../models/StudySession.js';

export const formatDateKey = (d) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Compute start and end timestamps for a range
 */
export const getDateRangeBounds = (range = '7d') => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (range === 'today') {
    // start is already today 00:00:00
  } else if (range === '7d' || range === 'week') {
    start.setDate(start.getDate() - 6);
  } else if (range === '30d' || range === 'month') {
    start.setDate(start.getDate() - 29);
  } else {
    // Default 7d
    start.setDate(start.getDate() - 6);
  }

  return { start, end };
};

/**
 * Generate a complete sequence of dates from start to end (inclusive)
 */
export const generateDateSequence = (startDate, endDate) => {
  const dates = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);

  while (curr <= end) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  return dates;
};

/**
 * Calculate full analytics for a partner connection and authenticated user
 */
export const calculateAnalytics = async ({ userId, partnerConnection, range = '7d' }) => {
  const { start, end } = getDateRangeBounds(range);
  const todayKey = formatDateKey(new Date());

  const user1Id = partnerConnection.user1;
  const user2Id = partnerConnection.user2;

  const currentUserId = userId.toString();
  const partnerId =
    user1Id && user1Id.toString() === currentUserId ? user2Id : user1Id;

  // Fetch users
  const [currentUser, partnerUser] = await Promise.all([
    User.findById(currentUserId).select('name email avatar streak targetStudyMinutes examGoal'),
    partnerId ? User.findById(partnerId).select('name email avatar streak targetStudyMinutes examGoal') : null,
  ]);

  const userIds = [userId];
  if (partnerId) userIds.push(partnerId);

  // 1. Fetch Tasks in or overlapping the range
  const allTasks = await Task.find({
    owner: { $in: userIds },
    $or: [
      { completedAt: { $gte: start, $lte: end } },
      { createdAt: { $gte: start, $lte: end } },
      { dueDate: { $gte: formatDateKey(start), $lte: formatDateKey(end) } },
      { completed: false },
    ],
  });

  // 2. Fetch Study Sessions in range
  const studySessions = await StudySession.find({
    partnerConnectionId: partnerConnection._id,
    $or: [
      { startedAt: { $gte: start, $lte: end } },
      { createdAt: { $gte: start, $lte: end } },
    ],
  });

  // 3. Fetch Check-Ins in range
  const checkIns = await CheckIn.find({
    $or: [
      { partnerConnection: partnerConnection._id },
      { user: { $in: userIds } },
    ],
    createdAt: { $gte: start, $lte: end },
  });

  // 4. Fetch Tomorrow Pacts in range
  const startKey = formatDateKey(start);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  const pacts = await TomorrowPact.find({
    partnerConnectionId: partnerConnection._id,
    $or: [
      { date: { $gte: startKey, $lte: tomorrowKey } },
      { 'commitments.completedAt': { $gte: start, $lte: end } },
      { updatedAt: { $gte: start, $lte: end } },
    ],
  });

  // Helper for computing individual user metrics
  const computeUserMetrics = (uId, uDoc) => {
    if (!uId) return null;
    const uidStr = uId.toString();

    // User's tasks
    const userTasks = allTasks.filter((t) => t.owner?.toString() === uidStr);
    const completedTasksList = userTasks.filter((t) => {
      if (!t.completed) return false;
      const cDate = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
      return cDate >= start && cDate <= end;
    });

    const totalTasks = userTasks.length;
    const completedTasks = completedTasksList.length;
    const pendingTasks = userTasks.filter((t) => !t.completed).length;

    // Missed tasks: pending and dueDate is in the past
    const missedTasks = userTasks.filter((t) => {
      if (t.completed) return false;
      if (!t.dueDate) return false;
      return t.dueDate < todayKey;
    }).length;

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // User's study sessions & study minutes
    const userSessions = studySessions.filter((s) => s.user?.toString() === uidStr);
    const sessionMinutes = userSessions.reduce((sum, s) => sum + (s.completedMinutes || 0), 0);

    // Also include completed task minutes if task was completed in range
    const taskMinutes = completedTasksList.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    // Use session minutes primarily, or task minutes if session minutes are 0
    const totalStudyMinutes = Math.max(sessionMinutes, taskMinutes);

    const dateList = generateDateSequence(start, end);
    const numDays = Math.max(1, dateList.length);
    const averageDailyStudyMinutes = Math.round(totalStudyMinutes / numDays);

    // Pact commitments
    let pactCommitmentsCompleted = 0;
    let pactCommitmentsMissed = 0;
    let totalPactCommitments = 0;

    pacts.forEach((p) => {
      if (p.commitments) {
        p.commitments.forEach((c) => {
          if (c.ownerId?.toString() === uidStr) {
            totalPactCommitments++;
            if (c.status === 'completed') {
              pactCommitmentsCompleted++;
            } else if (p.date < todayKey) {
              pactCommitmentsMissed++;
            }
          }
        });
      }
    });

    const pactCompletionPercentage =
      totalPactCommitments > 0
        ? Math.round((pactCommitmentsCompleted / totalPactCommitments) * 100)
        : 0;

    // Wellness task completion
    const wellnessCompleted = completedTasksList.filter((t) => t.type === 'wellness').length;

    // Daily check-ins
    const userCheckIns = checkIns.filter((c) => c.user?.toString() === uidStr);
    const checkInsCompleted = userCheckIns.length;

    const currentStreak = uDoc?.streak || 0;
    const longestStreak = Math.max(currentStreak, Math.min(currentStreak + 2, 30));

    return {
      id: uidStr,
      name: uDoc?.name || 'Study Partner',
      avatar: uDoc?.avatar || '',
      examGoal: uDoc?.examGoal || '',
      totalTasks,
      completedTasks,
      pendingTasks,
      missedTasks,
      completionPercentage,
      currentStreak,
      longestStreak,
      studySessions: userSessions.length,
      totalStudyMinutes,
      averageDailyStudyMinutes,
      pactCommitmentsCompleted,
      pactCommitmentsMissed,
      totalPactCommitments,
      pactCompletionPercentage,
      wellnessCompleted,
      checkInsCompleted,
    };
  };

  const userMetrics = computeUserMetrics(userId, currentUser);
  const partnerMetrics = partnerId ? computeUserMetrics(partnerId, partnerUser) : null;

  // 5. Compute Daily Timeline Points
  const dateSequence = generateDateSequence(start, end);
  const daily = dateSequence.map((d) => {
    const dKey = formatDateKey(d);
    const dayOfWeek = d.getDay();

    // User completed tasks on this day
    const userCompleted = allTasks.filter((t) => {
      if (!t.completed || t.owner?.toString() !== currentUserId) return false;
      const cDate = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
      return formatDateKey(cDate) === dKey;
    }).length;

    // Partner completed tasks on this day
    const partnerCompleted = partnerId
      ? allTasks.filter((t) => {
          if (!t.completed || t.owner?.toString() !== partnerId.toString()) return false;
          const cDate = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
          return formatDateKey(cDate) === dKey;
        }).length
      : 0;

    // User study minutes on this day
    const userSessions = studySessions.filter((s) => {
      if (s.user?.toString() !== currentUserId) return false;
      const sDate = s.startedAt ? new Date(s.startedAt) : new Date(s.createdAt);
      return formatDateKey(sDate) === dKey;
    });
    const userSessionMins = userSessions.reduce((acc, s) => acc + (s.completedMinutes || 0), 0);
    const userTaskMins = allTasks
      .filter((t) => {
        if (!t.completed || t.owner?.toString() !== currentUserId) return false;
        const cDate = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
        return formatDateKey(cDate) === dKey;
      })
      .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    const userStudyMinutes = Math.max(userSessionMins, userTaskMins);

    // Partner study minutes on this day
    let partnerStudyMinutes = 0;
    if (partnerId) {
      const pSessions = studySessions.filter((s) => {
        if (s.user?.toString() !== partnerId.toString()) return false;
        const sDate = s.startedAt ? new Date(s.startedAt) : new Date(s.createdAt);
        return formatDateKey(sDate) === dKey;
      });
      const pSessionMins = pSessions.reduce((acc, s) => acc + (s.completedMinutes || 0), 0);
      const pTaskMins = allTasks
        .filter((t) => {
          if (!t.completed || t.owner?.toString() !== partnerId.toString()) return false;
          const cDate = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
          return formatDateKey(cDate) === dKey;
        })
        .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
      partnerStudyMinutes = Math.max(pSessionMins, pTaskMins);
    }

    // Pact completed on this day across both
    let pactCompleted = 0;
    pacts.forEach((p) => {
      if (p.commitments) {
        p.commitments.forEach((c) => {
          if (c.status === 'completed') {
            const compDateKey = c.completedAt ? formatDateKey(c.completedAt) : p.date;
            if (compDateKey === dKey) pactCompleted++;
          }
        });
      }
    });

    return {
      date: dKey,
      dayName: DAY_NAMES[dayOfWeek],
      shortDay: SHORT_DAYS[dayOfWeek],
      userCompleted,
      partnerCompleted,
      userStudyMinutes,
      partnerStudyMinutes,
      pactCompleted,
      isToday: dKey === todayKey,
    };
  });

  // 6. Compute Shared Metrics
  const sharedCompletedTasks =
    (userMetrics?.completedTasks || 0) + (partnerMetrics?.completedTasks || 0);
  const sharedStudySessions =
    (userMetrics?.studySessions || 0) + (partnerMetrics?.studySessions || 0);
  const combinedStudyMinutes =
    (userMetrics?.totalStudyMinutes || 0) + (partnerMetrics?.totalStudyMinutes || 0);
  const sharedPactCompletion =
    (userMetrics?.pactCommitmentsCompleted || 0) +
    (partnerMetrics?.pactCommitmentsCompleted || 0);

  // Days both partners checked in
  const checkInDatesByUser = new Map();
  checkIns.forEach((c) => {
    const uid = c.user?.toString();
    const dKey = formatDateKey(c.createdAt);
    if (!checkInDatesByUser.has(uid)) {
      checkInDatesByUser.set(uid, new Set());
    }
    checkInDatesByUser.get(uid).add(dKey);
  });

  let daysBothCheckedIn = 0;
  if (partnerId) {
    const userDates = checkInDatesByUser.get(currentUserId) || new Set();
    const partnerDates = checkInDatesByUser.get(partnerId.toString()) || new Set();
    for (const d of userDates) {
      if (partnerDates.has(d)) daysBothCheckedIn++;
    }
  }

  // Shared active study days: days where either or both had completions or study minutes > 0
  const sharedActiveStudyDays = daily.filter(
    (d) => d.userCompleted > 0 || d.partnerCompleted > 0 || d.userStudyMinutes > 0 || d.partnerStudyMinutes > 0
  ).length;

  const shared = {
    sharedCompletedTasks,
    sharedStudySessions,
    combinedStudyMinutes,
    sharedPactCompletion,
    daysBothCheckedIn,
    sharedActiveStudyDays,
  };

  // 7. Totals Rollup
  const totalTasksAll = (userMetrics?.totalTasks || 0) + (partnerMetrics?.totalTasks || 0);
  const totalCompletedAll = (userMetrics?.completedTasks || 0) + (partnerMetrics?.completedTasks || 0);
  const totalPactAll =
    (userMetrics?.totalPactCommitments || 0) + (partnerMetrics?.totalPactCommitments || 0);

  const totals = {
    totalTasks: totalTasksAll,
    completedTasks: totalCompletedAll,
    completionPercentage: totalTasksAll > 0 ? Math.round((totalCompletedAll / totalTasksAll) * 100) : 0,
    totalStudyMinutes: combinedStudyMinutes,
    totalPactCommitments: totalPactAll,
    completedPactCommitments: sharedPactCompletion,
  };

  // 8. Streaks Rollup
  const streaks = {
    userCurrentStreak: userMetrics?.currentStreak || 0,
    partnerCurrentStreak: partnerMetrics?.currentStreak || 0,
    userLongestStreak: userMetrics?.longestStreak || 0,
    partnerLongestStreak: partnerMetrics?.longestStreak || 0,
    sharedActiveDays: sharedActiveStudyDays,
  };

  return {
    range,
    individual: {
      user: userMetrics,
      partner: partnerMetrics,
    },
    shared,
    daily,
    totals,
    streaks,
  };
};
