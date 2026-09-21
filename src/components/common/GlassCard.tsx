import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`relative rounded-3xl bg-white/95 backdrop-blur-sm border-2 border-[#F1DDD4] text-[#3F3534] p-5 md:p-6 transition-all duration-300 ${
        glow ? 'shadow-[4px_5px_0px_rgba(248,180,192,0.5)] border-[#F8B4C0]' : 'shadow-[3px_4px_0px_rgba(220,195,185,0.45)]'
      } ${
        hoverEffect
          ? 'hover:border-[#FF8FA3] hover:shadow-[4px_6px_0px_rgba(255,143,163,0.35)] hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
