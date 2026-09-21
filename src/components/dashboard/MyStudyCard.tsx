import React from 'react';
import { Flame, BookOpen, CheckCircle2, Clock, Award } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ProgressBar, CircularProgress } from '../common/ProgressBar';
import { SubjectBadge } from '../common/Badge';
import { useStudy } from '../../context/StudyContext';

export const MyStudyCard: React.FC = () => {
  const { me, taskStats, tasks } = useStudy();

  const hours = Math.floor(taskStats.completedStudyMinutes / 60);
  const minutes = taskStats.completedStudyMinutes % 60;
  const targetTotalMinutes = taskStats.plannedStudyMinutes > 0 ? taskStats.plannedStudyMinutes : me.targetStudyMinutes;
  const targetHours = Math.floor(targetTotalMinutes / 60);
  const targetMins = targetTotalMinutes % 60;
  const progressPercent = taskStats.percentage;

  // Active subject from current top pending study task, or user default
  const activeTask = tasks.find((t) => (t.owner === 'me' || t.assignedTo === 'me') && !t.completed && t.type === 'study');
  const currentSubject = activeTask ? activeTask.subject : me.currentSubject;

  return (
    <GlassCard glow className="relative overflow-hidden group">
      {/* Subtle purple background aura */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/25 transition-all duration-500" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              My Goal
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{me.streak} days</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{me.examGoal}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Alex Vance • Target 8h daily</p>
        </div>

        <CircularProgress value={progressPercent} size={76} color="#a855f7" sublabel="goal" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Today's Study</span>
          </div>
          <p className="text-base font-bold text-slate-100">
            {hours}h {minutes}m <span className="text-xs font-normal text-slate-500">/ {targetHours}h{targetMins > 0 ? ` ${targetMins}m` : ''}</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Tasks</span>
          </div>
          <p className="text-base font-bold text-slate-100">
            {me.tasksCompleted} <span className="text-xs font-normal text-slate-500">/ {me.totalTasks} done</span>
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Subject</span>
          </div>
          <SubjectBadge subject={currentSubject} />
        </div>
      </div>

      {/* Linear progress bar */}
      <div className="pt-2 border-t border-white/[0.05]">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            Daily Completion
          </span>
          <span className="text-purple-300 font-bold">{progressPercent}%</span>
        </div>
        <ProgressBar value={progressPercent} color="purple" height="sm" />
      </div>
    </GlassCard>
  );
};
