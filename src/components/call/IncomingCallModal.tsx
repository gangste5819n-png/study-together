import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, PhoneOff, PhoneCall, Sparkles } from 'lucide-react';
import { useCall } from '../../context/CallContext';

export const IncomingCallModal: React.FC = () => {
  const { callState, caller, acceptCall, rejectCall } = useCall();

  if (callState !== 'incoming' || !caller) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}
          className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0e101f]/95 border border-purple-500/30 shadow-2xl shadow-purple-950/60 overflow-hidden text-center"
        >
          {/* Ambient background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Caller Avatar with Pulsating Rings */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Animated Ring 1 */}
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full border-2 border-purple-400"
            />
            {/* Animated Ring 2 */}
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="absolute inset-0 rounded-full border border-pink-400"
            />

            {/* Avatar or Placeholder */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-purple-400/80 shadow-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center">
              {caller.avatar ? (
                <img
                  src={caller.avatar}
                  alt={caller.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl sm:text-5xl">🧑‍⚕️</span>
              )}
            </div>

            <div className="absolute bottom-0 right-1 p-2 rounded-full bg-emerald-500 text-white shadow-lg border-2 border-[#0e101f]">
              <Video className="w-4 h-4" />
            </div>
          </div>

          {/* Incoming Call Details */}
          <div className="space-y-1.5 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Incoming Live Study Call</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {caller.name}
            </h3>
            <p className="text-sm text-slate-300">
              inviting you to a live peer-to-peer digital study chamber 🎥
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            {/* Decline Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => rejectCall('declined')}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-sm transition-all shadow-lg shadow-rose-950/30 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Decline</span>
            </motion.button>

            {/* Accept Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => acceptCall()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/25 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Accept Call</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
