import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import type {
  User,
  Task,
  HealthTask,
  ActivityItem,
  DayProgress,
  TomorrowTask,
  MoodType,
  UserSettings,
  CelebrationInfo,
  TomorrowPactData,
  TomorrowPactCommitment,
  DareData,
  CommitmentStatus,
} from '../types';
import {
  initialMe,
  initialPartner,
  initialHealthTasks,
  initialTasks,
  initialActivities,
  weeklyProgressData,
  partnerWeeklyProgressData,
  initialTomorrowMyTasks,
  initialTomorrowPartnerTasks,
  defaultSettings,
  randomDaresPool,
  icebreakersPool,
  teachMePool,
  tinyWinsPool,
} from '../data/mockData';

import {
  apiClient,
  isClientAuthenticated,
  type BackendUser,
  type PartnerConnectionResponse,
} from '../services/apiClient';
import {
  fetchAndMergeRemoteTasks,
  syncTaskCreate,
  syncTaskToggle,
  syncTaskUpdate,
  syncTaskDelete,
} from '../services/taskSyncService';
import {
  connectSocket,
  disconnectSocket,
  joinPartnerRoom,
  emitTaskCreated,
  emitTaskCompleted,
  emitTaskUncompleted,
  emitTaskUpdated,
  emitTaskDeleted,
  emitCheckInUpdate,
  emitCheer,
  emitStudySessionStarted,
  emitStudySessionUpdated,
  emitStudySessionEnded,
  onPartnerStatusChanged,
  onPartnerPaired,
  onPartnerTaskCreated,
  onPartnerTaskCompleted,
  onPartnerTaskUncompleted,
  onPartnerTaskUpdated,
  onPartnerTaskDeleted,
  onPartnerCheckInUpdated,
  onPartnerCheered,
  onStudySessionStarted,
  onStudySessionUpdated,
  onStudySessionEnded,
  onProgressUpdated,
  onStreakUpdated,
  onNotificationCreated,
  onCheckInSubmitted,
  onPactCreated,
  onPactUpdated,
  onPactConfirmed,
  onPactFinalized,
  onPactActivated,
  onPactCommitmentCompleted,
  onDareCreated,
  onDareUpdated,
  onDareCompleted,
  onAccountabilityNotification,
  getSocket,
} from '../services/socketService';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ActiveToastPayload {
  message: string;
  type?: ToastType;
}

const TASKS_STORAGE_KEY = 'studyTogether_tasks';

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  percentage: number;
  plannedStudyMinutes: number;
  completedStudyMinutes: number;
  remainingStudyMinutes: number;
}

interface StudyContextType {
  me: User;
  partner: User;
  tasks: Task[];
  healthTasks: HealthTask[];
  activities: ActivityItem[];
  weeklyProgress: DayProgress[];
  partnerWeeklyProgress: DayProgress[];
  tomorrowMyTasks: TomorrowTask[];
  tomorrowPartnerTasks: TomorrowTask[];
  tomorrowLocked: boolean;
  settings: UserSettings;
  funIndexes: { dare: number; icebreaker: number; teach: number; win: number };
  activeToast: ActiveToastPayload | string | null;
  celebration: CelebrationInfo | null;
  taskStats: TaskStats;
  authUser: BackendUser | null;
  partnerInfo: PartnerConnectionResponse | null;
  isAuthenticated: boolean;
  socketConnected: boolean;
  activeSession: StudySessionState;
  startStudySession: (mode?: 'focus' | 'break', durationMins?: number, subject?: string) => void;
  pauseStudySession: () => void;
  resumeStudySession: () => void;
  endStudySession: () => void;
  setSessionPreset: (mins: number, mode: 'focus' | 'break') => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  createPartnerInvite: () => Promise<{ success: boolean; roomCode?: string; message?: string }>;
  joinPartnerInvite: (code: string) => Promise<{ success: boolean; message?: string }>;
  toggleHealthTask: (id: string) => void;
  toggleTask: (id: string) => void;
  triggerCelebration: (info: Omit<CelebrationInfo, 'id'>) => void;
  clearCelebration: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'> & { createdAt?: string }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksForDate: (dateStr: string) => Task[];
  addTomorrowTask: (task: Omit<TomorrowTask, 'id'>) => void;
  deleteTomorrowTask: (id: string) => void;
  lockTomorrowPlan: (locked: boolean) => void;
  updateMood: (mood: MoodType) => void;
  updateEnergy: (level: number) => void;
  sendEncouragement: (emoji: string) => void;
  nextFunCard: (category: 'dare' | 'icebreaker' | 'teach' | 'win') => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  showToast: (message: string, type?: ToastType) => void;
  tomorrowPact: TomorrowPactData | null;
  todayPact: TomorrowPactData | null;
  activeDares: DareData[];
  loadPacts: () => Promise<void>;
  addPactCommitment: (commitment: Partial<TomorrowPactCommitment>) => Promise<void>;
  updatePactCommitment: (commitmentId: string, updates: Partial<TomorrowPactCommitment>) => Promise<void>;
  deletePactCommitment: (commitmentId: string) => Promise<void>;
  confirmTomorrowPact: () => Promise<void>;
  activateTodayPact: () => Promise<void>;
  togglePactCommitment: (commitmentId: string) => Promise<void>;
  proposeDare: (dare: Partial<DareData>) => Promise<void>;
  acceptDare: (dareId: string) => Promise<void>;
  skipDare: (dareId: string) => Promise<void>;
  completeDare: (dareId: string) => Promise<void>;
}

export interface StudySessionState {
  status: 'idle' | 'active' | 'paused' | 'ended';
  mode: 'focus' | 'break';
  durationMins: number;
  startedAt: string | null;
  pausedAt: string | null;
  elapsedSeconds: number;
  serverTime?: string;
  ownerName?: string;
  ownerId?: string;
  subject?: string;
}

