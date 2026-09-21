import React, { useState } from 'react';
import { Menu, Search, Send, Settings, Sparkles, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../../context/StudyContext';
import { NotificationCenter } from '../notifications/NotificationCenter';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { me, partner, sendEncouragement, socketConnected } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/together');
    }
  };

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-3 sm:px-6 md:px-8 bg-white/95 border-b-2 border-[#F1DDD4] shadow-[0_2px_8px_rgba(230,200,195,0.25)] z-20">
      {/* Left: Mobile Menu & Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl text-[#786C6A] hover:text-[#3F3534] hover:bg-[#FFF0F3] transition-colors active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo with Open Book & Hearts */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFF0F3] border-2 border-[#FFCCD5] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-lg sm:text-xl select-none">📖</span>
          </div>
          <div>
            <h1 className="font-cute text-lg sm:text-xl font-black tracking-tight text-[#3F3534] flex items-center gap-1">
              <span>Study Together</span>
              <span className="text-[#FF4D6D] text-sm">💕</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center: "Better Together" Search Pill & Airplane Decoration (Desktop/Tablet) */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center gap-2 max-w-sm w-full mx-4"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Better Together 💕"
            className="w-full h-10 pl-9 pr-4 text-xs font-bold rounded-full bg-[#FAF7F2] border-2 border-[#F1DDD4] text-[#3F3534] placeholder-[#756866] focus:bg-white focus:border-[#FF4D6D] focus:outline-none transition-all shadow-inner"
          />
          <Search className="w-3.5 h-3.5 text-[#756866] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => navigate('/together')}
          title="Connect with Partner"
          className="p-2 rounded-full text-[#FF4D6D] hover:text-[#E63946] hover:bg-[#FFF0F3] transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4 transform -rotate-45" />
        </button>
      </form>

      {/* Right: Presence Status, Room CTA, Cheer, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Quick Online Presence Status Pill */}
        <div
          title={
            socketConnected
              ? partner.isOnline
                ? `${partner.shortName} is online`
                : 'Connected to Study Room'
              : 'Connecting...'
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border-2 border-[#86EFAC] text-[#15803D] text-xs font-extrabold select-none shadow-xs"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              socketConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="font-cute text-[11px] sm:text-xs">Online</span>
        </div>

        {/* Quick Study Room Video Trigger (Desktop) */}
        <button
          onClick={() => navigate('/study-room')}
          aria-label="Open Study Room"
          className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3E8FF] hover:bg-[#E9D5FF] border-2 border-[#D8B4FE] text-[#581C87] text-xs font-cute font-extrabold transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
        >
          <Video className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Study Room</span>
        </button>

        {/* Quick Micro-Cheer Button */}
        <button
          onClick={() => sendEncouragement('💖')}
          aria-label="Send cheer encouragement to partner"
          title="Send cheer to partner"
          className="min-h-[40px] min-w-[40px] px-3 py-1 rounded-full bg-[#FFE4E8] hover:bg-[#FFCCD5] border-2 border-[#F8B4C0] text-[#9D174D] transition-all text-xs font-cute font-extrabold flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D6D]" />
          <span className="hidden sm:inline">Cheer</span>
        </button>

        {/* Notification Bell (Real count badge & dropdown) */}
        <div className="relative">
          <NotificationCenter />
        </div>

        {/* Settings Gear Button */}
        <button
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          title="Settings"
          className="min-h-[40px] min-w-[40px] p-2 rounded-full hover:bg-[#FFF0F3] text-[#5F5351] hover:text-[#3F3534] transition-colors flex items-center justify-center cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => navigate('/settings')}
          aria-label="Account Settings and Profile"
          title={`${me.name} (Settings)`}
          className="min-h-[40px] min-w-[40px] p-0.5 rounded-full hover:ring-2 hover:ring-pink-300 transition-all cursor-pointer"
        >
          <img
            src={me.avatar}
            alt={me.name}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#FFCCD5] shadow-sm"
          />
        </button>
      </div>
    </header>
  );
};
