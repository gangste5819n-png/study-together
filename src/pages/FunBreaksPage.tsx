import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dices,
  Shuffle,
  Flame,
  HelpCircle,
  Trophy,
  Coffee,
  Sparkles,
  CheckCircle2,
  Clock,
  Laugh,
  PartyPopper,
  Filter,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { GlassCard } from '../components/common/GlassCard';
import {
  randomDaresPool,
  icebreakersPool,
  miniChallengesPool,
  tinyWinsPool,
} from '../data/mockData';
import type { FunCardItem } from '../types';

type CategoryFilterType = 'All' | 'Silly' | 'Acting' | 'Random' | 'Icebreaker' | 'Mini Challenge';

interface CardState {
  hasDrawn: boolean;
  itemIndex: number;
  isCompleted: boolean;
  completedCount: number;
}

export const FunBreaksPage: React.FC = () => {
  const { showToast, settings } = useStudy();

  // Persistent Fun Count (completely separated from academic task completion)
  const [funCount, setFunCount] = useState<number>(() => {
    const saved = localStorage.getItem('studyTogether_funCount');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 7;
  });

  // Category filter state
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilterType>('All');

  // Independent state for each of the 4 category cards
  const [cardStates, setCardStates] = useState<{
    dare: CardState;
    icebreaker: CardState;
    challenge: CardState;
    win: CardState;
  }>({
    dare: { hasDrawn: true, itemIndex: 0, isCompleted: false, completedCount: 0 },
    icebreaker: { hasDrawn: true, itemIndex: 0, isCompleted: false, completedCount: 0 },
    challenge: { hasDrawn: true, itemIndex: 0, isCompleted: false, completedCount: 0 },
    win: { hasDrawn: true, itemIndex: 0, isCompleted: false, completedCount: 0 },
  });

  // Playful chime audio synthesis (only if user enabled sound)
  const playChaosChime = () => {
    if (!settings.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // AudioContext might be blocked until interaction; safe to ignore
    }
  };

  // Helper to filter pool based on selectedFilter
  const getFilteredPool = (
    pool: FunCardItem[],
    categoryKey: 'dare' | 'icebreaker' | 'challenge' | 'win'
  ): FunCardItem[] => {
    if (selectedFilter === 'All') return pool;
    if (selectedFilter === 'Icebreaker') {
      return categoryKey === 'icebreaker' ? pool : [];
    }
    if (selectedFilter === 'Mini Challenge') {
      return categoryKey === 'challenge' ? pool : [];
    }
    // Tag-based filters (Silly, Acting, Random)
    return pool.filter((item) => item.categoryTag === selectedFilter);
  };

  const filteredDares = getFilteredPool(randomDaresPool, 'dare');
  const filteredIce = getFilteredPool(icebreakersPool, 'icebreaker');
  const filteredChallenge = getFilteredPool(miniChallengesPool, 'challenge');
  const filteredWin = getFilteredPool(tinyWinsPool, 'win');

  // Random item selector
  const handleDrawOrShuffle = (category: 'dare' | 'icebreaker' | 'challenge' | 'win') => {
    let pool: FunCardItem[] = [];
    if (category === 'dare') pool = filteredDares.length ? filteredDares : randomDaresPool;
    if (category === 'icebreaker') pool = filteredIce.length ? filteredIce : icebreakersPool;
    if (category === 'challenge') pool = filteredChallenge.length ? filteredChallenge : miniChallengesPool;
    if (category === 'win') pool = filteredWin.length ? filteredWin : tinyWinsPool;

    if (pool.length === 0) return;

    setCardStates((prev) => {
      const currentIdx = prev[category].itemIndex;
      let nextIdx = Math.floor(Math.random() * pool.length);
      if (pool.length > 1 && nextIdx === currentIdx) {
        nextIdx = (currentIdx + 1) % pool.length;
      }
      return {
        ...prev,
        [category]: {
          ...prev[category],
          hasDrawn: true,
          itemIndex: nextIdx,
          isCompleted: false,
        },
      };
    });
  };

  // Mark break as completed (Does NOT give study points or affect study tasks)
  const handleDone = (category: 'dare' | 'icebreaker' | 'challenge' | 'win') => {
    playChaosChime();

    // Increment persistent Fun Count
    setFunCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('studyTogether_funCount', String(next));
      return next;
    });

    // Mark card as completed
    setCardStates((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        isCompleted: true,
        completedCount: prev[category].completedCount + 1,
      },
    }));

    showToast('😂 Chaos successfully completed.');
  };

  // Category filter buttons
  const filterOptions: { id: CategoryFilterType; label: string; icon: string }[] = [
    { id: 'All', label: 'All', icon: '✨' },
    { id: 'Silly', label: 'Silly', icon: '🤪' },
    { id: 'Acting', label: 'Acting', icon: '🎭' },
    { id: 'Random', label: 'Random', icon: '🎲' },
    { id: 'Icebreaker', label: 'Icebreaker', icon: '🧊' },
    { id: 'Mini Challenge', label: 'Mini Challenge', icon: '⚡' },
  ];

  // Check if a category section should be visible given current filter
  const isCategoryVisible = (categoryKey: 'dare' | 'icebreaker' | 'challenge' | 'win') => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Icebreaker') return categoryKey === 'icebreaker';
    if (selectedFilter === 'Mini Challenge') return categoryKey === 'challenge';
    if (selectedFilter === 'Silly') {
      return (
        randomDaresPool.some((d) => d.categoryTag === 'Silly') &&
        (categoryKey === 'dare' || categoryKey === 'challenge')
      );
    }
    if (selectedFilter === 'Acting') {
      return categoryKey === 'dare';
    }
    if (selectedFilter === 'Random') {
      return categoryKey === 'dare' || categoryKey === 'win';
    }
    return true;
  };

  // Sync state if index out of bounds when filter changes
  useEffect(() => {
    (['dare', 'icebreaker', 'challenge', 'win'] as const).forEach((cat) => {
      let pool = randomDaresPool;
      if (cat === 'icebreaker') pool = icebreakersPool;
      if (cat === 'challenge') pool = miniChallengesPool;
      if (cat === 'win') pool = tinyWinsPool;
      const filtered = getFilteredPool(pool, cat);

      if (filtered.length > 0 && cardStates[cat].itemIndex >= filtered.length) {
        setCardStates((prev) => ({
          ...prev,
          [cat]: { ...prev[cat], itemIndex: 0 },
        }));
      }
    });
  }, [selectedFilter]);

  // Current items safe lookup
  const darePoolToUse = filteredDares.length ? filteredDares : randomDaresPool;
  const icePoolToUse = filteredIce.length ? filteredIce : icebreakersPool;
  const challengePoolToUse = filteredChallenge.length ? filteredChallenge : miniChallengesPool;
  const winPoolToUse = filteredWin.length ? filteredWin : tinyWinsPool;

  const currentDare = darePoolToUse[cardStates.dare.itemIndex % darePoolToUse.length] || darePoolToUse[0];
  const currentIce = icePoolToUse[cardStates.icebreaker.itemIndex % icePoolToUse.length] || icePoolToUse[0];
  const currentChallenge = challengePoolToUse[cardStates.challenge.itemIndex % challengePoolToUse.length] || challengePoolToUse[0];
  const currentWin = winPoolToUse[cardStates.win.itemIndex % winPoolToUse.length] || winPoolToUse[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Top Header & Navigation Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-[#F8B4C0]/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D6D] mb-1 font-cute">
            <Dices className="w-3.5 h-3.5 text-[#FF4D6D]" />
            <span>1–3 MINUTE MENTAL RECHARGE 🎲</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3F3534] tracking-tight flex items-center gap-2.5 font-cute">
            <span>🎲</span>
            <span>Fun Breaks & Dares</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#FF6B8B] font-hand font-bold mt-1">
            "Okay, we've studied enough. Here's 60 seconds of nonsense 💕"
          </p>
        </div>

        {/* Status Indicators: Fun Count & Safety Tag */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fun Count Metric Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#FFF2F4] border-2 border-[#F8B4C0] shadow-xs">
            <span className="text-xl select-none" role="img" aria-label="laugh">
              😂
            </span>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#FF4D6D] tracking-wider font-cute">
                Chaos Counter
              </div>
              <div className="text-xs md:text-sm font-extrabold text-[#3F3534] font-cute">
                Fun breaks completed:{' '}
                <span className="text-[#D90429] font-mono font-black">{funCount}</span>
              </div>
            </div>
          </div>

          {/* Quick reminder tag */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#FEFCE8] border border-[#FEF08A] text-[#854D0E] text-xs font-bold font-cute">
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            <span>0 study pressure • 100% silly</span>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[#7A6B69] font-semibold font-cute">
          <Filter className="w-3.5 h-3.5 text-[#FF4D6D]" />
          <span>Category Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-cute transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#FFCCD5] text-[#831843] border border-[#FF8FA3] shadow-xs font-bold'
                    : 'bg-[#FAF7F2] text-[#7A6B69] hover:bg-pink-100/50 hover:text-[#3F3534] border border-[#F1DDD4]'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ======================================================= */}
        {/* CARD 1: 🎲 RANDOM DARE */}
        {/* ======================================================= */}
        {isCategoryVisible('dare') && (
          <GlassCard
            glow
            className="relative flex flex-col justify-between overflow-hidden bg-white/95 border-2 border-[#F8B4C0] shadow-[3px_4px_0px_rgba(248,180,192,0.45)]"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#F1DDD4]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-[#FFE4E8] text-[#9D174D] border border-[#F8B4C0]">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#9D174D] font-cute">
                        Category 1
                      </span>
                      {currentDare.categoryTag && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FFE4E8] text-[#9D174D] border border-[#F8B4C0]">
                          {currentDare.categoryTag}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-extrabold text-[#3F3534] flex items-center gap-1.5 font-cute">
                      <span>🎲</span>
                      <span>RANDOM DARE</span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold font-mono">
                  <span>
                    #{(cardStates.dare.itemIndex % darePoolToUse.length) + 1} of {darePoolToUse.length}
                  </span>
                </div>
              </div>

              {/* Card Content or Celebration */}
              <AnimatePresence mode="wait">
                {cardStates.dare.isCompleted ? (
                  <motion.div
                    key="dare-done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="my-3 p-5 rounded-2xl bg-[#FFE4E8] border-2 border-[#F8B4C0] text-center space-y-2"
                  >
                    <div className="text-3xl animate-bounce">😂</div>
                    <h3 className="text-base font-extrabold text-[#831843] font-cute">
                      Chaos successfully completed.
                    </h3>
                    <p className="text-xs text-[#9D174D] font-bold">
                      Dopamine restored! +0 study pressure added.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentDare.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="my-3 p-4 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] hover:border-[#FFCCD5] transition-all"
                  >
                    <p className="text-lg font-extrabold text-[#3F3534] leading-snug tracking-normal">
                      "{currentDare.content}"
                    </p>
                    {currentDare.instruction && (
                      <p className="text-xs text-[#5F5351] font-medium mt-2.5 italic flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#FF4D6D] shrink-0" />
                        <span>{currentDare.instruction}</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-[#F1DDD4] flex items-center gap-2">
              <button
                onClick={() => handleDrawOrShuffle('dare')}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3F3534] text-xs font-bold transition-all border-2 border-[#F1DDD4] hover:border-[#FFCCD5] active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#FF4D6D]" />
                <span>
                  {cardStates.dare.isCompleted
                    ? '🎲 Draw another dare'
                    : cardStates.dare.hasDrawn
                    ? 'Give me another'
                    : '🎲 Give Me One'}
                </span>
              </button>

              {!cardStates.dare.isCompleted && (
                <button
                  onClick={() => handleDone('dare')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-extrabold transition-all border-2 border-[#FF2A55] shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done ✓</span>
                </button>
              )}
            </div>
          </GlassCard>
        )}

        {/* ======================================================= */}
        {/* CARD 2: 🧊 ICEBREAKER */}
        {/* ======================================================= */}
        {isCategoryVisible('icebreaker') && (
          <GlassCard
            glow
            className="relative flex flex-col justify-between overflow-hidden bg-white/95 border-2 border-[#BAE6FD] shadow-[3px_4px_0px_rgba(186,230,253,0.45)]"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#F1DDD4]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#0369A1] font-cute">
                        Category 2
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                        Questions, not tasks
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold text-[#3F3534] flex items-center gap-1.5 font-cute">
                      <span>🧊</span>
                      <span>ICEBREAKER</span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold font-mono">
                  <span>
                    #{(cardStates.icebreaker.itemIndex % icePoolToUse.length) + 1} of {icePoolToUse.length}
                  </span>
                </div>
              </div>

              {/* Card Content or Celebration */}
              <AnimatePresence mode="wait">
                {cardStates.icebreaker.isCompleted ? (
                  <motion.div
                    key="ice-done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="my-3 p-5 rounded-2xl bg-[#E0F2FE] border-2 border-[#BAE6FD] text-center space-y-2"
                  >
                    <div className="text-3xl animate-bounce">😂</div>
                    <h3 className="text-base font-extrabold text-[#0369A1] font-cute">
                      Chaos successfully completed.
                    </h3>
                    <p className="text-xs text-[#0284C7] font-bold">
                      Great minds think ridiculously together.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentIce.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="my-3 p-4 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] hover:border-[#BAE6FD] transition-all"
                  >
                    <p className="text-lg font-extrabold text-[#3F3534] leading-snug tracking-normal">
                      "{currentIce.content}"
                    </p>
                    {currentIce.instruction && (
                      <p className="text-xs text-[#5F5351] font-medium mt-2.5 italic flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#0284C7] shrink-0" />
                        <span>{currentIce.instruction}</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-[#F1DDD4] flex items-center gap-2">
              <button
                onClick={() => handleDrawOrShuffle('icebreaker')}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3F3534] text-xs font-bold transition-all border-2 border-[#F1DDD4] hover:border-[#BAE6FD] active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>
                  {cardStates.icebreaker.isCompleted
                    ? '🎲 Draw another icebreaker'
                    : cardStates.icebreaker.hasDrawn
                    ? 'Give me another'
                    : '🎲 Give Me One'}
                </span>
              </button>

              {!cardStates.icebreaker.isCompleted && (
                <button
                  onClick={() => handleDone('icebreaker')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold transition-all border-2 border-[#0284C7] shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done ✓</span>
                </button>
              )}
            </div>
          </GlassCard>
        )}

        {/* ======================================================= */}
        {/* CARD 3: 🎭 MINI CHALLENGE */}
        {/* ======================================================= */}
        {isCategoryVisible('challenge') && (
          <GlassCard
            glow
            className="relative flex flex-col justify-between overflow-hidden bg-white/95 border-2 border-[#C7D2FE] shadow-[3px_4px_0px_rgba(199,210,254,0.45)]"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#F1DDD4]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#4338CA] font-cute">
                        Category 3
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
                        30–90 seconds
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold text-[#3F3534] flex items-center gap-1.5 font-cute">
                      <span>🎭</span>
                      <span>MINI CHALLENGE</span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold font-mono">
                  <span>
                    #{(cardStates.challenge.itemIndex % challengePoolToUse.length) + 1} of {challengePoolToUse.length}
                  </span>
                </div>
              </div>

              {/* Card Content or Celebration */}
              <AnimatePresence mode="wait">
                {cardStates.challenge.isCompleted ? (
                  <motion.div
                    key="chal-done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="my-3 p-5 rounded-2xl bg-[#EEF2FF] border-2 border-[#C7D2FE] text-center space-y-2"
                  >
                    <div className="text-3xl animate-bounce">😂</div>
                    <h3 className="text-base font-extrabold text-[#4338CA] font-cute">
                      Chaos successfully completed.
                    </h3>
                    <p className="text-xs text-[#4F46E5] font-bold">
                      Micro-challenge conquered in style!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentChallenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="my-3 p-4 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] hover:border-[#C7D2FE] transition-all"
                  >
                    <p className="text-lg font-extrabold text-[#3F3534] leading-snug tracking-normal">
                      "{currentChallenge.content}"
                    </p>
                    {currentChallenge.instruction && (
                      <p className="text-xs text-[#5F5351] font-medium mt-2.5 italic flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#4338CA] shrink-0" />
                        <span>{currentChallenge.instruction}</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-[#F1DDD4] flex items-center gap-2">
              <button
                onClick={() => handleDrawOrShuffle('challenge')}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3F3534] text-xs font-bold transition-all border-2 border-[#F1DDD4] hover:border-[#C7D2FE] active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#4338CA]" />
                <span>
                  {cardStates.challenge.isCompleted
                    ? '🎲 Draw another challenge'
                    : cardStates.challenge.hasDrawn
                    ? 'Give me another'
                    : '🎲 Give Me One'}
                </span>
              </button>

              {!cardStates.challenge.isCompleted && (
                <button
                  onClick={() => handleDone('challenge')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold transition-all border-2 border-[#4338CA] shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done ✓</span>
                </button>
              )}
            </div>
          </GlassCard>
        )}

        {/* ======================================================= */}
        {/* CARD 4: ✨ TINY WIN */}
        {/* ======================================================= */}
        {isCategoryVisible('win') && (
          <GlassCard
            glow
            className="relative flex flex-col justify-between overflow-hidden bg-white/95 border-2 border-[#BBF7D0] shadow-[3px_4px_0px_rgba(187,247,208,0.45)]"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#F1DDD4]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#15803D] font-cute">
                        Category 4
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                        Positive reflection
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold text-[#3F3534] flex items-center gap-1.5 font-cute">
                      <span>✨</span>
                      <span>TINY WIN</span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#5F5351] font-bold font-mono">
                  <span>
                    #{(cardStates.win.itemIndex % winPoolToUse.length) + 1} of {winPoolToUse.length}
                  </span>
                </div>
              </div>

              {/* Card Content or Celebration */}
              <AnimatePresence mode="wait">
                {cardStates.win.isCompleted ? (
                  <motion.div
                    key="win-done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="my-3 p-5 rounded-2xl bg-[#DCFCE7] border-2 border-[#86EFAC] text-center space-y-2"
                  >
                    <div className="text-3xl animate-bounce">✨</div>
                    <h3 className="text-base font-extrabold text-[#15803D] font-cute">
                      Chaos successfully completed.
                    </h3>
                    <p className="text-xs text-[#166534] font-bold">
                      Gratitude logged. You are doing fantastic today.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentWin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="my-3 p-4 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] hover:border-[#BBF7D0] transition-all"
                  >
                    <p className="text-lg font-extrabold text-[#3F3534] leading-snug tracking-normal">
                      "{currentWin.content}"
                    </p>
                    {currentWin.instruction && (
                      <p className="text-xs text-[#5F5351] font-medium mt-2.5 italic flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#15803D] shrink-0" />
                        <span>{currentWin.instruction}</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-[#F1DDD4] flex items-center gap-2">
              <button
                onClick={() => handleDrawOrShuffle('win')}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3F3534] text-xs font-bold transition-all border-2 border-[#F1DDD4] hover:border-[#BBF7D0] active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#15803D]" />
                <span>
                  {cardStates.win.isCompleted
                    ? '🎲 Draw another win'
                    : cardStates.win.hasDrawn
                    ? 'Give me another'
                    : '🎲 Give Me One'}
                </span>
              </button>

              {!cardStates.win.isCompleted && (
                <button
                  onClick={() => handleDone('win')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold transition-all border-2 border-[#15803D] shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done ✓</span>
                </button>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Bottom Fun Tip Card */}
      <div className="p-4 rounded-3xl bg-white border-2 border-[#F1DDD4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5F5351] shadow-xs">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="p-2 rounded-xl bg-[#F3E8FF] text-[#6B21A8]">
            <PartyPopper className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-[#3F3534]">Remember:</span> Completed fun breaks do not affect study hours, exam syllabus, or task stats. Laugh for 60 seconds, then get back to conquering your goals!
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#6B21A8] font-extrabold shrink-0">
          <Laugh className="w-4 h-4" />
          <span>Keep it lighthearted</span>
        </div>
      </div>
    </motion.div>
  );
};
