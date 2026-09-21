import React, { useState } from 'react';
import { X, Plus, Clock, Tag, Flag } from 'lucide-react';
import type { Priority, TaskCategory } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    subject: string;
    priority: Priority;
    category: TaskCategory;
    estimatedMinutes: number;
    assignedTo: 'me' | 'partner';
    notes?: string;
  }) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('English');
  const [customSubject, setCustomSubject] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [category] = useState<TaskCategory>('study');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [assignedTo, setAssignedTo] = useState<'me' | 'partner'>('me');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalSubject = subject === 'Other' ? customSubject.trim() || 'General' : subject;

    onAdd({
      title: title.trim(),
      subject: finalSubject,
      priority,
      category,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      assignedTo,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setNotes('');
    onClose();
  };

  const commonSubjects = [
    // CDS Subjects
    'English',
    'Polity',
    'Mathematics',
    'Current Affairs',
    'Mock Test',
    'History',
    'Science',
    // MBBS Subjects
    'Medicine',
    'Surgery',
    'Pharmacology',
    'Pathology',
    'Pediatrics',
    'Obstetrics',
    'MCQs',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d101c] border border-white/10 p-6 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Create New Study Task</h2>
            <p className="text-xs text-slate-400">Plan your deep work milestone</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. English — 50 PYQs or Medicine — Cardiology"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#131726] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                {commonSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Estimated Time (mins)
              </label>
              <input
                type="number"
                min="10"
                max="360"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {subject === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter Custom Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g. Microbiology, Geography, Economics..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-purple-400" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#131726] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Aspirant
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value as 'me' | 'partner')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#131726] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="me">For Me (CDS Prep)</option>
                <option value="partner">For Priya (MBBS Exam)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes or Syllabus Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 4, 2022 PYQs, or Harrison Vol 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
