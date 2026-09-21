import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Video,
  BarChart3,
  Flame,
  Moon,
  Dices,
  Settings,
  X,
  Bell,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useNotifications } from '../../context/NotificationContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { me, partner } = useStudy();
  const { unreadCount, setIsPreferencesOpen } = useNotifications();

  // Handle Escape key and prevent background scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const primaryItems = [
    { to: '/dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/study-room', label: 'Study Room', icon: Video },
    { to: '/progress', label: 'Progress & Analytics', icon: BarChart3 },
  ];

  const secondaryItems = [
    { to: '/tomorrow', label: 'Tomorrow Pact', icon: Moon, badge: 'Pact' },
    { to: '/fun', label: 'Fun Breaks & Dares', icon: Dices },
    { to: '/streaks', label: 'Streaks & Milestones', icon: Flame, badge: `${me.streak}d` },
    { to: '/together', label: 'Partner Pairing', icon: Users },
    { to: '/settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Navigation Menu">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-[#FAF7F2] border-r-2 border-[#F8B4C0] p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto text-[#3F3534]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[#F8B4C0]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFB4C0] to-[#FFAAA6] flex items-center justify-center shadow-md shadow-pink-200 border-2 border-white">
                <span className="text-xl select-none">📖</span>
              </div>
              <div>
                <span className="font-cute font-extrabold text-[#3F3534] text-base tracking-tight">Study Together</span>
                <p className="text-[11px] text-[#FF4D6D] font-bold font-hand">Digital study companion 💕</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#7A6B69] hover:text-[#3F3534] hover:bg-pink-100/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Partner status banner */}
          <div className="my-4 p-3 rounded-2xl bg-[#FFF2F4] border-2 border-[#F8B4C0] flex items-center gap-3 shadow-sm">
            <div className="relative">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${partner.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#3F3534] truncate font-cute">{partner.name}</p>
              <p className="text-[11px] text-[#FF4D6D] font-semibold truncate">
                {partner.isOnline ? `${partner.currentSubject} 🩺` : 'Offline (Resting)'}
              </p>
            </div>
          </div>

          {/* Primary Quick Links */}
          <div className="mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A4908C] px-3 font-cute">
              Main Pages
            </span>
            <nav className="mt-1 space-y-1">
              {primaryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#FFCCD5] text-[#831843] border-2 border-[#FF8FA3] font-bold shadow-xs'
                          : 'text-[#5C4F4D] hover:text-[#3F3534] hover:bg-pink-100/50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-[#FF4D6D]" />
                    <span className="font-cute">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Secondary Features ("More") */}
          <div className="pt-3 border-t-2 border-dashed border-[#F8B4C0]/40">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF4D6D] px-3 font-cute">
              More Features & Actions
            </span>
            <nav className="mt-1 space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#FFCCD5] text-[#831843] border-2 border-[#FF8FA3] font-bold shadow-xs'
                          : 'text-[#5C4F4D] hover:text-[#3F3534] hover:bg-pink-100/50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#F472B6]" />
                      <span className="font-cute">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#FFCCD5] text-[#FF4D6D] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {/* Notification Preferences Trigger */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsPreferencesOpen(true);
                }}
                className="w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold text-[#5C4F4D] hover:text-[#3F3534] hover:bg-pink-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span className="font-cute">Notification Settings</span>
                </div>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF4D6D] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* User profile footer */}
        <div className="pt-4 mt-6 border-t-2 border-dashed border-[#F8B4C0]/50 flex items-center gap-3 bg-white/70 p-2.5 rounded-2xl border border-[#F8B4C0]/40">
          <img
            src={me.avatar}
            alt={me.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#FF8FA3]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#3F3534] truncate font-cute">{me.name}</p>
            <p className="text-[11px] text-[#FF4D6D] font-semibold truncate">{me.examGoal}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
