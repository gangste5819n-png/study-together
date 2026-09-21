import React from 'react';
import { Activity, CheckCircle2, Clock, Sparkles, Moon, Flame } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useStudy } from '../../context/StudyContext';

export const RecentActivityFeed: React.FC = () => {
  const { activities } = useStudy();

  const getActivityIcon = (type: string) => {
    if (type === 'task') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (type === 'session') return <Flame className="w-4 h-4 text-purple-400" />;
    if (type === 'reaction') return <Sparkles className="w-4 h-4 text-cyan-400" />;
    if (type === 'plan') return <Moon className="w-4 h-4 text-indigo-400" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const getActorBadge = (actor: string) => {
    if (actor === 'me') return 'bg-[#FFCCD5] text-[#831843] border-[#FF8FA3]';
    if (actor === 'partner') return 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]';
    return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
  };

  return (
    <GlassCard className="relative">
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-dashed border-[#F1DDD4]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0]">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-[#3F3534] tracking-tight font-cute">Recent Study Activity</h3>
        </div>
        <span className="text-[11px] text-[#5F5351] font-bold">Synced Feed</span>
      </div>

      <div className="space-y-3">
        {activities.slice(0, 5).map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 p-3 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs hover:border-[#F8B4C0] transition-colors"
          >
            <div className="mt-0.5 p-1.5 rounded-xl bg-[#FFF0F3] border border-[#F8B4C0] flex-shrink-0">
              {getActivityIcon(act.type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#3F3534] leading-snug">{act.text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getActorBadge(
                    act.actor
                  )}`}
                >
                  {act.actor === 'me' ? 'You' : act.actor === 'partner' ? 'Priya' : 'Both'}
                </span>
                <span className="text-[10px] text-[#756866] font-medium">{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
