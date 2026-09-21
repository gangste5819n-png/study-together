import React from 'react';
import type { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const configs = {
    high: {
      bg: 'bg-[#FFE4E8] text-[#9D174D] border-[#F8B4C0]',
      label: 'High Priority',
      dot: 'bg-[#E11D48]',
    },
    medium: {
      bg: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
      label: 'Medium',
      dot: 'bg-[#D97706]',
    },
    low: {
      bg: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
      label: 'Low Priority',
      dot: 'bg-[#0284C7]',
    },
  };

  const key = (priority ? priority.toLowerCase() : 'medium') as 'high' | 'medium' | 'low';
  const config = configs[key] || configs.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border-2 ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

interface SubjectBadgeProps {
  subject: string;
  className?: string;
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({ subject, className = '' }) => {
  // Generate consistent subtle colors based on subject name
  const subjectColors: Record<string, string> = {
    English: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
    Polity: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]',
    Mathematics: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    'Current Affairs': 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
    'Mock Test': 'bg-[#FFF0F3] text-[#9D174D] border-[#FFCCD5]',
    History: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    Science: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
    Medicine: 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]',
    Surgery: 'bg-[#FFE4E8] text-[#9D174D] border-[#F8B4C0]',
    Pharmacology: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
    Pathology: 'bg-[#FAE8FF] text-[#86198F] border-[#F0ABFC]',
    MCQs: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    Pediatrics: 'bg-[#ECFCCB] text-[#3F6212] border-[#D9F99D]',
    Obstetrics: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
  };

  const style = subjectColors[subject] || 'bg-[#FAF7F2] text-[#3F3534] border-[#F1DDD4]';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border-2 ${style} ${className}`}
    >
      {subject}
    </span>
  );
};
