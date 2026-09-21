import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Clock, Tag, Flag, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import type { Task, Priority, TaskCategory, TaskType } from '../../types';
import { getTodayDateString } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  onSave: (taskData: {
    title: string;
    description: string;
    category: TaskCategory;
    type: TaskType;
    subject: string;
    priority: Priority;
    estimatedMinutes: number;
    dueDate: string;
    mandatory: boolean;
    owner: 'me' | 'partner';
  }) => void;
}

const CDS_SUBJECTS = [
  'English',
  'Mathematics',
  'General Knowledge',
  'Current Affairs',
  'Polity',
  'History',
  'Geography',
  'Science',
  'Mock Test',
  'Revision',
  'Custom',
];

const MBBS_SUBJECTS = [
  'Anatomy',
  'Physiology',
  'Biochemistry',
  'Pathology',
  'Pharmacology',
  'Microbiology',
  'Medicine',
  'Surgery',
  'Obstetrics & Gynaecology',
  'Paediatrics',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
  'Orthopaedics',
  'Dermatology',
  'Community Medicine',
  'MCQs',
  'PYQs',
  'Revision',
  'Custom',
];

const WELLNESS_SUBJECTS = [
  'Hydration',
  'Nutrition',
  'Posture',
  'Sleep',
  'Meditation',
  'Walk',
  'Screen Break',
  'Custom',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('CDS');
  const [type, setType] = useState<TaskType>('study');
  const [subject, setSubject] = useState('English');
  const [customSubject, setCustomSubject] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(50);
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [mandatory, setMandatory] = useState(false);
  const [owner, setOwner] = useState<'me' | 'partner'>('me');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill state when editing or reset when adding
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category === 'study' ? 'CDS' : taskToEdit.category);
      setType(taskToEdit.type || 'study');

      const isKnownCDS = CDS_SUBJECTS.includes(taskToEdit.subject);
      const isKnownMBBS = MBBS_SUBJECTS.includes(taskToEdit.subject);
      const isKnownWellness = WELLNESS_SUBJECTS.includes(taskToEdit.subject);

      if (isKnownCDS || isKnownMBBS || isKnownWellness) {
        setSubject(taskToEdit.subject);
        setCustomSubject('');
      } else {
        setSubject('Custom');
        setCustomSubject(taskToEdit.subject);
      }

      // Normalize priority
      const p = taskToEdit.priority.toLowerCase();
      if (p === 'high') setPriority('High');
      else if (p === 'low') setPriority('Low');
      else setPriority('Medium');

      setEstimatedMinutes(taskToEdit.estimatedMinutes || 45);
      setDueDate(taskToEdit.dueDate || getTodayDateString());
      setMandatory(Boolean(taskToEdit.mandatory));
      setOwner(taskToEdit.owner || 'me');
      setErrorMsg(null);
    } else {
      // Default reset
      setTitle('');
      setDescription('');
      setCategory('CDS');
      setType('study');
      setSubject('English');
      setCustomSubject('');
      setPriority('High');
      setEstimatedMinutes(50);
      setDueDate(getTodayDateString());
      setMandatory(false);
      setOwner('me');
      setErrorMsg(null);
    }
  }, [taskToEdit, isOpen]);

  // Adjust subject list when category or type changes
  const getSubjectOptions = () => {
    if (type === 'wellness' || category === 'Wellness') {
      return WELLNESS_SUBJECTS;
    }
    if (category === 'MBBS') {
      return MBBS_SUBJECTS;
    }
    return CDS_SUBJECTS;
  };

  const handleCategoryChange = (newCat: TaskCategory) => {
    setCategory(newCat);
    if (newCat === 'Wellness') {
      setType('wellness');
      setSubject('Hydration');
    } else if (newCat === 'MBBS') {
      setType('study');
      setSubject('Medicine');
    } else {
      setType('study');
      setSubject('English');
    }
  };

  const handleTypeChange = (newType: TaskType) => {
    setType(newType);
    if (newType === 'wellness') {
      setCategory('Wellness');
      setSubject('Hydration');
    } else {
      if (category === 'Wellness') setCategory('CDS');
      setSubject('English');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('Task title is required.');
      return;
    }

    const mins = Number(estimatedMinutes);
    if (isNaN(mins) || mins <= 0) {
      setErrorMsg('Estimated time must be a positive number (at least 1 min).');
      return;
    }

    let finalSubject = subject;
    if (subject === 'Custom') {
      finalSubject = customSubject.trim() || 'General';
    }

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      category,
      type,
      subject: finalSubject,
      priority,
      estimatedMinutes: mins,
      dueDate: dueDate || getTodayDateString(),
      mandatory,
      owner,
    });

    onClose();
  };

  // Handle Escape key and prevent background scroll while open
  useEffect(() => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={taskToEdit ? 'Edit Study Task' : 'Add New Daily Task'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border-2 border-[#F8B4C0] p-5 sm:p-7 shadow-2xl relative my-auto text-[#3F3534]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[#F1DDD4]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#3F3534] tracking-tight font-cute">
                {taskToEdit ? 'Edit Study Task' : 'Add New Daily Task'}
              </h2>
              <p className="text-xs text-[#5F5351]">
                {taskToEdit
                  ? 'Update syllabus milestones and time targets'
                  : 'Schedule high-yield topics for today'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#756866] hover:text-[#3F3534] hover:bg-[#FFF0F3] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-[#FFF2F4] border-2 border-[#F8B4C0] text-[#9D174D] text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#FF4D6D]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5">
              Task Title <span className="text-[#FF4D6D]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CDS English — Previous Year Questions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] placeholder-[#756866] text-sm focus:outline-none focus:border-[#FF8FA3] shadow-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5">
              Description & Topics (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Solve 50 questions, mark error log, review flashcards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] placeholder-[#756866] text-xs focus:outline-none focus:border-[#FF8FA3] shadow-xs"
            />
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#FF4D6D]" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as TaskCategory)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-xs focus:outline-none focus:border-[#FF8FA3] shadow-xs font-medium cursor-pointer"
              >
                <option value="CDS">CDS Preparation</option>
                <option value="MBBS">Final Year MBBS</option>
                <option value="Wellness">Mandatory Wellness</option>
                <option value="Custom">Custom / General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5">
                Task Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('study')}
                  className={`py-2 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer ${
                    type === 'study'
                      ? 'bg-[#FFCCD5] border-[#FF8FA3] text-[#831843]'
                      : 'bg-white border-[#F1DDD4] text-[#5F5351] hover:text-[#3F3534]'
                  }`}
                >
                  Study Task
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('wellness')}
                  className={`py-2 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer ${
                    type === 'wellness'
                      ? 'bg-[#FFE4E8] border-[#F8B4C0] text-[#BE185D]'
                      : 'bg-white border-[#F1DDD4] text-[#5F5351] hover:text-[#3F3534]'
                  }`}
                >
                  Wellness
                </button>
              </div>
            </div>
          </div>

          {/* Subject & Custom Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5">
                Subject Focus
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-xs focus:outline-none focus:border-[#FF8FA3] shadow-xs font-medium cursor-pointer"
              >
                {getSubjectOptions().map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {subject === 'Custom' ? (
              <div>
                <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5">
                  Custom Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Biostatistics, Defence Tech..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] placeholder-[#756866] text-xs focus:outline-none focus:border-[#FF8FA3] shadow-xs"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-[#B45309]" />
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-xs focus:outline-none focus:border-[#FF8FA3] shadow-xs font-medium cursor-pointer"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            )}
          </div>

          {/* Time & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF4D6D]" />
                Estimated Time (Minutes) <span className="text-[#FF4D6D]">*</span>
              </label>
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-xs focus:outline-none focus:border-[#FF8FA3] shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF4D6D]" />
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-xs focus:outline-none focus:border-[#FF8FA3] shadow-xs font-medium cursor-pointer"
              />
            </div>
          </div>

          {/* Assigned Aspirant & Mandatory Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1.5">
                Task Owner
              </label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value as 'me' | 'partner')}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-xs focus:outline-none focus:border-[#FF8FA3] shadow-xs font-medium cursor-pointer"
              >
                <option value="me">Alex Vance (CDS)</option>
                <option value="partner">Dr. Priya (MBBS)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 self-end p-2.5 rounded-2xl bg-[#FFF2F4] border-2 border-[#F8B4C0]">
              <input
                type="checkbox"
                id="mandatoryCheck"
                checked={mandatory}
                onChange={(e) => setMandatory(e.target.checked)}
                className="w-4 h-4 rounded border-[#F8B4C0] text-[#FF4D6D] focus:ring-[#FF4D6D] cursor-pointer"
              />
              <label htmlFor="mandatoryCheck" className="text-xs text-[#5F5351] cursor-pointer select-none">
                <span className="font-bold text-[#3F3534]">Mandatory task</span>
                <span className="block text-[10px] text-[#756866]">Non-negotiable daily target</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-dashed border-[#F1DDD4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-[#5F5351] hover:text-[#3F3534] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-bold font-cute shadow-sm shadow-pink-200 transition-all hover:scale-102 cursor-pointer"
            >
              {taskToEdit ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
