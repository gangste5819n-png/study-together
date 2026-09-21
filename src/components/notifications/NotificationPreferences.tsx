import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  CheckCircle2,
  Clock,
  Users,
  Video,
  Shield,
  Heart,
  Sparkles,
  Flame,
  BellRing,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { getBrowserNotificationPermission } from '../../services/browserNotificationService';

interface PreferenceItem {
  key: keyof import('../../types').NotificationPreferences;
  label: string;
  desc: string;
  icon: React.ElementType;
  accent: string;
}

const PREFERENCE_ITEMS: PreferenceItem[] = [
  {
    key: 'taskReminders',
    label: 'Task Reminders',
    desc: 'Remind before task deadlines (24h & 1h prior)',
    icon: Clock,
    accent: 'text-purple-400',
  },
  {
    key: 'taskOverdue',
    label: 'Overdue Task Alerts',
    desc: 'Gentle alerts for uncompleted tasks past deadline',
    icon: CheckCircle2,
    accent: 'text-rose-400',
  },
  {
    key: 'partnerActivity',
    label: 'Partner Activity',
    desc: 'When partner completes a task or logs a daily check-in',
    icon: Users,
    accent: 'text-cyan-400',
  },
  {
    key: 'studySession',
    label: 'Study Room Sessions',
    desc: 'When your partner starts a focus timer session',
    icon: Video,
    accent: 'text-indigo-400',
  },
  {
    key: 'pactReminders',
    label: 'Tomorrow Pact',
    desc: 'Evening pact planning, locks, and activation notices',
    icon: Shield,
    accent: 'text-amber-400',
  },
  {
    key: 'wellnessReminders',
    label: 'Wellness Habits',
    desc: 'Gentle hydration, eye rest, and routine break checks',
    icon: Heart,
    accent: 'text-emerald-400',
  },
  {
    key: 'dareNotifications',
    label: 'Playful Dares',
    desc: 'When partner sends, accepts, or fulfills a fun dare',
    icon: Sparkles,
    accent: 'text-pink-400',
  },
  {
    key: 'streakReminders',
    label: 'Streak Continuity',
    desc: 'Remind before day ends to protect active study streak',
    icon: Flame,
    accent: 'text-amber-400',
  },
];

export const NotificationPreferencesModal: React.FC = () => {
  const { preferences, updatePreferences, isPreferencesOpen, setIsPreferencesOpen, requestBrowserPermission } =
    useNotifications();

  // Handle Escape key and prevent background scroll while open
  React.useEffect(() => {
    if (!isPreferencesOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreferencesOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreferencesOpen, setIsPreferencesOpen]);

  if (!isPreferencesOpen) return null;

  const browserPermission = getBrowserNotificationPermission();

  const handleToggle = (key: keyof import('../../types').NotificationPreferences) => {
    if (!preferences) return;
    updatePreferences({ [key]: !preferences[key] });
  };

  const handleBrowserRequest = async () => {
    await requestBrowserPermission();
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notification Preferences"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsPreferencesOpen(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg rounded-3xl bg-white border-2 border-[#F8B4C0] shadow-2xl p-5 sm:p-6 relative max-h-[90vh] flex flex-col my-auto text-[#3F3534]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[#F1DDD4]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFE4E8] border border-[#F8B4C0] flex items-center justify-center text-[#BE185D]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#3F3534] font-cute">Notification Preferences</h3>
                <p className="text-xs text-[#5F5351]">Choose which smart reminders you wish to receive.</p>
              </div>
            </div>
            <button
              onClick={() => setIsPreferencesOpen(false)}
              className="p-1.5 rounded-xl text-[#756866] hover:text-[#3F3534] hover:bg-[#FFF0F3] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Browser Push Permission Banner */}
          <div className="my-4 p-3.5 rounded-2xl bg-[#FFF2F4] border-2 border-[#F8B4C0] flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-[#FF4D6D] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#3F3534]">Desktop Push Notifications</p>
                <p className="text-[11px] text-[#5F5351]">
                  Status: <span className="font-extrabold text-[#9D174D] capitalize">{browserPermission}</span>
                </p>
              </div>
            </div>
            {browserPermission !== 'granted' && (
              <button
                onClick={handleBrowserRequest}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-bold font-cute shadow-sm shadow-pink-200 transition-all cursor-pointer"
              >
                Enable
              </button>
            )}
          </div>

          {/* Toggle List */}
          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {PREFERENCE_ITEMS.map((item) => {
              const Icon = item.icon;
              const isEnabled = preferences ? Boolean(preferences[item.key]) : true;

              return (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/95 hover:bg-[#FFF8F9] border-2 border-[#F1DDD4] hover:border-[#F8B4C0] transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#F1DDD4] text-[#FF4D6D]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#3F3534]">{item.label}</p>
                      <p className="text-[11px] text-[#5F5351] leading-snug font-medium">{item.desc}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                      isEnabled ? 'bg-[#FF4D6D]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`w-5 h-5 rounded-full bg-white shadow-md ${
                        isEnabled ? 'ml-auto' : 'ml-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-4 mt-2 border-t-2 border-dashed border-[#F1DDD4] flex items-center justify-between">
            <span className="text-[11px] text-[#756866] font-medium">Preferences automatically saved to your account</span>
            <button
              onClick={() => setIsPreferencesOpen(false)}
              className="px-5 py-2 rounded-2xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-bold font-cute transition-all cursor-pointer shadow-sm shadow-pink-200"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
