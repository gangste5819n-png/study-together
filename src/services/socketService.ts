/**
 * Socket.IO Real-Time Client Service
 * Manages authenticated WebSocket connections, partner room synchronization,
 * online presence, and real-time task & celebration events.
 */

import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './apiClient';
import type { Task, TomorrowPactData, TomorrowPactCommitment, PactConfirmation, DareData, AppNotification } from '../types';

const SOCKET_SERVER_URL =
  (import.meta.env.VITE_SOCKET_URL as string) ||
  (import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, '') ||
  'http://localhost:5001';

let socketInstance: Socket | null = null;
let currentRoomCode: string | null = null;

export interface PartnerStatusPayload {
  userId: string;
  userName?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface PartnerTaskPayload {
  taskId?: string;
  task?: Task;
  updates?: Partial<Task>;
  userId?: string;
  userName?: string;
  completedAt?: string;
  message?: string;
  timestamp?: string;
}

export interface PartnerCheckInPayload {
  userId?: string;
  userName?: string;
  mood?: string;
  energyLevel?: number;
  reaction?: string;
  statusMessage?: string;
  timestamp?: string;
}

export interface PartnerCheerPayload {
  userId?: string;
  userName?: string;
  reaction: string;
  message: string;
  timestamp?: string;
}

export interface IncomingCallPayload {
  callerId: string;
  callerSocketId?: string;
  callerName: string;
  callerAvatar?: string;
  roomCode: string;
  timestamp: string;
}

export interface CallAcceptedPayload {
  calleeId: string;
  calleeSocketId?: string;
  calleeName: string;
  roomCode: string;
  timestamp: string;
}

export interface CallRejectedPayload {
  reason: string;
  calleeId: string;
  calleeName: string;
  timestamp: string;
}

export interface CallEndedPayload {
  endedBy: string;
  userName?: string;
  reason?: string;
  timestamp: string;
}

export interface PartnerMediaStatePayload {
  userId: string;
  userName?: string;
  micOn: boolean;
  camOn: boolean;
  timestamp: string;
}

export interface WebRtcOfferPayload {
  offer: RTCSessionDescriptionInit;
  senderId: string;
  senderUser?: { userId?: string; userName?: string };
  timestamp?: string;
}

export interface WebRtcAnswerPayload {
  answer: RTCSessionDescriptionInit;
  senderId: string;
  timestamp?: string;
}

export interface WebRtcIceCandidatePayload {
  candidate: RTCIceCandidateInit;
  senderId: string;
}

export interface StudySessionPayload {
  status: 'idle' | 'active' | 'paused' | 'ended';
  mode: 'focus' | 'break';
  durationMins: number;
  startedAt?: string | null;
  pausedAt?: string | null;
  elapsedSeconds?: number;
  serverTime?: string;
  ownerId?: string;
  ownerName?: string;
  subject?: string;
  action?: string;
  completedMinutes?: number;
  endedBy?: string;
  timestamp?: string;
}

export interface ProgressUpdatedPayload {
  userId: string;
  userName?: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  streak?: number;
  todayStudyMinutes?: number;
  timestamp: string;
}

export interface StreakUpdatedPayload {
  userId: string;
  userName?: string;
  streak: number;
  timestamp: string;
}

export interface NotificationPayload {
  id: string;
  title: string;
  text: string;
  type: 'task' | 'checkin' | 'session' | 'reaction' | 'general' | 'plan';
  timestamp: string;
  actor?: 'me' | 'partner' | 'both';
}

export interface PactUpdatedPayload {
  pactId: string;
  pact?: TomorrowPactData;
  commitment?: TomorrowPactCommitment;
  commitmentId?: string;
  action?: 'added' | 'edited' | 'deleted';
  userName?: string;
  timestamp?: string;
}

export interface PactConfirmedPayload {
  pactId: string;
  userId: string;
  userName?: string;
  confirmations: PactConfirmation[];
  isLocked: boolean;
  pact?: TomorrowPactData;
  timestamp?: string;
}

export interface PactFinalizedPayload {
  pactId: string;
  status: 'locked';
  finalizedAt?: string;
  pact?: TomorrowPactData;
  timestamp?: string;
}

export interface PactActivatedPayload {
  pactId: string;
  status: 'active';
  date?: string;
  activatedAt?: string;
  pact?: TomorrowPactData;
  timestamp?: string;
}

export interface PactCommitmentCompletedPayload {
  pactId: string;
  commitmentId: string;
  status: 'completed' | 'pending';
  completedAt?: string | null;
  ownerId: string;
  completedCount?: number;
  totalCount?: number;
  percentage?: number;
  userName?: string;
  timestamp?: string;
}

export interface DarePayload {
  dare: DareData;
  dareId?: string;
  status?: string;
  proposedBy?: string;
  updatedBy?: string;
  completedBy?: string;
  timestamp?: string;
}

/**
 * Get or initialize the singleton Socket.IO instance
 */
export const getSocket = (): Socket => {
  if (socketInstance) {
    return socketInstance;
  }

  const token = getAuthToken();

  socketInstance = io(SOCKET_SERVER_URL, {
    transports: ['websocket', 'polling'],
    auth: {
      token: token || undefined,
    },
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    timeout: 15000,
  });

  socketInstance.on('connect', () => {
    console.log('[SocketService] Connected to real-time server:', socketInstance?.id);
    if (currentRoomCode) {
      socketInstance?.emit('join_partner_room', { roomCode: currentRoomCode });
    }
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[SocketService] Disconnected:', reason);
  });

  socketInstance.on('connect_error', (err) => {
    console.warn('[SocketService] Connection notice:', err.message);
  });

  return socketInstance;
};

/**
 * Establish or refresh socket connection with optional token
 */
export const connectSocket = (token?: string): Socket => {
  const authToken = token || getAuthToken();

  if (socketInstance) {
    if (socketInstance.connected) {
      if (authToken) {
        socketInstance.auth = { token: authToken };
      }
      return socketInstance;
    }
    socketInstance.auth = { token: authToken || undefined };
    socketInstance.connect();
    return socketInstance;
  }

  return getSocket();
};

/**
 * Disconnect socket cleanly
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    currentRoomCode = null;
  }
};

/**
 * Check if socket is currently connected
 */
export const isSocketConnected = (): boolean => {
  return Boolean(socketInstance && socketInstance.connected);
};

/**
 * Join a partner room
 */
export const joinPartnerRoom = (roomCode: string): void => {
  currentRoomCode = roomCode.trim().toUpperCase();
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('join_partner_room', { roomCode: currentRoomCode });
  }
};

