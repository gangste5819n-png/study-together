import React from 'react';
import { Filter, CheckCircle2, Clock, BookOpen, Heart, Flame } from 'lucide-react';

export type FilterOption = 'All' | 'Pending' | 'Completed' | 'Study' | 'Wellness' | 'High Priority';

interface TaskFiltersProps {
  activeFilter: FilterOption;
  onChange: (filter: FilterOption) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
    study: number;
    wellness: number;
    highPriority: number;
  };
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  activeFilter,
  onChange,
  counts,
}) => {
  const filterTabs: { id: FilterOption; label: string; icon: React.FC<{ className?: string }>; count: number }[] = [
    { id: 'All', label: 'All Tasks', icon: Filter, count: counts.all },
    { id: 'Pending', label: 'Pending', icon: Clock, count: counts.pending },
    { id: 'Completed', label: 'Completed', icon: CheckCircle2, count: counts.completed },
    { id: 'Study', label: 'Study Tasks', icon: BookOpen, count: counts.study },
    { id: 'Wellness', label: 'Wellness', icon: Heart, count: counts.wellness },
    { id: 'High Priority', label: 'High Priority', icon: Flame, count: counts.highPriority },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 border-2 border-[#F1DDD4] w-max min-w-full sm:min-w-0 shadow-xs">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#FFCCD5] text-[#701A33] border border-[#FF8FA3] shadow-xs font-extrabold'
                  : 'text-[#3F3534] hover:text-[#1F1615] hover:bg-[#FFF0F3]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D81B60]' : 'text-[#756866]'}`} />
              <span className="font-cute">{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  isActive
                    ? 'bg-white text-[#701A33] border border-[#FF8FA3]'
                    : 'bg-[#FAF7F2] text-[#3F3534] border border-[#F1DDD4]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
