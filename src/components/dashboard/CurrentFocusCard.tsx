import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Video, Coffee, Flame } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

export const CurrentFocusCard: React.FC = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60 + 42); // 25:42

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Active Focus Session
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">CDS English — 50 PYQs</h3>
          <p className="text-xs text-slate-400">Personal focus interval • Deep work mode</p>
        </div>

        <button
          onClick={() => navigate('/study-room')}
          className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-105"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Continue in Study Room</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
        {/* Large Timer Display */}
        <div className="flex items-center gap-4">
          <div className="text-4xl md:text-5xl font-mono font-extrabold text-white tracking-tight">
            {formatTime(secondsRemaining)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2.5 rounded-xl transition-all ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 hover:bg-purple-500'
              }`}
              title={isRunning ? 'Pause' : 'Start'}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setSecondsRemaining(25 * 60 + 42);
              }}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Focus stats breakdown */}
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 text-center md:text-left">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-center md:justify-start">
              <Flame className="w-3 h-3 text-purple-400" />
              <span>Focus Today</span>
            </div>
            <p className="text-sm font-bold text-slate-100 mt-0.5">5h 20m</p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-center md:justify-start">
              <Coffee className="w-3 h-3 text-amber-400" />
              <span>Break Time</span>
            </div>
            <p className="text-sm font-bold text-slate-100 mt-0.5">45m</p>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Completed</div>
            <p className="text-sm font-bold text-slate-100 mt-0.5">6 sessions</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
