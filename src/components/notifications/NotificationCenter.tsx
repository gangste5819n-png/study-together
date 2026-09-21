import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Clock,
  Shield,
  Users,
  Video,
  Droplets,
  Sparkles,
  Trash2,
  CheckCheck,
  Sliders,
  Flame,
  Inbox,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import type { AppNotification, NotificationCategory } from '../../types';

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    clearRead,
    setIsPreferencesOpen,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Group notifications into TODAY and EARLIER
  const todayDateKey = new Date().toISOString().substring(0, 10);
  const todayNotifs = notifications.filter(
    (n) => n.createdAt && n.createdAt.substring(0, 10) === todayDateKey
  );
  const earlierNotifs = notifications.filter(
    (n) => !n.createdAt || n.createdAt.substring(0, 10) !== todayDateKey
  );

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'task':
        return <Clock className="w-4 h-4 text-purple-400" />;
      case 'pact':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'study':
        return <Video className="w-4 h-4 text-indigo-400" />;
      case 'wellness':
        return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'partner':
        return <Users className="w-4 h-4 text-cyan-400" />;
      case 'dare':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      default:
        return <Flame className="w-4 h-4 text-purple-400" />;
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markRead(notif._id);
    }

    // Determine target route
    let target = notif.metadata?.route;
    if (!target) {
      if (notif.category === 'task') target = '/tasks';
      else if (notif.category === 'pact') target = '/tomorrow';
      else if (notif.category === 'study') target = '/study-room';
      else if (notif.category === 'dare') target = '/tomorrow';
      else if (notif.category === 'wellness') target = '/tasks';
      else if (notif.type === 'STREAK_REMINDER') target = '/progress';
      else target = '/dashboard';
    }

    setIsOpen(false);
    navigate(target);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        id="notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-white hover:bg-pink-50 border-2 border-[#F1DDD4] hover:border-[#FF8FA3] text-[#7A6B69] hover:text-[#3F3534] transition-all focus:outline-none cursor-pointer active:scale-95 shadow-xs"
        title="Notifications & Reminders"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF4D6D] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm pointer-events-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 rounded-3xl bg-[#FAF7F2] border-2 border-[#F8B4C0] shadow-2xl shadow-pink-200/50 z-50 overflow-hidden flex flex-col max-h-[80vh] text-[#3F3534]"
          >
            {/* Header */}
            <div className="p-3.5 px-4 border-b border-[#F8B4C0]/50 flex items-center justify-between bg-white/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF4D6D] font-cute">
                  Smart Reminders 💕
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0]">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    title="Mark all as read"
                    className="p-1 rounded-lg text-[#5F5351] hover:text-[#3F3534] hover:bg-pink-100 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => clearRead()}
                  title="Clear read notifications"
                  className="p-1 rounded-lg text-[#5F5351] hover:text-rose-500 hover:bg-pink-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsPreferencesOpen(true);
                  }}
                  title="Notification Settings"
                  className="p-1 rounded-lg text-[#5F5351] hover:text-[#FF4D6D] hover:bg-pink-100 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List area */}
            <div className="overflow-y-auto divide-y divide-[#F8B4C0]/30 flex-1">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#F1DDD4] text-[#756866] flex items-center justify-center mx-auto shadow-xs">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#3F3534] font-cute">No new notifications</p>
                  <p className="text-[11px] text-[#5F5351] max-w-xs mx-auto">
                    Deadlines, pact planning, and study room updates will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* TODAY SECTION */}
                  {todayNotifs.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 bg-[#FFF2F4] text-[10px] font-bold uppercase tracking-wider text-[#FF4D6D] border-b border-[#F8B4C0]/30 font-cute">
                        Today
                      </div>
                      {todayNotifs.map((n) => renderNotificationItem(n))}
                    </div>
                  )}

                  {/* EARLIER SECTION */}
                  {earlierNotifs.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-[#5F5351] border-b border-[#F8B4C0]/30 font-cute">
                        Earlier
                      </div>
                      {earlierNotifs.map((n) => renderNotificationItem(n))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 px-4 bg-white/80 border-t border-[#F8B4C0]/40 flex items-center justify-between text-[11px] text-[#5F5351]">
              <span>Automatic real-time sync</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsPreferencesOpen(true);
                }}
                className="text-[#FF4D6D] hover:text-[#BE185D] font-bold font-cute cursor-pointer"
              >
                Preferences
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function renderNotificationItem(n: AppNotification) {
    return (
      <div
        key={n._id}
        onClick={() => handleNotificationClick(n)}
        className={`p-3 px-4 flex items-start gap-3 hover:bg-[#FFF2F4] transition-colors cursor-pointer group relative ${
          !n.isRead ? 'bg-[#FFE4E8]/50' : ''
        }`}
      >
        {/* Unread indicator */}
        {!n.isRead && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] absolute left-1.5 top-5" />
        )}

        {/* Icon */}
        <div className="w-8 h-8 rounded-xl bg-white border border-[#F1DDD4] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          {getCategoryIcon(n.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-baseline justify-between gap-1">
            <h4
              className={`text-xs font-bold truncate ${
                !n.isRead ? 'text-[#3F3534]' : 'text-[#5F5351]'
              }`}
            >
              {n.title}
            </h4>
            <span className="text-[10px] text-[#756866] shrink-0 font-medium">
              {formatTimestamp(n.createdAt)}
            </span>
          </div>
          <p className="text-[11px] text-[#5F5351] mt-0.5 line-clamp-2 leading-relaxed font-medium">
            {n.message}
          </p>
        </div>

        {/* Delete button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(n._id);
          }}
          title="Delete"
          className="opacity-0 group-hover:opacity-100 p-1 text-[#756866] hover:text-rose-500 hover:bg-white rounded-md transition-opacity absolute right-2 top-3 cursor-pointer shadow-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
};
