import React from 'react';
import { MessageCircleHeart } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useStudy } from '../../context/StudyContext';

export const EncouragementBar: React.FC = () => {
  const { partner, sendEncouragement } = useStudy();

  const reactions = [
    { emoji: '🔥', label: 'On Fire' },
    { emoji: '👏', label: 'Well Done' },
    { emoji: '💪', label: 'Stay Strong' },
    { emoji: '🫡', label: 'Salute Officer/Doc' },
    { emoji: '😂', label: 'Hang In There' },
  ];

  return (
    <GlassCard className="relative overflow-hidden bg-white/95 border-2 border-[#F1DDD4]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#F3E8FF] border border-[#E9D5FF] text-[#6B21A8]">
              <MessageCircleHeart className="w-4 h-4" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B21A8] font-cute">
              Real-Time Encouragement
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-[#3F3534] tracking-tight font-cute">
            Send quick encouragement to {partner.shortName}
          </h3>
          <p className="text-xs text-[#5F5351] font-medium mt-0.5">
            A tiny micro-cheer can turn around a grueling 8-hour study day.
          </p>
        </div>

        <span className="text-xs text-[#756866] font-bold self-start sm:self-center bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#F1DDD4]">
          Tap any emoji to trigger
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {reactions.map((r) => (
          <button
            key={r.emoji}
            onClick={() => sendEncouragement(r.emoji)}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border-2 border-[#F1DDD4] hover:bg-[#FFF0F3] hover:border-[#F8B4C0] hover:scale-105 active:scale-95 transition-all duration-200 shadow-xs cursor-pointer"
          >
            <span className="text-3xl mb-1.5 transform group-hover:scale-110 transition-transform">
              {r.emoji}
            </span>
            <span className="text-xs font-extrabold text-[#3F3534] group-hover:text-[#831843]">
              {r.label}
            </span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
};
