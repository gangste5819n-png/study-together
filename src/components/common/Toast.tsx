import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useStudy, type ToastType } from '../../context/StudyContext';

export const Toast: React.FC = () => {
  const { activeToast } = useStudy();

  if (!activeToast) return null;

  const message = typeof activeToast === 'string' ? activeToast : activeToast.message;
  const type: ToastType = typeof activeToast === 'string' ? 'info' : (activeToast.type || 'info');

  const getStyleAndIcon = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          bgIcon: 'bg-emerald-600/20 text-emerald-300',
          border: 'border-emerald-500/30',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          bgIcon: 'bg-rose-600/20 text-rose-300',
          border: 'border-rose-500/30',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          bgIcon: 'bg-amber-600/20 text-amber-300',
          border: 'border-amber-500/30',
        };
      case 'info':
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-300" />,
          bgIcon: 'bg-purple-600/20 text-purple-300',
          border: 'border-purple-500/30',
        };
    }
  };

  const { icon, bgIcon, border } = getStyleAndIcon();

  return (
    <AnimatePresence>
      <motion.div
        key={message}
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        role="status"
        aria-live="polite"
        className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0e101c]/95 border ${border} text-slate-100 text-xs sm:text-sm font-semibold shadow-2xl shadow-purple-950/60 backdrop-blur-xl pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-md`}
      >
        <div className={`w-7 h-7 rounded-xl ${bgIcon} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <span className="truncate">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
};
