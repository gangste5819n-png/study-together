import React from 'react';

export const StreakCalendar: React.FC = () => {
  // Generate 28 days for current 4-week accountability cycle
  const daysInCycle = Array.from({ length: 28 }, (_, i) => {
    const dayNum = i + 1;
    // Mock activity for recent days
    // Days 1-20: high activity (8h+), Days 21-26: current streak active, Day 26 is today, Days 27-28 upcoming
    let level: 'none' | 'low' | 'med' | 'high' = 'none';
    let isToday = dayNum === 26;
    let isUpcoming = dayNum > 26;

    if (dayNum < 21) {
      level = dayNum % 5 === 0 ? 'med' : 'high';
    } else if (dayNum <= 26) {
      level = 'high';
    }

    return {
      dayNum,
      level,
      isToday,
      isUpcoming,
      hours: isUpcoming ? 0 : dayNum === 26 ? 5.3 : (6.5 + (dayNum % 3) * 0.8).toFixed(1),
    };
  });

  const getLevelClasses = (level: string, isToday: boolean, isUpcoming: boolean) => {
    if (isUpcoming) return 'bg-white/40 border-[#F1DDD4] text-[#A4908C]';
    if (isToday) return 'bg-[#FF4D6D] border-2 border-[#E63946] text-white shadow-sm shadow-pink-300 ring-2 ring-[#FFCCD5] font-black';
    if (level === 'high') return 'bg-[#FFCCD5] border border-[#FF8FA3] text-[#831843] font-bold';
    if (level === 'med') return 'bg-[#FFE4E8] border border-[#F8B4C0] text-[#9D174D] font-bold';
    return 'bg-white/90 border border-[#F1DDD4] text-[#5F5351]';
  };

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#F1DDD4]">
        <div>
          <h4 className="text-sm font-extrabold text-[#3F3534] font-cute">4-Week Accountability Grid</h4>
          <p className="text-xs text-[#5F5351] font-medium">September Active Cycle • Alex & Priya</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#5F5351] font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-white border border-[#F1DDD4]" />
            Rest
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#FFCCD5] border border-[#FF8FA3]" />
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#FF4D6D]" />
            Today
          </span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#5F5351]">
        {weekdays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysInCycle.map((d) => (
          <div
            key={d.dayNum}
            className={`aspect-square rounded-2xl border-2 p-1.5 flex flex-col items-center justify-between transition-all duration-200 hover:scale-105 group relative cursor-pointer shadow-xs ${getLevelClasses(
              d.level,
              d.isToday,
              d.isUpcoming
            )}`}
          >
            <span className="text-[11px] font-bold">{d.dayNum}</span>

            {!d.isUpcoming && (
              <span className="text-[9px] font-bold opacity-90">{d.hours}h</span>
            )}

            {/* Hover tooltip */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-xl bg-[#3F3534] border border-[#F8B4C0] text-[10px] whitespace-nowrap shadow-xl pointer-events-none z-20 text-white font-bold">
              {d.isUpcoming ? 'Upcoming day' : `Day ${d.dayNum}: ${d.hours} hrs completed`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
