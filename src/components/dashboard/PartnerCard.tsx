import React from 'react';
import { Flame, BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ProgressBar, CircularProgress } from '../common/ProgressBar';
import { SubjectBadge } from '../common/Badge';
import { useStudy } from '../../context/StudyContext';

export const PartnerCard: React.FC = () => {
  const { partner, sendEncouragement } = useStudy();

  const hours = Math.floor(partner.todayStudyMinutes / 60);
  const minutes = partner.todayStudyMinutes % 60;
  const targetHours = Math.floor(partner.targetStudyMinutes / 60);
  const progressPercent = Math.round((partner.todayStudyMinutes / partner.targetStudyMinutes) * 100);

  return (
    <GlassCard className="relative overflow-hidden group">
      {/* Subtle blue/teal background aura for partner */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-600/20 transition-all duration-500" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Partner Online
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{partner.streak} days</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{partner.name}</h2>
          <p className="text-xs text-cyan-300/80 mt-0.5">{partner.examGoal}</p>
        </div>

        <CircularProgress value={progressPercent} size={76} color="#06b6d4" sublabel="goal" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Today's Study</span>
          </div>
          <p className="text-base font-bold text-slate-100">
            {hours}h {minutes}m <span className="text-xs font-normal text-slate-500">/ {targetHours}h</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Tasks</span>
          </div>
          <p className="text-base font-bold text-slate-100">
            {partner.tasksCompleted} <span className="text-xs font-normal text-slate-500">/ {partner.totalTasks} done</span>
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>Active Subject</span>
          </div>
          <SubjectBadge subject={partner.currentSubject} />
        </div>
      </div>

      {/* Linear progress bar and cheer button */}
      <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400">Daily Completion</span>
            <span className="text-cyan-300 font-bold">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} color="blue" height="sm" />
        </div>

        <button
          onClick={() => sendEncouragement('💪')}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Cheer Priya</span>
        </button>
      </div>
    </GlassCard>
  );
};
