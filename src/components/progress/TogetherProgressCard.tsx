import React from 'react';
import { Sparkles, Clock, CheckCircle2, Video, Heart, Shield } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { AnalyticsOverviewData } from '../../types';

interface TogetherProgressCardProps {
  data: AnalyticsOverviewData;
  userName?: string;
  partnerName?: string;
}

const formatMinutesToHours = (minutes: number = 0): string => {
  if (!minutes || minutes <= 0) return '0 hrs';
  const hours = (minutes / 60).toFixed(1);
  return `${hours} hrs`;
};

export const TogetherProgressCard: React.FC<TogetherProgressCardProps> = ({
  data,
  userName = 'You',
  partnerName = 'Partner',
}) => {
  const actualData = (data as any)?.data || data;
  const shared = actualData?.shared || {
    combinedStudyMinutes: 0,
    sharedCompletedTasks: 0,
    sharedStudySessions: 0,
    sharedPactCompletion: 0,
    daysBothCheckedIn: 0,
    sharedActiveStudyDays: 0,
  };
  const totals = actualData?.totals || {
    totalTasks: 0,
    completedTasks: 0,
    completionPercentage: 0,
    totalStudyMinutes: 0,
    totalPactCommitments: 0,
    completedPactCommitments: 0,
  };

  return (
    <GlassCard glow className="p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#9D174D] font-cute mb-2">
            <Sparkles className="w-4 h-4 text-[#FF4D6D]" />
            <span>COLLABORATIVE EFFORT • NO WINNERS, JUST TEAMWORK</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#3F3534] tracking-tight font-cute">
            Studying Together, Growing Together
          </h2>

          <p className="text-sm text-[#5F5351] mt-2 leading-relaxed">
            Every minute of focus and every completed task brings both of you closer to your exam ambitions—CDS preparation for {userName} and MBBS clinical mastery for {partnerName}.
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#9D174D] font-bold">
            <Heart className="w-4 h-4 text-[#FF4D6D] fill-[#FF4D6D]" />
            <span>Mutual accountability turns grueling exam seasons into shared triumphs.</span>
          </div>
        </div>

        {/* 4 Collaborative Metric Pills */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
          {/* Combined Study Time */}
          <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs min-w-[140px]">
            <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold mb-1">
              <Clock className="w-3.5 h-3.5 text-[#4338CA]" />
              <span>Joint Hours</span>
            </div>
            <p className="text-xl font-black text-[#3F3534]">
              {formatMinutesToHours(shared.combinedStudyMinutes)}
            </p>
            <p className="text-[10px] text-[#4338CA] font-bold">Combined focus</p>
          </div>

          {/* Combined Tasks Completed */}
          <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs min-w-[140px]">
            <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Tasks Done</span>
            </div>
            <p className="text-xl font-black text-[#3F3534]">
              {shared.sharedCompletedTasks}
            </p>
            <p className="text-[10px] text-[#15803D] font-bold">Across both partners</p>
          </div>

          {/* Shared Study Sessions */}
          <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs min-w-[140px]">
            <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold mb-1">
              <Video className="w-3.5 h-3.5 text-[#6B21A8]" />
              <span>Study Sessions</span>
            </div>
            <p className="text-xl font-black text-[#3F3534]">
              {shared.sharedStudySessions}
            </p>
            <p className="text-[10px] text-[#6B21A8] font-bold">Timer sessions logged</p>
          </div>

          {/* Days Both Studied */}
          <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs min-w-[140px]">
            <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold mb-1">
              <Shield className="w-3.5 h-3.5 text-[#9D174D]" />
              <span>Pacts Kept</span>
            </div>
            <p className="text-xl font-black text-[#3F3534]">
              {totals.completedPactCommitments}
            </p>
            <p className="text-[10px] text-[#9D174D] font-bold">Vows fulfilled</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
