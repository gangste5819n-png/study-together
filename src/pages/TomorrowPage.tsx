import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Plus,
  Clock,
  Sparkles,
  Trash2,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Zap,
  Droplets,
  Utensils,
  BookOpen,
  Bed,
  Users,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { GlassCard } from '../components/common/GlassCard';
import { AddTomorrowTaskModal } from '../components/tomorrow/AddTomorrowTaskModal';
import { PactConfirmationWidget } from '../components/tomorrow/PactConfirmationWidget';
import { AccountabilitySummaryCard } from '../components/tomorrow/AccountabilitySummaryCard';
import type { TomorrowPactCommitment, PactCategory } from '../types';

export const TomorrowPage: React.FC = () => {
  const {
    me,
    partner,
    authUser,
    partnerInfo,
    tomorrowPact,
    todayPact,
    addPactCommitment,
    deletePactCommitment,
    confirmTomorrowPact,
    togglePactCommitment,
    activateTodayPact,
    proposeDare,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'tomorrow' | 'today'>('tomorrow');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active pact to display based on selected tab
  const displayedPact = activeTab === 'tomorrow' ? tomorrowPact : todayPact || tomorrowPact;
  const isLocked = displayedPact?.status === 'locked' || displayedPact?.status === 'active';
  const isActiveForToday = displayedPact?.status === 'active';

  // Extract commitments
  const commitments: TomorrowPactCommitment[] = displayedPact?.commitments || [];
  const myUserId = authUser?._id;
  const partnerUserId = partnerInfo?.partner?._id;

  // Filter commitments into YOUR PACT vs PARTNER'S PACT
  const myCommitments = commitments.filter((c) =>
    myUserId ? c.ownerId === myUserId : true
  );
  const partnerCommitments = commitments.filter((c) =>
    myUserId ? c.ownerId !== myUserId : false
  );

  const myTotalMinutes = myCommitments.reduce((acc, c) => acc + (c.estimatedMinutes || 45), 0);
  const partnerTotalMinutes = partnerCommitments.reduce(
    (acc, c) => acc + (c.estimatedMinutes || 45),
    0
  );

  const myCompletedCount = myCommitments.filter((c) => c.status === 'completed').length;
  const partnerCompletedCount = partnerCommitments.filter((c) => c.status === 'completed').length;

  const totalAll = commitments.length;
  const completedAll = commitments.filter((c) => c.status === 'completed').length;
  const overallPercentage = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  // Icon helper for categories
  const getCategoryIcon = (category: PactCategory, title: string) => {
    const lower = `${category} ${title}`.toLowerCase();
    if (lower.includes('water') || lower.includes('hydration')) return Droplets;
    if (lower.includes('food') || lower.includes('breakfast') || lower.includes('meal')) return Utensils;
    if (lower.includes('sleep') || lower.includes('rest')) return Bed;
    if (category === 'CDS' || category === 'MBBS' || category === 'Revision' || category === 'Practice') {
      return BookOpen;
    }
    return Sparkles;
  };

  const handleAddCommitment = (task: {
    title: string;
    category?: PactCategory;
    estimatedMinutes?: number;
    mandatory?: boolean;
    assignedTo: 'me' | 'partner';
  }) => {
    const targetOwnerId =
      task.assignedTo === 'partner' && partnerUserId
        ? partnerUserId
        : myUserId || 'me';

    addPactCommitment({
      title: task.title,
      category: task.category || 'CDS',
      estimatedMinutes: task.estimatedMinutes || 45,
      mandatory: Boolean(task.mandatory),
      ownerId: targetOwnerId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-16 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-dashed border-[#F8B4C0]/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D6D] mb-1 font-cute">
            <Moon className="w-3.5 h-3.5" />
            <span>NIGHTLY MUTUAL COMMITMENT & CHECKLIST 🌙</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3F3534] tracking-tight font-cute">
            Tomorrow Pact
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6B69] mt-0.5">
            Plan your day together before bedtime, lock the pact mutually, and hold each other accountable 💕
          </p>
        </div>

        {/* Tab Switcher: Tomorrow's Pact vs Today's Active Plan */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border-2 border-[#F1DDD4] shadow-xs self-start sm:self-center">
          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-cute transition-all cursor-pointer ${
              activeTab === 'tomorrow'
                ? 'bg-[#FFCCD5] text-[#831843] border border-[#FF8FA3] shadow-xs'
                : 'text-[#7A6B69] hover:text-[#3F3534]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#FF4D6D]" />
            <span>Tomorrow’s Pact</span>
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-cute transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-[#BAE6FD] text-[#0369A1] border border-[#7DD3FC] shadow-xs'
                : 'text-[#7A6B69] hover:text-[#3F3534]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Today’s Active Plan</span>
          </button>
        </div>
      </div>

      {/* Confirmation Widget (Two-Person Confirmation & Mutual Nightly Lock) */}
      <PactConfirmationWidget
        pact={displayedPact}
        myUserId={myUserId}
        partnerUserId={partnerUserId}
        myName={me.name}
        partnerName={partner.name}
        onConfirm={confirmTomorrowPact}
      />

      {/* Today's Active Activation Banner if pact is locked and today arrived */}
      {isLocked && !isActiveForToday && activeTab === 'today' && (
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-sm font-bold text-white">Tomorrow's Pact is ready for today!</p>
              <p className="text-xs text-slate-300">
                Activate the pact to begin live checkoffs and progress tracking for the day.
              </p>
            </div>
          </div>
          <button
            onClick={activateTodayPact}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30"
          >
            Activate Today’s Plan 🚀
          </button>
        </div>
      )}

      {/* Dual Column: YOUR PACT vs PARTNER'S PACT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* YOUR PACT */}
        <GlassCard glow className="relative flex flex-col justify-between bg-white/95 border-2 border-[#F8B4C0]">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#F1DDD4]">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#6B21A8] font-cute">
                  YOUR PACT
                </span>
                <h2 className="text-xl font-extrabold text-[#3F3534] font-cute mt-0.5">{me.name}</h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#5F5351] font-bold">Progress</span>
                <p className="text-base font-black text-[#6B21A8]">
                  {myCompletedCount} / {myCommitments.length} ({Math.round((myTotalMinutes / 60) * 10) / 10}h)
                </p>
              </div>
            </div>

            {/* Commitments List */}
            <div className="space-y-3">
              {myCommitments.length === 0 ? (
                <div className="text-center py-8 text-[#5F5351] font-medium text-xs bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#F1DDD4]">
                  No commitments proposed for you yet. Add your first goal below!
                </div>
              ) : (
                myCommitments.map((c) => {
                  const Icon = getCategoryIcon(c.category, c.title);
                  const isCompleted = c.status === 'completed';

                  return (
                    <motion.div
                      key={c._id || c.id}
                      layout
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 shadow-xs ${
                        isCompleted
                          ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]'
                          : c.mandatory
                          ? 'bg-[#FFF0F3] border-[#F8B4C0]'
                          : 'bg-white border-[#F1DDD4] hover:border-[#FFCCD5]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Completion Checkbox */}
                        <button
                          type="button"
                          onClick={() => togglePactCommitment(c._id || c.id!)}
                          aria-label={`Mark commitment "${c.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#756866] hover:text-[#16A34A] transition-colors flex-shrink-0 cursor-pointer"
                          title="Toggle commitment completed"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#A89F91]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF] flex items-center gap-1">
                              <Icon className="w-3 h-3" />
                              <span>{c.category}</span>
                            </span>
                            {c.mandatory && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0] flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>MANDATORY</span>
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm font-bold break-words leading-snug ${
                              isCompleted ? 'line-through text-[#756866]' : 'text-[#3F3534]'
                            }`}
                          >
                            {c.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-[#5F5351] whitespace-nowrap flex items-center gap-1 bg-[#FAF7F2] px-2 py-1 rounded-lg border border-[#F1DDD4]">
                          <Clock className="w-3.5 h-3.5 text-[#756866]" />
                          {c.estimatedMinutes}m
                        </span>

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => deletePactCommitment(c._id || c.id!)}
                            aria-label={`Remove commitment "${c.title}"`}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#756866] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove commitment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add Commitment Action (only allowed pre-lock) */}
          {!isLocked && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#FFF0F3] hover:bg-[#FFE4E8] border-2 border-[#F8B4C0] text-xs font-extrabold text-[#831843] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FF4D6D]" />
              <span>Propose Commitment for Tomorrow</span>
            </button>
          )}
        </GlassCard>

        {/* PARTNER'S PACT */}
        <GlassCard className="relative flex flex-col justify-between bg-white/95 border-2 border-[#BAE6FD]">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#F1DDD4]">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0369A1] font-cute">
                  PARTNER'S PACT
                </span>
                <h2 className="text-xl font-extrabold text-[#3F3534] font-cute mt-0.5">{partner.name}</h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#5F5351] font-bold">Progress</span>
                <p className="text-base font-black text-[#0369A1]">
                  {partnerCompletedCount} / {partnerCommitments.length} (
                  {Math.round((partnerTotalMinutes / 60) * 10) / 10}h)
                </p>
              </div>
            </div>

            {/* Commitments List */}
            <div className="space-y-3">
              {partnerCommitments.length === 0 ? (
                <div className="text-center py-8 text-[#5F5351] font-medium text-xs bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#F1DDD4]">
                  {partner.name.split(' ')[0]} hasn't added commitments yet, or you can propose one for them!
                </div>
              ) : (
                partnerCommitments.map((c) => {
                  const Icon = getCategoryIcon(c.category, c.title);
                  const isCompleted = c.status === 'completed';

                  return (
                    <motion.div
                      key={c._id || c.id}
                      layout
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 shadow-xs ${
                        isCompleted
                          ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]'
                          : c.mandatory
                          ? 'bg-[#F0F9FF] border-[#BAE6FD]'
                          : 'bg-white border-[#F1DDD4] hover:border-[#BAE6FD]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => togglePactCommitment(c._id || c.id!)}
                          aria-label={`Mark commitment "${c.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#756866] hover:text-[#16A34A] transition-colors flex-shrink-0 cursor-pointer"
                          title="Toggle commitment completed"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#A89F91]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] flex items-center gap-1">
                              <Icon className="w-3 h-3" />
                              <span>{c.category}</span>
                            </span>
                            {c.mandatory && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0] flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>MANDATORY</span>
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm font-bold break-words leading-snug ${
                              isCompleted ? 'line-through text-[#756866]' : 'text-[#3F3534]'
                            }`}
                          >
                            {c.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-[#5F5351] whitespace-nowrap flex items-center gap-1 bg-[#FAF7F2] px-2 py-1 rounded-lg border border-[#F1DDD4]">
                          <Clock className="w-3.5 h-3.5 text-[#756866]" />
                          {c.estimatedMinutes}m
                        </span>

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => deletePactCommitment(c._id || c.id!)}
                            aria-label={`Remove commitment "${c.title}"`}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#756866] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove commitment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {!isLocked && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border-2 border-[#7DD3FC] text-xs font-extrabold text-[#0369A1] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0284C7]" />
              <span>Propose Goal for {partner.name.split(' ')[0]}</span>
            </button>
          )}
        </GlassCard>
      </div>

      {/* OUR PACT: Combined Overview & Mutual Foundations */}
      <GlassCard className="bg-white/95 border-2 border-[#F1DDD4]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-dashed border-[#F1DDD4]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#6B21A8] font-cute">
                OUR PACT
              </span>
              <h3 className="text-base font-extrabold text-[#3F3534] font-cute">Mutual Foundations & Team Accountability</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-[#5F5351]">
              Combined Targets: <strong className="text-[#3F3534] font-extrabold">{totalAll}</strong>
            </span>
            <span className="text-[#15803D]">
              Cleared: <strong className="font-extrabold">{completedAll}</strong> ({overallPercentage}%)
            </span>
          </div>
        </div>

        {/* Mandatory Foundation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: '💧 Hydration Target (3L)', note: 'Drink water during focus sprints', mandatory: true },
            { title: '🍽️ Nourishing Meals', note: 'Fuel brain with healthy sustenance', mandatory: true },
            { title: '📚 Dedicated Study Hours', note: 'Deep focus together in Study Room', mandatory: true },
            { title: '😴 7.5h Rest Protocol', note: 'Consistent sleep schedule for recovery', mandatory: true },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white border-2 border-[#F1DDD4] hover:border-[#FFCCD5] transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <span className="text-[10px] font-black text-[#9D174D] bg-[#FFE4E8] px-2.5 py-0.5 rounded-full border border-[#F8B4C0] inline-block mb-1.5">
                  Protective Foundation
                </span>
                <p className="text-xs font-extrabold text-[#3F3534] mt-1">{item.title}</p>
                <p className="text-[11px] text-[#5F5351] font-medium mt-0.5">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Accountability Summary & Harmless Dare System */}
      <AccountabilitySummaryCard
        pact={displayedPact}
        myUserId={myUserId}
        partnerUserId={partnerUserId}
        myName={me.name}
        partnerName={partner.name}
        onProposeDare={proposeDare}
      />

      {/* Add Commitment Modal */}
      <AddTomorrowTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCommitment}
        partnerName={partner.name}
        myName={me.name}
      />
    </motion.div>
  );
};
