import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import type { TomorrowPactData } from '../../types';

interface PactConfirmationWidgetProps {
  pact: TomorrowPactData | null;
  myUserId?: string;
  partnerUserId?: string;
  myName: string;
  partnerName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const PactConfirmationWidget: React.FC<PactConfirmationWidgetProps> = ({
  pact,
  myUserId,
  partnerUserId,
  myName,
  partnerName,
  onConfirm,
  isLoading = false,
}) => {
  const isLocked = pact?.status === 'locked' || pact?.status === 'active';

  const myConfirmed = Boolean(
    pact?.confirmations?.some((c) => (myUserId ? c.userId === myUserId : c.userName === myName))
  );

  const partnerConfirmed = Boolean(
    pact?.confirmations?.some((c) =>
      partnerUserId ? c.userId === partnerUserId : c.userName === partnerName
    )
  );

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F9] border-2 border-[#F8B4C0] shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        {/* Left: Mutual Pact Title & Status */}
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
              isLocked
                ? 'bg-[#E8F8F0] text-[#2E7D32] border-2 border-[#A3E2C4] shadow-sm'
                : 'bg-[#FFE8ED] text-[#D81B60] border-2 border-[#F8B4C0]'
            }`}
          >
            {isLocked ? <Lock className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#9D174D]">
                Nightly Lock Protocol
              </span>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border-2 ${
                  isLocked
                    ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                    : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                }`}
              >
                {isLocked ? 'MUTUAL PACT LOCKED ♡' : 'DRAFTING IN PROGRESS'}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-[#3F3534] font-cute mt-0.5">
              {isLocked
                ? 'Tomorrow’s Pact is Sealed Together! 🔒'
                : 'Decide & Finalize Tomorrow’s Commitments'}
            </h3>
            <p className="text-xs text-[#5F5351] font-medium mt-0.5">
              {isLocked
                ? 'Neither partner can casually alter commitments. Rest well tonight and conquer tomorrow!'
                : 'Both study partners must confirm to lock tomorrow’s accountability plan.'}
            </p>
          </div>
        </div>

        {/* Right: Confirmation Status Indicators & Action CTA */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
          {/* Partner A (Me) Indicator */}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
              myConfirmed
                ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] shadow-xs'
                : 'bg-white text-[#3F3534] border-[#F1DDD4]'
            }`}
          >
            {myConfirmed ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <Clock className="w-4 h-4 text-[#D97706] animate-spin" />
            )}
            <span>
              {myName.split(' ')[0]}: {myConfirmed ? '✓ Confirmed' : 'Waiting...'}
            </span>
          </div>

          {/* Partner B Indicator */}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
              partnerConfirmed
                ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] shadow-xs'
                : 'bg-white text-[#3F3534] border-[#F1DDD4]'
            }`}
          >
            {partnerConfirmed ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <Clock className="w-4 h-4 text-[#D97706] animate-spin" />
            )}
            <span>
              {partnerName.split(' ')[0]}: {partnerConfirmed ? '✓ Confirmed' : 'Waiting for partner...'}
            </span>
          </div>

          {/* Confirmation Action Button */}
          {!isLocked && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              disabled={isLoading || myConfirmed}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all ${
                myConfirmed
                  ? 'bg-[#DCFCE7] text-[#15803D] border-2 border-[#86EFAC] cursor-default'
                  : 'bg-[#FF4D6D] hover:bg-[#E63946] text-white shadow-pink-200 border-2 border-[#FF2A55] cursor-pointer'
              }`}
            >
              {myConfirmed ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Your Confirmation Saved</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalize Tomorrow Pact ♡</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
