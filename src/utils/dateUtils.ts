/**
 * Date and time helper utilities for Study Together task system.
 */

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const todayStr = getTodayDateString();
  if (dateString === todayStr) {
    return 'Today';
  }

  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;

  const dateObj = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

export const formatMinutesToHoursAndMins = (totalMinutes: number): string => {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};
