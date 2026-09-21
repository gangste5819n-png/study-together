import React from 'react';
import { CheckCircle2, Clock, Hourglass, Target } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ProgressBar, CircularProgress } from '../common/ProgressBar';
import { formatMinutesToHoursAndMins } from '../../utils/dateUtils';

interface TaskProgressProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
  plannedStudyMinutes: number;
  completedStudyMinutes: number;
  remainingStudyMinutes: number;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  completedCount,
  totalCount,
  percentage,
  plannedStudyMinutes,
  completedStudyMinutes,
  remainingStudyMinutes,
}) => {
  return (
    <GlassCard glow className="relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Overall Completion Circle & Status */}
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <CircularProgress
            value={percentage}
            size={88}
            strokeWidth={8}
            color="#FF4D6D"
            sublabel="done"
          />

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D6D] bg-[#FFE4E8] px-2.5 py-0.5 rounded-full border border-[#F8B4C0]">
                Today&apos;s Velocity
              </span>
              {percentage === 100 && (
                <span className="text-[10px] font-extrabold text-[#059669] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#86EFAC] animate-pulse">
                  All Clear! 🎉
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-[#3F3534] tracking-tight font-cute">
              {completedCount} of {totalCount} Tasks Completed
            </h2>

            <p className="text-xs text-[#5F5351] font-semibold mt-0.5">
              {percentage}% daily execution rate • CDS & Joint Study Chamber
            </p>
          </div>
        </div>

        {/* Right: Study Hours Metrics Banner (Strictly study tasks only) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l-2 lg:border-dashed border-[#F1DDD4] pt-4 lg:pt-0 lg:pl-6">
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] text-center sm:text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-[#5F5351] font-bold mb-1 justify-center sm:justify-start">
              <Target className="w-3.5 h-3.5 text-[#FF4D6D]" />
              <span>Planned Study</span>
            </div>
            <p className="text-base font-extrabold text-[#3F3534] font-cute">
              {formatMinutesToHoursAndMins(plannedStudyMinutes)}
            </p>
            <p className="text-[10px] text-[#756866] font-medium mt-0.5">Study topics</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FFF2F4] border-2 border-[#F8B4C0] text-center sm:text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-[#9D174D] font-bold mb-1 justify-center sm:justify-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completed Study</span>
            </div>
            <p className="text-base font-extrabold text-[#831843] font-cute">
              {formatMinutesToHoursAndMins(completedStudyMinutes)}
            </p>
            <p className="text-[10px] text-[#9D174D] mt-0.5 font-black">
              {plannedStudyMinutes > 0
                ? `${Math.round((completedStudyMinutes / plannedStudyMinutes) * 100)}% met`
                : '0%'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FEFCE8] border-2 border-[#FEF08A] text-center sm:text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-[#713F12] font-bold mb-1 justify-center sm:justify-start">
              <Hourglass className="w-3.5 h-3.5 text-amber-600" />
              <span>Remaining Study</span>
            </div>
            <p className="text-base font-extrabold text-[#713F12] font-cute">
              {formatMinutesToHoursAndMins(remainingStudyMinutes)}
            </p>
            <p className="text-[10px] text-[#854D0E] font-bold mt-0.5">To target</p>
          </div>
        </div>
      </div>

      {/* Linear progress bar line */}
      <div className="mt-5 pt-3 border-t-2 border-dashed border-[#F1DDD4]">
        <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
          <span className="text-[#5F5351] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF4D6D]" />
            Daily Task Progress
          </span>
          <span className="text-[#9D174D] font-extrabold">{percentage}%</span>
        </div>
        <ProgressBar value={percentage} color="purple" height="sm" />
      </div>
    </GlassCard>
  );
};
