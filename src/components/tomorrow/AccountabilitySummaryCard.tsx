import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Sparkles, Target, Zap, Smile } from 'lucide-react';
import type { TomorrowPactData } from '../../types';

interface AccountabilitySummaryCardProps {
  pact: TomorrowPactData | null;
  myUserId?: string;
  partnerUserId?: string;
  myName: string;
  partnerName: string;
  onProposeDare: (dareData: {
    targetUserId: string;
    title: string;
    instruction: string;
    reason: string;
  }) => void;
}

const HARMLESS_DARES = [
  {
    title: 'Speak like a news reporter for 30 seconds',
    instruction: 'Give dramatic breaking news about your study targets or refrigerator contents!',
  },
  {
    title: 'Send your partner your funniest selfie',
    instruction: 'Make a goofy face or show your sleepy study hair!',
  },
  {
    title: 'Send a terrible joke right now',
    instruction: 'The more cringe and corny it is, the better!',
  },
  {
    title: 'Use only emojis for your next message',
    instruction: 'Tell your partner how your day went using zero words!',
  },
  {
    title: 'Give your partner a dramatic compliment',
    instruction: 'Deliver it like a passionate Shakespearean soliloquy!',
  },
  {
    title: 'Make a 10-second victory dance',
    instruction: 'Celebrate surviving another hard study day with a goofy jig!',
  },
  {
    title: 'Send a motivational voice note',
    instruction: 'Hype up your study partner for tomorrow in your most heroic voice!',
  },
];

export const AccountabilitySummaryCard: React.FC<AccountabilitySummaryCardProps> = ({
  pact,
  myUserId,
  partnerUserId,
  myName,
  partnerName,
  onProposeDare,
}) => {
  const [showDarePicker, setShowDarePicker] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<'me' | 'partner'>('partner');

  if (!pact || !pact.commitments || pact.commitments.length === 0) {
    return null;
  }

  const commitments = pact.commitments;
  const totalCommitments = commitments.length;
  const completedCommitments = commitments.filter((c) => c.status === 'completed').length;
  const incompleteCommitments = totalCommitments - completedCommitments;
  const mandatoryItems = commitments.filter((c) => c.mandatory);
  const mandatoryCompleted = mandatoryItems.filter((c) => c.status === 'completed').length;
  const percentage = totalCommitments > 0 ? Math.round((completedCommitments / totalCommitments) * 100) : 0;

  // Cute summary headline
  let cuteRemark = 'All missions conquered together! You two are an unstoppable duo! 💜✨';
  if (incompleteCommitments === 1) {
    cuteRemark = 'One tiny mission escaped 😭 But you showed immense grit today!';
  } else if (incompleteCommitments > 1 && completedCommitments > 0) {
    cuteRemark = `${completedCommitments} solid wins secured! Rest up, recharge, and attack tomorrow! 🌟`;
  } else if (completedCommitments === 0) {
    cuteRemark = 'Rest day acknowledged. Tomorrow is a brand new clean slate! ☕';
  }

  const handleSendDare = (dare: { title: string; instruction: string }) => {
    const targetUserId = selectedTarget === 'partner' ? partnerUserId || '' : myUserId || '';
    const targetUserName = selectedTarget === 'partner' ? partnerName : myName;

    onProposeDare({
      targetUserId,
      title: dare.title,
      instruction: dare.instruction,
      reason: `Playful dare for missed target (${incompleteCommitments} mission(s) pending for ${targetUserName.split(' ')[0]})`,
    });
    setShowDarePicker(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 sm:p-6 rounded-3xl bg-white/95 border-2 border-[#F1DDD4] shadow-[3px_4px_0px_rgba(220,195,185,0.45)] relative overflow-hidden text-[#3F3534]"
    >
      <div className="relative z-10 space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-dashed border-[#F1DDD4]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#6B21A8] font-cute">
                End of Day Accountability
              </span>
              <h2 className="text-xl font-extrabold text-[#3F3534] font-cute tracking-tight">Today’s Pact Summary</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#6B21A8]">
              {completedCommitments} / {totalCommitments}
            </span>
            <span className="text-xs font-extrabold text-[#3F3534] bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-[#F1DDD4]">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Cute Headline Remark */}
        <div className="p-3.5 rounded-2xl bg-[#FFF0F3] border-2 border-[#F8B4C0] flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#FF4D6D] flex-shrink-0" />
          <p className="text-xs font-bold text-[#831843]">{cuteRemark}</p>
        </div>

        {/* Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs">
            <span className="text-[11px] font-bold text-[#5F5351]">Completed</span>
            <p className="text-lg font-black text-[#15803D] mt-0.5">{completedCommitments}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs">
            <span className="text-[11px] font-bold text-[#5F5351]">Incomplete</span>
            <p className="text-lg font-black text-[#B91C1C] mt-0.5">{incompleteCommitments}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs">
            <span className="text-[11px] font-bold text-[#5F5351]">Mandatory Done</span>
            <p className="text-lg font-black text-[#0369A1] mt-0.5">
              {mandatoryCompleted} / {mandatoryItems.length}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs">
            <span className="text-[11px] font-bold text-[#5F5351]">Pact Status</span>
            <p className="text-lg font-black text-[#6B21A8] capitalize mt-0.5">{pact.status}</p>
          </div>
        </div>

        {/* Playful Dare Trigger when non-critical missions are missed */}
        {incompleteCommitments > 0 && (
          <div className="pt-2">
            {!showDarePicker ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FEF3C7] border-2 border-[#FDE68A] shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-[#D97706]" />
                  <span className="text-xs font-bold text-[#92400E]">
                    A non-critical target was missed! Want to assign a harmless, funny dare?
                  </span>
                </div>
                <button
                  onClick={() => setShowDarePicker(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-extrabold shadow-sm transition-transform hover:scale-105 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Dare Partner 🎯</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white border-2 border-[#FDE68A] shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#92400E] flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Pick a harmless, funny dare (100% optional & playful):
                  </span>
                  <button
                    onClick={() => setShowDarePicker(false)}
                    className="text-xs font-bold text-[#756866] hover:text-[#3F3534] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#5F5351] font-bold">Target:</span>
                  <button
                    onClick={() => setSelectedTarget('partner')}
                    className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedTarget === 'partner'
                        ? 'bg-[#FF4D6D] text-white'
                        : 'bg-[#FAF7F2] text-[#5F5351] border border-[#F1DDD4]'
                    }`}
                  >
                    {partnerName.split(' ')[0]}
                  </button>
                  <button
                    onClick={() => setSelectedTarget('me')}
                    className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedTarget === 'me'
                        ? 'bg-[#FF4D6D] text-white'
                        : 'bg-[#FAF7F2] text-[#5F5351] border border-[#F1DDD4]'
                    }`}
                  >
                    Self-Dare ({myName.split(' ')[0]})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {HARMLESS_DARES.map((d, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendDare(d)}
                      className="p-3 text-left rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF0F3] border-2 border-[#F1DDD4] hover:border-[#F8B4C0] transition-all group cursor-pointer"
                    >
                      <p className="text-xs font-extrabold text-[#3F3534] group-hover:text-[#831843] flex items-center gap-1.5">
                        <Smile className="w-4 h-4 text-[#D97706]" />
                        {d.title}
                      </p>
                      <p className="text-[11px] text-[#5F5351] font-medium mt-1 line-clamp-1">{d.instruction}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
