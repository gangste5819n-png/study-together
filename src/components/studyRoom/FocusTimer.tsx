import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Flame, Coffee, Sparkles, BookOpen, Users } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useStudy } from '../../context/StudyContext';

export const FocusTimer: React.FC = () => {
  const {
    me,
    partner,
    activeSession,
    startStudySession,
    pauseStudySession,
    resumeStudySession,
    endStudySession,
    setSessionPreset,
  } = useStudy();

  const isRunning = activeSession.status === 'active';
  const isPaused = activeSession.status === 'paused';
  const durationMins = activeSession.durationMins || 50;
  const mode = activeSession.mode || 'focus';

  // Compute secondsLeft from server timestamps to prevent clock drift
  const calculateSecondsLeft = (): number => {
    const totalSeconds = durationMins * 60;
    if (isRunning && activeSession.startedAt) {
      const startTime = new Date(activeSession.startedAt).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      return Math.max(0, totalSeconds - elapsed);
    }
    if (isPaused) {
      return Math.max(0, totalSeconds - (activeSession.elapsedSeconds || 0));
    }
    return totalSeconds;
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateSecondsLeft);

  // Synchronized countdown interval
  useEffect(() => {
    setSecondsLeft(calculateSecondsLeft());

    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft(calculateSecondsLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession.status, activeSession.startedAt, activeSession.pausedAt, activeSession.elapsedSeconds, durationMins]);

  // Status message
  let statusText = 'Ready to study';
  if (isRunning) {
    statusText = mode === 'focus' ? 'Deep focus in progress...' : 'Break time in progress...';
  } else if (isPaused) {
    statusText = 'Session paused';
  } else if (activeSession.status === 'ended') {
    statusText = 'Session completed 🎉';
  }

  const handleStartOrResume = () => {
    if (isPaused) {
      resumeStudySession();
    } else {
      startStudySession(mode, durationMins, me.currentSubject);
    }
  };

  const formatMinutes = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, ((durationMins * 60 - secondsLeft) / (durationMins * 60)) * 100)
  );

  return (
    <GlassCard glow className="relative overflow-hidden bg-white/95 border-2 border-[#F8B4C0]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Task Info & Status */}
        <div className="w-full md:w-1/3 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning
                  ? 'bg-emerald-500 animate-ping'
                  : isPaused
                  ? 'bg-amber-500'
                  : 'bg-[#FF4D6D]'
              }`}
            />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B21A8]">
              {statusText}
            </span>

            {/* Synchronized Partner Indicator */}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E0F2FE] border border-[#7DD3FC] text-xs text-[#0369A1] font-bold ml-auto sm:ml-0">
              <Users className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Real-Time Sync</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[#9333EA]" />
              <span>Current Focus Target</span>
            </div>
            <h3 className="text-base font-extrabold text-[#3F3534] tracking-tight">
              {activeSession.subject || `${me.currentSubject} — 50 High-Yield PYQs`}
            </h3>
            <p className="text-xs text-[#5F5351] font-medium mt-0.5">
              {activeSession.ownerName
                ? `Active chamber • Started by ${activeSession.ownerName}`
                : `${me.name} & ${partner.name}`}
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => setSessionPreset(50, 'focus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'focus' && durationMins === 50
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200'
                  : 'bg-white border-2 border-[#F1DDD4] text-[#3F3534] hover:bg-[#FFF0F3]'
              }`}
            >
              50m Focus
            </button>
            <button
              onClick={() => setSessionPreset(25, 'focus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'focus' && durationMins === 25
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200'
                  : 'bg-white border-2 border-[#F1DDD4] text-[#3F3534] hover:bg-[#FFF0F3]'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => setSessionPreset(10, 'break')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'break'
                  ? 'bg-[#D97706] text-white shadow-md shadow-amber-200'
                  : 'bg-white border-2 border-[#F1DDD4] text-[#3F3534] hover:bg-[#FEFCE8]'
              }`}
            >
              10m Break
            </button>
          </div>
        </div>

        {/* Center: Large Digit Display */}
        <div className="flex flex-col items-center justify-center my-2 md:my-0">
          <div className="text-5xl sm:text-7xl font-mono font-black text-[#3F3534] tracking-tight select-none">
            {formatMinutes(secondsLeft)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 mt-4 flex-wrap justify-center">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStartOrResume}
                aria-label={isPaused ? "Resume focus session" : "Start focus session"}
                className="min-h-[44px] min-w-[44px] flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isPaused ? 'Resume' : 'Start'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseStudySession}
                aria-label="Pause focus session"
                className="min-h-[44px] min-w-[44px] flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              type="button"
              onClick={endStudySession}
              aria-label="End study session"
              className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FEE2E2] text-[#B91C1C] text-sm font-bold transition-colors border-2 border-[#FECACA] shadow-xs cursor-pointer"
            >
              <Square className="w-4 h-4" />
              <span>End Session</span>
            </button>

            <button
              type="button"
              onClick={() => setSessionPreset(durationMins, mode)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#5F5351] hover:text-[#3F3534] transition-colors border-2 border-[#F1DDD4] shadow-xs cursor-pointer"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Session Metas */}
        <div className="w-full md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#F1DDD4] pt-4 md:pt-0 md:pl-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5F5351] font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#E11D48]" />
              Session Duration
            </span>
            <span className="text-[#3F3534] font-extrabold">{durationMins}:00 min</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5F5351] font-bold flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-[#D97706]" />
              Break Preset
            </span>
            <span className="text-[#3F3534] font-extrabold">10:00 min</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5F5351] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
              Today's Completed Study
            </span>
            <span className="text-[#6B21A8] font-black">{me.todayStudyMinutes} min</span>
          </div>

          {/* Mini progress line */}
          <div className="w-full bg-[#F1DDD4] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF8BA7] to-[#7C3AED] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