const defaultStudyContextValue: StudyContextType = {
  me: initialMe,
  partner: initialPartner,
  tasks: initialTasks,
  healthTasks: initialHealthTasks,
  activities: initialActivities,
  weeklyProgress: weeklyProgressData,
  partnerWeeklyProgress: partnerWeeklyProgressData,
  tomorrowMyTasks: initialTomorrowMyTasks,
  tomorrowPartnerTasks: initialTomorrowPartnerTasks,
  tomorrowLocked: false,
  settings: defaultSettings,
  funIndexes: { dare: 0, icebreaker: 0, teach: 0, win: 0 },
  activeToast: null,
  celebration: null,
  taskStats: {
    totalTasks: initialTasks.length,
    completedTasks: initialTasks.filter((t) => t.completed).length,
    pendingTasks: initialTasks.filter((t) => !t.completed).length,
    percentage: 70,
    plannedStudyMinutes: 480,
    completedStudyMinutes: 320,
    remainingStudyMinutes: 160,
  },
  authUser: null,
  partnerInfo: null,
  isAuthenticated: false,
  socketConnected: false,
  activeSession: {
    status: 'idle',
    mode: 'focus',
    durationMins: 50,
    startedAt: null,
    pausedAt: null,
    elapsedSeconds: 0,
    subject: 'General Focus Target',
  },
  startStudySession: () => {},
  pauseStudySession: () => {},
  resumeStudySession: () => {},
  endStudySession: () => {},
  setSessionPreset: () => {},
  login: async () => ({ success: false, message: 'Not initialized' }),
  register: async () => ({ success: false, message: 'Not initialized' }),
  logout: () => {},
  createPartnerInvite: async () => ({ success: false }),
  joinPartnerInvite: async () => ({ success: false }),
  toggleHealthTask: () => {},
  toggleTask: () => {},
  triggerCelebration: () => {},
  clearCelebration: () => {},
  addTask: (t) => ({ ...t, id: 'temp-' + Date.now(), createdAt: new Date().toISOString() } as Task),
  updateTask: () => {},
  deleteTask: () => {},
  getTasksForDate: () => [],
  addTomorrowTask: () => {},
  deleteTomorrowTask: () => {},
  lockTomorrowPlan: () => {},
  updateMood: () => {},
  updateEnergy: () => {},
  sendEncouragement: () => {},
  nextFunCard: () => {},
  updateSettings: () => {},
  showToast: () => {},
  tomorrowPact: null,
  todayPact: null,
  activeDares: [],
  loadPacts: async () => {},
  addPactCommitment: async () => {},
  updatePactCommitment: async () => {},
  deletePactCommitment: async () => {},
  confirmTomorrowPact: async () => {},
  activateTodayPact: async () => {},
  togglePactCommitment: async () => {},
  proposeDare: async () => {},
  acceptDare: async () => {},
  skipDare: async () => {},
  completeDare: async () => {},
};

const StudyContext = createContext<StudyContextType>(defaultStudyContextValue);

