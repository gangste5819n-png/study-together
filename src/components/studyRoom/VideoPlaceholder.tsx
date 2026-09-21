import React, { useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Shield, Sparkles } from 'lucide-react';

interface VideoPlaceholderProps {
  label: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  statusText: string;
  isSelf?: boolean;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  label,
  name,
  role,
  avatar,
  isOnline,
  statusText,
  isSelf = false,
}) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#0a0c16] border border-white/[0.08] shadow-2xl flex flex-col justify-between aspect-video group">
      {/* Top Overlay Bar */}
      <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        <div className="flex items-center gap-2.5">
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
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-semibold text-white">{name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
            WebRTC Ready
          </span>
        </div>
      </div>

      {/* Center Simulated Camera Feed Placeholder */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {camOn ? (
          <div className="relative flex flex-col items-center">
            {/* Ambient pulse effect */}
            <div
              className={`absolute w-32 h-32 rounded-full blur-2xl opacity-30 animate-pulse ${
                isSelf ? 'bg-purple-600' : 'bg-cyan-600'
              }`}
            />
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-2 border-white/20 shadow-2xl"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0c16]" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-200">{role}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              {statusText}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-500">
            <VideoOff className="w-12 h-12 mb-2 stroke-[1.5]" />
            <span className="text-xs font-medium">Camera is turned off</span>
          </div>
        )}
      </div>

      {/* Bottom Overlay Controls */}
      <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          {/* Mic Button */}
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-2 rounded-xl transition-all pointer-events-auto ${
              micOn
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
            title={micOn ? 'Mute audio' : 'Unmute audio'}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={() => setCamOn(!camOn)}
            className={`p-2 rounded-xl transition-all pointer-events-auto ${
              camOn
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
            title={camOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {camOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">P2P Encrypted</span>
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
