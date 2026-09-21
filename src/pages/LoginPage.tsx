import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudy } from '../context/StudyContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useStudy();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex.cds@studytogether.app');
  const [password, setPassword] = useState('studyhard123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        const res = await register(name, email, password);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setErrorMessage(res.message || 'Registration failed');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setErrorMessage(res.message || 'Invalid email or password');
        }
      }
    } catch {
      // Offline fallback: navigate directly to dashboard
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoEntry = async (demoEmail: string, demoName: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Try login first; if not registered yet, auto-register
      const loginRes = await login(demoEmail, 'demoStudy2026!');
      if (loginRes.success) {
        navigate('/dashboard');
        return;
      }

      const regRes = await register(demoName, demoEmail, 'demoStudy2026!');
      if (regRes.success) {
        navigate('/dashboard');
        return;
      }

      // Fallback
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07080d] p-4 relative overflow-hidden">
      {/* Dynamic ambient gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 shadow-xl shadow-purple-600/30 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">Study Together</h1>
          <p className="text-sm text-purple-300 font-medium mt-1">
            Your private study room for two.
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            Dedicated accountability for CDS and Final Year MBBS aspirations.
          </p>
        </div>

        {/* Login / Register Glassmorphism Box */}
        <div className="rounded-3xl bg-[#0f121e]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl shadow-black/60">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-5">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isRegisterMode
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isRegisterMode
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@studytogether.app"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                {!isRegisterMode && (
                  <span className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'Please wait...' : isRegisterMode ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Launch Pills */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Demo Entry
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoEntry('alex.cds@studytogether.app', 'Alex')}
                className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-xs font-semibold text-purple-200 text-center transition-colors"
              >
                Enter as Alex (CDS)
              </button>

              <button
                type="button"
                onClick={() => handleDemoEntry('priya.mbbs@studytogether.app', 'Priya')}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-semibold text-cyan-200 text-center transition-colors"
              >
                Enter as Priya (MBBS)
              </button>
            </div>
          </div>

          {/* Guest Direct Entry */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-400 hover:text-purple-300 font-medium transition-colors"
            >
              Continue without signing in →
            </button>
          </div>
        </div>

        {/* Small Privacy Guarantee Footer */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Private two-person encrypted study room</span>
        </div>
      </motion.div>
    </div>
  );
};