/**
 * Leave the current partner room
 */
export const leavePartnerRoom = (): void => {
  if (socketInstance && currentRoomCode) {
    socketInstance.emit('leave_partner_room');
  }
  currentRoomCode = null;
};

// --- Emitters ---

export const emitTaskCreated = (task: Task): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('task_created', { task });
  }
};

export const emitTaskCompleted = (task: Task): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('task_completed', { taskId: task.id, task });
  }
};

export const emitTaskUncompleted = (taskId: string, task?: Task): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('task_uncompleted', { taskId, task });
  }
};

export const emitTaskUpdated = (taskId: string, updates: Partial<Task>): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('task_updated', { taskId, updates });
  }
};

export const emitTaskDeleted = (taskId: string): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('task_deleted', { taskId });
  }
};

export const emitCheckInUpdate = (data: {
  mood?: string;
  energyLevel?: number;
  reaction?: string;
  statusMessage?: string;
}): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('checkin_updated', data);
  }
};

export const emitCheer = (reaction: string, message?: string): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('send_cheer', { reaction, message });
  }
};

export const emitTimerAction = (data: { action: string; mode?: string; timeLeft?: number }): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('timer_action', data);
  }
};

// --- Listeners with cleanup functions ---

export const onPartnerStatusChanged = (callback: (payload: PartnerStatusPayload) => void) => {
  const socket = getSocket();
  socket.on('partner_status_changed', callback);
  return () => socket.off('partner_status_changed', callback);
};

