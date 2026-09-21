import React, { useState } from 'react';
import { X, Plus, Sparkles, ShieldCheck } from 'lucide-react';
import type { Priority, PactCategory } from '../../types';

interface AddTomorrowTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    subject: string;
    estimatedHours: number;
    priority: Priority;
    assignedTo: 'me' | 'partner';
    category?: PactCategory;
    estimatedMinutes?: number;
    mandatory?: boolean;
  }) => void;
  partnerName?: string;
  myName?: string;
}

export const AddTomorrowTaskModal: React.FC<AddTomorrowTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  partnerName = 'Partner',
  myName = 'You',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PactCategory>('CDS');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [priority, setPriority] = useState<Priority>('high');
  const [assignedTo, setAssignedTo] = useState<'me' | 'partner'>('me');
  const [mandatory, setMandatory] = useState(false);

  // Handle Escape key and prevent background scroll while open
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      subject: category,
      category,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      estimatedHours: (Number(estimatedMinutes) || 45) / 60,
      priority,
      assignedTo,
      mandatory,
    });

    setTitle('');
    setMandatory(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add Tomorrow's Commitment"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white border-2 border-[#F8B4C0] p-5 sm:p-6 shadow-2xl relative my-auto text-[#3F3534]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#F1DDD4]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF4D6D]" />
            <h2 className="text-base font-extrabold text-[#3F3534] font-cute">Add Tomorrow's Commitment</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-[#756866] hover:text-[#3F3534] hover:bg-[#FFF0F3] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-[#4A3F3D] mb-1">
              Mission / Target Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Finish 2 CDS English chapters, Revise Pathology unit 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border-2 border-[#F1DDD4] text-[#3F3534] text-sm font-medium focus:outline-none focus:border-[#FF4D6D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PactCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border-2 border-[#F1DDD4] text-[#3F3534] text-sm font-medium focus:outline-none focus:border-[#FF4D6D]"
              >
                <option value="CDS">CDS</option>
                <option value="MBBS">MBBS</option>
                <option value="Revision">Revision</option>
                <option value="Practice">Practice</option>
                <option value="Wellness">Wellness</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1">
                Estimated Time
              </label>
              <select
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border-2 border-[#F1DDD4] text-[#3F3534] text-sm font-medium focus:outline-none focus:border-[#FF4D6D]"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (1h)</option>
                <option value={90}>90 mins (1.5h)</option>
                <option value={120}>120 mins (2h)</option>
                <option value={180}>180 mins (3h)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border-2 border-[#F1DDD4] text-[#3F3534] text-sm font-medium focus:outline-none focus:border-[#FF4D6D]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1">Who Owns This?</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value as 'me' | 'partner')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border-2 border-[#F1DDD4] text-[#3F3534] text-sm font-medium focus:outline-none focus:border-[#FF4D6D]"
              >
                <option value="me">My Pact ({myName.split(' ')[0]})</option>
                <option value="partner">Partner's Pact ({partnerName.split(' ')[0]})</option>
              </select>
            </div>
          </div>

          {/* Mandatory Item Toggle */}
          <div className="p-3 rounded-2xl bg-[#FFF0F3] border-2 border-[#F8B4C0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#FF4D6D]" />
              <div>
                <p className="text-xs font-extrabold text-[#3F3534]">Mandatory Foundation</p>
                <p className="text-[11px] text-[#5F5351] font-medium">Essential core target (💧 Water, 🍽️ Food, 📚 Study)</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={mandatory}
              onChange={(e) => setMandatory(e.target.checked)}
              className="w-5 h-5 accent-[#FF4D6D] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-dashed border-[#F1DDD4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#756866] hover:text-[#3F3534] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Tomorrow Pact</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
