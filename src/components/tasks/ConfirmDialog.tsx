import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Delete this task?',
  message = 'This action will permanently remove the task from your study plan.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm rounded-3xl bg-white border-2 border-[#F8B4C0] p-6 shadow-2xl z-10 text-[#3F3534]"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF2F4] border-2 border-[#F8B4C0] text-[#FF4D6D] flex items-center justify-center flex-shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#3F3534] tracking-tight font-cute">{title}</h3>
            </div>

            <p className="text-xs text-[#5F5351] leading-relaxed mb-6">{message}</p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-[#5F5351] hover:text-[#3F3534] bg-white hover:bg-[#FFF0F3] border-2 border-[#F1DDD4] transition-colors cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-2xl text-xs font-bold font-cute text-white bg-[#FF4D6D] hover:bg-[#E63946] shadow-sm shadow-pink-200 transition-all cursor-pointer"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