export const onPartnerPaired = (callback: (payload: any) => void) => {
  const socket = getSocket();
  socket.on('partner_paired', callback);
  return () => socket.off('partner_paired', callback);
};

export const onPartnerTaskCreated = (callback: (payload: PartnerTaskPayload) => void) => {
  const socket = getSocket();
  socket.on('partner_task_created', callback);
  return () => socket.off('partner_task_created', callback);
};

export const onPartnerTaskCompleted = (callback: (payload: PartnerTaskPayload) => void) => {
  const socket = getSocket();
  socket.on('partner_task_completed', callback);
  return () => socket.off('partner_task_completed', callback);
};

export const onPartnerTaskUncompleted = (callback: (payload: PartnerTaskPayload) => void) => {
  const socket = getSocket();
  socket.on('partner_task_uncompleted', callback);
  return () => socket.off('partner_task_uncompleted', callback);
};

export const onPartnerTaskUpdated = (callback: (payload: PartnerTaskPayload) => void) => {
  const socket = getSocket();
  socket.on('partner_task_updated', callback);
  return () => socket.off('partner_task_updated', callback);
};

export const onPartnerTaskDeleted = (callback: (payload: { taskId: string; userName?: string }) => void) => {
  const socket = getSocket();
  socket.on('partner_task_deleted', callback);
  return () => socket.off('partner_task_deleted', callback);
};

export const onPartnerCheckInUpdated = (callback: (payload: PartnerCheckInPayload) => void) => {
  const socket = getSocket();
  socket.on('partner_checkin_updated', callback);
  return () => socket.off('partner_checkin_updated', callback);
};

export const onPartnerCheered = (callback: (payload: PartnerCheerPayload) => void) => {
  const socket = getSocket();
  socket.on('partner_cheered', callback);
  return () => socket.off('partner_cheered', callback);
};

// --- WebRTC Signaling Emitters ---

export const emitCallUser = (data: { callerAvatar?: string } = {}): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('call_user', data);
  }
};

export const emitAcceptCall = (): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('accept_call');
  }
};

export const emitRejectCall = (reason: string = 'declined'): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('reject_call', { reason });
  }
};

export const emitEndCall = (reason: string = 'hangup'): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('end_call', { reason });
  }
};

export const emitCallMediaState = (data: { micOn: boolean; camOn: boolean }): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('call_media_state', data);
  }
};

export const emitWebRtcOffer = (offer: RTCSessionDescriptionInit): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('webrtc_offer', { offer });
  }
};

export const emitWebRtcAnswer = (answer: RTCSessionDescriptionInit): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('webrtc_answer', { answer });
  }
};

export const emitWebRtcIceCandidate = (candidate: RTCIceCandidateInit): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('webrtc_ice_candidate', { candidate });
  }
};

// --- WebRTC Signaling Listeners ---

export const onIncomingCall = (callback: (payload: IncomingCallPayload) => void) => {
  const socket = getSocket();
  socket.on('incoming_call', callback);
  return () => socket.off('incoming_call', callback);
};

export const onCallAccepted = (callback: (payload: CallAcceptedPayload) => void) => {
  const socket = getSocket();
  socket.on('call_accepted', callback);
  return () => socket.off('call_accepted', callback);
};

export const onCallRejected = (callback: (payload: CallRejectedPayload) => void) => {
  const socket = getSocket();
  socket.on('call_rejected', callback);
  return () => socket.off('call_rejected', callback);
};

export const onCallEnded = (callback: (payload: CallEndedPayload) => void) => {
  const socket = getSocket();
  socket.on('call_ended', callback);
  return () => socket.off('call_ended', callback);
};

export const onPartnerMediaStateChanged = (callback: (payload: PartnerMediaStatePayload) => void) => {
  const socket = getSocket();
  socket.on('partner_media_state_changed', callback);
  return () => socket.off('partner_media_state_changed', callback);
};

