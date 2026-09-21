import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Sparkles, CheckCircle2, ListTodo } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import type { Task } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskFilters, type FilterOption } from '../components/tasks/TaskFilters';
import { TaskSort, type SortOption } from '../components/tasks/TaskSort';
import { TaskProgress } from '../components/tasks/TaskProgress';
import { ConfirmDialog } from '../components/tasks/ConfirmDialog';

export const TasksPage: React.FC = () => {
  const {
    tasks,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    taskStats,
  } = useStudy();

  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [activeSort, setActiveSort] = useState<SortOption>('Priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // 1. Search Query filter
    let result = tasks.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    });

    // 2. Filter category / status
    switch (activeFilter) {
      case 'Pending':
        result = result.filter((t) => !t.completed);
        break;
      case 'Completed':
        result = result.filter((t) => t.completed);
        break;
      case 'Study':
        result = result.filter((t) => t.type === 'study');
        break;
      case 'Wellness':
        result = result.filter((t) => t.type === 'wellness');
        break;
      case 'High Priority':
        result = result.filter((t) => t.priority.toLowerCase() === 'high');
        break;
      case 'All':
      default:
        break;
    }

    // 3. Sorting
    const priorityWeight: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    result.sort((a, b) => {
      if (activeSort === 'Priority') {
        const weightA = priorityWeight[a.priority.toLowerCase()] || 2;
        const weightB = priorityWeight[b.priority.toLowerCase()] || 2;
        if (weightA !== weightB) return weightB - weightA;
        return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
      }
      if (activeSort === 'Estimated Time') {
        return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
      }
      if (activeSort === 'Newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (activeSort === 'Oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [tasks, activeFilter, activeSort, searchQuery]);

  // Counts for filter chips
  const filterCounts = useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
      study: tasks.filter((t) => t.type === 'study').length,
      wellness: tasks.filter((t) => t.type === 'wellness').length,
      highPriority: tasks.filter((t) => t.priority.toLowerCase() === 'high').length,
    };
  }, [tasks]);

  const handleOpenAddModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleConfirmDelete = () => {
    if (taskToDeleteId) {
      deleteTask(taskToDeleteId);
      setTaskToDeleteId(null);
    }
  };

  const isAllComplete = tasks.length > 0 && tasks.every((t) => t.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-14"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-dashed border-[#F8B4C0]/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D6D] mb-1 font-cute">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY SYLLABUS & EXECUTION 🌸</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3F3534] tracking-tight font-cute">
            My Study Tasks
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6B69] mt-0.5">
            Organized high-yield tasks for defense and examination targets 💕
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-bold font-cute shadow-sm shadow-pink-200 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Dynamic Progress & Study Hours Banner */}
      <TaskProgress
        completedCount={taskStats.completedTasks}
        totalCount={taskStats.totalTasks}
        percentage={taskStats.percentage}
        plannedStudyMinutes={taskStats.plannedStudyMinutes}
        completedStudyMinutes={taskStats.completedStudyMinutes}
        remainingStudyMinutes={taskStats.remainingStudyMinutes}
      />

      {/* All Complete Cheer Banner */}
      {isAllComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-3xl bg-[#DCFCE7] border-2 border-[#86EFAC] flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-[#16A34A] border border-[#86EFAC]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#14532D] font-cute">Daily mission complete 🎉</p>
              <p className="text-xs text-[#166534]">
                You cleared all scheduled study and wellness milestones for today. Outstanding discipline!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls Bar: Filters, Sorting & Search */}
      <div className="space-y-3 pt-1">
        {/* Filters */}
        <TaskFilters
          activeFilter={activeFilter}
          onChange={setActiveFilter}
          counts={filterCounts}
        />

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 text-[#A4908C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, subjects, PYQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border-2 border-[#F1DDD4] text-xs text-[#3F3534] placeholder-[#A4908C] focus:outline-none focus:border-[#FF8FA3] shadow-xs transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <TaskSort activeSort={activeSort} onChange={setActiveSort} />
        </div>
      </div>

      {/* Task List / Empty States */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          /* Empty State: No tasks at all */
          <div className="text-center py-16 px-4 rounded-3xl bg-white/[0.01] border border-dashed border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-3">
              <ListTodo className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Nothing planned yet.</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add your first task and let's get moving.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          /* Empty State: No tasks match active filter */
          <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.01] border border-white/5">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              No tasks match filter "{activeFilter}"
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Try switching filters or clearing your search query.
            </p>
          </div>
        ) : (
          /* Render Task Cards */
          <AnimatePresence mode="popLayout">
            {filteredAndSortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setTaskToDeleteId(id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Unified Add/Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDeleteId)}
        title="Delete this task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDeleteId(null)}
      />
    </motion.div>
  );
};
