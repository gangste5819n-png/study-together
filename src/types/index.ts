export type Priority = 'High' | 'Medium' | 'Low' | 'high' | 'medium' | 'low';
export type TaskType = 'study' | 'wellness';
export type TaskCategory = 'CDS' | 'MBBS' | 'Wellness' | 'Custom' | 'study';
export type MoodType = 'good' | 'okay' | 'sleepy' | 'tired' | 'ready';

export interface User {
  id: string;
  name: string;
  shortName: string;
  avatar: string;
  examGoal: string;
  targetStudyMinutes: number;
  todayStudyMinutes: number;
  currentSubject: string;
  streak: number;
  longestStreak: number;
  tasksCompleted: number;
  totalTasks: number;
  isOnline: boolean;
  statusMessage: string;
  mood: MoodType;
  energyLevel: number; // 1 - 5
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: string;
  category: TaskCategory;
  type: TaskType;
  priority: Priority;
  estimatedMinutes: number;
  completed: boolean;
  mandatory: boolean;
  owner: 'me' | 'partner';
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  completedAt?: string;
  assignedTo?: 'me' | 'partner';
  notes?: string;
}

export interface HealthTask {
  id: string;
  title: string;
  completed: boolean;
  subtitle: string;
  funRemark: string;
  iconName: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: 'task' | 'session' | 'reaction' | 'streak' | 'plan';
  actor: 'me' | 'partner' | 'both';
  icon?: string;
}

export interface DayProgress {
  dayKey: string;
  dayName: string;
  shortDay: string;
  studyHours: number;
  targetHours: number;
  tasksCompleted: number;
  totalTasks: number;
  isToday: boolean;
}

export interface StreakMilestone {
  days: number;
  title: string;
  description: string;
  unlocked: boolean;
  rewardText: string;
  icon: string;
}

export interface TomorrowTask {
  id: string;
  title: string;
  subject: string;
  estimatedHours: number;
  priority: Priority;
  assignedTo: 'me' | 'partner';
}

export interface FunCardItem {
  id: string;
  type: 'dare' | 'icebreaker' | 'challenge' | 'win' | 'teach';
  content: string;
  instruction?: string;
  badge: string;
  categoryTag?: 'Silly' | 'Acting' | 'Random' | 'Icebreaker' | 'Mini Challenge' | 'Tiny Win';
}

export interface UserSettings {
  profileName: string;
  examGoal: string;
  dailyTargetHours: number;
  breakReminderInterval: number; // minutes
  partnerCanSeeTasks: boolean;
  partnerCanSeeMood: boolean;
  partnerCanSeeBreaks: boolean;
  soundEnabled: boolean;
  theme: 'dark-purple' | 'midnight-blue' | 'pure-black';
}

export interface CelebrationInfo {
  id: string;
  title: string;
  subtitle: string;
  message?: string;
  type: 'study' | 'wellness' | 'water' | 'dare';
}

export type PactCategory = 'CDS' | 'MBBS' | 'Revision' | 'Practice' | 'Wellness' | 'Personal' | 'Other';
export type CommitmentStatus = 'pending' | 'completed' | 'missed';
export type PactStatus = 'draft' | 'locked' | 'active' | 'completed';

export interface TomorrowPactCommitment {
  _id?: string;
  id?: string;
  title: string;
  category: PactCategory;
  ownerId: string;
  createdBy?: string;
  estimatedMinutes: number;
  date?: string;
  mandatory: boolean;
  status: CommitmentStatus;
  completedAt?: string | null;
  taskId?: string | null;
  createdAt?: string;
}

export interface PactConfirmation {
  userId: string;
  userName?: string;
  confirmedAt: string;
}

export interface TomorrowPactData {
  _id: string;
  partnerConnectionId: string;
  date: string; // 'YYYY-MM-DD'
  commitments: TomorrowPactCommitment[];
  confirmations: PactConfirmation[];
  status: PactStatus;
  finalizedAt?: string | null;
  activatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DareData {
  _id: string;
  partnerConnectionId: string;
  pactId?: string | null;
  commitmentId?: string | null;
  targetUserId: string;
  targetUserName?: string;
  proposedBy: string;
  proposedByName?: string;
  title: string;
  instruction?: string;
  reason?: string;
  categoryTag?: string;
  status: 'proposed' | 'accepted' | 'skipped' | 'completed';
  acceptedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type AnalyticsRange = 'today' | '7d' | '30d' | 'week' | 'month';

export interface AnalyticsUserMetrics {
  id: string;
  name: string;
  avatar?: string;
  examGoal?: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  missedTasks: number;
  completionPercentage: number;
  currentStreak: number;
  longestStreak: number;
  studySessions: number;
  totalStudyMinutes: number;
  averageDailyStudyMinutes: number;
  pactCommitmentsCompleted: number;
  pactCommitmentsMissed: number;
  totalPactCommitments: number;
  pactCompletionPercentage: number;
  wellnessCompleted: number;
  checkInsCompleted: number;
}

export interface AnalyticsSharedMetrics {
  sharedCompletedTasks: number;
  sharedStudySessions: number;
  combinedStudyMinutes: number;
  sharedPactCompletion: number;
  daysBothCheckedIn: number;
  sharedActiveStudyDays: number;
}

export interface AnalyticsDailyPoint {
  date: string; // YYYY-MM-DD
  dayName: string;
  shortDay: string;
  userCompleted: number;
  partnerCompleted: number;
  userStudyMinutes: number;
  partnerStudyMinutes: number;
  pactCompleted: number;
  isToday: boolean;
}

export interface AnalyticsTotals {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  totalStudyMinutes: number;
  totalPactCommitments: number;
  completedPactCommitments: number;
}

export interface AnalyticsStreaks {
  userCurrentStreak: number;
  partnerCurrentStreak: number;
  userLongestStreak: number;
  partnerLongestStreak: number;
  sharedActiveDays: number;
}

export interface AnalyticsOverviewData {
  range: string;
  isPaired: boolean;
  connectionId?: string;
  individual: {
    user: AnalyticsUserMetrics | null;
    partner: AnalyticsUserMetrics | null;
  };
  shared: AnalyticsSharedMetrics;
  daily: AnalyticsDailyPoint[];
  totals: AnalyticsTotals;
  streaks: AnalyticsStreaks;
}

export type NotificationType =
  | 'TASK_REMINDER'
  | 'TASK_DUE'
  | 'TASK_COMPLETED'
  | 'PARTNER_CHECKIN'
  | 'PARTNER_TASK_COMPLETED'
  | 'STUDY_SESSION'
  | 'PACT_REMINDER'
  | 'PACT_LOCKED'
  | 'PACT_ACTIVE'
  | 'PACT_MISSED'
  | 'WELLNESS_REMINDER'
  | 'DARE_RECEIVED'
  | 'STREAK_REMINDER'
  | 'SYSTEM';

export type NotificationCategory =
  | 'task'
  | 'study'
  | 'wellness'
  | 'pact'
  | 'partner'
  | 'dare'
  | 'system';

export interface AppNotification {
  _id: string;
  userId: string;
  partnerConnectionId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  category: NotificationCategory;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  metadata?: {
    dedupeKey?: string;
    route?: string;
    actorName?: string;
    [key: string]: any;
  };
}

export interface NotificationPreferences {
  _id?: string;
  userId?: string;
  taskReminders: boolean;
  taskOverdue: boolean;
  partnerActivity: boolean;
  studySession: boolean;
  pactReminders: boolean;
  wellnessReminders: boolean;
  dareNotifications: boolean;
  streakReminders: boolean;
  createdAt?: string;
  updatedAt?: string;
}




