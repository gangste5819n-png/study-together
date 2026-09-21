import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { AnalyticsDailyPoint } from '../../types';

interface DailyActivityChartProps {
  daily: AnalyticsDailyPoint[];
  userName?: string;
  partnerName?: string;
  isPaired?: boolean;
}

export const DailyActivityChart: React.FC<DailyActivityChartProps> = ({
  daily = [],
  userName = 'You',
  partnerName = 'Partner',
  isPaired = false,
}) => {
  const safeDaily = Array.isArray(daily) ? daily : [];
  // Determine highest count for scaling
  const maxCompleted = Math.max(
    4,
    ...safeDaily.map((d) => Math.max(d?.userCompleted || 0, isPaired ? (d?.partnerCompleted || 0) : 0))
  );

  return (
    <GlassCard glow className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#6B21A8] font-cute mb-1">
            <BarChart2 className="w-4 h-4" />
            <span>DAILY TASK VELOCITY</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#3F3534] tracking-tight font-cute">
            Daily Completed Tasks Comparison
          </h3>
          <p className="text-xs text-[#5F5351]">
            Side-by-side view of tasks completed each day without competitive ranking.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shadow-xs" />
            <span className="text-[#3F3534] font-bold">{userName}</span>
          </div>
          {isPaired && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#0369A1] inline-block shadow-xs" />
              <span className="text-[#3F3534] font-bold">{partnerName}</span>
            </div>
          )}
        </div>
      </div>

      {safeDaily.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No daily task data available for this range.
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[480px]">
            {/* Chart Bars Area */}
            <div className="h-48 flex items-end justify-between gap-1 sm:gap-3 px-2 pt-6 pb-2 border-b border-[#F1DDD4]">
              {safeDaily.map((d) => {
                const userHeightPercent = Math.min(100, Math.round((d.userCompleted / maxCompleted) * 100));
                const partnerHeightPercent = Math.min(100, Math.round((d.partnerCompleted / maxCompleted) * 100));

                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Hover Floating Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute -top-12 z-20 bg-[#3F3534] border border-[#F8B4C0] rounded-lg p-2 text-[10px] text-white shadow-xl whitespace-nowrap">
                      <p className="font-bold text-white">{d.dayName} ({d.date})</p>
                      <p className="text-[#FFCCD5]">
                        {userName}: <span className="font-bold">{d.userCompleted}</span> tasks
                      </p>
                      {isPaired && (
                        <p className="text-[#BAE6FD]">
                          {partnerName}: <span className="font-bold">{d.partnerCompleted}</span> tasks
                        </p>
                      )}
                    </div>

                    {/* Dual bar group */}
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* User Bar */}
                      <div className="w-1/2 max-w-[18px] bg-[#F1DDD4]/70 rounded-t-md h-full flex items-end overflow-hidden">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${userHeightPercent}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`w-full rounded-t-sm ${
                            d.userCompleted > 0
                              ? 'bg-gradient-to-t from-purple-600 to-indigo-500 shadow-xs'
                              : 'bg-transparent'
                          }`}
                        />
                      </div>

                      {/* Partner Bar */}
                      {isPaired && (
                        <div className="w-1/2 max-w-[18px] bg-[#F1DDD4]/70 rounded-t-md h-full flex items-end overflow-hidden">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${partnerHeightPercent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`w-full rounded-t-sm ${
                              d.partnerCompleted > 0
                                ? 'bg-gradient-to-t from-cyan-600 to-teal-500 shadow-xs'
                                : 'bg-transparent'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Date Labels */}
            <div className="flex items-center justify-between gap-1 sm:gap-3 px-2 pt-3">
              {daily.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center text-center">
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                      d.isToday
                        ? 'bg-[#FFCCD5] border border-[#FF8FA3] text-[#831843] font-black'
                        : 'text-[#3F3534]'
                    }`}
                  >
                    {d.shortDay}
                  </span>
                  <span className="text-[10px] text-[#756866] mt-0.5 font-medium">
                    {d.date.substring(5)}
                  </span>
                  <div className="mt-1 text-[10px] font-bold flex gap-1">
                    <span className={d.userCompleted > 0 ? 'text-[#6B21A8]' : 'text-[#756866]'}>
                      {d.userCompleted}
                    </span>
                    {isPaired && (
                      <span className={d.partnerCompleted > 0 ? 'text-[#0369A1]' : 'text-[#756866]'}>
                        /{d.partnerCompleted}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
