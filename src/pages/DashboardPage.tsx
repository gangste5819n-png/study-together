import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Video,
  Plus,
  Check,
  Clock,
  Flame,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import {
  RedPushPin,
  PaperClip,
  WashiTapeStrip,
  HeartConnector,
  CuteCatHeadphones,
  CuteCatSleeping,
  CuteChibiBoy,
  CuteChibiGirl,
  GlobeOnBooks,
} from '../components/common/StationeryDecorations';
import { MandatoryHealthCheck } from '../components/dashboard/MandatoryHealthCheck';
import { TomorrowPactPreview } from '../components/dashboard/TomorrowPactPreview';
import { SharedWeeklyGoal } from '../components/dashboard/SharedWeeklyGoal';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';

export const DashboardPage: React.FC = () => {
  const {
    me,
    partner,
    tasks,
    addTask,
    toggleTask,
    activeSession,
    startStudySession,
    pauseStudySession,
    resumeStudySession,
    endStudySession,
    todayPact,
    taskStats,
  } = useStudy();

  const navigate = useNavigate();

  // Quick task entry state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Expandable companion tools (Health check, Tomorrow pact, Weekly goal, Activity)
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);

  // Local fallback timer when no server active session is ticking
  const [localSeconds, setLocalSeconds] = useState(240); // 04:00 (matching reference image)
  const [isLocalRunning, setIsLocalRunning] = useState(false);

  // Interactive Goals state for extra cute checkboxes
  const [goalsChecked, setGoalsChecked] = useState<{ [key: string]: boolean }>({
    consistent: me.streak > 0,
    future: true,
  });

  const toggleGoal = (key: string) => {
    setGoalsChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Format seconds to mm:ss
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isSessionRunning = activeSession.status === 'active';
  const isSessionPaused = activeSession.status === 'paused';
  const sessionDurationMins = activeSession.durationMins || 25;

  const calculateSessionRemaining = (): number => {
    const totalSeconds = sessionDurationMins * 60;
    if (isSessionRunning || isSessionPaused) {
      return Math.max(0, totalSeconds - (activeSession.elapsedSeconds || 0));
    }
    return totalSeconds;
  };

  // Timer display: use activeSession if running, else local fallback
  const displayTimer = isSessionRunning || isSessionPaused
    ? formatTimer(calculateSessionRemaining())
    : formatTimer(localSeconds);

  const handleTimerToggle = () => {
    if (isSessionRunning) {
      pauseStudySession();
    } else if (isSessionPaused) {
      resumeStudySession();
    } else {
      if (isLocalRunning) {
        setIsLocalRunning(false);
      } else {
        // Start a 25 min focus session on backend
        startStudySession('focus', 25, me.currentSubject || 'General Study');
        setIsLocalRunning(true);
      }
    }
  };

  const handleTimerReset = () => {
    if (isSessionRunning || isSessionPaused) {
      endStudySession();
    }
    setLocalSeconds(240);
    setIsLocalRunning(false);
  };

  // Handle adding a new task directly from the To-Do List card
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      subject: me.currentSubject || 'General',
      category: 'study',
      type: 'study',
      priority: 'medium',
      estimatedMinutes: 30,
      completed: false,
      mandatory: false,
      owner: 'me',
      assignedTo: 'me',
      dueDate: new Date().toISOString().substring(0, 10),
    });

    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  // User tasks
  const myTasks = tasks.filter((t) => t.owner === 'me' || t.assignedTo === 'me');
  const completedTasksCount = myTasks.filter((t) => t.completed).length;

  // Real or default topics for Today's Topics card
  const derivedTopics = Array.from(new Set(myTasks.map((t) => t.subject).filter(Boolean)));
  const defaultTopics = [
    'CDS / NDA PYQs Practice',
    'General Science & Current Affairs',
    'Grammar & Vocabulary Review',
    'Mock Test Performance Analysis',
    'Evening Revision & Hydration',
  ];
  const displayTopics = derivedTopics.length > 0 ? derivedTopics.slice(0, 5) : defaultTopics;
  while (displayTopics.length < 5 && defaultTopics[displayTopics.length]) {
    displayTopics.push(defaultTopics[displayTopics.length]);
  }

  const studyHours = Math.floor(taskStats.completedStudyMinutes / 60);
  const studyMins = taskStats.completedStudyMinutes % 60;
  const studyTimeDisplay = `${studyHours > 0 ? `${studyHours}h ` : ''}${studyMins}m`;
  const pactPercent = todayPact
    ? todayPact.commitments && todayPact.commitments.length > 0
      ? Math.round(
          (todayPact.commitments.filter((c) => c.status === 'completed').length /
            todayPact.commitments.length) *
            100
        )
      : 50
    : 0;

  return (
    <div className="space-y-7 pb-12 font-body text-[#3F3534]">
      {/* =========================================================================
          ROW 1: DUAL PARTNER CARDS + LOOPING HEART CONNECTOR + SLEEPING CAT NOTE
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left Card: Akshay / User Card */}
        <div className="relative flex-1 w-full bg-[#FFFDF7] rounded-3xl border-2 border-[#FCD34D] p-4 sm:p-5 shadow-[3px_4px_0px_rgba(252,211,77,0.4)] transition-transform hover:-translate-y-0.5">
          {/* Top Washi Tape */}
          <div className="absolute -top-3 left-6 pointer-events-none">
            <WashiTapeStrip color="yellow" rotate={-2} />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853]/40 flex items-center justify-center shadow-sm overflow-hidden">
                <CuteChibiBoy className="w-16 h-16" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-cute text-lg sm:text-xl font-bold text-[#3F3534] tracking-tight">
                Hey {me.shortName || 'Akshay'}!
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-[#E0F2FE] border border-[#7DD3FC] text-xs font-semibold text-[#0369A1]">
                <span>🛡️</span>
                <span className="truncate">{me.examGoal || 'Defense Aspirant'}</span>
              </div>
              <p className="text-xs text-[#FF6B8B] font-hand font-bold mt-1.5 flex items-center gap-1">
                Same goals Bigger dreams ♡
              </p>
            </div>
          </div>
        </div>

        {/* Center: Looping Ribbon Heart Connector */}
        <div className="hidden lg:flex items-center justify-center flex-shrink-0 px-2">
          <HeartConnector className="w-24 xl:w-28 h-12" />
        </div>

        {/* Right Card: Dr. Vamp / Partner Card */}
        <div className="relative flex-1 w-full bg-[#FFFDF7] rounded-3xl border-2 border-[#F8B4C0] p-4 sm:p-5 shadow-[3px_4px_0px_rgba(248,180,192,0.4)] transition-transform hover:-translate-y-0.5">
          {/* Top Washi Tape */}
          <div className="absolute -top-3 right-6 pointer-events-none">
            <WashiTapeStrip color="pink" rotate={2} />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-[#FCE7F3] border-2 border-[#EC4899]/40 flex items-center justify-center shadow-sm overflow-hidden">
                <CuteChibiGirl className="w-16 h-16" />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  partner.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-cute text-lg sm:text-xl font-bold text-[#3F3534] tracking-tight">
                Hey {partner.shortName || 'Dr. Vamp'}!
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-[#FCE7F3] border border-[#F472B6] text-xs font-semibold text-[#BE185D]">
                <span>🩺</span>
                <span className="truncate">{partner.examGoal || 'Future Doctor'}</span>
              </div>
              <p className="text-xs text-[#FF6B8B] font-hand font-bold mt-1.5 flex items-center gap-1">
                Better Together ♡
              </p>
            </div>
          </div>
        </div>

        {/* Far Right Note: Good Things Take Time Note with Sleeping Cat */}
        <div className="relative w-full lg:w-48 xl:w-56 bg-[#FFFDF7] rounded-3xl border-2 border-[#FED7AA] p-3 sm:p-4 shadow-[3px_4px_0px_rgba(254,215,170,0.45)] flex lg:flex-col items-center justify-between gap-2">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none">
            <WashiTapeStrip color="peach" rotate={-3} className="text-[10px]" />
          </div>
          <div className="text-center pt-2">
            <p className="font-cute text-sm sm:text-base font-bold text-[#431407]">Good Things ♡</p>
            <p className="font-cute text-xs sm:text-sm font-semibold text-[#9A3412]">Take Time ♡</p>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center">
            <CuteCatSleeping className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: STUDY TIME (Timer + Cat) | GOALS & EXAM DATES | TO DO LIST
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        {/* -------------------------------------------------------------
            CARD 1: STUDY TIME (Col span 4)
            ------------------------------------------------------------- */}
        <div className="lg:col-span-4 bg-[#FFF2F4] rounded-3xl border-2 border-[#F8B4C0] p-5 shadow-[3px_4px_0px_rgba(248,180,192,0.45)] flex flex-col justify-between relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#F8B4C0]/60">
            <div className="flex items-center gap-2">
              <span className="text-xl select-none">⏰</span>
              <h3 className="font-cute text-base sm:text-lg font-bold text-[#3F3534]">Study Time</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#F8B4C0] text-[#FF4D6D]">
              {isSessionRunning ? 'Active' : isSessionPaused ? 'Paused' : 'Ready'}
            </span>
          </div>

          {/* Big Pink Digital Timer Pill */}
          <div className="my-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-[220px] py-2.5 px-5 rounded-2xl bg-[#FFE4E8] border-4 border-[#FF8FA3] shadow-inner text-center">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#D90429] tracking-wider drop-shadow-xs">
                {displayTimer}
              </span>
            </div>

            {/* Subtitle tag */}
            <p className="text-xs font-hand font-bold text-[#FF4D6D] mt-2 flex items-center gap-1 select-none">
              ✦ Focus! Take a Break! ♡
            </p>

            {/* Controls */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleTimerToggle}
                className="min-w-[44px] min-h-[44px] px-4 py-2 rounded-xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-bold font-cute flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                {isSessionRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isSessionPaused ? 'Resume' : 'Start Focus'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleTimerReset}
                title="Reset session"
                aria-label="Reset session"
                className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-white hover:bg-pink-100 border-2 border-[#F8B4C0] text-[#7A6B69] hover:text-[#3F3534] transition-colors cursor-pointer flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/study-room')}
                title="Go to Study Room"
                className="min-h-[44px] px-3 py-2 rounded-xl bg-[#FFFDF7] hover:bg-white border-2 border-[#FCD34D] text-[#854D0E] text-xs font-bold font-cute flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Video className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Room</span>
              </button>
            </div>
          </div>

          {/* Cute Cat with Headphones illustration */}
          <div className="flex items-center justify-center pt-1 border-t border-[#F8B4C0]/40">
            <CuteCatHeadphones className="w-24 h-24 select-none drop-shadow-xs" />
          </div>
        </div>

        {/* -------------------------------------------------------------
            CARD 2: GOALS & EXAM DATES STACK (Col span 4)
            ------------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
          {/* Goals Card (Mint Grid) */}
          <div className="relative bg-[#F0FDF4] rounded-3xl border-2 border-[#BBF7D0] p-4 sm:p-5 shadow-[3px_4px_0px_rgba(187,247,208,0.5)]">
            <div className="absolute -top-3 right-6 pointer-events-none">
              <WashiTapeStrip color="mint" rotate={2} />
            </div>

            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#BBF7D0]/60">
              <span className="text-lg select-none">🎯</span>
              <h3 className="font-cute text-base font-bold text-[#1E3A2B]">Goals</h3>
            </div>

            <div className="space-y-2.5 font-cute text-sm text-[#2D5A43]">
              <label
                onClick={() => toggleGoal('consistent')}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    goalsChecked.consistent
                      ? 'bg-[#10B981] border-[#059669] text-white'
                      : 'border-[#86EFAC] bg-white group-hover:border-[#10B981]'
                  }`}
                >
                  {goalsChecked.consistent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={goalsChecked.consistent ? 'font-bold' : ''}>Stay Consistent</span>
              </label>

              <label
                onClick={() => toggleGoal('future')}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    goalsChecked.future
                      ? 'bg-[#10B981] border-[#059669] text-white'
                      : 'border-[#86EFAC] bg-white group-hover:border-[#10B981]'
                  }`}
                >
                  {goalsChecked.future && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={goalsChecked.future ? 'font-bold' : ''}>Build Our Future ♡</span>
              </label>

              <div className="pt-2 border-t border-[#BBF7D0]/50 text-xs flex items-center justify-between text-[#1E3A2B]">
                <span className="font-semibold">Daily Study Target:</span>
                <span className="font-bold text-[#047857]">
                  {Math.floor((me.todayStudyMinutes || 0) / 60)}h / {Math.round((me.targetStudyMinutes || 480) / 60)}h
                </span>
              </div>
            </div>
          </div>

          {/* Exam Dates Card (Butter Yellow Notepad) */}
          <div className="relative bg-[#FEFCE8] rounded-3xl border-2 border-[#FEF08A] p-4 sm:p-5 shadow-[3px_4px_0px_rgba(254,240,138,0.55)]">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#FEF08A]/70">
              <div className="flex items-center gap-2">
                <span className="text-lg select-none">📅</span>
                <h3 className="font-cute text-base font-bold text-[#713F12]">Exam Dates</h3>
              </div>
              <span className="text-sm select-none">✏️ 📘</span>
            </div>

            <div className="space-y-2 text-xs font-cute text-[#854D0E]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-[#FEF08A]">
                <span className="font-bold flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>Test : {me.examGoal || 'Defense Finals'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] font-bold text-[10px]">
                  48d Left
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-[#FEF08A]">
                <span className="font-bold flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>Quiz : {partner.examGoal || 'NEET Mock Test'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] font-bold text-[10px]">
                  In 3 Days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CARD 3: TO DO LIST (Pink Lined Notepad with Red Pushpin) (Col span 4)
            ------------------------------------------------------------- */}
        <div className="lg:col-span-4 relative bg-[#FFF2F4] rounded-3xl border-2 border-[#F8B4C0] p-5 shadow-[3px_4px_0px_rgba(248,180,192,0.45)] flex flex-col justify-between">
          {/* Centered Red Pushpin */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 drop-shadow-sm pointer-events-none">
            <RedPushPin className="w-6 h-7" />
          </div>

          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b-2 border-dashed border-[#F8B4C0]/60">
              <h3 className="font-cute text-lg font-bold text-[#831843] flex items-center gap-1.5">
                <span>To Do List</span>
              </h3>
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="text-xs font-cute font-bold text-[#FF4D6D] hover:text-[#831843] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-pink-200/50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingTask ? 'Cancel' : 'Add'}</span>
              </button>
            </div>

            {/* Quick Add Form */}
            {isAddingTask && (
              <form onSubmit={handleCreateTask} className="mb-3 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New task..."
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white border border-[#F8B4C0] focus:outline-none focus:ring-2 focus:ring-[#FF4D6D] text-[#3F3534]"
                />
                <button
                  type="submit"
                  className="min-h-[36px] px-3 py-1 bg-[#FF4D6D] text-white text-xs font-cute font-bold rounded-xl shadow-xs hover:bg-[#E63946] transition-colors cursor-pointer"
                >
                  Save
                </button>
              </form>
            )}

            {/* Lined Tasks List */}
            <div className="space-y-2 font-hand text-base text-[#4A2833]">
              {myTasks.length > 0 ? (
                myTasks.slice(0, 5).map((task, idx) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-2.5 cursor-pointer py-1 px-1 rounded-lg hover:bg-white/40 transition-colors select-none group"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                        task.completed
                          ? 'bg-[#FF4D6D] border-[#FF4D6D] text-white'
                          : 'border-[#F8B4C0] bg-white group-hover:border-[#FF4D6D]'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`flex-1 text-sm sm:text-base transition-all ${
                        task.completed ? 'line-through text-[#9E7B84]' : 'font-bold'
                      }`}
                    >
                      {idx + 1}. {task.title}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="w-5 h-5 rounded-md border-2 border-[#F8B4C0] bg-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#FF4D6D] stroke-[3]" />
                    </div>
                    <span className="text-sm sm:text-base font-bold">1. Study / Work</span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="w-5 h-5 rounded-md border-2 border-[#F8B4C0] bg-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#FF4D6D] stroke-[3]" />
                    </div>
                    <span className="text-sm sm:text-base font-bold">2. Stay Healthy</span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="w-5 h-5 rounded-md border-2 border-[#F8B4C0] bg-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#FF4D6D] stroke-[3]" />
                    </div>
                    <span className="text-sm sm:text-base font-bold">3. Be Happy</span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="w-5 h-5 rounded-md border-2 border-[#F8B4C0] bg-white flex items-center justify-center flex-shrink-0" />
                    <span className="text-sm sm:text-base font-bold">4. Grow Together ♡</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom helper action */}
          <div className="pt-3 border-t border-[#F8B4C0]/40 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-[#FF4D6D]">
              {completedTasksCount}/{myTasks.length} Completed
            </span>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-cute font-bold text-[#831843] hover:underline cursor-pointer"
            >
              All Tasks →
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: TODAY'S TOPICS | YOU GOT THIS NOTE | DAILY PROGRESS | GLOBE BOOKS
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        {/* -------------------------------------------------------------
            CARD 4: TODAY'S TOPICS (Lavender Notepad with Purple Paperclip) (Col span 4)
            ------------------------------------------------------------- */}
        <div className="lg:col-span-4 relative bg-[#FAF5FF] rounded-3xl border-2 border-[#E9D5FF] p-5 shadow-[3px_4px_0px_rgba(233,213,255,0.55)] flex flex-col justify-between">
          {/* Top Paperclip */}
          <div className="absolute -top-3 right-6 z-10 pointer-events-none drop-shadow-xs">
            <PaperClip color="#A855F7" className="w-6 h-9" />
          </div>

          <div>
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#E9D5FF]/70">
              <span className="text-lg select-none">⭐</span>
              <h3 className="font-cute text-base sm:text-lg font-bold text-[#581C87]">
                Today&apos;s Topics
              </h3>
            </div>

            <div className="space-y-2.5 font-hand text-sm sm:text-base text-[#3B0764]">
              {displayTopics.map((topic, index) => {
                const heartColors = ['💖', '🧡', '💙', '💜', '💚'];
                return (
                  <div key={index} className="flex items-center gap-2 py-0.5">
                    <span className="text-sm select-none">{heartColors[index % heartColors.length]}</span>
                    <span className="font-bold truncate">
                      {index + 1}. {topic}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E9D5FF]/50 text-[11px] font-cute text-[#6B21A8] flex items-center justify-between">
            <span>Current Syllabus Focus</span>
            <span>✦ ✦ ✦</span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            NOTES 5: YOU GOT THIS STICKY + DISCIPLINE NOTE (Col span 2)
            ------------------------------------------------------------- */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4">
          {/* Pinned Sticky: You Got This */}
          <div className="relative bg-[#FFFDF7] rounded-2xl border-2 border-[#BAE6FD] p-3 shadow-[2px_3px_0px_rgba(186,230,253,0.55)] text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none">
              <PaperClip color="#38BDF8" className="w-5 h-7" />
            </div>
            <div className="pt-2 font-cute font-extrabold text-sm text-[#0369A1]">
              <p>You</p>
              <p>Got</p>
              <p>This ♡</p>
            </div>
          </div>

          {/* Seedling Note: Discipline today */}
          <div className="bg-[#F0FDF4] rounded-2xl border-2 border-[#86EFAC] p-3 text-center shadow-[2px_3px_0px_rgba(134,239,172,0.45)]">
            <div className="flex justify-center mb-1">
              <span className="text-lg select-none">🌱</span>
            </div>
            <p className="font-hand font-bold text-xs text-[#166534] leading-tight">
              Discipline today Freedom tomorrow ♡
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CARD 6: DAILY PROGRESS (Baby Blue Paper Card) (Col span 4)
            ------------------------------------------------------------- */}
        <div className="lg:col-span-4 relative bg-[#F0F9FF] rounded-3xl border-2 border-[#BAE6FD] p-5 shadow-[3px_4px_0px_rgba(186,230,253,0.55)] flex flex-col justify-between">
          <div className="absolute -top-3 left-6 pointer-events-none">
            <WashiTapeStrip color="blue" rotate={-2} />
          </div>

          <div>
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#BAE6FD]/60">
              <span className="text-lg select-none">📊</span>
              <h3 className="font-cute text-base sm:text-lg font-bold text-[#0369A1]">
                Daily Progress
              </h3>
            </div>

            {/* 4 Stat Tiles Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Tile 1: Tasks */}
              <div className="bg-white/90 rounded-2xl border border-[#BAE6FD] p-2.5 flex items-center gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#16A34A] stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#0369A1] font-semibold">Tasks</p>
                  <p className="font-cute text-xs sm:text-sm font-bold text-[#3F3534]">
                    {completedTasksCount}/{myTasks.length || 5}
                  </p>
                </div>
              </div>

              {/* Tile 2: Study Time */}
              <div className="bg-white/90 rounded-2xl border border-[#BAE6FD] p-2.5 flex items-center gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#FFE4E8] border border-[#F8B4C0] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#FF4D6D]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#0369A1] font-semibold">Study Time</p>
                  <p className="font-cute text-xs sm:text-sm font-bold text-[#3F3534]">
                    {studyTimeDisplay}
                  </p>
                </div>
              </div>

              {/* Tile 3: Streak */}
              <div className="bg-white/90 rounded-2xl border border-[#BAE6FD] p-2.5 flex items-center gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4 text-[#D97706] fill-[#D97706]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#0369A1] font-semibold">Streak</p>
                  <p className="font-cute text-xs sm:text-sm font-bold text-[#3F3534]">
                    {me.streak} days
                  </p>
                </div>
              </div>

              {/* Tile 4: Pact */}
              <div className="bg-white/90 rounded-2xl border border-[#BAE6FD] p-2.5 flex items-center gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] border border-[#D8B4FE] flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-[#9333EA] fill-[#9333EA]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#0369A1] font-semibold">Pact</p>
                  <p className="font-cute text-xs sm:text-sm font-bold text-[#3F3534]">
                    {pactPercent}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#BAE6FD]/50 flex justify-between items-center text-xs">
            <span className="text-[10px] font-semibold text-[#0369A1]">Side-by-side growth</span>
            <button
              onClick={() => navigate('/progress')}
              className="font-cute font-bold text-[#0284C7] hover:underline cursor-pointer"
            >
              Full Analytics →
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            ILLUSTRATION 7: GLOBE ON BOOKS (Col span 2)
            ------------------------------------------------------------- */}
        <div className="lg:col-span-2 hidden md:flex flex-col items-center justify-center p-2">
          <GlobeOnBooks className="w-24 h-24 select-none drop-shadow-xs" />
        </div>
      </div>

      {/* =========================================================================
          EXTRAS ACCORDION: PRESERVE ALL STEP 1-10 FEATURES (Routine, Pact, Activity)
          ========================================================================= */}
      <div className="pt-4 border-t-2 border-dashed border-[#F8B4C0]/50">
        <button
          onClick={() => setIsExtrasOpen(!isExtrasOpen)}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#FFF2F4] hover:bg-[#FFE4E8] border-2 border-[#F8B4C0] text-[#831843] font-cute font-bold text-sm flex items-center justify-between shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF4D6D]" />
            <span>Companion Routine Care, Tomorrow Pact & Activity Feed</span>
          </div>
          {isExtrasOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {isExtrasOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pt-5 overflow-hidden"
            >
              {/* Mandatory Health Check Routine */}
              <MandatoryHealthCheck />

              {/* Tomorrow Pact Preview */}
              <TomorrowPactPreview />

              {/* Shared Weekly Goal */}
              <SharedWeeklyGoal />

              {/* Recent Activity Feed */}
              <RecentActivityFeed />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
