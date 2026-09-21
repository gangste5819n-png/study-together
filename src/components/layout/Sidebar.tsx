import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStudy } from '../../context/StudyContext';
import { CuteCatPeeking, WashiTapeStrip } from '../common/StationeryDecorations';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { me, partner } = useStudy();

  const navItems = [
    { to: '/dashboard', label: 'Home', emoji: '🏠' },
    { to: '/tasks', label: 'Tasks', emoji: '📋', badge: `${me.tasksCompleted}/${me.totalTasks}` },
    { to: '/study-room', label: 'Study Room', emoji: '💻', pulse: true },
    { to: '/together', label: 'Together', emoji: '👥' },
    { to: '/tomorrow', label: 'Tomorrow Pact', emoji: '📅' },
    { to: '/fun', label: 'Dares', emoji: '🎲' },
    { to: '/progress', label: 'Progress', emoji: '📊' },
    { to: '/settings', label: 'Settings', emoji: '⚙️' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-[#FFF5F7] bg-gingham-pink border-r-2 border-[#F1DDD4] shadow-sm relative select-none">
      {/* Top Planner Binding & Partner Note */}
      <div className="p-4 border-b-2 border-[#F1DDD4] bg-white/70 backdrop-blur-sm">
        {/* Quick Partner Live Card */}
        <div className="p-3 rounded-2xl bg-[#FFF0F3] border-2 border-[#FFCCD5] shadow-[2px_2px_0px_rgba(255,182,193,0.5)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500 animate-pulse" />
              <span className="font-cute font-bold text-xs text-[#3F3534]">{partner.shortName}</span>
            </div>
            <span className="text-[10px] font-semibold text-pink-500 bg-pink-100/80 px-2 py-0.5 rounded-full">
              {partner.isOnline ? 'Studying' : 'Offline'} ✨
            </span>
          </div>
          <p className="text-[11px] text-[#786C6A] font-medium mt-1 truncate">
            {partner.currentSubject || partner.examGoal}
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Styled as highlighted paper index tabs) */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-cute transition-all duration-150 ${
                isActive
                  ? 'bg-[#FFCCD5] text-[#701A33] border-2 border-[#FF8FA3] shadow-[2px_3px_0px_rgba(255,143,163,0.6)] translate-x-1 font-extrabold'
                  : 'text-[#3F3534] hover:text-[#1F1615] font-bold hover:bg-white/90 hover:border-2 hover:border-[#F1DDD4]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base select-none">{item.emoji}</span>
                <span className="text-sm font-extrabold tracking-tight">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-extrabold font-cute border ${
                    isActive
                      ? 'bg-white text-[#701A33] border-[#FF8FA3]'
                      : 'bg-white text-[#3F3534] border-[#F1DDD4]'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.pulse && !item.badge && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] animate-ping" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Sticky Note with Washi Tape & Peeking Cat */}
      <div className="p-4 pt-1">
        <div className="relative p-3.5 pt-4 rounded-2xl bg-[#FEFCE8] border-2 border-[#FEF08A] shadow-[2px_3px_0px_rgba(254,240,138,0.7)] text-center">
          {/* Top Washi Tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none">
            <WashiTapeStrip color="mint" rotate={-2} className="text-[9px]" />
          </div>

          <p className="font-handwriting text-base font-bold text-[#713F12]">
            Small Steps
          </p>
          <p className="font-handwriting text-sm font-bold text-[#A16207]">
            Big Dreams 💕
          </p>

          {/* Peeking Cat at Top Right */}
          <div className="absolute -bottom-2 -right-2 pointer-events-none drop-shadow-sm">
            <CuteCatPeeking className="w-12 h-9" />
          </div>
        </div>
      </div>
    </aside>
  );
};
