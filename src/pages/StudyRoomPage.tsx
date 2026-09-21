import React from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Wifi,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useCall } from '../context/CallContext';
import { VideoFeed } from '../components/studyRoom/VideoFeed';
import { FocusTimer } from '../components/studyRoom/FocusTimer';
import { EncouragementBar } from '../components/together/EncouragementBar';

export const StudyRoomPage: React.FC = () => {
  const { me, partner } = useStudy();
  const {
    callState,
    localStream,
    remoteStream,
    isMicOn,
    isCamOn,
    partnerMicOn,
    partnerCamOn,
    callDuration,
    permissionError,
    retryPermissions,
    startCall,
    endCall,
    toggleMic,
    toggleCam,
  } = useCall();

  const isCallConnected = callState === 'connected';
  const isCalling = callState === 'calling';

  // Format call duration MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            <Video className="w-3.5 h-3.5" />
            <span>REAL-TIME SYNCHRONIZED DIGITAL STUDY ROOM 🌸</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3F3534] tracking-tight font-cute">
            Study Room: {me.name} & {partner.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6B69] mt-0.5">
            Private peer-to-peer WebRTC video chamber for deep focus and study sessions 💕
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-bold">
            <Wifi className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>
              {isCallConnected ? 'WebRTC Live (P2P)' : isCalling ? 'Calling Partner...' : 'Room Live (Ready)'}
            </span>
          </div>
        </div>
      </div>

      {/* Permission Warning Banner */}
      {permissionError && (
        <div className="p-4 rounded-3xl bg-[#FEF3C7] border-2 border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#92400E] text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#78350F]">Camera or Microphone Notice</p>
              <p className="text-xs text-[#92400E] mt-0.5">{permissionError}</p>
            </div>
          </div>
          <button
            onClick={retryPermissions}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100/50 border border-[#FDE68A] text-xs font-bold text-[#92400E] transition-all cursor-pointer w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Access</span>
          </button>
        </div>
      )}

      {/* Main Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: "You" (Local WebRTC Preview - Always Muted) */}
        <VideoFeed
          label="You (Local Preview)"
          name={me.name}
          role="CDS Aspirant • Armed Forces Target"
          avatar={me.avatar}
          isOnline={me.isOnline}
          statusText={me.statusMessage}
          stream={localStream}
          isSelf={true}
          isMicOn={isMicOn}
          isCamOn={isCamOn}
          isCallActive={isCallConnected}
          isCalling={isCalling}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
        />

        {/* Right: "Study Partner" (Remote WebRTC Feed) */}
        <VideoFeed
          label={`${partner.name} (Remote Feed)`}
          name={partner.name}
          role="Final Year MBBS • Exams in Nov"
          avatar={partner.avatar}
          isOnline={partner.isOnline}
          statusText={partner.statusMessage}
          stream={remoteStream}
          isSelf={false}
          isMicOn={partnerMicOn}
          isCamOn={partnerCamOn}
          isCallActive={isCallConnected}
          isCalling={isCalling}
        />
      </div>

      {/* Call Action Bar & Controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border-2 border-[#F1DDD4] shadow-[3px_4px_0px_rgba(220,195,185,0.45)] flex flex-wrap items-center justify-between gap-4 text-[#3F3534]">
        {/* Left Status / Duration Indicator */}
        <div className="flex items-center gap-3">
          {isCallConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#FFE4E8] border border-[#F8B4C0] text-[#BE185D] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Clock className="w-3.5 h-3.5 text-[#FF4D6D]" />
              <span>Call Duration: {formatDuration(callDuration)}</span>
            </div>
          ) : isCalling ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Calling {partner.name}... Waiting for answer</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#7A6B69] font-medium">
              <Sparkles className="w-4 h-4 text-[#FF4D6D]" />
              <span>Ready for synchronized audio/video study session 💕</span>
            </div>
          )}
        </div>

        {/* Right Control Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {isCallConnected ? (
            <>
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={toggleMic}
                aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold font-cute transition-all cursor-pointer ${
                  isMicOn
                    ? 'bg-[#FAF7F2] hover:bg-[#F1DDD4] text-[#3F3534] border border-[#F1DDD4]'
                    : 'bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0]'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isMicOn ? 'Mute' : 'Unmute'}</span>
              </button>

              {/* Camera Toggle */}
              <button
                type="button"
                onClick={toggleCam}
                aria-label={isCamOn ? "Turn camera off" : "Turn camera on"}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold font-cute transition-all cursor-pointer ${
                  isCamOn
                    ? 'bg-[#FAF7F2] hover:bg-[#F1DDD4] text-[#3F3534] border border-[#F1DDD4]'
                    : 'bg-[#FFE4E8] text-[#BE185D] border border-[#F8B4C0]'
                }`}
              >
                {isCamOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isCamOn ? 'Stop Cam' : 'Start Cam'}</span>
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={endCall}
                aria-label="End call"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs font-cute shadow-sm shadow-rose-200 transition-all cursor-pointer active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </>
          ) : isCalling ? (
            <button
              type="button"
              onClick={endCall}
              aria-label="Cancel outgoing call"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-[#FFE4E8] hover:bg-[#FFCCD5] border border-[#F8B4C0] text-[#BE185D] font-bold text-xs font-cute transition-all cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Cancel Call</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startCall}
              aria-label={`Start video call with ${partner.name}`}
              className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF4D6D] hover:bg-[#E63946] text-white font-bold text-xs font-cute shadow-sm shadow-pink-200 transition-all cursor-pointer active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Start Video Call with {partner.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Partner Sync & Presence Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Partner Presence & Status */}
        <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                partner.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-[#9CA3AF]'
              }`}
            />
            <div className="text-xs">
              <span className="font-extrabold text-[#3F3534] block">{partner.name}</span>
              <span className="text-[#5F5351] font-medium text-[11px]">
                {partner.isOnline ? 'Active right now' : 'Currently offline'}
              </span>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              partner.isOnline
                ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                : 'bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB]'
            }`}
          >
            {partner.isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* Partner Live Check-in */}
        <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] text-[#6B21A8] flex items-center justify-center font-bold text-sm flex-shrink-0">
            {partner.mood === 'good' ? '😊' : partner.mood === 'tired' ? '🥱' : partner.mood === 'sleepy' ? '😴' : '✨'}
          </div>
          <div className="text-xs min-w-0">
            <span className="text-[#5F5351] font-bold text-[11px] block">Partner Check-In</span>
            <span className="font-extrabold text-[#3F3534] truncate block">
              {partner.mood ? `Feeling ${partner.mood}` : 'Ready to study'} • Energy: {partner.energyLevel || 4}/5
            </span>
          </div>
        </div>

        {/* Partner Progress & Streak */}
        <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#F1DDD4] flex items-center justify-between shadow-xs">
          <div className="text-xs">
            <span className="text-[#5F5351] font-bold text-[11px] block">Partner Progress</span>
            <span className="font-extrabold text-[#3F3534]">
              {partner.tasksCompleted} tasks completed
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-xs font-bold">
            <span>🔥</span>
            <span>{partner.streak || 0}d streak</span>
          </div>
        </div>
      </div>

      {/* Focus Timer Section */}
      <FocusTimer />

      {/* Quick encouragement during study */}
      <EncouragementBar />
    </motion.div>
  );
};
