import React from 'react';
import { Heart, Droplets, Moon, Coffee, ShieldAlert, Sparkles } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { AnalyticsOverviewData } from '../../types';

interface WellnessAnalyticsSectionProps {
  data: AnalyticsOverviewData;
  userName?: string;
  partnerName?: string;
}

export const WellnessAnalyticsSection: React.FC<WellnessAnalyticsSectionProps> = ({
  data,
  userName = 'You',
  partnerName = 'Partner',
}) => {
  const actualData = (data as any)?.data || data;
  const user = actualData?.individual?.user;
  const partner = actualData?.individual?.partner;
  const isPaired = Boolean(actualData?.isPaired && partner);

  return (
    <GlassCard glow className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#065F46] font-cute mb-1">
            <Heart className="w-4 h-4 text-[#059669]" />
            <span>WELLNESS & ROUTINE SUSTAINABILITY</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#3F3534] tracking-tight font-cute">
            Healthy Habits & Check-In Balance
          </h3>
          <p className="text-xs text-[#5F5351]">
            Sustaining long study hours requires hydration, proper meals, and scheduled breaks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] text-xs font-bold self-start sm:self-auto shadow-xs font-cute">
          <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Burnout Prevention Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Wellness Habits Completed (User) */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D] shrink-0 shadow-xs">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#5F5351] font-bold block">{userName}&apos;s Wellness</span>
            <span className="text-xl font-black text-[#3F3534]">
              {user?.wellnessCompleted ?? 0}
            </span>
            <span className="text-[10px] text-[#756866] font-medium block">habits checked</span>
          </div>
        </div>

        {/* Wellness Habits Completed (Partner) */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] border border-[#7DD3FC] flex items-center justify-center text-[#0369A1] shrink-0 shadow-xs">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#5F5351] font-bold block">
              {isPaired ? partnerName : 'Partner'}&apos;s Wellness
            </span>
            <span className="text-xl font-black text-[#3F3534]">
              {isPaired ? partner?.wellnessCompleted ?? 0 : '—'}
            </span>
            <span className="text-[10px] text-[#756866] font-medium block">habits checked</span>
          </div>
        </div>

        {/* User Routine Check-ins */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] border border-[#D8B4FE] flex items-center justify-center text-[#6B21A8] shrink-0 shadow-xs">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#5F5351] font-bold block">{userName}&apos;s Check-ins</span>
            <span className="text-xl font-black text-[#3F3534]">
              {user?.checkInsCompleted ?? 0}
            </span>
            <span className="text-[10px] text-[#756866] font-medium block">mood & energy shares</span>
          </div>
        </div>

        {/* Partner Routine Check-ins */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0 shadow-xs">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#5F5351] font-bold block">
              {isPaired ? partnerName : 'Partner'}&apos;s Check-ins
            </span>
            <span className="text-xl font-black text-[#3F3534]">
              {isPaired ? partner?.checkInsCompleted ?? 0 : '—'}
            </span>
            <span className="text-[10px] text-[#756866] font-medium block">mood & energy shares</span>
          </div>
        </div>
      </div>

      {/* Wellness Philosophy Box */}
      <div className="p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-extrabold text-[#15803D] mb-0.5 font-cute">
            Routine Health Over Burnout
          </p>
          <p className="text-[#3F3534] font-medium">
            We focus exclusively on vital routine maintenance—regular water intake, wholesome meals, eye rest from screens, and scheduled stretch breaks. Tracking physical appearance, body weight, or calories is never part of our study routine.
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
