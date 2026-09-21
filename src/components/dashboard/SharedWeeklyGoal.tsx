import React from 'react';
import { Target, Sparkles, Trophy } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ProgressBar } from '../common/ProgressBar';

export const SharedWeeklyGoal: React.FC = () => {
  const currentHours = 72;
  const targetHours = 100;
  const percent = Math.round((currentHours / targetHours) * 100);

  return (
    <GlassCard glow className="relative overflow-hidden">
      {/* Dynamic gradient edge glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/10 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE]">
              <Trophy className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B21A8] font-cute">
              Our Shared Weekly Goal
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#3F3534] tracking-tight flex items-center gap-2 font-cute">
            100 Combined Study Hours
          </h3>
          <p className="text-xs text-[#5F5351] font-medium italic mt-0.5">
            "Two people. Two goals. One study room."
          </p>
        </div>

        <div className="flex items-baseline gap-1.5 self-start sm:self-center">
          <span className="text-3xl font-black text-[#3F3534]">{currentHours}</span>
          <span className="text-sm font-bold text-[#5F5351]">/ {targetHours} hrs</span>
          <span className="ml-2 text-xs font-black text-[#6B21A8] bg-[#F3E8FF] px-2.5 py-0.5 rounded-full border border-[#D8B4FE]">
            {percent}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar value={percent} color="purple" height="lg" />
        <div className="flex justify-between items-center text-xs text-[#5F5351] font-medium">
          <span className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-[#6B21A8]" />
            28 hours left to conquer before Sunday midnight
          </span>
          <span className="text-[#6B21A8] font-extrabold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF4D6D]" />
            On track to hit milestone
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
