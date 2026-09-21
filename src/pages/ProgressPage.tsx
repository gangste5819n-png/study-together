import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  RefreshCw,
  Sparkles,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { apiClient } from '../services/apiClient';
import { onAnalyticsUpdated } from '../services/socketService';
import type { AnalyticsOverviewData, AnalyticsRange } from '../types';

import { TogetherProgressCard } from '../components/progress/TogetherProgressCard';
import { AnalyticsSummaryCards } from '../components/progress/AnalyticsSummaryCards';
import { DailyActivityChart } from '../components/progress/DailyActivityChart';
import { StudyTimeChart } from '../components/progress/StudyTimeChart';
import { StreakSection } from '../components/progress/StreakSection';
import { PactProgressSection } from '../components/progress/PactProgressSection';
import { WellnessAnalyticsSection } from '../components/progress/WellnessAnalyticsSection';

export const ProgressPage: React.FC = () => {
  const { me, partner, partnerInfo } = useStudy();
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [data, setData] = useState<AnalyticsOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalytics = useCallback(async (selectedRange: AnalyticsRange, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const response = await apiClient.analytics.getOverview(selectedRange);
      if (response.success && response.data) {
        const payload = (response.data as any)?.data || response.data;
        setData(payload);
        setLastUpdated(new Date());
      } else {
        setError(response.message || 'Failed to load progress analytics.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error loading analytics';
      setError(errMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch when range changes
  useEffect(() => {
    fetchAnalytics(range);
  }, [range, fetchAnalytics]);

  // Real-time socket updates
  useEffect(() => {
    const unsub = onAnalyticsUpdated(() => {
      // Re-fetch in the background when socket notifies of updates
      fetchAnalytics(range, true);
    });

    return () => {
      unsub();
    };
  }, [range, fetchAnalytics]);

  const userName = me?.name || data?.individual?.user?.name || 'You';
  const partnerName = partner?.name || data?.individual?.partner?.name || 'Partner';
  const isPaired = Boolean(data?.isPaired || partnerInfo?.connected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-16 max-w-7xl mx-auto px-2 sm:px-4"
    >
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-[#F8B4C0]/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D6D] mb-1 font-cute">
            <BarChart3 className="w-4 h-4 text-[#FF4D6D]" />
            <span>PROGRESS & HISTORICAL ANALYTICS 📊</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] text-[#059669] font-bold uppercase tracking-wider">
              Live Real-Time Data
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3F3534] tracking-tight font-cute">
            Study Together Progress
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5351] mt-0.5">
            Real data from your daily tasks, focus timer sessions, Tomorrow Pacts, and wellness habits 💕
          </p>
        </div>

        {/* Range Switcher + Manual Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs">
            <button
              onClick={() => setRange('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-cute transition-all flex items-center gap-1.5 cursor-pointer ${
                range === 'today'
                  ? 'bg-[#FFCCD5] text-[#831843] border border-[#FF8FA3] shadow-xs'
                  : 'text-[#5F5351] hover:text-[#3F3534]'
              }`}
            >
              <Calendar className="w-3 h-3 text-[#FF4D6D]" />
              <span>Today</span>
            </button>
            <button
              onClick={() => setRange('7d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-cute transition-all cursor-pointer ${
                range === '7d' || range === 'week'
                  ? 'bg-[#FFCCD5] text-[#831843] border border-[#FF8FA3] shadow-xs'
                  : 'text-[#5F5351] hover:text-[#3F3534]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setRange('30d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-cute transition-all cursor-pointer ${
                range === '30d' || range === 'month'
                  ? 'bg-[#FFCCD5] text-[#831843] border border-[#FF8FA3] shadow-xs'
                  : 'text-[#5F5351] hover:text-[#3F3534]'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAnalytics(range, true)}
            disabled={refreshing || loading}
            title="Refresh analytics data"
            className="p-2 rounded-2xl bg-white border-2 border-[#F1DDD4] text-[#5F5351] hover:text-[#3F3534] hover:border-[#FF8FA3] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#FF4D6D]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Unpaired Notice Banner */}
      {!isPaired && !loading && (
        <div className="p-4 rounded-3xl bg-[#FFF2F4] border-2 border-[#F8B4C0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#F8B4C0] text-[#FF4D6D] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#831843] font-cute">Solo Study Analytics Active</p>
              <p className="text-[11px] text-[#7A6B69]">
                You are currently viewing your personal study metrics. Connect with your study partner via Room Code in the top bar to enable live side-by-side comparisons and shared milestones.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-slate-800/40 rounded-2xl border border-white/5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-36 bg-slate-800/40 rounded-2xl border border-white/5" />
            <div className="h-36 bg-slate-800/40 rounded-2xl border border-white/5" />
            <div className="h-36 bg-slate-800/40 rounded-2xl border border-white/5" />
            <div className="h-36 bg-slate-800/40 rounded-2xl border border-white/5" />
          </div>
          <div className="h-64 bg-slate-800/40 rounded-2xl border border-white/5" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && !data && (
        <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Unable to Load Analytics</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchAnalytics(range)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
          >
            Retry Analytics
          </button>
        </div>
      )}

      {/* Loaded Dashboard Content */}
      {data && (
        <>
          {/* 1. Collaborative Together Summary Banner */}
          <TogetherProgressCard
            data={data}
            userName={userName}
            partnerName={partnerName}
          />

          {/* 2. Top Level 4 Summary Cards */}
          <AnalyticsSummaryCards
            data={data}
            userName={userName}
            partnerName={partnerName}
          />

          {/* 3. Daily Task Velocity Chart */}
          <DailyActivityChart
            daily={data.daily}
            userName={userName}
            partnerName={partnerName}
            isPaired={isPaired}
          />

          {/* 4. Daily Study Duration Chart */}
          <StudyTimeChart
            daily={data.daily}
            userName={userName}
            partnerName={partnerName}
            isPaired={isPaired}
          />

          {/* 5. Habit Consistency & Streaks */}
          <StreakSection
            data={data}
            userName={userName}
            partnerName={partnerName}
          />

          {/* 6. Mutual Accountability (Tomorrow Pact Analytics) */}
          <PactProgressSection
            data={data}
            userName={userName}
            partnerName={partnerName}
          />

          {/* 7. Wellness & Routine Health */}
          <WellnessAnalyticsSection
            data={data}
            userName={userName}
            partnerName={partnerName}
          />

          {/* Subtle footer */}
          <div className="text-center pt-4 pb-2 text-[11px] text-[#756866] flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#FF4D6D]" />
            <span>
              Updated at {lastUpdated.toLocaleTimeString()} • Calculations powered by MongoDB
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
};
