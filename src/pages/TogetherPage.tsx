import React from 'react';
import { motion } from 'framer-motion';
import { Users, Flame, Clock, CheckCircle2, Target, Sparkles } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { GlassCard } from '../components/common/GlassCard';
import { CircularProgress } from '../components/common/ProgressBar';
import { SubjectBadge } from '../components/common/Badge';
import { CheckInCard } from '../components/together/CheckInCard';
import { EncouragementBar } from '../components/together/EncouragementBar';
import { SharedWeeklyGoal } from '../components/dashboard/SharedWeeklyGoal';
import { PartnerConnectCard } from '../components/together/PartnerConnectCard';

export const TogetherPage: React.FC = () => {
  const { me, partner } = useStudy();

  const myProgressPercent = Math.round((me.todayStudyMinutes / me.targetStudyMinutes) * 100);
  const partnerProgressPercent = Math.round(
    (partner.todayStudyMinutes / partner.targetStudyMinutes) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-dashed border-[#F8B4C0]/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D6D] mb-1 font-cute">
            <Users className="w-3.5 h-3.5" />
            <span>PARTNER DIGITAL ACCOUNTABILITY 🌸</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3F3534] tracking-tight font-cute">
            Together in the Room
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6B69] mt-0.5">
            Side-by-side progress, live status, mutual check-ins, and positive reinforcement 💕
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#FFE4E8] border border-[#F8B4C0] text-xs font-bold text-[#BE185D]">
          <Sparkles className="w-4 h-4 text-[#FF4D6D]" />
          <span>Sync Room Active</span>
        </div>
      </div>

      {/* Partner Connection & Pairing */}
      <PartnerConnectCard />

      {/* Side by Side Comparative Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* MY PROGRESS CARD */}
        <GlassCard glow className="relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={me.avatar}
                alt={me.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#FF8FA3]"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D6D] bg-[#FFE4E8] px-2 py-0.5 rounded-full border border-[#F8B4C0]">
                  My Progress
                </span>
                <h3 className="text-lg font-bold text-[#3F3534] mt-1 font-cute">{me.name}</h3>
                <p className="text-xs text-[#7A6B69]">{me.examGoal}</p>
              </div>
            </div>

            <CircularProgress value={myProgressPercent} size={70} color="#FF4D6D" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] shadow-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#5F5351] font-bold mb-1">
                <Clock className="w-3.5 h-3.5 text-[#FF4D6D]" />
                <span>Study Hours</span>
              </div>
              <p className="text-sm font-black text-[#3F3534] font-cute">
                {Math.floor(me.todayStudyMinutes / 60)}h {me.todayStudyMinutes % 60}m
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] shadow-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#5F5351] font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tasks</span>
              </div>
              <p className="text-sm font-black text-[#3F3534] font-cute">
                {me.tasksCompleted} / {me.totalTasks}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] shadow-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#5F5351] font-bold mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Streak</span>
              </div>
              <p className="text-sm font-black text-[#B45309] font-cute">{me.streak} days</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] shadow-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#5F5351] font-bold mb-1">
                <Target className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Daily Target</span>
              </div>
              <p className="text-sm font-black text-[#3F3534] font-cute">8h goal</p>
            </div>
          </div>

          <div className="pt-2.5 border-t-2 border-dashed border-[#F1DDD4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5F5351] font-bold">Current Subject:</span>
              <SubjectBadge subject={me.currentSubject} />
            </div>
            <span className="text-xs font-black text-[#831843]">{myProgressPercent}% Met</span>
          </div>
        </GlassCard>

        {/* PARTNER PROGRESS CARD */}
        <GlassCard className="relative overflow-hidden bg-white/95 border-2 border-[#BAE6FD]">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#7DD3FC]"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded-full border border-[#BAE6FD]">
                  Partner Progress
                </span>
                <h3 className="text-lg font-extrabold text-[#3F3534] mt-1 font-cute">{partner.name}</h3>
                <p className="text-xs text-[#5F5351] font-medium">{partner.examGoal}</p>
              </div>
            </div>

            <CircularProgress value={partnerProgressPercent} size={70} color="#0284C7" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] shadow-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#5F5351] font-bold mb-1">
                <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Study Hours</span>
              </div>
              <p className="text-sm font-black text-[#3F3534] font-cute">
                {Math.floor(partner.todayStudyMinutes / 60)}h {partner.todayStudyMinutes % 60}m
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] shadow-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#5F5351] font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tasks</span>
              </div>
              <p className="text-sm font-black text-[#3F3534] font-cute">
                {partner.tasksCompleted} / {partner.totalTasks}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] shadow-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#5F5351] font-bold mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Streak</span>
              </div>
              <p className="text-sm font-black text-[#B45309] font-cute">{partner.streak} days</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] shadow-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#5F5351] font-bold mb-1">
                <Target className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Daily Target</span>
              </div>
              <p className="text-sm font-black text-[#3F3534] font-cute">8h goal</p>
            </div>
          </div>

          <div className="pt-2.5 border-t-2 border-dashed border-[#F1DDD4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5F5351] font-bold">Current Subject:</span>
              <SubjectBadge subject={partner.currentSubject} />
            </div>
            <span className="text-xs font-black text-[#0369A1]">
              {partnerProgressPercent}% Met
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Check In Card */}
      <CheckInCard />

      {/* Send Encouragement Bar */}
      <EncouragementBar />

      {/* Shared Goal */}
      <SharedWeeklyGoal />
    </motion.div>
  );
};