const loadTasksFromLocalStorage = (): Task[] => {
  if (typeof window === 'undefined') return initialTasks;
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading tasks from localStorage:', err);
  }
  return initialTasks;
};

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(loadTasksFromLocalStorage);
  const [healthTasks, setHealthTasks] = useState<HealthTask[]>(initialHealthTasks);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [weeklyProgress] = useState<DayProgress[]>(weeklyProgressData);
  const [partnerWeeklyProgress] = useState<DayProgress[]>(partnerWeeklyProgressData);
  const [tomorrowMyTasks, setTomorrowMyTasks] = useState<TomorrowTask[]>(initialTomorrowMyTasks);
  const [tomorrowPartnerTasks, setTomorrowPartnerTasks] = useState<TomorrowTask[]>(initialTomorrowPartnerTasks);
  const [tomorrowLocked, setTomorrowLocked] = useState<boolean>(false);
  const [tomorrowPact, setTomorrowPact] = useState<TomorrowPactData | null>(null);
  const [todayPact, setTodayPact] = useState<TomorrowPactData | null>(null);
  const [activeDares, setActiveDares] = useState<DareData[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [activeToast, setActiveToast] = useState<ActiveToastPayload | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  };

  const [celebration, setCelebration] = useState<CelebrationInfo | null>(null);

  // Backend state
  const [authUser, setAuthUser] = useState<BackendUser | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerConnectionResponse | null>(null);
  const [rawMe, setMe] = useState<User>(initialMe);
  const [partner, setPartner] = useState<User>(initialPartner);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<StudySessionState>({
    status: 'idle',
    mode: 'focus',
    durationMins: 50,
    startedAt: null,
    pausedAt: null,
    elapsedSeconds: 0,
    subject: 'General Focus Target',
  });
  const processedHugsRef = useRef<Set<string>>(new Set());

  const triggerCelebration = (info: Omit<CelebrationInfo, 'id'>) => {
    setCelebration({
      ...info,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });
  };

  const clearCelebration = () => {
    setCelebration(null);
  };

  // Synchronize tasks state to localStorage for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Error persisting tasks to localStorage:', err);
    }
  }, [tasks]);

  // Load Tomorrow Pact & Dares from backend
  const loadPacts = async () => {
    try {
      const [tomorrowRes, todayRes, daresRes] = await Promise.all([
        apiClient.pacts.getTomorrow(),
        apiClient.pacts.getToday(),
        apiClient.dares.getActive(),
      ]);

      if (tomorrowRes.success && tomorrowRes.data?.pact) {
        setTomorrowPact(tomorrowRes.data.pact);
        setTomorrowLocked(tomorrowRes.data.pact.status === 'locked');
      }
      if (todayRes.success && todayRes.data?.pact) {
        setTodayPact(todayRes.data.pact);
      }
      if (daresRes.success && daresRes.data?.dares) {
        setActiveDares(daresRes.data.dares);
      }
    } catch (err) {
      console.warn('[StudyContext] Error loading pacts:', err);
    }
  };

  // Synchronize with MongoDB backend on mount and auth changes
  const syncBackendData = async () => {
    if (!isClientAuthenticated()) return;

    try {
      // 1. Fetch user profile
      const userRes = await apiClient.auth.getMe();
      if (userRes.success && userRes.data?.user) {
        const bUser = userRes.data.user;
        setAuthUser(bUser);
        setMe((prev) => ({
          ...prev,
          name: bUser.name,
          shortName: bUser.name.split(' ')[0],
          examGoal: bUser.examGoal || prev.examGoal,
          streak: bUser.streak !== undefined ? bUser.streak : prev.streak,
          avatar: bUser.avatar || prev.avatar,
          statusMessage: bUser.statusMessage || prev.statusMessage,
          isOnline: true,
        }));
      }

      // 2. Fetch partner info & auto-join room
      const partnerRes = await apiClient.partner.getCurrent();
      if (partnerRes.success && partnerRes.data) {
        setPartnerInfo(partnerRes.data);
        if (partnerRes.data.roomCode) {
          joinPartnerRoom(partnerRes.data.roomCode);
        }
        if (partnerRes.data.activeSession) {
          const act = partnerRes.data.activeSession;
          setActiveSession({
            status: act.status || 'idle',
            mode: act.mode || 'focus',
            durationMins: act.durationMins || 50,
            startedAt: act.startedAt ? new Date(act.startedAt).toISOString() : null,
            pausedAt: act.pausedAt ? new Date(act.pausedAt).toISOString() : null,
            elapsedSeconds: act.elapsedSeconds || 0,
            ownerName: act.ownerName,
            ownerId: act.ownerId,
            subject: act.subject || 'General Focus Target',
          });
        }
        if (partnerRes.data.partner) {
          const bPartner = partnerRes.data.partner;
          setPartner((prev) => ({
            ...prev,
            name: bPartner.name,
            shortName: bPartner.name.split(' ')[0],
            examGoal: bPartner.examGoal || prev.examGoal,
            avatar: bPartner.avatar || prev.avatar,
            statusMessage: bPartner.statusMessage || prev.statusMessage,
            isOnline: Boolean(bPartner.isOnline),
            streak: bPartner.streak !== undefined ? bPartner.streak : prev.streak,
          }));
        }
      }

      // 3. Fetch remote tasks & merge
      const merged = await fetchAndMergeRemoteTasks(tasks);
      if (merged && merged.length > 0) {
        setTasks(merged);
      }

      // 4. Load Tomorrow Pact & Dares
      await loadPacts();
    } catch (err) {
      console.warn('[StudyContext] Background sync notice:', err);
    }
  };

  useEffect(() => {
    syncBackendData();
  }, []);

  // --- Real-time Socket.IO Listeners ---
  useEffect(() => {
    const socket = connectSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setSocketConnected(socket.connected);

    // 1. Partner Online/Offline Status (Requirement 5)
    const unsubStatus = onPartnerStatusChanged((payload) => {
      setPartner((prev) => ({
        ...prev,
        isOnline: payload.isOnline,
      }));
    });

    // 2. Partner Paired in Real Time (Requirement 2)
    const unsubPaired = onPartnerPaired((payload) => {
      if (payload.partner) {
        const bPartner = payload.partner;
        setPartner((prev) => ({
          ...prev,
          name: bPartner.name,
          shortName: bPartner.name.split(' ')[0],
          examGoal: bPartner.examGoal || prev.examGoal,
          avatar: bPartner.avatar || prev.avatar,
          isOnline: true,
        }));
        setPartnerInfo({
          connected: true,
          roomCode: payload.roomCode,
          connectionId: payload.connectionId,
          partner: bPartner,
        });
        showToast(`✨ Study partner connected in real time: ${bPartner.name}!`);
      }
    });

    // 3. Partner Task Created (Requirement 3)
    const unsubTaskCreated = onPartnerTaskCreated((payload) => {
      if (!payload.task) return;
      const partnerTask: Task = {
        ...payload.task,
        owner: 'partner',
        assignedTo: 'partner',
      };
      setTasks((prev) => {
        if (prev.some((t) => t.id === partnerTask.id || (t.title === partnerTask.title && t.owner === 'partner'))) {
          return prev;
        }
        return [partnerTask, ...prev];
      });
      const partnerName = payload.userName || partner.shortName;
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          text: `${partnerName} added task: "${partnerTask.title.split('—')[0].trim()}".`,
          time: 'Just now',
          type: 'task',
          actor: 'partner',
        },
        ...prev.slice(0, 7),
      ]);
    });

    // 4. Partner Task Completed & Virtual Hug (Requirement 3 & 4)
    const unsubTaskCompleted = onPartnerTaskCompleted((payload) => {
      const taskId = payload.taskId || payload.task?.id;
      if (!taskId) return;

      const eventKey = `${taskId}-${payload.completedAt || ''}`;
      if (processedHugsRef.current.has(eventKey)) return;
      processedHugsRef.current.add(eventKey);

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId || (payload.task?.title && t.title === payload.task.title && t.owner === 'partner')) {
            return {
              ...t,
              completed: true,
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return t;
        })
      );

      const partnerName = payload.userName || partner.shortName;
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          text: `${partnerName} completed "${(payload.task?.title || 'a study task').split('—')[0].trim()}".`,
          time: 'Just now',
          type: 'task',
          actor: 'partner',
        },
        ...prev.slice(0, 7),
      ]);

      // Trigger the existing Virtual Hug celebration
      showToast(`🎉 ${partnerName} completed a task! Virtual hug unlocked 🫂`);
      triggerCelebration({
        title: `${partnerName} Completed a Task! 🎉`,
        subtitle: 'Virtual hug unlocked 🫂',
        message: `${partnerName} finished "${(payload.task?.title || 'a study task').split('—')[0].trim()}". Virtual hug unlocked! 🫂`,
        type: 'study',
      });
    });

    // 5. Partner Task Uncompleted
    const unsubTaskUncompleted = onPartnerTaskUncompleted((payload) => {
      const taskId = payload.taskId || payload.task?.id;
      if (!taskId) return;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId || (payload.task?.title && t.title === payload.task.title && t.owner === 'partner')) {
            return { ...t, completed: false, completedAt: undefined };
          }
          return t;
        })
      );
    });

    // 6. Partner Task Updated
    const unsubTaskUpdated = onPartnerTaskUpdated((payload) => {
      const taskId = payload.taskId;
      if (!taskId) return;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...payload.updates, owner: 'partner' } : t))
      );
    });

    // 7. Partner Task Deleted
    const unsubTaskDeleted = onPartnerTaskDeleted((payload) => {
      if (!payload.taskId) return;
      setTasks((prev) => prev.filter((t) => t.id !== payload.taskId));
    });

    // 8. Partner Check-In Updated (Requirement 6)
    const unsubCheckIn = onPartnerCheckInUpdated((payload) => {
      setPartner((prev) => ({
        ...prev,
        mood: (payload.mood as any) || prev.mood,
        energyLevel: payload.energyLevel || prev.energyLevel,
        statusMessage: payload.statusMessage || prev.statusMessage,
      }));
      showToast(`${partner.shortName} updated check-in: ${payload.reaction || '✨'} ${payload.mood || ''}`);
    });

    // 9. Partner Cheered
    const unsubCheered = onPartnerCheered((payload) => {
      showToast(`${payload.userName || partner.shortName} cheered you: ${payload.reaction} ${payload.message}`);
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          text: `${payload.userName || partner.shortName} cheered you: ${payload.reaction}`,
          time: 'Just now',
          type: 'reaction',
          actor: 'partner',
        },
        ...prev.slice(0, 7),
      ]);
    });

    // 10. Study Session Started (Requirement 5)
    const unsubSessionStarted = onStudySessionStarted((payload) => {
      setActiveSession({
        status: payload.status,
        mode: payload.mode,
        durationMins: payload.durationMins,
        startedAt: payload.startedAt || null,
        pausedAt: payload.pausedAt || null,
        elapsedSeconds: payload.elapsedSeconds || 0,
        serverTime: payload.serverTime,
        ownerName: payload.ownerName,
        ownerId: payload.ownerId,
        subject: payload.subject,
      });
      showToast(`🎯 ${payload.ownerName || partner.shortName} started a ${payload.durationMins}m ${payload.mode} session!`);
    });

    // 11. Study Session Updated (Pause / Resume / Preset)
    const unsubSessionUpdated = onStudySessionUpdated((payload) => {
      setActiveSession((prev) => ({
        ...prev,
        status: payload.status,
        mode: payload.mode,
        durationMins: payload.durationMins,
        startedAt: payload.startedAt !== undefined ? payload.startedAt : prev.startedAt,
        pausedAt: payload.pausedAt !== undefined ? payload.pausedAt : prev.pausedAt,
        elapsedSeconds: payload.elapsedSeconds !== undefined ? payload.elapsedSeconds : prev.elapsedSeconds,
        serverTime: payload.serverTime,
      }));
      if (payload.action === 'pause') {
        showToast(`⏸️ ${payload.ownerName || partner.shortName} paused the study session.`);
      } else if (payload.action === 'resume') {
        showToast(`▶️ ${payload.ownerName || partner.shortName} resumed the study session.`);
      }
    });

    // 12. Study Session Ended
    const unsubSessionEnded = onStudySessionEnded((payload) => {
      setActiveSession((prev) => ({
        ...prev,
        status: 'ended',
        elapsedSeconds: payload.elapsedSeconds || 0,
      }));
      showToast(`🏁 ${payload.endedBy || partner.shortName} completed the study session!`);
    });

    // 13. Progress Updated
    const unsubProgress = onProgressUpdated((payload) => {
      setPartner((prev) => ({
        ...prev,
        tasksCompleted: payload.completedTasks,
        totalTasks: payload.totalTasks,
        streak: payload.streak !== undefined ? payload.streak : prev.streak,
        todayStudyMinutes: payload.todayStudyMinutes !== undefined ? payload.todayStudyMinutes : prev.todayStudyMinutes,
      }));
    });

    // 14. Streak Updated
    const unsubStreak = onStreakUpdated((payload) => {
      setPartner((prev) => ({
        ...prev,
        streak: payload.streak,
      }));
    });

    // 15. Notification Created
    const unsubNotification = onNotificationCreated((payload) => {
      setActivities((prev) => {
        if (prev.some((a) => a.id === payload.id)) return prev;
        return [
          {
            id: payload.id,
            text: payload.text,
            time: 'Just now',
            type: payload.type as any,
            actor: payload.actor || 'partner',
          },
          ...prev.slice(0, 7),
        ];
      });
    });

    // 16. Check-in Submitted alias
    const unsubCheckInSubmitted = onCheckInSubmitted((payload) => {
      setPartner((prev) => ({
        ...prev,
        mood: (payload.mood as any) || prev.mood,
        energyLevel: payload.energyLevel || prev.energyLevel,
        statusMessage: payload.statusMessage || prev.statusMessage,
      }));
    });

    // 17. Step 6: Tomorrow Pact Created
    const unsubPactCreated = onPactCreated((payload) => {
      if (payload.pact) {
        setTomorrowPact(payload.pact);
      }
    });

    // 18. Step 6: Tomorrow Pact Updated
    const unsubPactUpdated = onPactUpdated((payload) => {
      if (payload.pact) {
        setTomorrowPact((prev) => (prev && prev._id === payload.pact?._id ? payload.pact! : payload.pact!));
        if (payload.pact.status === 'locked') {
          setTomorrowLocked(true);
        }
      }
    });

    // 18. Step 6: Tomorrow Pact Confirmed
    const unsubPactConfirmed = onPactConfirmed((payload) => {
      setTomorrowPact((prev) => {
        if (!prev || prev._id !== payload.pactId) return prev;
        return {
          ...prev,
          confirmations: payload.confirmations,
          status: payload.isLocked ? 'locked' : prev.status,
        };
      });
      if (payload.isLocked) {
        setTomorrowLocked(true);
        showToast("🔒 Mutual lock achieved! Tomorrow's study pact is locked!");
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        showToast(`✓ ${payload.userName || 'Partner'} confirmed tomorrow's pact!`);
      }
    });

    // 19. Step 6: Tomorrow Pact Finalized (Locked)
    const unsubPactFinalized = onPactFinalized((payload) => {
      setTomorrowLocked(true);
      setTomorrowPact((prev) => (prev && prev._id === payload.pactId ? { ...prev, status: 'locked' } : prev));
    });

    // 20. Step 6: Tomorrow Pact Activated
    const unsubPactActivated = onPactActivated((payload) => {
      if (payload.pact) {
        setTodayPact(payload.pact);
      }
      showToast("🌅 Today's Tomorrow Pact is now active!");
    });

    // 21. Step 6: Pact Commitment Completed
    const unsubCommitmentCompleted = onPactCommitmentCompleted((payload) => {
      const updater = (prev: TomorrowPactData | null) => {
        if (!prev || prev._id !== payload.pactId) return prev;
        return {
          ...prev,
          commitments: prev.commitments.map((c) =>
            c._id === payload.commitmentId || c.id === payload.commitmentId
              ? { ...c, status: payload.status as CommitmentStatus, completedAt: payload.completedAt }
              : c
          ),
        };
      };
      setTomorrowPact(updater);
      setTodayPact(updater);
      if (payload.status === 'completed') {
        showToast(`Partner cleared a commitment: ${payload.userName || 'Study Partner'} ✨`);
      }
    });

    // 22. Step 6: Dare Created
    const unsubDareCreated = onDareCreated((payload) => {
      if (payload.dare) {
        setActiveDares((prev) => [payload.dare, ...prev.filter((d) => d._id !== payload.dare._id)]);
        showToast(`🎯 New dare proposed: "${payload.dare.title}"!`);
      }
    });

    // 23. Step 6: Dare Updated
    const unsubDareUpdated = onDareUpdated((payload) => {
      if (payload.dare) {
        setActiveDares((prev) => prev.map((d) => (d._id === payload.dare._id ? payload.dare : d)));
      }
    });

    // 24. Step 6: Dare Completed
    const unsubDareCompleted = onDareCompleted((payload) => {
      if (payload.dare) {
        setActiveDares((prev) => prev.map((d) => (d._id === payload.dare._id ? payload.dare : d)));
        showToast(`🎉 Dare completed by ${payload.completedBy || 'partner'}!`);
      }
    });

    // 25. Step 6: Accountability Notification Relay
    const unsubAccNotif = onAccountabilityNotification((payload) => {
      showToast(`${payload.title}: ${payload.text}`);
    });

    return () => {
      const s = getSocket();
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      unsubStatus();
      unsubPaired();
      unsubTaskCreated();
      unsubTaskCompleted();
      unsubTaskUncompleted();
      unsubTaskUpdated();
      unsubTaskDeleted();
      unsubCheckIn();
      unsubCheered();
      unsubSessionStarted();
      unsubSessionUpdated();
      unsubSessionEnded();
      unsubProgress();
      unsubStreak();
      unsubNotification();
      unsubCheckInSubmitted();
      unsubPactCreated();
      unsubPactUpdated();
      unsubPactConfirmed();
      unsubPactFinalized();
      unsubPactActivated();
      unsubCommitmentCompleted();
      unsubDareCreated();
      unsubDareUpdated();
      unsubDareCompleted();
      unsubAccNotif();
    };
  }, [partner.shortName]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.auth.login({ email, password });
    if (res.success && res.data?.user) {
      setAuthUser(res.data.user);
      connectSocket(res.data.token);
      showToast(`Welcome back, ${res.data.user.name}! 🌸`);
      await syncBackendData();
      return { success: true, message: 'Logged in successfully' };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiClient.auth.register({ name, email, password });
    if (res.success && res.data?.user) {
      setAuthUser(res.data.user);
      connectSocket(res.data.token);
      showToast(`Account created! Welcome, ${res.data.user.name}! ✨`);
      await syncBackendData();
      return { success: true, message: 'Account registered successfully' };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    apiClient.auth.logout();
    disconnectSocket();
    setAuthUser(null);
    setPartnerInfo(null);
    showToast('Logged out.');
  };

  const createPartnerInvite = async () => {
    const res = await apiClient.partner.createInvite();
    if (res.success && res.data?.roomCode) {
      setPartnerInfo((prev) => ({
        connected: false,
        roomCode: res.data!.roomCode,
        connectionId: res.data!.connectionId,
        partner: prev?.partner || null,
      }));
      joinPartnerRoom(res.data.roomCode);
      showToast(`Room code generated: ${res.data.roomCode}`);
      return { success: true, roomCode: res.data.roomCode };
    }
    return { success: false, message: res.message || 'Failed to create partner invite' };
  };

  const joinPartnerInvite = async (roomCode: string) => {
    const res = await apiClient.partner.joinInvite(roomCode);
    if (res.success && res.data?.partner) {
      const bPartner = res.data.partner;
      setPartner((prev) => ({
        ...prev,
        name: bPartner.name,
        shortName: bPartner.name.split(' ')[0],
        examGoal: bPartner.examGoal || prev.examGoal,
        avatar: bPartner.avatar || prev.avatar,
        statusMessage: bPartner.statusMessage || prev.statusMessage,
        isOnline: Boolean(bPartner.isOnline),
      }));
      setPartnerInfo({
        connected: true,
        roomCode,
        connectionId: res.data.connectionId,
        partner: bPartner,
      });
      joinPartnerRoom(roomCode);
      showToast(`Connected with your study partner: ${bPartner.name}! 🎉`);
      return { success: true };
    }
    return { success: false, message: res.message || 'Failed to join partner room' };
  };

  const [funIndexes, setFunIndexes] = useState({
    dare: 0,
    icebreaker: 0,
    teach: 0,
    win: 0,
  });

  // Derive dynamic task statistics for the user (Alex / CDS)
  const myTasks = tasks.filter((t) => t.owner === 'me' || t.assignedTo === 'me');
  const myStudyTasks = myTasks.filter((t) => t.type === 'study');
  const completedTasksList = myTasks.filter((t) => t.completed);

  const plannedStudyMinutes = myStudyTasks.reduce(
    (acc, t) => acc + (Number(t.estimatedMinutes) || 0),
    0
  );
  const completedStudyMinutes = myStudyTasks
    .filter((t) => t.completed)
    .reduce((acc, t) => acc + (Number(t.estimatedMinutes) || 0), 0);
  const remainingStudyMinutes = Math.max(0, plannedStudyMinutes - completedStudyMinutes);

  const taskStats: TaskStats = {
    totalTasks: myTasks.length,
    completedTasks: completedTasksList.length,
    pendingTasks: myTasks.length - completedTasksList.length,
    percentage:
      myTasks.length > 0 ? Math.round((completedTasksList.length / myTasks.length) * 100) : 0,
    plannedStudyMinutes,
    completedStudyMinutes,
    remainingStudyMinutes,
  };

  // Live user profile dynamically bound to task state
  const me: User = {
    ...rawMe,
    tasksCompleted: taskStats.completedTasks,
    totalTasks: taskStats.totalTasks,
    todayStudyMinutes: taskStats.completedStudyMinutes,
    targetStudyMinutes:
      taskStats.plannedStudyMinutes > 0 ? taskStats.plannedStudyMinutes : rawMe.targetStudyMinutes,
  };

  const toggleHealthTask = (id: string) => {
    setHealthTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newState = !t.completed;
          if (newState) {
            showToast(`Great habit! ${t.title} checked off.`);
            const isWater = t.title.toLowerCase().includes('water');
            triggerCelebration({
              title: isWater ? 'Hydration Complete! 💧' : 'Task Complete! 🌿',
              subtitle: 'Virtual hug unlocked 🫂',
              message: isWater
                ? 'Hydration mission complete! 💧🫂'
                : 'Taking care of yourself counts too. 🫂',
              type: isWater ? 'water' : 'wellness',
            });
          }
          return { ...t, completed: newState };
        }
        return t;
      })
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const willComplete = !t.completed;
          const updated: Task = {
            ...t,
            completed: willComplete,
            completedAt: willComplete
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };

          if (willComplete) {
            showToast(`Completed: ${t.title}`);
            const newAct: ActivityItem = {
              id: `act-${Date.now()}`,
              text: `You completed "${t.title.split('—')[0].trim()}".`,
              time: 'Just now',
              type: 'task',
              actor: t.owner || 'me',
            };
            setActivities((prevAct) => [newAct, ...prevAct.slice(0, 7)]);
            triggerCelebration({
              title: 'Task Complete! 🎉',
              subtitle: 'Virtual hug unlocked 🫂',
              message: 'Nice work! 🫂',
              type: 'study',
            });
          } else {
            showToast(`Marked pending: ${t.title}`);
          }
          return updated;
        }
        return t;
      })
    );

    // Asynchronously sync toggle to MongoDB
    syncTaskToggle(id);

    // Emit real-time completion/uncompletion to partner
    const targetTask = tasks.find((t) => t.id === id);
    if (targetTask) {
      if (!targetTask.completed) {
        emitTaskCompleted({ ...targetTask, completed: true });
      } else {
        emitTaskUncompleted(id, { ...targetTask, completed: false });
      }
    }
  };

  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt'> & { createdAt?: string }) => {
    const tempId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTask: Task = {
      ...newTaskData,
      id: tempId,
      createdAt: newTaskData.createdAt || new Date().toISOString(),
      completed: newTaskData.completed || false,
      owner: newTaskData.owner || 'me',
      assignedTo: newTaskData.owner || 'me',
      mandatory: Boolean(newTaskData.mandatory),
      category: newTaskData.category || 'CDS',
      type: newTaskData.type || 'study',
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Added task: ${newTask.title}`);

    // Emit real-time task creation to partner
    emitTaskCreated(newTask);

    // Asynchronously persist to MongoDB and update id
    if (isClientAuthenticated()) {
      syncTaskCreate(newTask).then((remoteId) => {
        if (remoteId) {
          setTasks((curr) =>
            curr.map((t) => (t.id === tempId ? { ...t, id: remoteId } : t))
          );
        }
      });
    }

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            ...updates,
            assignedTo: updates.owner || t.owner || 'me',
          };
        }
        return t;
      })
    );
    showToast('Task updated successfully.');
    syncTaskUpdate(id, updates);
    emitTaskUpdated(id, updates);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task deleted.');
    syncTaskDelete(id);
    emitTaskDeleted(id);
  };

  const getTasksForDate = (dateStr: string): Task[] => {
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  // Step 6: Pact & Dare Actions
  const addPactCommitment = async (commitment: Partial<TomorrowPactCommitment>) => {
    let currentPact = tomorrowPact;
    if (!currentPact?._id) {
      const res = await apiClient.pacts.getTomorrow();
      if (res.data?.pact) {
        currentPact = res.data.pact;
        setTomorrowPact(currentPact);
      }
    }
    const pactId = currentPact?._id;
    if (!pactId) return;

    const res = await apiClient.pacts.addCommitment(pactId, commitment);
    if (res.success && res.data?.pact) {
      setTomorrowPact(res.data.pact);
      showToast(`Planned for tomorrow: ${commitment.title}`);
    } else {
      showToast(res.message || 'Could not add commitment');
    }
  };

  const updatePactCommitment = async (commitmentId: string, updates: Partial<TomorrowPactCommitment>) => {
    if (!tomorrowPact?._id) return;
    const res = await apiClient.pacts.updateCommitment(tomorrowPact._id, commitmentId, updates);
    if (res.success && res.data?.pact) {
      setTomorrowPact(res.data.pact);
      showToast('Commitment updated');
    }
  };

  const deletePactCommitment = async (commitmentId: string) => {
    if (!tomorrowPact?._id) return;
    const res = await apiClient.pacts.deleteCommitment(tomorrowPact._id, commitmentId);
    if (res.success && res.data?.pact) {
      setTomorrowPact(res.data.pact);
      showToast('Removed commitment from Tomorrow Pact');
    }
  };

  const confirmTomorrowPact = async () => {
    if (!tomorrowPact?._id) return;
    const res = await apiClient.pacts.confirm(tomorrowPact._id);
    if (res.success && res.data?.pact) {
      setTomorrowPact(res.data.pact);
      if (res.data.isLocked) {
        setTomorrowLocked(true);
        showToast("🔒 Mutual lock achieved! Tomorrow's study pact is locked!");
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        showToast('✓ Confirmed! Waiting for your study partner to confirm...');
      }
    }
  };

  const activateTodayPact = async () => {
    if (!todayPact?._id) return;
    const res = await apiClient.pacts.activate(todayPact._id);
    if (res.success && res.data?.pact) {
      setTodayPact(res.data.pact);
      showToast("🚀 Today's pact is active! Let's crush these targets!");
    }
  };

  const togglePactCommitment = async (commitmentId: string) => {
    const pactId = todayPact?._id || tomorrowPact?._id;
    if (!pactId) return;

    const res = await apiClient.pacts.completeCommitment(pactId, commitmentId);
    if (res.success && res.data?.pact) {
      if (todayPact && todayPact._id === pactId) {
        setTodayPact(res.data.pact);
      } else {
        setTomorrowPact(res.data.pact);
      }

      if (res.data.commitment?.status === 'completed') {
        showToast(`Cleared: "${res.data.commitment.title}" ✨`);
      }
    }
  };

  const proposeDare = async (dareData: Partial<DareData>) => {
    const res = await apiClient.dares.create(dareData);
    if (res.success && res.data?.dare) {
      const newDare = res.data.dare;
      setActiveDares((prev) => [newDare, ...prev]);
      showToast(`🎯 Dare sent to partner: "${newDare.title}"`);
    } else {
      showToast(res.message || 'Failed to send dare');
    }
  };

  const acceptDare = async (dareId: string) => {
    const res = await apiClient.dares.updateStatus(dareId, 'accepted');
    if (res.success && res.data?.dare) {
      const updatedDare = res.data.dare;
      setActiveDares((prev) => prev.map((d) => (d._id === dareId ? updatedDare : d)));
      showToast('Dare accepted! Show your partner what you got 🔥');
    }
  };

  const skipDare = async (dareId: string) => {
    const res = await apiClient.dares.updateStatus(dareId, 'skipped');
    if (res.success && res.data?.dare) {
      const updatedDare = res.data.dare;
      setActiveDares((prev) => prev.map((d) => (d._id === dareId ? updatedDare : d)));
      showToast('Dare skipped. No stress at all! 😊');
    }
  };

  const completeDare = async (dareId: string) => {
    const res = await apiClient.dares.updateStatus(dareId, 'completed');
    if (res.success && res.data?.dare) {
      const updatedDare = res.data.dare;
      setActiveDares((prev) => prev.map((d) => (d._id === dareId ? updatedDare : d)));
      showToast('🎉 Dare conquered! You two are amazing!');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const addTomorrowTask = (data: Omit<TomorrowTask, 'id'>) => {
    const item: TomorrowTask = {
      ...data,
      id: `tm-${Date.now()}`,
    };
    if (data.assignedTo === 'me') {
      setTomorrowMyTasks((prev) => [...prev, item]);
    } else {
      setTomorrowPartnerTasks((prev) => [...prev, item]);
    }

    // Also persist to backend tomorrowPact if available
    addPactCommitment({
      title: data.title,
      category: (data.subject as any) || 'CDS',
      estimatedMinutes: Math.round((data.estimatedHours || 1) * 60),
      mandatory: data.priority === 'high' || data.priority === 'High',
    });
  };

  const deleteTomorrowTask = (id: string) => {
    setTomorrowMyTasks((prev) => prev.filter((t) => t.id !== id));
    setTomorrowPartnerTasks((prev) => prev.filter((t) => t.id !== id));
    deletePactCommitment(id);
  };

  const lockTomorrowPlan = (locked: boolean) => {
    setTomorrowLocked(locked);
    if (locked) {
      confirmTomorrowPact();
    } else {
      showToast("Unlocked tomorrow's plan for editing.");
    }
  };

  const updateMood = (mood: MoodType) => {
    setMe((prev) => ({ ...prev, mood }));
    showToast(`Mood updated to: ${mood.toUpperCase()} ✨`);
    apiClient.checkin.submit({ mood });
    emitCheckInUpdate({ mood });
  };

  const updateEnergy = (level: number) => {
    setMe((prev) => ({ ...prev, energyLevel: level }));
    showToast(`Energy level set to: ${level}/5 ⚡`);
    apiClient.checkin.submit({ energyLevel: level });
    emitCheckInUpdate({ energyLevel: level });
  };

  const sendEncouragement = (emoji: string) => {
    showToast(`Sent encouragement reaction: ${emoji} to ${partner.shortName}!`);
    emitCheer(emoji);
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      text: `You sent ${partner.shortName} an encouragement cheer: ${emoji}`,
      time: 'Just now',
      type: 'reaction',
      actor: 'me',
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 7)]);
  };

  const nextFunCard = (category: 'dare' | 'icebreaker' | 'teach' | 'win') => {
    setFunIndexes((prev) => {
      let max = 1;
      if (category === 'dare') max = randomDaresPool.length;
      if (category === 'icebreaker') max = icebreakersPool.length;
      if (category === 'teach') max = teachMePool.length;
      if (category === 'win') max = tinyWinsPool.length;
      return {
        ...prev,
        [category]: (prev[category] + 1) % max,
      };
    });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (newSettings.profileName) {
      setMe((m) => ({ ...m, name: newSettings.profileName! }));
    }
    if (newSettings.examGoal) {
      setMe((m) => ({ ...m, examGoal: newSettings.examGoal! }));
    }
    showToast('Settings saved successfully.');
  };

  const startStudySession = (mode: 'focus' | 'break' = 'focus', durationMins: number = 50, subject?: string) => {
    const now = new Date().toISOString();
    const subj = subject || me.currentSubject || 'General Focus Target';
    setActiveSession({
      status: 'active',
      mode,
      durationMins,
      startedAt: now,
      pausedAt: null,
      elapsedSeconds: 0,
      serverTime: now,
      ownerName: me.name,
      ownerId: authUser?._id || 'me',
      subject: subj,
    });
    emitStudySessionStarted({ mode, durationMins, subject: subj });
    showToast(`Started ${durationMins}m ${mode} session! 🎯`);
  };

  const pauseStudySession = () => {
    setActiveSession((prev) => {
      const updated: StudySessionState = {
        ...prev,
        status: 'paused',
        pausedAt: new Date().toISOString(),
      };
      emitStudySessionUpdated({ action: 'pause', elapsedSeconds: prev.elapsedSeconds });
      return updated;
    });
    showToast('Session paused.');
  };

  const resumeStudySession = () => {
    setActiveSession((prev) => {
      const updated: StudySessionState = {
        ...prev,
        status: 'active',
        pausedAt: null,
        startedAt: new Date(Date.now() - prev.elapsedSeconds * 1000).toISOString(),
      };
      emitStudySessionUpdated({ action: 'resume', elapsedSeconds: prev.elapsedSeconds });
      return updated;
    });
    showToast('Session resumed.');
  };

  const endStudySession = () => {
    setActiveSession((prev) => {
      emitStudySessionEnded({ elapsedSeconds: prev.elapsedSeconds, mode: prev.mode });
      return {
        ...prev,
        status: 'ended',
      };
    });
    showToast('Study session ended.');
  };

  const setSessionPreset = (mins: number, mode: 'focus' | 'break') => {
    setActiveSession({
      status: 'idle',
      mode,
      durationMins: mins,
      startedAt: null,
      pausedAt: null,
      elapsedSeconds: 0,
      subject: me.currentSubject || 'General Focus Target',
    });
    emitStudySessionUpdated({ action: 'preset', mode, durationMins: mins });
  };

  return (
    <StudyContext.Provider
      value={{
        me,
        partner,
        tasks,
        healthTasks,
        activities,
        weeklyProgress,
        partnerWeeklyProgress,
        tomorrowMyTasks,
        tomorrowPartnerTasks,
        tomorrowLocked,
        settings,
        funIndexes,
        activeToast,
        celebration,
        taskStats,
        authUser,
        partnerInfo,
        isAuthenticated: Boolean(authUser || isClientAuthenticated()),
        socketConnected,
        activeSession,
        startStudySession,
        pauseStudySession,
        resumeStudySession,
        endStudySession,
        setSessionPreset,
        login,
        register,
        logout,
        createPartnerInvite,
        joinPartnerInvite,
        toggleHealthTask,
        toggleTask,
        triggerCelebration,
        clearCelebration,
        addTask,
        updateTask,
        deleteTask,
        getTasksForDate,
        addTomorrowTask,
        deleteTomorrowTask,
        lockTomorrowPlan,
        updateMood,
        updateEnergy,
        sendEncouragement,
        nextFunCard,
        updateSettings,
        showToast,
        tomorrowPact,
        todayPact,
        activeDares,
        loadPacts,
        addPactCommitment,
        updatePactCommitment,
        deletePactCommitment,
        confirmTomorrowPact,
        activateTodayPact,
        togglePactCommitment,
        proposeDare,
        acceptDare,
        skipDare,
        completeDare,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  return context || defaultStudyContextValue;
};
