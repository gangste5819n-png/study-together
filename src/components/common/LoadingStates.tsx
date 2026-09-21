import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * Standard spinner with custom size and tone
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <Loader2
      className={`animate-spin text-purple-400 ${sizeClasses[size]} ${className}`}
      aria-label="Loading..."
    />
  );
};

/**
 * Button inline spinner for action buttons
 */
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Loader2
      className={`w-3.5 h-3.5 animate-spin text-current inline-block ${className}`}
      aria-label="Processing..."
    />
  );
};

/**
 * Shimmering skeleton card placeholder for content blocks
 */
export const SkeletonCard: React.FC<{ className?: string; lines?: number }> = ({
  className = '',
  lines = 3,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading content..."
      className={`p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse space-y-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-1.5">
          <div className="w-1/3 h-3.5 rounded bg-white/[0.08]" />
          <div className="w-1/4 h-2.5 rounded bg-white/[0.04]" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2.5 rounded bg-white/[0.05] ${
              idx === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Full page or section loader for route Suspense and initial loads
 */
export const PageLoader: React.FC<{ message?: string }> = ({
  message = 'Loading study companion...',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-600/20">
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border border-purple-500/20 animate-ping pointer-events-none" />
      </div>
      <p className="text-sm font-bold text-white tracking-tight">{message}</p>
      <p className="text-xs text-purple-300/70 mt-1">Synchronizing goals & data ✨</p>
    </div>
  );
};
