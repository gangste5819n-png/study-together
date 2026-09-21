import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import type { CelebrationInfo } from '../../types';

interface TaskCompletionCelebrationProps {
  celebration?: CelebrationInfo | null;
  onDismiss?: () => void;
}

export const TaskCompletionCelebration: React.FC<TaskCompletionCelebrationProps> = ({
  celebration: propCelebration,
  onDismiss,
}) => {
  const { celebration: contextCelebration, clearCelebration } = useStudy();
  const activeCelebration = propCelebration !== undefined ? propCelebration : contextCelebration;
  const shouldReduceMotion = useReducedMotion();

  // Animation phase: 'approach' (0.1s - 0.45s), 'hug' (0.45s - 1.4s)
  const [phase, setPhase] = useState<'approach' | 'hug'>('approach');

  useEffect(() => {
    if (!activeCelebration) return;

    if (shouldReduceMotion) {
      setPhase('hug');
    } else {
      setPhase('approach');
      // Transition to hug at 0.45s
      const hugTimer = setTimeout(() => {
        setPhase('hug');
      }, 450);

      // Auto-dismiss at ~1.35s - 1.45s
      const dismissTimer = setTimeout(() => {
        if (onDismiss) {
          onDismiss();
        } else {
          clearCelebration();
        }
      }, 1400);

      return () => {
        clearTimeout(hugTimer);
        clearTimeout(dismissTimer);
      };
    }

    // Auto-dismiss for reduced motion
    const reducedDismissTimer = setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      } else {
        clearCelebration();
      }
    }, 1400);

    return () => clearTimeout(reducedDismissTimer);
  }, [activeCelebration?.id, shouldReduceMotion]);

  if (!activeCelebration) return null;

  return (
    <AnimatePresence>
      {activeCelebration && (
        <div
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Celebration Card */}
          <motion.div
            key={activeCelebration.id}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.82, y: 15 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.88, y: -10 }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-[#0d101e]/95 backdrop-blur-2xl border border-purple-500/35 shadow-[0_0_50px_rgba(168,85,247,0.35)] max-w-xs w-full pointer-events-auto"
          >
            {/* Top Pill / Checkmark indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeCelebration.title}</span>
            </div>

            {/* Two Friendly Avatars Hugging Area */}
            <div className="relative w-48 h-28 flex items-center justify-center my-1 select-none overflow-visible">
              {/* Particle Sparkles popping during the hug */}
              {phase === 'hug' && !shouldReduceMotion && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 0, x: -16 }}
                    animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], y: -24, x: -22 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute top-2 text-amber-300 text-base"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 0, x: 0 }}
                    animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0], y: -30, x: 2 }}
                    transition={{ duration: 0.65, delay: 0.05, ease: 'easeOut' }}
                    className="absolute top-0 text-purple-300 text-lg"
                  >
                    ⭐
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 0, x: 18 }}
                    animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], y: -22, x: 24 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                    className="absolute top-2 text-sky-300 text-base"
                  >
                    ✨
                  </motion.div>
                </>
              )}

              {/* FIGURE 1: Alex / Partner 1 (Purple Buddy) */}
              <motion.div
                initial={shouldReduceMotion ? { x: -6 } : { x: -38, rotate: -8 }}
                animate={
                  shouldReduceMotion
                    ? { x: -6 }
                    : phase === 'approach'
                    ? { x: -14, rotate: -2, transition: { duration: 0.35, ease: 'easeOut' } }
                    : {
                        x: 8,
                        rotate: 6,
                        scale: [1, 1.08, 1],
                        transition: { duration: 0.45, ease: 'easeInOut' },
                      }
                }
                className="absolute z-10"
              >
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-[0_4px_12px_rgba(147,51,234,0.35)]"
                >
                  {/* Alex's Body (Purple Gradient) */}
                  <rect
                    x="12"
                    y="14"
                    width="48"
                    height="50"
                    rx="24"
                    fill="url(#purpleBuddy)"
                    stroke="#a855f7"
                    strokeWidth="2"
                  />
                  {/* Soft Rosy Cheeks */}
                  <circle cx="21" cy="39" r="3.5" fill="#f472b6" opacity="0.6" />
                  <circle cx="51" cy="39" r="3.5" fill="#f472b6" opacity="0.6" />
                  {/* Happy Smiling Eyes (^ ^) */}
                  <path
                    d="M 23 33 Q 27 28 31 33"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 41 33 Q 45 28 49 33"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Sweet Smile */}
                  <path
                    d="M 32 40 Q 36 45 40 40"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Hugging Arm */}
                  <path
                    d={
                      phase === 'hug'
                        ? 'M 44 44 Q 58 40 64 36'
                        : 'M 44 44 Q 52 46 54 48'
                    }
                    stroke="#c084fc"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="purpleBuddy" x1="12" y1="14" x2="60" y2="64" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#8b5cf6" />
                      <stop offset="1" stopColor="#6d28d9" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* FIGURE 2: Priya / Partner 2 (Cyan/Teal Buddy) */}
              <motion.div
                initial={shouldReduceMotion ? { x: 6 } : { x: 38, rotate: 8 }}
                animate={
                  shouldReduceMotion
                    ? { x: 6 }
                    : phase === 'approach'
                    ? { x: 14, rotate: 2, transition: { duration: 0.35, ease: 'easeOut' } }
                    : {
                        x: -8,
                        rotate: -6,
                        scale: [1, 1.08, 1],
                        transition: { duration: 0.45, ease: 'easeInOut' },
                      }
                }
                className="absolute z-20"
              >
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-[0_4px_12px_rgba(6,182,212,0.35)]"
                >
                  {/* Priya's Body (Cyan/Teal Gradient) */}
                  <rect
                    x="12"
                    y="14"
                    width="48"
                    height="50"
                    rx="24"
                    fill="url(#cyanBuddy)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  {/* Soft Rosy Cheeks */}
                  <circle cx="21" cy="39" r="3.5" fill="#f472b6" opacity="0.6" />
                  <circle cx="51" cy="39" r="3.5" fill="#f472b6" opacity="0.6" />
                  {/* Happy Smiling Eyes (^ ^) */}
                  <path
                    d="M 23 33 Q 27 28 31 33"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 41 33 Q 45 28 49 33"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Sweet Smile */}
                  <path
                    d="M 32 40 Q 36 45 40 40"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Hugging Arm */}
                  <path
                    d={
                      phase === 'hug'
                        ? 'M 28 44 Q 14 40 8 36'
                        : 'M 28 44 Q 20 46 18 48'
                    }
                    stroke="#38bdf8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="cyanBuddy" x1="12" y1="14" x2="60" y2="64" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#06b6d4" />
                      <stop offset="1" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>

            {/* Dynamic Celebration Text Sequence */}
            <div className="space-y-1 mt-1">
              <motion.h4
                key={phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="text-base font-extrabold text-white flex items-center justify-center gap-1.5"
              >
                {phase === 'hug' ? (
                  <>
                    <span>Virtual hug unlocked</span>
                    <span>🫂</span>
                  </>
                ) : (
                  <>
                    <span>{activeCelebration.title}</span>
                  </>
                )}
              </motion.h4>

              {/* Contextual Supportive Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                className="text-xs text-purple-200/90 font-medium"
              >
                {activeCelebration.message || activeCelebration.subtitle}
              </motion.p>
            </div>

            {/* Subtle glow bar at bottom */}
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mt-3 opacity-60" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
