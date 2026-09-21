import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if dismissed previously
    const dismissedAt = localStorage.getItem('study_together_install_dismissed');
    if (dismissedAt) {
      // Don't show if dismissed within last 7 days
      const daysSinceDismissal = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('[PWA] User accepted installation prompt');
      }
    } catch (err) {
      console.warn('[PWA] Installation prompt error:', err);
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('study_together_install_dismissed', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div
      role="region"
      aria-label="App Installation Prompt"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 p-4 rounded-2xl bg-[#0f121e]/95 border border-purple-500/30 shadow-2xl shadow-purple-950/50 backdrop-blur-xl animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-600/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white tracking-tight">Install Study Together</h3>
          <p className="text-xs text-purple-200/80 mt-0.5">
            Add to home screen for distraction-free full screen study sessions and offline access.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 min-h-[36px] px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
