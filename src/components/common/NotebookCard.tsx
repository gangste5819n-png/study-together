import React from 'react';
import { RedPushPin, PaperClip, WashiTapeStrip } from './StationeryDecorations';

interface NotebookCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'white' | 'pink' | 'mint' | 'yellow' | 'lavender' | 'blue' | 'peach';
  pin?: 'red' | 'none';
  paperclip?: 'lavender' | 'pink' | 'none';
  washiTape?: 'pink' | 'mint' | 'yellow' | 'lavender' | 'blue' | 'peach' | 'none';
  headerAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const NotebookCard: React.FC<NotebookCardProps> = ({
  title,
  subtitle,
  icon,
  color = 'white',
  pin = 'none',
  paperclip = 'none',
  washiTape = 'none',
  headerAction,
  className = '',
  children,
}) => {
  const colorMap = {
    white: 'bg-white border-[#F1DDD4] text-[#3F3534]',
    pink: 'bg-[#FFF2F4] border-[#F8B4C0] text-[#4A2833]',
    mint: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#1E3A2B]',
    yellow: 'bg-[#FEFCE8] border-[#FEF08A] text-[#422006]',
    lavender: 'bg-[#FAF5FF] border-[#E9D5FF] text-[#3B0764]',
    blue: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0C4A6E]',
    peach: 'bg-[#FFF7ED] border-[#FED7AA] text-[#431407]',
  };

  const shadowMap = {
    white: 'shadow-[3px_4px_0px_rgba(220,195,185,0.45)]',
    pink: 'shadow-[3px_4px_0px_rgba(248,180,192,0.45)]',
    mint: 'shadow-[3px_4px_0px_rgba(187,247,208,0.5)]',
    yellow: 'shadow-[3px_4px_0px_rgba(254,240,138,0.55)]',
    lavender: 'shadow-[3px_4px_0px_rgba(233,213,255,0.55)]',
    blue: 'shadow-[3px_4px_0px_rgba(186,230,253,0.55)]',
    peach: 'shadow-[3px_4px_0px_rgba(254,215,170,0.55)]',
  };

  return (
    <div
      className={`relative rounded-3xl border-2 p-4 sm:p-5 transition-all duration-200 ${colorMap[color]} ${shadowMap[color]} ${className}`}
    >
      {/* Top Center Pushpin */}
      {pin === 'red' && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none drop-shadow-sm">
          <RedPushPin className="w-6 h-7" />
        </div>
      )}

      {/* Top Corner Paperclip */}
      {paperclip !== 'none' && (
        <div className="absolute -top-3 right-6 z-10 pointer-events-none drop-shadow-sm">
          <PaperClip color={paperclip === 'lavender' ? '#A855F7' : '#EC4899'} className="w-6 h-9" />
        </div>
      )}

      {/* Top Corner Washi Tape */}
      {washiTape !== 'none' && (
        <div className="absolute -top-3 left-6 z-10 pointer-events-none">
          <WashiTapeStrip color={washiTape} rotate={-3} className="text-[10px]" />
        </div>
      )}

      {/* Card Header (if title or icon present) */}
      {(title || icon || headerAction) && (
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg sm:text-xl select-none">{icon}</span>}
            <div>
              {title && (
                <h3 className="font-cute text-base sm:text-lg font-bold tracking-tight text-current flex items-center gap-1.5">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-xs opacity-75 font-medium">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Card Body */}
      <div>{children}</div>
    </div>
  );
};
