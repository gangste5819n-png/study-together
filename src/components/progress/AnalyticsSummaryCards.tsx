import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Flame, Users } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { AnalyticsOverviewData } from '../../types';

interface AnalyticsSummaryCardsProps {
  data: AnalyticsOverviewData;
  userName?: string;
  partnerName?: string;
}

const formatHoursAndMins = (minutes: number = 0): string => {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({
  data,
  userName = 'You',
  partnerName = 'Partner',
}) => {
  const actualData = (data as any)?.data || data;
  const user = actualData?.individual?.user;
  const partner = actualData?.individual?.partner;
  const shared = actualData?.shared;
  const hasPartner = Boolean(actualData?.isPaired && partner);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Task Completion Rate */}
      <GlassCard glow className="p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#5F5351] mb-2">
            <span className="font-extrabold uppercase tracking-wider text-[#6B21A8] font-cute">
              Task Velocity
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#5F5351] font-bold truncate max-w-[120px]">{userName}</span>
              <span className="text-xl font-black text-[#3F3534]">
                {user?.completionPercentage ?? 0}%
              </span>
            </div>
            <div className="w-full bg-[#F1DDD4] rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${user?.completionPercentage ?? 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
              />
            </div>
            <p className="text-[11px] text-[#756866] font-semibold text-right">
              {user?.completedTasks ?? 0} / {user?.totalTasks ?? 0} completed
            </p>
          </div>

          {hasPartner && (
            <div className="mt-3 pt-3 border-t border-[#F1DDD4] space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#5F5351] font-bold truncate max-w-[120px]">{partnerName}</span>
                <span className="text-xl font-black text-[#0369A1]">
                  {partner?.completionPercentage ?? 0}%
                </span>
              </div>
              <div className="w-full bg-[#F1DDD4] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${partner?.completionPercentage ?? 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-cyan-600 to-teal-500 h-full rounded-full"
                />
              </div>
              <p className="text-[11px] text-[#756866] font-semibold text-right">
                {partner?.completedTasks ?? 0} / {partner?.totalTasks ?? 0} completed
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* 2. Total Study Time */}
      <GlassCard className="p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#5F5351] mb-2">
            <span className="font-extrabold uppercase tracking-wider text-[#4338CA] font-cute">
              Study Focus
            </span>
            <Clock className="w-4 h-4 text-[#4338CA]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#5F5351] font-bold truncate max-w-[120px]">{userName}</span>
              <span className="text-xl font-black text-[#3F3534]">
                {formatHoursAndMins(user?.totalStudyMinutes ?? 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#756866] font-medium">
              Avg daily: {formatHoursAndMins(user?.averageDailyStudyMinutes ?? 0)}
            </p>
          </div>

          {hasPartner ? (
            <div className="mt-3 pt-3 border-t border-[#F1DDD4] space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#5F5351] font-bold truncate max-w-[120px]">{partnerName}</span>
                <span className="text-xl font-black text-[#0369A1]">
                  {formatHoursAndMins(partner?.totalStudyMinutes ?? 0)}
                </span>
              </div>
              <p className="text-[11px] text-[#756866] font-medium">
                Avg daily: {formatHoursAndMins(partner?.averageDailyStudyMinutes ?? 0)}
              </p>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-[#F1DDD4]">
              <span className="text-[11px] text-[#756866] italic">
                Pair with a partner to compare focus time
              </span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* 3. Current Streak */}
      <GlassCard className="p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#5F5351] mb-2">
            <span className="font-extrabold uppercase tracking-wider text-[#B45309] font-cute">
              Consistency Streak
            </span>
            <Flame className="w-4 h-4 text-[#B45309]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#5F5351] font-bold truncate max-w-[120px]">{userName}</span>
              <span className="text-xl font-black text-[#B45309]">
                {user?.currentStreak ?? 0}{' '}
                <span className="text-xs font-bold text-[#5F5351]">days</span>
              </span>
            </div>
            <p className="text-[11px] text-[#756866] font-medium">
              Best record: {user?.longestStreak ?? 0} days
            </p>
          </div>

          {hasPartner ? (
            <div className="mt-3 pt-3 border-t border-[#F1DDD4] space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#5F5351] font-bold truncate max-w-[120px]">{partnerName}</span>
                <span className="text-xl font-black text-[#B45309]">
                  {partner?.currentStreak ?? 0}{' '}
                  <span className="text-xs font-bold text-[#5F5351]">days</span>
                </span>
              </div>
              <p className="text-[11px] text-[#756866] font-medium">
                Best record: {partner?.longestStreak ?? 0} days
              </p>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-[#F1DDD4]">
              <span className="text-[11px] text-[#756866] italic">
                Streak builds every active study day
              </span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* 4. Collaborative Shared Days */}
      <GlassCard glow className="p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#5F5351] mb-2">
            <span className="font-extrabold uppercase tracking-wider text-[#9D174D] font-cute">
              Together Effort
            </span>
            <Users className="w-4 h-4 text-[#9D174D]" />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-2xl font-black text-[#3F3534]">
                {shared?.sharedActiveStudyDays ?? 0}{' '}
                <span className="text-xs font-bold text-[#5F5351]">active days</span>
              </p>
              <p className="text-[11px] text-[#756866] font-semibold mt-0.5">
                {formatHoursAndMins(shared?.combinedStudyMinutes ?? 0)} combined study time
              </p>
            </div>

            <div className="pt-2 border-t border-[#F1DDD4] flex items-center justify-between text-xs">
              <span className="text-[#5F5351] font-bold">Both Checked In</span>
              <span className="font-extrabold text-[#9D174D]">
                {shared?.daysBothCheckedIn ?? 0} days
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5F5351] font-bold">Shared Tasks Done</span>
              <span className="font-extrabold text-[#15803D]">
                {shared?.sharedCompletedTasks ?? 0}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
