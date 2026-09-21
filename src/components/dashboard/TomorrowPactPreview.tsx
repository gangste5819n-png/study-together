import React from 'react';
import { Moon, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../common/GlassCard';
import { useStudy } from '../../context/StudyContext';

export const TomorrowPactPreview: React.FC = () => {
  const navigate = useNavigate();
  const { tomorrowPact, todayPact } = useStudy();

  const activePact = tomorrowPact || todayPact;
  const commitments = activePact?.commitments || [];
  const completedCount = commitments.filter((c) => c.status === 'completed').length;
  const isLocked = activePact?.status === 'locked' || activePact?.status === 'active';

  return (
    <GlassCard glow className="p-5 sm:p-6 border-2 border-[#F8B4C0]/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-dashed border-[#F1DDD4]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFE4E8] border border-[#F8B4C0] flex items-center justify-center text-[#BE185D] flex-shrink-0 shadow-xs">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#3F3534] tracking-tight font-cute">Tomorrow Pact</h2>
              {isLocked ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-[10px] font-bold flex items-center gap-1 font-cute">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Locked & Committed</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-bold flex items-center gap-1 font-cute">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Planning in Progress</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F5351] mt-0.5 font-medium">
              Cozy mutual commitments established together before tomorrow begins.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/tomorrow')}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#FFCCD5] hover:bg-[#FFB3C1] border border-[#FF8FA3] text-[#831843] text-xs font-bold font-cute transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 self-start sm:self-auto"
        >
          <span>Open Pact</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Commitments Summary */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[#5F5351] uppercase tracking-wider text-[10px] font-extrabold block">
              Commitments
            </span>
            <span className="text-sm font-black text-[#3F3534]">
              {commitments.length} Total
            </span>
          </div>

          <div className="h-7 w-px bg-[#F1DDD4]" />

          <div>
            <span className="text-[#5F5351] uppercase tracking-wider text-[10px] font-extrabold block">
              Completed
            </span>
            <span className="text-sm font-black text-[#6B21A8]">
              {completedCount} / {commitments.length}
            </span>
          </div>

          <div className="h-7 w-px bg-[#F1DDD4]" />

          <div>
            <span className="text-[#5F5351] uppercase tracking-wider text-[10px] font-extrabold block">
              Partner Status
            </span>
            <span className="text-sm font-bold text-[#3F3534]">
              {activePact?.confirmations && activePact.confirmations.length > 0 ? 'Confirmed ✓' : 'Reviewing ✨'}
            </span>
          </div>
        </div>

        {commitments.length > 0 && (
          <div className="flex -space-x-1.5 overflow-hidden">
            {commitments.slice(0, 4).map((c, i) => (
              <span
                key={c._id || c.id || i}
                title={c.title}
                className={`inline-block w-6 h-6 rounded-full border-2 border-[#090b12] flex items-center justify-center text-[10px] ${
                  c.status === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-purple-900 text-purple-200'
                }`}
              >
                {c.status === 'completed' ? '✓' : i + 1}
              </span>
            ))}
            {commitments.length > 4 && (
              <span className="inline-block w-6 h-6 rounded-full bg-white/10 border-2 border-[#090b12] text-[9px] text-slate-300 flex items-center justify-center font-bold">
                +{commitments.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
