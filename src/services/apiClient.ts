/**
 * Central API Client for Study Together
 * Provides typed, resilient communication with the Express backend
 * with automatic Bearer token injection and graceful offline fallbacks.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5001/api';
const TOKEN_KEY = 'studyTogether_authToken';

import type { TomorrowPactData, TomorrowPactCommitment, DareData, AnalyticsOverviewData, AppNotification, NotificationPreferences } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status: number;
}

export interface BackendUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  examGoal?: string;
  targetStudyMinutes?: number;
  streak?: number;
  isOnline?: boolean;
  statusMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendTask {
  _id: string;
  owner: string;
  title: string;
  description?: string;
  category: string;
  subject: string;
  priority: string;
  completed: boolean;
  completedAt?: string | null;
  estimatedMinutes: number;
  dueDate?: string | null;
  mandatory?: boolean;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerConnectionResponse {
  connected: boolean;
  roomCode?: string;
  connectionId?: string;
  partner?: BackendUser | null;
  activeSession?: any;
}

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const isClientAuthenticated = (): boolean => {
  return Boolean(getAuthToken());
};

/**
 * Low-level HTTP requester with authentication headers and resilient error handling
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || `Request failed with status ${res.status}`,
        error: data?.message || res.statusText,
        status: res.status,
        data,
      };
    }

    return {
      success: true,
      message: data?.message,
      data,
      status: res.status,
    };
  } catch (err: any) {
    // Graceful offline/network failure
    return {
      success: false,
      message: 'Backend server is currently offline or unreachable.',
      error: err?.message || 'Network error',
      status: 0,
    };
  }
}

export const apiClient = {
  // Health
  checkHealth: async () => {
    return request('/health', { method: 'GET' });
  },

  // Authentication
  auth: {
    register: async (payload: { name: string; email: string; password: string }) => {
      const res = await request<{ user: BackendUser; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },

    login: async (payload: { email: string; password: string }) => {
      const res = await request<{ user: BackendUser; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },

    getMe: async () => {
      return request<{ user: BackendUser }>('/auth/me', { method: 'GET' });
    },

    updateProfile: async (payload: {
      name?: string;
      examGoal?: string;
      targetStudyMinutes?: number;
      statusMessage?: string;
      avatar?: string;
    }) => {
      return request<{ user: BackendUser; message?: string }>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    logout: () => {
      clearAuthToken();
    },
  },

  // Task API
  tasks: {
    getAll: async () => {
      return request<{ count: number; tasks: BackendTask[] }>('/tasks', { method: 'GET' });
    },

    create: async (taskData: {
      title: string;
      description?: string;
      category?: string;
      subject?: string;
      priority?: string;
      estimatedMinutes?: number;
      dueDate?: string | null;
      mandatory?: boolean;
      type?: string;
    }) => {
      return request<{ task: BackendTask }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    },

    update: async (id: string, updates: Partial<BackendTask>) => {
      return request<{ task: BackendTask }>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    toggle: async (id: string) => {
      return request<{ task: BackendTask }>(`/tasks/${id}/toggle`, {
        method: 'PATCH',
      });
    },

    delete: async (id: string) => {
      return request(`/tasks/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Partner Pairing API
  partner: {
    createInvite: async () => {
      return request<{ roomCode: string; status: string; connectionId: string }>('/partner/invite', {
        method: 'POST',
      });
    },

    joinInvite: async (roomCode: string) => {
      return request<{ connectionId: string; partner: BackendUser }>('/partner/join', {
        method: 'POST',
        body: JSON.stringify({ roomCode }),
      });
    },

    getCurrent: async () => {
      return request<PartnerConnectionResponse>('/partner/current', { method: 'GET' });
    },
  },

  // Check-In API
  checkin: {
    submit: async (data: {
      mood?: string;
      energyLevel?: number;
      reaction?: string;
      statusMessage?: string;
    }) => {
      return request('/checkin', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getLatest: async () => {
      return request('/checkin/latest', { method: 'GET' });
    },
  },

  // Tomorrow Pact API
  pacts: {
    getTomorrow: async () => {
      return request<{ pact: TomorrowPactData; roomCode: string }>('/pacts/tomorrow', { method: 'GET' });
    },

    getToday: async () => {
      return request<{ pact: TomorrowPactData | null; roomCode: string }>('/pacts/today', { method: 'GET' });
    },

    create: async (date?: string) => {
      return request<{ pact: TomorrowPactData }>('/pacts', {
        method: 'POST',
        body: JSON.stringify({ date }),
      });
    },

    update: async (id: string, updates: any) => {
      return request<{ pact: TomorrowPactData }>(`/pacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    addCommitment: async (id: string, commitment: Partial<TomorrowPactCommitment>) => {
      return request<{ pact: TomorrowPactData; commitment: TomorrowPactCommitment }>(`/pacts/${id}/commitments`, {
        method: 'POST',
        body: JSON.stringify(commitment),
      });
    },

    updateCommitment: async (id: string, commitmentId: string, updates: Partial<TomorrowPactCommitment>) => {
      return request<{ pact: TomorrowPactData; commitment: TomorrowPactCommitment }>(`/pacts/${id}/commitments/${commitmentId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    deleteCommitment: async (id: string, commitmentId: string) => {
      return request<{ pact: TomorrowPactData }>(`/pacts/${id}/commitments/${commitmentId}`, {
        method: 'DELETE',
      });
    },

    confirm: async (id: string) => {
      return request<{ pact: TomorrowPactData; isLocked: boolean }>(`/pacts/${id}/confirm`, {
        method: 'POST',
      });
    },

    finalize: async (id: string) => {
      return request<{ pact: TomorrowPactData }>(`/pacts/${id}/finalize`, {
        method: 'POST',
      });
    },

    activate: async (id: string) => {
      return request<{ pact: TomorrowPactData }>(`/pacts/${id}/activate`, {
        method: 'POST',
      });
    },

    completeCommitment: async (id: string, commitmentId: string) => {
      return request<{ pact: TomorrowPactData; commitment: TomorrowPactCommitment; stats: any }>(
        `/pacts/${id}/commitments/${commitmentId}/complete`,
        { method: 'POST' }
      );
    },
  },

  // Dare API
  dares: {
    getActive: async () => {
      return request<{ dares: DareData[]; roomCode: string }>('/dares/active', { method: 'GET' });
    },

    create: async (dareData: Partial<DareData>) => {
      return request<{ dare: DareData }>('/dares', {
        method: 'POST',
        body: JSON.stringify(dareData),
      });
    },

    updateStatus: async (id: string, status: 'accepted' | 'skipped' | 'completed') => {
      return request<{ dare: DareData }>(`/dares/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  // Analytics API
  analytics: {
    getToday: async () => {
      const res = await request<any>('/analytics/today', { method: 'GET' });
      if (res.success && res.data && 'data' in res.data) {
        return { ...res, data: res.data.data };
      }
      return res as ApiResponse<AnalyticsOverviewData>;
    },
    getWeek: async () => {
      const res = await request<any>('/analytics/week', { method: 'GET' });
      if (res.success && res.data && 'data' in res.data) {
        return { ...res, data: res.data.data };
      }
      return res as ApiResponse<AnalyticsOverviewData>;
    },
    getMonth: async () => {
      const res = await request<any>('/analytics/month', { method: 'GET' });
      if (res.success && res.data && 'data' in res.data) {
        return { ...res, data: res.data.data };
      }
      return res as ApiResponse<AnalyticsOverviewData>;
    },
    getOverview: async (range: string = '7d') => {
      const res = await request<any>(`/analytics/overview?range=${range}`, { method: 'GET' });
      if (res.success && res.data && 'data' in res.data) {
        return { ...res, data: res.data.data };
      }
      return res as ApiResponse<AnalyticsOverviewData>;
    },
  },

  // Notifications API
  notifications: {
    getAll: async (limit: number = 50, page: number = 1) => {
      return request<{ notifications: AppNotification[]; total: number; unreadCount: number }>(
        `/notifications?limit=${limit}&page=${page}`,
        { method: 'GET' }
      );
    },

    getUnread: async () => {
      return request<{ notifications: AppNotification[]; unreadCount: number }>(
        '/notifications/unread',
        { method: 'GET' }
      );
    },

    markRead: async (id: string) => {
      return request<{ notification: AppNotification; unreadCount: number }>(
        `/notifications/${id}/read`,
        { method: 'PATCH' }
      );
    },

    markAllRead: async () => {
      return request<{ modifiedCount: number; unreadCount: number }>(
        '/notifications/read-all',
        { method: 'PATCH' }
      );
    },

    delete: async (id: string) => {
      return request<{ unreadCount: number }>(`/notifications/${id}`, {
        method: 'DELETE',
      });
    },

    clearRead: async () => {
      return request<{ deletedCount: number; unreadCount: number }>(
        '/notifications/clear-read',
        { method: 'DELETE' }
      );
    },

    getPreferences: async () => {
      return request<{ preferences: NotificationPreferences }>(
        '/notifications/preferences',
        { method: 'GET' }
      );
    },

    updatePreferences: async (prefs: Partial<NotificationPreferences>) => {
      return request<{ preferences: NotificationPreferences }>(
        '/notifications/preferences',
        {
          method: 'PATCH',
          body: JSON.stringify(prefs),
        }
      );
    },
  },
};
