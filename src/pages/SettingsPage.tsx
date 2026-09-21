import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Target, Eye, Palette, Shield, Save } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { GlassCard } from '../components/common/GlassCard';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, me, partner } = useStudy();

  const [name, setName] = useState(me?.name || '');
  const [goal, setGoal] = useState(me?.examGoal || '');
  const [targetHours, setTargetHours] = useState(settings?.dailyTargetHours ?? 8);
  const [breakInterval, setBreakInterval] = useState(settings?.breakReminderInterval ?? 50);
  const [canSeeTasks, setCanSeeTasks] = useState(settings?.partnerCanSeeTasks ?? true);
  const [canSeeMood, setCanSeeMood] = useState(settings?.partnerCanSeeMood ?? true);
  const [canSeeBreaks, setCanSeeBreaks] = useState(settings?.partnerCanSeeBreaks ?? true);
  const [soundEnabled, setSoundEnabled] = useState(settings?.soundEnabled ?? true);
  const [theme, setTheme] = useState(settings?.theme || 'dark-purple');

  useEffect(() => {
    if (me?.name) setName(me.name);
    if (me?.examGoal) setGoal(me.examGoal);
  }, [me?.name, me?.examGoal]);

  useEffect(() => {
    if (settings) {
      if (settings.dailyTargetHours !== undefined) setTargetHours(settings.dailyTargetHours);
      if (settings.breakReminderInterval !== undefined) setBreakInterval(settings.breakReminderInterval);
      if (settings.partnerCanSeeTasks !== undefined) setCanSeeTasks(settings.partnerCanSeeTasks);
      if (settings.partnerCanSeeMood !== undefined) setCanSeeMood(settings.partnerCanSeeMood);
      if (settings.partnerCanSeeBreaks !== undefined) setCanSeeBreaks(settings.partnerCanSeeBreaks);
      if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
      if (settings.theme) setTheme(settings.theme);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      profileName: name,
      examGoal: goal,
      dailyTargetHours: targetHours,
      breakReminderInterval: breakInterval,
      partnerCanSeeTasks: canSeeTasks,
      partnerCanSeeMood: canSeeMood,
      partnerCanSeeBreaks: canSeeBreaks,
      soundEnabled,
      theme,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-dashed border-[#F8B4C0]/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D6D] mb-1 font-cute">
            <Settings className="w-3.5 h-3.5" />
            <span>ACCOUNT & PRIVACY CONTROLS 🌸</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3F3534] tracking-tight font-cute">
            Settings & Study Configuration
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6B69] mt-0.5">
            Manage your exam goals, partner visibility permissions, and notification preferences 💕
          </p>
        </div>

        <button
          onClick={handleSave}
          className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-bold font-cute shadow-sm shadow-pink-200 transition-all hover:scale-102 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile Card */}
        <GlassCard>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F1DDD4]">
            <User className="w-4 h-4 text-[#FF4D6D]" />
            <h2 className="text-base font-bold text-[#3F3534] font-cute">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C4F4D] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-sm focus:outline-none focus:border-[#FF8FA3] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4F4D] mb-1">
                Examination / Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-sm focus:outline-none focus:border-[#FF8FA3] shadow-xs"
              />
            </div>
          </div>
        </GlassCard>

        {/* Study Target Goals */}
        <GlassCard>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F1DDD4]">
            <Target className="w-4 h-4 text-[#FF4D6D]" />
            <h2 className="text-base font-bold text-[#3F3534] font-cute">Study Targets & Interval</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C4F4D] mb-1">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                min="2"
                max="16"
                step="0.5"
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-sm focus:outline-none focus:border-[#FF8FA3] shadow-xs"
              />
              <p className="text-[11px] text-[#A4908C] mt-1">Currently recommended target: 8h</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4F4D] mb-1">
                Break Reminder Interval (Minutes)
              </label>
              <input
                type="number"
                min="20"
                max="90"
                step="5"
                value={breakInterval}
                onChange={(e) => setBreakInterval(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-sm focus:outline-none focus:border-[#FF8FA3] shadow-xs"
              />
              <p className="text-[11px] text-[#A4908C] mt-1">Recommended Pomodoro: 50m work / 10m break</p>
            </div>
          </div>
        </GlassCard>

        {/* Partner Visibility & Privacy Controls */}
        <GlassCard>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F1DDD4]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FF4D6D]" />
              <h2 className="text-base font-extrabold text-[#3F3534] font-cute">Partner Visibility Controls</h2>
            </div>
            <span className="text-xs text-[#9D174D] font-bold flex items-center gap-1 font-cute">
              <Shield className="w-3.5 h-3.5" />
              Two-Person Privacy
            </span>
          </div>

          <p className="text-xs text-[#5F5351] mb-4">
            Customize what {partner?.name || 'your partner'} can view in their synchronized study feed.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs">
              <div>
                <p className="text-xs font-bold text-[#3F3534]">Partner can view my detailed study tasks</p>
                <p className="text-[11px] text-[#5F5351]">
                  Allows {partner?.shortName || 'your partner'} to see which chapters and PYQs you completed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCanSeeTasks(!canSeeTasks)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  canSeeTasks ? 'bg-[#FF4D6D]' : 'bg-[#E5E7EB]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                    canSeeTasks ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs">
              <div>
                <p className="text-xs font-bold text-[#3F3534]">Partner can view my mood & energy level</p>
                <p className="text-[11px] text-[#5F5351]">
                  Shares your daily 1-5 energy rating and mood emoji.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCanSeeMood(!canSeeMood)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  canSeeMood ? 'bg-[#FF4D6D]' : 'bg-[#E5E7EB]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                    canSeeMood ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs">
              <div>
                <p className="text-xs font-bold text-[#3F3534]">Partner can view break counts</p>
                <p className="text-[11px] text-[#5F5351]">
                  Shows how many 10m recharge breaks were taken.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCanSeeBreaks(!canSeeBreaks)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  canSeeBreaks ? 'bg-[#FF4D6D]' : 'bg-[#E5E7EB]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                    canSeeBreaks ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Notifications & Theme */}
        <GlassCard>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F1DDD4]">
            <Palette className="w-4 h-4 text-[#FF4D6D]" />
            <h2 className="text-base font-extrabold text-[#3F3534] font-cute">Experience & Theme</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#3F3534]">Audio Chimes & Cheers</p>
                <p className="text-[11px] text-[#5F5351]">Play soft chime on cheers & timer finish</p>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  soundEnabled ? 'bg-[#FF4D6D]' : 'bg-[#E5E7EB]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3F3D] mb-1">Color Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#3F3534] text-sm focus:outline-none focus:border-[#FF8FA3] shadow-xs font-medium cursor-pointer"
              >
                <option value="dark-purple">Pastel Pink & Warm Stationery (Active)</option>
                <option value="midnight-blue">Midnight Blue & Cyan Accent</option>
                <option value="pure-black">Pure OLED Black</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </form>
    </motion.div>
  );
};