export const onWebRtcOffer = (callback: (payload: WebRtcOfferPayload) => void) => {
  const socket = getSocket();
  socket.on('webrtc_offer', callback);
  return () => socket.off('webrtc_offer', callback);
};

export const onWebRtcAnswer = (callback: (payload: WebRtcAnswerPayload) => void) => {
  const socket = getSocket();
  socket.on('webrtc_answer', callback);
  return () => socket.off('webrtc_answer', callback);
};

export const onWebRtcIceCandidate = (callback: (payload: WebRtcIceCandidatePayload) => void) => {
  const socket = getSocket();
  socket.on('webrtc_ice_candidate', callback);
  return () => socket.off('webrtc_ice_candidate', callback);
};

// --- Step 5 Study Session Emitters ---

export const emitStudySessionStarted = (data: {
  mode?: 'focus' | 'break';
  durationMins?: number;
  subject?: string;
}): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('study_session_started', data);
  }
};

export const emitStudySessionUpdated = (data: {
  action: 'pause' | 'resume' | 'preset';
  mode?: 'focus' | 'break';
  durationMins?: number;
  elapsedSeconds?: number;
}): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('study_session_updated', data);
  }
};

export const emitStudySessionEnded = (data: {
  elapsedSeconds: number;
  mode?: 'focus' | 'break';
}): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('study_session_ended', data);
  }
};

export const emitNotificationCreated = (data: Omit<NotificationPayload, 'id'>): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('notification_created', {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    });
  }
};

// --- Step 5 Listeners ---

export const onStudySessionStarted = (callback: (payload: StudySessionPayload) => void) => {
  const socket = getSocket();
  socket.on('study_session_started', callback);
  return () => socket.off('study_session_started', callback);
};

export const onStudySessionUpdated = (callback: (payload: StudySessionPayload) => void) => {
  const socket = getSocket();
  socket.on('study_session_updated', callback);
  return () => socket.off('study_session_updated', callback);
};

export const onStudySessionEnded = (callback: (payload: StudySessionPayload) => void) => {
  const socket = getSocket();
  socket.on('study_session_ended', callback);
  return () => socket.off('study_session_ended', callback);
};

export const onProgressUpdated = (callback: (payload: ProgressUpdatedPayload) => void) => {
  const socket = getSocket();
  socket.on('progress_updated', callback);
  return () => socket.off('progress_updated', callback);
};

export const onStreakUpdated = (callback: (payload: StreakUpdatedPayload) => void) => {
  const socket = getSocket();
  socket.on('streak_updated', callback);
  return () => socket.off('streak_updated', callback);
};

export const onNotificationCreated = (callback: (payload: any) => void) => {
  const socket = getSocket();
  socket.on('notification_created', callback);
  return () => socket.off('notification_created', callback);
};

export const onCheckInSubmitted = (callback: (payload: PartnerCheckInPayload) => void) => {
  const socket = getSocket();
  socket.on('checkin_submitted', callback);
  return () => socket.off('checkin_submitted', callback);
};

// --- Step 6 Tomorrow Pact & Dare Emitters ---

export const emitPactCreated = (data: { pact: TomorrowPactData }): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('pact_created', data);
  }
};

export const emitPactUpdated = (data: {
  pactId: string;
  pact?: TomorrowPactData;
  commitment?: TomorrowPactCommitment;
  action?: string;
}): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('pact_updated', data);
  }
};

export const emitPactConfirmed = (data: {
  pactId: string;
  confirmations: PactConfirmation[];
  isLocked: boolean;
}): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('pact_confirmed', data);
  }
};

export const emitPactFinalized = (data: { pactId: string; finalizedAt?: string }): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('pact_finalized', data);
  }
};

export const emitPactActivated = (data: { pactId: string; date?: string }): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('pact_activated', data);
  }
};

export const emitPactCommitmentCompleted = (data: {
  pactId: string;
  commitmentId: string;
  status: string;
  ownerId: string;
}): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('pact_commitment_completed', data);
  }
};

export const emitDareCreated = (data: { dare: DareData }): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('dare_created', data);
  }
};

