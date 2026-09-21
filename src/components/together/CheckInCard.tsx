import React from 'react';
import { Sparkles, Zap, Heart } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { MoodType } from '../../types';
import { useStudy } from '../../context/StudyContext';

export const CheckInCard: React.FC = () => {
  const { me, partner, updateMood, updateEnergy } = useStudy();

  const moods: { id: MoodType; label: string; emoji: string }[] = [
    { id: 'good', label: 'Good', emoji: '🙂' },
    { id: 'okay', label: 'Okay', emoji: '😐' },
    { id: 'sleepy', label: 'Sleepy', emoji: '😴' },
    { id: 'tired', label: 'Tired', emoji: '😵' },
    { id: 'ready', label: 'Ready', emoji: '🔥' },
  ];

  const energyLevels = [1, 2, 3, 4, 5];

  return (
    <GlassCard glow className="relative overflow-hidden bg-white/95 border-2 border-[#F8B4C0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-dashed border-[#F1DDD4]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#6B21A8] font-cute">
              Daily Partner Check-In
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-[#3F3534] font-cute tracking-tight">How are you doing today?</h3>
          <p className="text-xs text-[#5F5351] font-medium mt-0.5">
            Share your headspace with {partner.shortName}. Honest check-ins keep both accountable.
          </p>
        </div>

        {/* Partner's status reflection */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#E0F2FE] border-2 border-[#BAE6FD] text-xs">
          <span className="text-[#0369A1] font-bold">{partner.shortName}'s mood:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white text-[#0369A1] font-extrabold flex items-center gap-1 border border-[#BAE6FD]">
            <span>🙂 Good</span>
            <span className="text-[#0284C7]">• Energy 5/5</span>
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Mood Selector */}
        <div>
          <label className="block text-xs font-bold text-[#4A3F3D] mb-2 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#FF4D6D]" />
            Select Your State
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((m) => {
              const isSelected = me.mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => updateMood(m.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFCCD5] border-[#FF8FA3] text-[#701A33] shadow-xs scale-[1.02] font-extrabold'
                      : 'bg-white border-[#F1DDD4] text-[#3F3534] hover:bg-[#FFF0F3] hover:border-[#FFCCD5]'
                  }`}
                >
                  <span className="text-2xl mb-1">{m.emoji}</span>
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#4A3F3D] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#D97706]" />
              Energy Level
            </label>
            <span className="text-xs font-extrabold text-[#92400E]">
              Level {me.energyLevel} / 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {energyLevels.map((lvl) => {
              const isSelected = me.energyLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => updateEnergy(lvl)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] shadow-xs scale-[1.02]'
                      : 'bg-white border-[#F1DDD4] text-[#5F5351] hover:text-[#3F3534] hover:bg-[#FEFCE8]'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
