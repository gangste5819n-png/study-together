/**
 * Browser Notification Service
 * Wraps the Web Notifications API with permission management,
 * user-gesture gating, and graceful degradation.
 */

export const isBrowserNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getBrowserNotificationPermission = (): NotificationPermission => {
  if (!isBrowserNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (!isBrowserNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('[BrowserNotification] Error requesting permission:', err);
    return false;
  }
};

export const showBrowserNotification = (
  title: string,
  options: NotificationOptions = {}
): Notification | null => {
  if (!isBrowserNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const defaultOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      silent: true, // Audio chime handled by soundUtil
      ...options,
    };

    const notif = new Notification(title, defaultOptions);

    // Auto-close after 6 seconds
    setTimeout(() => {
      try {
        notif.close();
      } catch {
        // Ignored
      }
    }, 6000);

    return notif;
  } catch (err) {
    console.warn('[BrowserNotification] Error displaying notification:', err);
    return null;
  }
};
