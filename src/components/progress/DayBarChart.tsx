import React from 'react';
import { motion } from 'framer-motion';
import type { DayProgress } from '../../types';

interface DayBarChartProps {
  days: DayProgress[];
  accentColor?: 'purple' | 'cyan';
}

export const DayBarChart: React.FC<DayBarChartProps> = ({ days, accentColor = 'purple' }) => {
  const maxHours = 10; // scale up to 10 hours for bar heights

  const barColors = {
    purple: 'from-purple-600 to-indigo-500',
    cyan: 'from-cyan-600 to-teal-400',
  };

  const activeDayRing = {
    purple: 'border-[#FF8FA3] bg-[#FFCCD5] text-[#831843]',
    cyan: 'border-[#38BDF8] bg-[#E0F2FE] text-[#0369A1]',
  };

  return (
    <div className="w-full">
      {/* Chart container */}
      <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-3 px-2 border-b border-[#F1DDD4]">
        {days.map((d) => {
          const heightPercent = Math.min(100, Math.round((d.studyHours / maxHours) * 100));
          const dayPercent = Math.round((d.studyHours / d.targetHours) * 100);

          return (
            <div key={d.dayKey} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 p-1.5 rounded-lg bg-[#3F3534] border border-[#F8B4C0] text-[10px] text-center shadow-xl pointer-events-none whitespace-nowrap z-10 text-white">
                <p className="font-bold text-white">{d.studyHours}h</p>
                <p className="text-[#FFCCD5]">{d.tasksCompleted}/{d.totalTasks} tasks</p>
                <p className="text-[#FDE68A]">{dayPercent}% target</p>
              </div>

              {/* Bar */}
              <div className="w-full max-w-[42px] bg-[#F1DDD4]/70 rounded-t-xl h-full flex items-end p-1 relative overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full rounded-t-lg bg-gradient-to-t ${barColors[accentColor]} relative group-hover:brightness-110 shadow-xs`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Days labels and metadata below chart */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 pt-3">
        {days.map((d) => (
          <div key={d.dayKey} className="flex-1 flex flex-col items-center text-center">
            <span
              className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                d.isToday ? activeDayRing[accentColor] + ' border' : 'text-[#3F3534]'
              }`}
            >
              {d.shortDay}
            </span>
            <span className="text-[11px] font-bold text-[#3F3534] mt-1">
              {d.studyHours > 0 ? `${d.studyHours}h` : '—'}
            </span>
            <span className="text-[10px] text-[#756866] font-medium">
              {d.tasksCompleted}/{d.totalTasks}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
