import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AppNotification, NotificationPreferences } from '../types';
import { apiClient } from '../services/apiClient';
import {
  onNotificationCreated,
  onNotificationRead,
  onNotificationReadAll,
  onNotificationDeleted,
  onNotificationCountUpdated,
} from '../services/socketService';
import { showBrowserNotification, requestBrowserNotificationPermission } from '../services/browserNotificationService';
import { playNotificationChime } from '../utils/soundUtil';
import { useStudy } from './StudyContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  isPreferencesOpen: boolean;
  setIsPreferencesOpen: (open: boolean) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearRead: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  refresh: () => Promise<void>;
  requestBrowserPermission: () => Promise<boolean>;
}

const defaultPreferences: NotificationPreferences = {
  taskReminders: true,
  taskOverdue: true,
  partnerActivity: true,
  studySession: true,
  pactReminders: true,
  wellnessReminders: true,
  dareNotifications: true,
  streakReminders: true,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, settings } = useStudy();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [notifsRes, prefsRes] = await Promise.all([
        apiClient.notifications.getAll(50, 1),
        apiClient.notifications.getPreferences(),
      ]);

      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data.notifications || []);
        setUnreadCount(notifsRes.data.unreadCount || 0);
      }

      if (prefsRes.success && prefsRes.data) {
        setPreferences(prefsRes.data.preferences || defaultPreferences);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching notifications';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time socket synchronization
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubCreated = onNotificationCreated((payload: any) => {
      if (!payload) return;
      let newNotif: AppNotification;
      if (payload.notification) {
        newNotif = payload.notification;
      } else {
        newNotif = {
          _id: payload.id || `notif-${Date.now()}`,
          userId: '',
          title: payload.title || 'Notification',
          message: payload.text || payload.message || '',
          category: (payload.type === 'task' ? 'task' : payload.type === 'session' ? 'study' : 'partner') as any,
          type: 'SYSTEM',
          isRead: false,
          createdAt: payload.timestamp || new Date().toISOString(),
        };
      }

      setNotifications((prev) => {
        // Prevent duplicate appending
        if (prev.some((n) => n._id === newNotif._id)) return prev;
        return [newNotif, ...prev];
      });

      if (typeof payload.unreadCount === 'number') {
        setUnreadCount(payload.unreadCount);
      } else {
        setUnreadCount((prev) => prev + 1);
      }

      // Audio notification chime (if enabled)
      if (settings.soundEnabled !== false) {
        playNotificationChime();
      }

      // Browser push notification
      showBrowserNotification(newNotif.title, {
        body: newNotif.message,
        tag: newNotif._id,
      });
    });

    const unsubRead = onNotificationRead((payload) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === payload.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(payload.unreadCount);
    });

    const unsubReadAll = onNotificationReadAll(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    const unsubDeleted = onNotificationDeleted((payload) => {
      setNotifications((prev) => prev.filter((n) => n._id !== payload.id));
      setUnreadCount(payload.unreadCount);
    });

    const unsubCount = onNotificationCountUpdated((payload) => {
      setUnreadCount(payload.unreadCount);
    });

    return () => {
      unsubCreated();
      unsubRead();
      unsubReadAll();
      unsubDeleted();
      unsubCount();
    };
  }, [isAuthenticated, settings.soundEnabled]);

  const markRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const res = await apiClient.notifications.markRead(id);
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.warn('[NotificationContext] Error marking as read:', err);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await apiClient.notifications.markAllRead();
    } catch (err) {
      console.warn('[NotificationContext] Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));

    try {
      const res = await apiClient.notifications.delete(id);
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.warn('[NotificationContext] Error deleting notification:', err);
    }
  };

  const clearRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));

    try {
      const res = await apiClient.notifications.clearRead();
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.warn('[NotificationContext] Error clearing read notifications:', err);
    }
  };

  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    setPreferences((prev) => (prev ? { ...prev, ...prefs } : defaultPreferences));

    try {
      const res = await apiClient.notifications.updatePreferences(prefs);
      if (res.success && res.data) {
        setPreferences(res.data.preferences);
      }
    } catch (err) {
      console.warn('[NotificationContext] Error updating preferences:', err);
    }
  };

  const requestBrowserPermission = async () => {
    return requestBrowserNotificationPermission();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        loading,
        error,
        isPreferencesOpen,
        setIsPreferencesOpen,
        markRead,
        markAllRead,
        deleteNotification,
        clearRead,
        updatePreferences,
        refresh: fetchNotifications,
        requestBrowserPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
