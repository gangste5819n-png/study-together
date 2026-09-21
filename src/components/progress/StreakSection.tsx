import React from 'react';
import { Flame, Award, CheckCheck, Sparkles } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { AnalyticsOverviewData } from '../../types';

interface StreakSectionProps {
  data: AnalyticsOverviewData;
  userName?: string;
  partnerName?: string;
}

interface Milestone {
  days: number;
  title: string;
  desc: string;
  unlocked: boolean;
}

export const StreakSection: React.FC<StreakSectionProps> = ({
  data,
  userName = 'You',
  partnerName = 'Partner',
}) => {
  const actualData = (data as any)?.data || data;
  const user = actualData?.individual?.user;
  const partner = actualData?.individual?.partner;
  const shared = actualData?.shared;
  const isPaired = Boolean(actualData?.isPaired && partner);

  const bestSharedStreak = Math.max(
    user?.currentStreak || 0,
    isPaired ? partner?.currentStreak || 0 : 0
  );

  const milestones: Milestone[] = [
    {
      days: 3,
      title: 'Spark Ignited',
      desc: '3 continuous days of active study sessions',
      unlocked: bestSharedStreak >= 3,
    },
    {
      days: 7,
      title: 'Momentum Master',
      desc: 'One full unbroken week of joint accountability',
      unlocked: bestSharedStreak >= 7,
    },
    {
      days: 14,
      title: 'Habit Fortress',
      desc: 'Two solid weeks of mutual dedication & focus',
      unlocked: bestSharedStreak >= 14,
    },
    {
      days: 30,
      title: 'Unstoppable Duo',
      desc: '30 days of shared habit mastery and growth',
      unlocked: bestSharedStreak >= 30,
    },
  ];

  return (
    <GlassCard glow className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#B45309] font-cute mb-1">
            <Flame className="w-4 h-4 text-[#B45309]" />
            <span>HABIT CONSISTENCY & MILESTONES</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#3F3534] tracking-tight font-cute">
            Streak Tracker & Check-in Habits
          </h3>
          <p className="text-xs text-[#5F5351]">
            Celebrating shared resilience, daily check-in habits, and continuous study momentum.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-bold self-start sm:self-auto shadow-xs font-cute">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{shared.sharedActiveStudyDays} Active Days Together</span>
        </div>
      </div>

      {/* 2-Column Streak Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* User Streak */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <h4 className="text-sm font-extrabold text-[#3F3534] font-cute">{userName}</h4>
            </div>
            <span className="text-[11px] font-bold text-[#831843] px-2 py-0.5 rounded-md bg-[#FFCCD5] border border-[#FF8FA3]">
              {user?.examGoal || 'Exam Prep'}
            </span>
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border-2 border-[#FDE68A] flex flex-col items-center justify-center text-[#B45309] shadow-xs">
              <Flame className="w-6 h-6 animate-pulse" />
              <span className="text-xs font-black">{user?.currentStreak ?? 0}d</span>
            </div>
            <div>
              <p className="text-xl font-black text-[#3F3534]">
                {user?.currentStreak ?? 0} Day Streak
              </p>
              <p className="text-xs text-[#5F5351]">
                Personal Best: <span className="text-[#B45309] font-bold">{user?.longestStreak ?? 0} days</span>
              </p>
              <p className="text-xs text-[#5F5351]">
                Daily Check-ins logged: <span className="text-[#6B21A8] font-bold">{user?.checkInsCompleted ?? 0}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Partner Streak */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0369A1]" />
              <h4 className="text-sm font-extrabold text-[#3F3534] font-cute">{isPaired ? partnerName : 'Study Partner'}</h4>
            </div>
            {isPaired && (
              <span className="text-[11px] font-bold text-[#0369A1] px-2 py-0.5 rounded-md bg-[#E0F2FE] border border-[#7DD3FC]">
                {partner?.examGoal || 'Partner Prep'}
              </span>
            )}
          </div>

          {isPaired ? (
            <div className="flex items-center gap-4 my-2">
              <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border-2 border-[#FDE68A] flex flex-col items-center justify-center text-[#B45309] shadow-xs">
                <Flame className="w-6 h-6 animate-pulse" />
                <span className="text-xs font-black">{partner?.currentStreak ?? 0}d</span>
              </div>
              <div>
                <p className="text-xl font-black text-[#3F3534]">
                  {partner?.currentStreak ?? 0} Day Streak
                </p>
                <p className="text-xs text-[#5F5351]">
                  Personal Best: <span className="text-[#B45309] font-bold">{partner?.longestStreak ?? 0} days</span>
                </p>
                <p className="text-xs text-[#5F5351]">
                  Daily Check-ins logged: <span className="text-[#0369A1] font-bold">{partner?.checkInsCompleted ?? 0}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-[#756866] text-xs font-medium italic">
              Connect your partner using room code to synchronize streaks and accountability milestones.
            </div>
          )}
        </div>
      </div>

      {/* Streak Milestones */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5F5351] font-cute mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#B45309]" />
          <span>Milestone Achievements</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {milestones.map((m) => (
            <div
              key={m.days}
              className={`p-3.5 rounded-2xl border-2 transition-all shadow-xs ${
                m.unlocked
                  ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                  : 'bg-white/80 border-[#F1DDD4] text-[#756866]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold">
                  {m.days} Days
                </span>
                {m.unlocked ? (
                  <CheckCheck className="w-4 h-4 text-[#B45309]" />
                ) : (
                  <span className="text-[10px] text-[#756866] font-bold">Locked</span>
                )}
              </div>
              <p className={`text-sm font-extrabold font-cute ${m.unlocked ? 'text-[#3F3534]' : 'text-[#5F5351]'}`}>
                {m.title}
              </p>
              <p className="text-[11px] text-[#5F5351] mt-0.5 leading-snug">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
