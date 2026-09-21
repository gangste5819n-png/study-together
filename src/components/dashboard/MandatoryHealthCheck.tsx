import React from 'react';
import { Heart, Coffee, Utensils, Soup, Droplets, Wind, Moon, Check } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useStudy } from '../../context/StudyContext';

export const MandatoryHealthCheck: React.FC = () => {
  const { healthTasks, toggleHealthTask } = useStudy();

  const getIcon = (name: string) => {
    switch (name) {
      case 'Coffee':
        return Coffee;
      case 'Utensils':
        return Utensils;
      case 'Soup':
        return Soup;
      case 'Droplets':
        return Droplets;
      case 'Wind':
        return Wind;
      case 'Moon':
        return Moon;
      default:
        return Heart;
    }
  };

  const completedCount = healthTasks.filter((t) => t.completed).length;

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0]">
              <Heart className="w-3.5 h-3.5 fill-[#BE185D]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#9D174D] font-cute">
              🌸 Daily Care
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-[#3F3534] tracking-tight font-cute">
            Be kind to your body & mind today ✨
          </h3>
          <p className="text-xs text-[#5F5351] mt-0.5 font-medium">
            Sip water, eat well, and rest your eyes! Taking care of yourself keeps you glowing 💖
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#FFE4E8] text-[#9D174D] border border-[#F8B4C0] font-cute shadow-xs">
            {completedCount} / {healthTasks.length} Done 🌟
          </span>
        </div>
      </div>

      {/* Grid of health tasks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {healthTasks.map((task) => {
          const Icon = getIcon(task.iconName);
          return (
            <div
              key={task.id}
              onClick={() => toggleHealthTask(task.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none flex items-start gap-3 shadow-xs ${
                task.completed
                  ? 'bg-[#FFF2F4] border-[#F8B4C0]'
                  : 'bg-white/95 border-[#F1DDD4] hover:border-[#F8B4C0]'
              }`}
            >
              {/* Checkbox box */}
              <div
                className={`w-5 h-5 rounded-lg mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                  task.completed
                    ? 'bg-[#FF4D6D] text-white shadow-xs'
                    : 'border-2 border-[#F8B4C0] bg-white'
                }`}
              >
                {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      task.completed ? 'text-[#FF4D6D]' : 'text-[#5F5351]'
                    }`}
                  />
                  <span
                    className={`text-sm font-bold truncate ${
                      task.completed ? 'text-[#9E7B84] line-through' : 'text-[#3F3534]'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#5F5351] mt-0.5 truncate font-medium">{task.subtitle}</p>
                <p className="text-[10px] text-[#9D174D] font-bold italic mt-1">{task.funRemark}</p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
