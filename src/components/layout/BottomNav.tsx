import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Video, BarChart3, MoreHorizontal } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface BottomNavProps {
  onOpenMore: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMore }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home, ariaLabel: 'Go to Home Dashboard' },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, ariaLabel: 'Go to My Tasks' },
    { to: '/study-room', label: 'Room', icon: Video, ariaLabel: 'Go to Study Room' },
    { to: '/progress', label: 'Progress', icon: BarChart3, ariaLabel: 'Go to Progress and Analytics' },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t-2 border-[#F1DDD4] shadow-[0_-2px_10px_rgba(230,200,195,0.2)] backdrop-blur-md px-2 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.ariaLabel}
              className={`flex-1 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[#832B45] font-cute font-bold bg-[#FFF0F3]'
                  : 'text-[#786C6A] hover:text-[#3F3534] active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF6584] stroke-[2.5]' : 'text-[#786C6A]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF6584]" />
                )}
              </div>
              <span className="text-[11px] font-cute leading-tight tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}

        {/* More Trigger Button */}
        <button
          type="button"
          onClick={onOpenMore}
          aria-label="Open More Options and Features"
          className="flex-1 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-2xl text-[#786C6A] hover:text-[#3F3534] active:scale-95 transition-all"
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5 text-[#786C6A]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[11px] font-cute leading-tight tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
