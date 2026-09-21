import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Edit3, Trash2, Zap, Heart } from 'lucide-react';
import type { Task, Priority } from '../../types';
import { PriorityBadge, SubjectBadge } from '../common/Badge';
import { formatMinutesToHoursAndMins } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const normalizedPriority = (task.priority.toLowerCase()) as Priority;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`group relative p-4 sm:p-4.5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3.5 ${
        task.completed
          ? 'bg-[#FFF2F4]/80 border-[#F8B4C0]/70 opacity-80 shadow-xs'
          : 'bg-white/95 border-[#F1DDD4] shadow-[2px_3px_0px_rgba(220,195,185,0.45)] hover:border-[#F8B4C0] hover:shadow-[3px_4px_0px_rgba(248,180,192,0.45)]'
      }`}
    >
      {/* Animated Checkbox Button */}
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
          task.completed
            ? 'bg-[#FF4D6D] text-white shadow-xs'
            : 'border-2 border-[#F8B4C0] hover:border-[#FF4D6D] bg-white'
        }`}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
      >
        {task.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </motion.div>
        )}
      </button>

      {/* Task Content Details */}
      <div className="flex-1 min-w-0">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <SubjectBadge subject={task.subject} />
          <PriorityBadge priority={normalizedPriority} />

          {/* Category Tag */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#4A3F3D] border border-[#F1DDD4]">
            {task.category}
          </span>

          {/* Mandatory Milestone Badge */}
          {task.mandatory && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              <Zap className="w-2.5 h-2.5 fill-[#B45309]" />
              Mandatory
            </span>
          )}

          {/* Wellness type indicator */}
          {task.type === 'wellness' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0]">
              <Heart className="w-2.5 h-2.5" />
              Wellness
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-sm font-bold transition-colors leading-snug ${
            task.completed ? 'text-[#9E7B84] line-through' : 'text-[#3F3534]'
          }`}
        >
          {task.title}
        </h3>

        {/* Optional Description */}
        {task.description && (
          <p
            className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
              task.completed ? 'text-[#756866]' : 'text-[#5F5351] font-medium'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Footer info: time estimate & completion time */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-xs text-[#5F5351] font-semibold">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF4D6D]" />
            <span>
              {task.estimatedMinutes}m ({formatMinutesToHoursAndMins(task.estimatedMinutes)})
            </span>
          </span>

          {task.completed && task.completedAt && (
            <span className="text-[#BE185D] font-bold flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[2.5]" />
              Done at {task.completedAt}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Edit and Delete */}
      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-[#5F5351] hover:text-[#3F3534] hover:bg-pink-100/60 transition-all cursor-pointer"
          title="Edit task"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-[#5F5351] hover:text-rose-600 hover:bg-rose-100/60 transition-all cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