export const emitDareUpdated = (data: { dareId: string; status: string }): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('dare_updated', data);
  }
};

export const emitDareCompleted = (data: { dareId: string }): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('dare_completed', data);
  }
};

export const emitAccountabilityNotification = (data: {
  title: string;
  text: string;
  type?: string;
}): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('accountability_notification', {
      ...data,
      id: `notif-acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    });
  }
};

// --- Step 6 Listeners ---

export const onPactCreated = (callback: (payload: any) => void) => {
  const socket = getSocket();
  socket.on('pact_created', callback);
  return () => socket.off('pact_created', callback);
};

export const onPactUpdated = (callback: (payload: PactUpdatedPayload) => void) => {
  const socket = getSocket();
  socket.on('pact_updated', callback);
  return () => socket.off('pact_updated', callback);
};

export const onPactConfirmed = (callback: (payload: PactConfirmedPayload) => void) => {
  const socket = getSocket();
  socket.on('pact_confirmed', callback);
  return () => socket.off('pact_confirmed', callback);
};

export const onPactFinalized = (callback: (payload: PactFinalizedPayload) => void) => {
  const socket = getSocket();
  socket.on('pact_finalized', callback);
  return () => socket.off('pact_finalized', callback);
};

export const onPactActivated = (callback: (payload: PactActivatedPayload) => void) => {
  const socket = getSocket();
  socket.on('pact_activated', callback);
  return () => socket.off('pact_activated', callback);
};

export const onPactCommitmentCompleted = (callback: (payload: PactCommitmentCompletedPayload) => void) => {
  const socket = getSocket();
  socket.on('pact_commitment_completed', callback);
  return () => socket.off('pact_commitment_completed', callback);
};

export const onDareCreated = (callback: (payload: DarePayload) => void) => {
  const socket = getSocket();
  socket.on('dare_created', callback);
  return () => socket.off('dare_created', callback);
};

export const onDareUpdated = (callback: (payload: DarePayload) => void) => {
  const socket = getSocket();
  socket.on('dare_updated', callback);
  return () => socket.off('dare_updated', callback);
};

export const onDareCompleted = (callback: (payload: DarePayload) => void) => {
  const socket = getSocket();
  socket.on('dare_completed', callback);
  return () => socket.off('dare_completed', callback);
};

export const onAccountabilityNotification = (callback: (payload: NotificationPayload) => void) => {
  const socket = getSocket();
  socket.on('accountability_notification', callback);
  return () => socket.off('accountability_notification', callback);
};

export interface AnalyticsUpdatedPayload {
  userId?: string;
  userName?: string;
  timestamp?: string;
}

export const onAnalyticsUpdated = (callback: (payload: AnalyticsUpdatedPayload) => void) => {
  const socket = getSocket();
  socket.on('analytics_updated', callback);
  return () => socket.off('analytics_updated', callback);
};

export const emitAnalyticsUpdated = (payload: AnalyticsUpdatedPayload = {}) => {
  const socket = getSocket();
  socket.emit('analytics_updated', payload);
};

export interface NotificationSocketPayload {
  notification: AppNotification;
  unreadCount: number;
}

export const onNotificationRead = (callback: (payload: { id: string; userId: string; unreadCount: number }) => void) => {
  const socket = getSocket();
  socket.on('notification_read', callback);
  return () => socket.off('notification_read', callback);
};

export const onNotificationReadAll = (callback: (payload: { userId: string; unreadCount: number }) => void) => {
  const socket = getSocket();
  socket.on('notification_read_all', callback);
  return () => socket.off('notification_read_all', callback);
};

export const onNotificationDeleted = (callback: (payload: { id: string; userId: string; unreadCount: number }) => void) => {
  const socket = getSocket();
  socket.on('notification_deleted', callback);
  return () => socket.off('notification_deleted', callback);
};

export const onNotificationCountUpdated = (callback: (payload: { userId: string; unreadCount: number }) => void) => {
  const socket = getSocket();
  socket.on('notification_count_updated', callback);
  return () => socket.off('notification_count_updated', callback);
};



