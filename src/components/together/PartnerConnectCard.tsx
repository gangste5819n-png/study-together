import React, { useState } from 'react';
import { Users, Copy, Check, Link2, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useStudy } from '../../context/StudyContext';

export const PartnerConnectCard: React.FC = () => {
  const {
    partner,
    partnerInfo,
    createPartnerInvite,
    joinPartnerInvite,
    isAuthenticated,
  } = useStudy();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConnected = Boolean(partnerInfo?.connected || partner.name !== 'Priya Sharma');
  const roomCode = partnerInfo?.roomCode || 'STUDY-CMQK';

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await createPartnerInvite();
      if (!res.success && res.message) {
        setErrorMessage(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await joinPartnerInvite(inputCode.trim());
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid or expired room code');
      } else {
        setInputCode('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard glow className="relative overflow-hidden bg-white/95 border-2 border-[#F8B4C0]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-[#F1DDD4]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] border-2 border-[#E9D5FF] flex items-center justify-center text-[#6B21A8]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#3F3534] font-cute">Study Partner Connection</h3>
              {isConnected ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Paired
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E]">
                  Pending Pairing
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F5351] font-medium mt-0.5">
              Encrypted two-person synchronization room for daily accountability.
            </p>
          </div>
        </div>

        {/* Room Code Quick Display */}
        <div className="flex items-center gap-2 bg-[#FAF7F2] border-2 border-[#F1DDD4] px-3.5 py-1.5 rounded-2xl shadow-xs">
          <span className="text-[11px] text-[#5F5351] font-bold">Room Code:</span>
          <span className="text-xs font-mono font-black text-[#6B21A8] tracking-wider">
            {roomCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy room code"
            className="p-1.5 rounded-xl hover:bg-[#FFF0F3] text-[#5F5351] hover:text-[#3F3534] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 rounded-2xl bg-[#FFE4E8] border border-[#F8B4C0] text-[#9D174D] text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#FF4D6D]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Row */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Generate / Share Code */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border-2 border-[#F1DDD4] flex items-center justify-between gap-3 shadow-xs">
          <div>
            <p className="text-xs font-extrabold text-[#3F3534]">Share Your Room Code</p>
            <p className="text-[11px] text-[#5F5351] font-medium mt-0.5">
              Send your 6-digit code to your study partner to link accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateCode}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#FFF0F3] hover:bg-[#FFE4E8] border-2 border-[#F8B4C0] text-[#831843] text-xs font-extrabold transition-all hover:scale-[1.02] whitespace-nowrap disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-[#FF4D6D]" />
            New Code
          </button>
        </div>

        {/* Join with Partner Code Form */}
        <form onSubmit={handleJoin} className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="STUDY-XXXX"
            maxLength={12}
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border-2 border-[#F1DDD4] text-[#3F3534] placeholder-[#756866] text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-[#FF4D6D]"
          />
          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="px-4 py-2 rounded-xl bg-[#FF4D6D] hover:bg-[#E63946] text-white text-xs font-extrabold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>
        </form>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-[#756866] font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Real MongoDB partner persistence & two-client room binding</span>
        </div>
        <span className="hidden sm:inline text-[#6B21A8] font-bold">
          {isAuthenticated ? 'Authenticated Account' : 'Guest / Local Session'}
        </span>
      </div>
    </GlassCard>
  );
};
