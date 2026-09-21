import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { AnalyticsOverviewData } from '../../types';

interface PactProgressSectionProps {
  data: AnalyticsOverviewData;
  userName?: string;
  partnerName?: string;
}

export const PactProgressSection: React.FC<PactProgressSectionProps> = ({
  data,
  userName = 'You',
  partnerName = 'Partner',
}) => {
  const actualData = (data as any)?.data || data;
  const user = actualData?.individual?.user;
  const partner = actualData?.individual?.partner;
  const totals = actualData?.totals || { totalPactCommitments: 0, completedPactCommitments: 0 };
  const isPaired = Boolean(actualData?.isPaired && partner);

  const sharedPactRate =
    (totals?.totalPactCommitments || 0) > 0
      ? Math.round(((totals?.completedPactCommitments || 0) / (totals?.totalPactCommitments || 1)) * 100)
      : 0;

  return (
    <GlassCard glow className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#9D174D] font-cute mb-1">
            <ShieldCheck className="w-4 h-4 text-[#FF4D6D]" />
            <span>MUTUAL ACCOUNTABILITY</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#3F3534] tracking-tight font-cute">
            Tomorrow Pact Commitments Analytics
          </h3>
          <p className="text-xs text-[#5F5351]">
            Fulfilling vows made together before each study day begins.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFE4E8] border border-[#F8B4C0] text-[#9D174D] text-xs font-extrabold self-start sm:self-auto shadow-xs font-cute">
          <span>{sharedPactRate}% Shared Pact Success</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Overall Pact Metric Card */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#9D174D] font-cute">
              Joint Pact Total
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#3F3534]">
                {totals.completedPactCommitments}
              </span>
              <span className="text-xs text-[#5F5351] font-bold">
                / {totals.totalPactCommitments} commitments fulfilled
              </span>
            </div>

            <div className="w-full bg-[#F1DDD4] rounded-full h-2 mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sharedPactRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#5F5351] mt-4 leading-relaxed font-medium">
            Every finalized pact locks in commitments for the next morning. Completed vows build reliability between study partners.
          </p>
        </div>

        {/* User Pact Commitments */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#6B21A8] font-cute">{userName}</span>
              <span className="text-xs font-black text-[#3F3534]">
                {user?.pactCompletionPercentage ?? 0}%
              </span>
            </div>

            <div className="w-full bg-[#F1DDD4] rounded-full h-2 mb-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${user?.pactCompletionPercentage ?? 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-purple-600 h-full rounded-full"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5F5351] font-medium">
                <span className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-[#15803D]" />
                  Completed
                </span>
                <span className="font-black text-[#3F3534]">
                  {user?.pactCommitmentsCompleted ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5F5351] font-medium">
                <span className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-3.5 h-3.5 text-[#B91C1C]" />
                  Missed past due
                </span>
                <span className="font-black text-[#B91C1C]">
                  {user?.pactCommitmentsMissed ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5F5351] font-medium">
                <span className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                  Total pledged
                </span>
                <span className="font-black text-[#3F3534]">
                  {user?.totalPactCommitments ?? 0}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#756866] mt-3 pt-3 border-t border-[#F1DDD4]">
            Commitments reflect high-priority daily goals selected together.
          </p>
        </div>

        {/* Partner Pact Commitments */}
        <div className="p-4 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex flex-col justify-between">
          {isPaired ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-[#0369A1] font-cute">{partnerName}</span>
                <span className="text-xs font-black text-[#3F3534]">
                  {partner?.pactCompletionPercentage ?? 0}%
                </span>
              </div>

              <div className="w-full bg-[#F1DDD4] rounded-full h-2 mb-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${partner?.pactCompletionPercentage ?? 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-[#0284C7] h-full rounded-full"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#5F5351] font-medium">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-[#15803D]" />
                    Completed
                  </span>
                  <span className="font-black text-[#3F3534]">
                    {partner?.pactCommitmentsCompleted ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5F5351] font-medium">
                  <span className="flex items-center gap-1.5 font-bold">
                    <XCircle className="w-3.5 h-3.5 text-[#B91C1C]" />
                    Missed past due
                  </span>
                  <span className="font-black text-[#B91C1C]">
                    {partner?.pactCommitmentsMissed ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5F5351] font-medium">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                    Total pledged
                  </span>
                  <span className="font-black text-[#3F3534]">
                    {partner?.totalPactCommitments ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <ShieldCheck className="w-8 h-8 text-[#A4908C] mb-2" />
              <p className="text-xs font-bold text-[#5F5351]">Partner Pact Stats</p>
              <p className="text-[11px] text-[#756866] mt-1">
                Pair with a partner to view collaborative pact fulfillment side-by-side.
              </p>
            </div>
          )}

          {isPaired && (
            <p className="text-[10px] text-[#756866] mt-3 pt-3 border-t border-[#F1DDD4]">
              Mutual encouragement keeps completion rates above 85%.
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
