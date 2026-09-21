import React from 'react';
import { Clock, CheckSquare, Target, Flame } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ProgressBar } from '../common/ProgressBar';
import { useStudy } from '../../context/StudyContext';

export const TodayProgress: React.FC = () => {
  const { me, partner } = useStudy();

  const combinedMinutes = me.todayStudyMinutes + partner.todayStudyMinutes;
  const combinedHours = (combinedMinutes / 60).toFixed(1);
  const totalCompletedTasks = me.tasksCompleted + partner.tasksCompleted;
  const totalCombinedTasks = me.totalTasks + partner.totalTasks;
  const taskCompletionRate = totalCombinedTasks > 0 ? Math.round((totalCompletedTasks / totalCombinedTasks) * 100) : 0;
  const alexHoursStr = (me.todayStudyMinutes / 60).toFixed(1);
  const priyaHoursStr = (partner.todayStudyMinutes / 60).toFixed(1);
  const alexPercent = Math.min(100, Math.round((me.todayStudyMinutes / (me.targetStudyMinutes || 1)) * 100));

  const metrics = [
    {
      label: 'Combined Study Time',
      value: `${combinedHours} hrs`,
      sub: `Alex (${alexHoursStr}h) + Priya (${priyaHoursStr}h)`,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label: 'Tasks Completed',
      value: `${totalCompletedTasks} / ${totalCombinedTasks}`,
      sub: `${taskCompletionRate}% done today`,
      icon: CheckSquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Daily Target Goal',
      value: '16.0 hrs',
      sub: '8h CDS + 8h MBBS target',
      icon: Target,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Joint Accountability',
      value: `${me.streak}d & ${partner.streak}d`,
      sub: 'Active daily streaks',
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Today's Joint Velocity
          </h3>
          <p className="text-xs text-slate-400">
            Real-time aggregate performance between CDS and MBBS rooms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            Combined {taskCompletionRate}% Tasks Done
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">{m.label}</span>
                <div className={`p-2 rounded-lg ${m.bg} ${m.border} border`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <p className="text-xl font-extrabold text-white tracking-tight">{m.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Dual Progress Bars */}
      <div className="space-y-3 pt-2 border-t border-white/[0.06]">
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium">Alex (CDS Prep)</span>
            <span className="text-purple-300 font-semibold">
              {Math.floor(me.todayStudyMinutes / 60)}h {me.todayStudyMinutes % 60}m / {Math.floor(me.targetStudyMinutes / 60)}h ({alexPercent}%)
            </span>
          </div>
          <ProgressBar value={alexPercent} color="purple" height="sm" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium">Dr. Priya (Final Year MBBS)</span>
            <span className="text-cyan-300 font-semibold">6h 10m / 8h (77%)</span>
          </div>
          <ProgressBar value={77} color="blue" height="sm" />
        </div>
      </div>
    </GlassCard>
  );
};
