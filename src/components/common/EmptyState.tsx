import React, { type ReactNode } from 'react';
import { Sparkles, CheckSquare, Users, Bell, BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'tasks' | 'partner' | 'notifications' | 'progress' | 'custom';
  customIcon?: ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'tasks',
  customIcon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  const getIcon = () => {
    if (customIcon) return customIcon;
    switch (icon) {
      case 'tasks':
        return <CheckSquare className="w-6 h-6 text-purple-400" />;
      case 'partner':
        return <Users className="w-6 h-6 text-cyan-400" />;
      case 'notifications':
        return <Bell className="w-6 h-6 text-amber-400" />;
      case 'progress':
        return <BarChart3 className="w-6 h-6 text-pink-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div
      role="status"
      className={`p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 shadow-inner">
        {getIcon()}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
