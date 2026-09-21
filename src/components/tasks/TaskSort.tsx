import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'Priority' | 'Estimated Time' | 'Newest' | 'Oldest';

interface TaskSortProps {
  activeSort: SortOption;
  onChange: (sort: SortOption) => void;
}

export const TaskSort: React.FC<TaskSortProps> = ({ activeSort, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-3.5 h-3.5 text-[#A4908C]" />
      <span className="text-xs text-[#7A6B69] font-medium hidden sm:inline">Sort:</span>
      <select
        value={activeSort}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="px-3 py-1.5 rounded-2xl bg-white border-2 border-[#F1DDD4] text-xs font-semibold text-[#3F3534] focus:outline-none focus:border-[#FF8FA3] shadow-xs cursor-pointer"
      >
        <option value="Priority" className="bg-[#FAF7F2] text-[#3F3534]">Priority (High → Low)</option>
        <option value="Estimated Time" className="bg-[#FAF7F2] text-[#3F3534]">Estimated Time (Longest)</option>
        <option value="Newest" className="bg-[#FAF7F2] text-[#3F3534]">Newest Added</option>
        <option value="Oldest" className="bg-[#FAF7F2] text-[#3F3534]">Oldest Added</option>
      </select>
    </div>
  );
};
