import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Trophy, Shield, Crown, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudy } from '../context/StudyContext';
import { GlassCard } from '../components/common/GlassCard';
import { StreakCalendar } from '../components/streaks/StreakCalendar';
import { streakMilestones } from '../data/mockData';

export const StreaksPage: React.FC = () => {
  const { me, partner, showToast } = useStudy();

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b'],
    });
    showToast('🔥 Keep the fire burning! CDS & MBBS streaks are unstoppable!');
  };

  const getMilestoneIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return Sparkles;
      case 'Flame':
        return Flame;
      case 'Shield':
        return Shield;
      case 'Crown':
        return Crown;
      default:
        return Trophy;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-dashed border-[#F8B4C0]/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#B45309] font-cute mb-1">
            <Flame className="w-3.5 h-3.5 fill-[#B45309]" />
            <span>MUTUAL STREAK DISCIPLINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3F3534] tracking-tight font-cute">
            Study Streaks & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5351] mt-1 font-medium">
            Zero zero-days. Consistency compounds into CDS selection and MBBS excellence.
          </p>
        </div>

        <button
          onClick={handleCelebrate}
          className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-bold font-cute shadow-sm shadow-pink-200 transition-all hover:scale-102 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Streak 🔥</span>
        </button>
      </div>

      {/* Big Streak Showcase Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main User Streak */}
        <GlassCard glow className="lg:col-span-2 relative overflow-hidden bg-white/95 border-2 border-[#F1DDD4]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold tracking-widest uppercase text-[#92400E] bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#FDE68A] inline-flex items-center gap-1.5 font-cute shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-[#B45309]" />
                Active Study Momentum
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black text-[#3F3534] tracking-tight font-cute">
                  {me.streak} DAYS
                </span>
                <span className="text-sm font-extrabold text-[#B45309]">STREAK</span>
              </div>
              <p className="text-xs text-[#5F5351] max-w-md font-medium leading-relaxed">
                You haven't missed a single CDS study target for 6 consecutive days. Priya is on day
                9. Keep pace!
              </p>
            </div>

            <div className="flex sm:flex-col gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[#F1DDD4] pt-4 sm:pt-0 sm:pl-6">
              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs flex-1 sm:flex-initial text-center sm:text-left">
                <span className="text-[11px] text-[#5F5351] font-bold">Longest Streak</span>
                <p className="text-base font-black text-[#3F3534] mt-0.5">{me.longestStreak} days</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs flex-1 sm:flex-initial text-center sm:text-left">
                <span className="text-[11px] text-[#5F5351] font-bold">Weekly Consistency</span>
                <p className="text-base font-black text-[#15803D] mt-0.5">100% On Track</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Partner Streak Pill Card */}
        <GlassCard className="relative overflow-hidden flex flex-col justify-between bg-white/95 border-2 border-[#F1DDD4]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0369A1] font-cute">
                Partner's Streak
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex items-center gap-3 mb-3">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#7DD3FC]"
              />
              <div>
                <h3 className="text-sm font-extrabold text-[#3F3534] font-cute">{partner.name}</h3>
                <p className="text-xs text-[#5F5351] font-medium">{partner.examGoal}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#E0F2FE] border-2 border-[#7DD3FC] my-2 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-[#0369A1]">
                <Flame className="w-6 h-6 text-[#0284C7] fill-[#0284C7]" />
                <span>{partner.streak} DAYS</span>
              </div>
              <p className="text-[11px] text-[#0369A1] font-bold mt-1">Best record: 21 days</p>
            </div>
          </div>

          <p className="text-[11px] text-[#756866] italic text-center font-medium">
            "We pull each other up when motivation drops."
          </p>
        </GlassCard>
      </div>

      {/* Calendar Activity Grid */}
      <GlassCard>
        <StreakCalendar />
      </GlassCard>

      {/* Motivational Milestones Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-extrabold text-[#3F3534] tracking-tight flex items-center gap-2 font-cute">
            <Trophy className="w-4 h-4 text-[#B45309]" />
            <span>Mutual Discipline Milestones</span>
          </h3>
          <p className="text-xs text-[#5F5351] mt-0.5 font-medium">
            Unlock shared badges and room perks as you build uninterrupted consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {streakMilestones.map((m) => {
            const Icon = getMilestoneIcon(m.icon);
            return (
              <GlassCard
                key={m.days}
                className={`relative overflow-hidden transition-all duration-300 ${
                  m.unlocked
                    ? 'border-2 border-[#FDE68A] bg-[#FFFBEB] shadow-xs'
                    : 'bg-white/80 border-2 border-[#F1DDD4] opacity-80'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-2xl border-2 ${
                      m.unlocked
                        ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]'
                        : 'bg-white border-[#F1DDD4] text-[#756866]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                      m.unlocked
                        ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                        : 'bg-[#FAF7F2] text-[#756866] border-[#F1DDD4]'
                    }`}
                  >
                    {m.days} Days
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-[#3F3534] mb-1 font-cute">{m.title}</h4>
                <p className="text-xs text-[#5F5351] mb-3 font-medium leading-relaxed">{m.description}</p>

                <div className="pt-2 border-t border-[#F1DDD4] flex items-center gap-1.5 text-[11px]">
                  {m.unlocked ? (
                    <span className="text-[#15803D] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {m.rewardText}
                    </span>
                  ) : (
                    <span className="text-[#756866] font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {m.rewardText}
                    </span>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
