import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, XCircle, Sparkles, Trophy } from 'lucide-react';
import type { DareData } from '../../types';

interface ActiveDareBannerProps {
  dares: DareData[];
  currentUserId?: string;
  onAccept: (dareId: string) => void;
  onSkip: (dareId: string) => void;
  onComplete: (dareId: string) => void;
}

export const ActiveDareBanner: React.FC<ActiveDareBannerProps> = ({
  dares,
  currentUserId,
  onAccept,
  onSkip,
  onComplete,
}) => {
  // Find active dare for this user or room (either proposed or accepted)
  const activeDare = dares.find(
    (d) => d.status === 'proposed' || d.status === 'accepted'
  );

  if (!activeDare) return null;

  const isMyDare = currentUserId ? activeDare.targetUserId === currentUserId : true;
  const isAccepted = activeDare.status === 'accepted';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 sm:px-0"
      >
        <div className="p-4 rounded-3xl bg-white border-2 border-[#F8B4C0] shadow-2xl relative overflow-hidden text-[#3F3534]">
          <div className="relative z-10 flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0] shadow-xs flex-shrink-0 mt-0.5">
              <Target className="w-5 h-5 animate-bounce" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9D174D] flex items-center gap-1.5 font-cute">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF4D6D]" />
                  <span>Dare Unlocked 🎯</span>
                </span>
                <span className="text-[10px] font-bold text-[#831843] bg-[#FFCCD5] px-2 py-0.5 rounded-full border border-[#FF8FA3]">
                  {isAccepted ? 'Accepted • In Progress' : isMyDare ? 'Dare for You! 🔥' : 'Pending Partner Response'}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-[#3F3534] mt-1 leading-snug font-cute">
                "{activeDare.title}"
              </h4>

              {activeDare.instruction && (
                <p className="text-xs text-[#5F5351] mt-1 leading-relaxed font-medium">
                  {activeDare.instruction}
                </p>
              )}

              <p className="text-[11px] text-[#5F5351] mt-1">
                Assigned to: <strong className="text-[#3F3534]">{activeDare.targetUserName || 'Partner'}</strong>{' '}
                by {activeDare.proposedByName || 'Partner'}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3.5 pt-2.5 border-t-2 border-dashed border-[#F1DDD4]">
                {!isAccepted ? (
                  <>
                    <button
                      onClick={() => onAccept(activeDare._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-bold font-cute shadow-sm shadow-pink-200 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Dare</span>
                    </button>
                    <button
                      onClick={() => onSkip(activeDare._id)}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFF0F3] text-[#5F5351] hover:text-[#3F3534] border border-[#F1DDD4] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Skip</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onComplete(activeDare._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold font-cute shadow-sm shadow-emerald-200 transition-all cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-white" />
                    <span>Mark Complete 🎉</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
