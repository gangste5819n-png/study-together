import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Shield, Sparkles, Wifi } from 'lucide-react';

interface VideoFeedProps {
  label: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  statusText: string;
  stream: MediaStream | null;
  isSelf?: boolean;
  isMicOn: boolean;
  isCamOn: boolean;
  isCallActive: boolean;
  isCalling?: boolean;
  onToggleMic?: () => void;
  onToggleCam?: () => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  label,
  name,
  role,
  avatar,
  isOnline,
  statusText,
  stream,
  isSelf = false,
  isMicOn,
  isCamOn,
  isCallActive,
  isCalling = false,
  onToggleMic,
  onToggleCam,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach MediaStream to HTML5 video element
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (stream && isCamOn) {
      videoEl.srcObject = stream;
      videoEl
        .play()
        .catch((err) => {
          console.warn('[VideoFeed] Play notification:', err.message);
        });
    } else {
      videoEl.srcObject = null;
    }
  }, [stream, isCamOn]);

  const hasActiveVideoStream = Boolean(stream && isCamOn && isCallActive);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#1a1c29] border-4 border-white shadow-[3px_5px_0px_rgba(248,180,192,0.5)] flex flex-col justify-between aspect-video group">
      {/* Actual HTML5 Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isSelf} // CRITICAL: Local preview MUST be muted to prevent acoustic feedback loops!
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          hasActiveVideoStream ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
        } ${isSelf ? '-scale-x-100' : ''}`}
      />

      {/* Top Overlay Bar */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase border ${
              isSelf
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {label}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isCallActive
                  ? 'bg-emerald-400 animate-pulse'
                  : isOnline
                  ? 'bg-blue-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-semibold text-white truncate max-w-[120px] sm:max-w-none">
              {name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute status badge */}
          {!isMicOn && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
              <MicOff className="w-2.5 h-2.5" />
              <span>Muted</span>
            </span>
          )}

          {/* Connection badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 border border-white/10 text-[10px] font-medium text-slate-300">
            {isCallActive ? (
              <>
                <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Live P2P</span>
              </>
            ) : isCalling ? (
              <span className="text-amber-300 font-semibold animate-pulse">Ringing...</span>
            ) : (
              <span className="text-slate-400">Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Fallback Display (When camera is off or call is not live) */}
      {!hasActiveVideoStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-5">
          {isCalling ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-purple-400/60 animate-ping absolute inset-0 opacity-40" />
                <img
                  src={avatar}
                  alt={name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-purple-400 shadow-xl"
                />
              </div>
              <p className="text-sm font-semibold text-purple-200">Connecting to {name}...</p>
              <p className="text-xs text-slate-400 mt-0.5">Establishing WebRTC peer session</p>
            </div>
          ) : !isCamOn ? (
            <div className="flex flex-col items-center text-slate-400">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center mb-2 shadow-inner">
                <VideoOff className="w-8 h-8 text-slate-500" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Camera is turned off</span>
              <span className="text-[11px] text-slate-500">{name}</span>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              {/* Ambient pulse effect */}
              <div
                className={`absolute w-32 h-32 rounded-full blur-2xl opacity-25 animate-pulse ${
                  isSelf ? 'bg-purple-600' : 'bg-cyan-600'
                }`}
              />
              <div className="relative">
                <img
                  src={avatar}
                  alt={name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/20 shadow-2xl"
                />
                <span
                  className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0a0c16] ${
                    isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-200">{role}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                {statusText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Overlay Bar */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/45 to-transparent">
        <div className="flex items-center gap-2">
          {/* Controls for Self */}
          {isSelf && onToggleMic && onToggleCam && (
            <>
              {/* Mic Toggle Button */}
              <button
                onClick={onToggleMic}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isMicOn
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
                title={isMicOn ? 'Mute audio' : 'Unmute audio'}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Camera Toggle Button */}
              <button
                onClick={onToggleCam}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isCamOn
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
                title={isCamOn ? 'Turn camera off' : 'Turn camera on'}
              >
                {isCamOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </>
          )}

          {/* Indicator for Partner */}
          {!isSelf && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[11px] text-slate-300">{partnerMicrophoneLabel(isMicOn)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">P2P Encrypted</span>
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

const partnerMicrophoneLabel = (micOn: boolean): string => {
  return micOn ? 'Audio active' : 'Partner muted';
};
