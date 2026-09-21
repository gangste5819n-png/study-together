import React, { useState, useEffect, useRef } from 'react';
import { WifiOff } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const OnlineIndicator: React.FC = () => {
  const { socketConnected } = useStudy();
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState<boolean>(false);
  const wasOfflineRef = useRef<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setBrowserOnline(true);
      if (wasOfflineRef.current) {
        setJustReconnected(true);
        const timer = setTimeout(() => {
          setJustReconnected(false);
          wasOfflineRef.current = false;
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    const handleOffline = () => {
      setBrowserOnline(false);
      wasOfflineRef.current = true;
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOnline = browserOnline && socketConnected;

  // Track socket reconnect transition
  useEffect(() => {
    if (socketConnected && wasOfflineRef.current) {
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
        wasOfflineRef.current = false;
      }, 3000);
      return () => clearTimeout(timer);
    } else if (!socketConnected && browserOnline) {
      wasOfflineRef.current = true;
    }
  }, [socketConnected, browserOnline]);

  if (justReconnected) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold select-none transition-all duration-300"
        title="Network connection re-established"
        role="status"
        aria-live="polite"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>Back online</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold select-none transition-all duration-300"
        title="Operating in offline mode"
        role="status"
        aria-live="polite"
      >
        <WifiOff className="w-3 h-3 text-amber-400" />
        <span>Offline</span>
      </div>
    );
  }

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 text-[11px] font-medium select-none"
      title="Connected to server and real-time socket"
      role="status"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span className="hidden md:inline">Connected</span>
    </div>
  );
};
