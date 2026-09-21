import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { AnalyticsDailyPoint } from '../../types';

interface StudyTimeChartProps {
  daily: AnalyticsDailyPoint[];
  userName?: string;
  partnerName?: string;
  isPaired?: boolean;
}

const formatMinutesShort = (minutes: number = 0): string => {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const StudyTimeChart: React.FC<StudyTimeChartProps> = ({
  daily = [],
  userName = 'You',
  partnerName = 'Partner',
  isPaired = false,
}) => {
  const safeDaily = Array.isArray(daily) ? daily : [];
  const maxMinutes = Math.max(
    60,
    ...safeDaily.map((d) => Math.max(d?.userStudyMinutes || 0, isPaired ? (d?.partnerStudyMinutes || 0) : 0))
  );

  return (
    <GlassCard glow className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#4338CA] font-cute mb-1">
            <Clock className="w-4 h-4 text-[#4338CA]" />
            <span>DAILY STUDY DURATION</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#3F3534] tracking-tight font-cute">
            Study Focus Time Comparison
          </h3>
          <p className="text-xs text-[#5F5351]">
            Recorded study sessions and task focus time across the active period.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block shadow-xs" />
            <span className="text-[#3F3534] font-bold">{userName}</span>
          </div>
          {isPaired && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" />
              <span className="text-[#3F3534] font-bold">{partnerName}</span>
            </div>
          )}
        </div>
      </div>

      {safeDaily.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No study time records found for this range.
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[480px]">
            {/* Chart Area */}
            <div className="h-48 flex items-end justify-between gap-1 sm:gap-3 px-2 pt-6 pb-2 border-b border-[#F1DDD4]">
              {safeDaily.map((d) => {
                const userHeightPercent = Math.min(100, Math.round((d.userStudyMinutes / maxMinutes) * 100));
                const partnerHeightPercent = Math.min(100, Math.round((d.partnerStudyMinutes / maxMinutes) * 100));

                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute -top-12 z-20 bg-[#3F3534] border border-[#F8B4C0] rounded-lg p-2 text-[10px] text-white shadow-xl whitespace-nowrap">
                      <p className="font-bold text-white">{d.dayName} ({d.date})</p>
                      <p className="text-[#C7D2FE]">
                        {userName}: <span className="font-bold">{formatMinutesShort(d.userStudyMinutes)}</span>
                      </p>
                      {isPaired && (
                        <p className="text-[#A7F3D0]">
                          {partnerName}: <span className="font-bold">{formatMinutesShort(d.partnerStudyMinutes)}</span>
                        </p>
                      )}
                    </div>

                    {/* Dual bar */}
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* User Bar */}
                      <div className="w-1/2 max-w-[18px] bg-[#F1DDD4]/70 rounded-t-md h-full flex items-end overflow-hidden">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${userHeightPercent}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`w-full rounded-t-sm ${
                            d.userStudyMinutes > 0
                              ? 'bg-gradient-to-t from-indigo-600 to-violet-500 shadow-xs'
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
                              d.partnerStudyMinutes > 0
                                ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-xs'
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

            {/* X-Axis */}
            <div className="flex items-center justify-between gap-1 sm:gap-3 px-2 pt-3">
              {daily.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center text-center">
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                      d.isToday
                        ? 'bg-[#E0E7FF] border border-[#C7D2FE] text-[#3730A3] font-black'
                        : 'text-[#3F3534]'
                    }`}
                  >
                    {d.shortDay}
                  </span>
                  <span className="text-[10px] text-[#756866] mt-0.5 font-medium">
                    {d.date.substring(5)}
                  </span>
                  <div className="mt-1 text-[10px] font-bold flex gap-1">
                    <span className={d.userStudyMinutes > 0 ? 'text-[#4338CA]' : 'text-[#756866]'}>
                      {d.userStudyMinutes > 0 ? `${Math.round(d.userStudyMinutes / 60 * 10) / 10}h` : '0'}
                    </span>
                    {isPaired && (
                      <span className={d.partnerStudyMinutes > 0 ? 'text-[#065F46]' : 'text-[#756866]'}>
                        /{d.partnerStudyMinutes > 0 ? `${Math.round(d.partnerStudyMinutes / 60 * 10) / 10}h` : '0'}
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
