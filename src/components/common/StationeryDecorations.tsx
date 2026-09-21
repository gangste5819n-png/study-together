import React from 'react';

/**
 * 1. 3D Shiny Red Pushpin SVG
 */
export const RedPushPin: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="20" cy="44" rx="8" ry="3" fill="#3D3534" fillOpacity="0.2" />
    <path d="M18 26L20 42L22 26" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
    <circle cx="20" cy="16" r="14" fill="#FF4D6D" />
    <circle cx="16" cy="12" r="5" fill="#FFA5B7" />
    <path d="M12 24C14 27 26 27 28 24" stroke="#D90429" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="8" r="4" fill="#D90429" />
  </svg>
);

/**
 * 2. Curved Wire Paperclip SVG
 */
export const PaperClip: React.FC<{ color?: string; className?: string }> = ({
  color = '#C084FC',
  className = 'w-6 h-10',
}) => (
  <svg viewBox="0 0 28 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 14V34C10 39.52 14.48 44 20 44C25.52 44 30 39.52 30 34V10C30 5.58 26.42 2 22 2C17.58 2 14 5.58 14 10V33C14 35.76 16.24 38 19 38C21.76 38 24 35.76 24 33V12"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      transform="scale(0.85)"
    />
  </svg>
);

/**
 * 3. Washi Tape Strip
 */
export const WashiTapeStrip: React.FC<{
  color?: 'pink' | 'mint' | 'yellow' | 'lavender' | 'blue' | 'peach';
  className?: string;
  rotate?: number;
}> = ({ color = 'pink', className = '', rotate = -2 }) => {
  const colorStyles = {
    pink: 'bg-[#FFCCD5]/80 border-[#FF8FA3]/40 text-[#A2284C]',
    mint: 'bg-[#C8E6C9]/80 border-[#81C784]/40 text-[#2E7D32]',
    yellow: 'bg-[#FEF08A]/85 border-[#FCD34D]/40 text-[#854D0E]',
    lavender: 'bg-[#E9D5FF]/80 border-[#C084FC]/40 text-[#6B21A8]',
    blue: 'bg-[#BAE6FD]/80 border-[#7DD3FC]/40 text-[#075985]',
    peach: 'bg-[#FED7AA]/80 border-[#FDBA74]/40 text-[#9A3412]',
  };

  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`inline-block px-3 py-0.5 text-xs font-semibold tracking-wider rounded-sm shadow-sm border-t border-b border-dashed ${colorStyles[color]} ${className}`}
    >
      <span className="opacity-80 select-none">✦ ✦ ✦</span>
    </div>
  );
};

/**
 * 4. Looping Ribbon Heart Connector between Partner Cards
 */
export const HeartConnector: React.FC<{ className?: string }> = ({ className = 'w-24 sm:w-32 h-14' }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M 5 25 Q 40 45, 70 25 T 90 25 Q 120 5, 155 25"
        stroke="#FF8FA3"
        strokeWidth="2.5"
        strokeDasharray="4 4"
        fill="none"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full bg-pink-100 border-2 border-pink-300 flex items-center justify-center shadow-sm animate-pulse">
        <span className="text-sm select-none">💖</span>
      </div>
    </div>
  </div>
);

/**
 * 5. Cute White Cat with Headphones & Drink (SVG Illustration)
 */
export const CuteCatHeadphones: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Iced Coffee Drink with straw */}
    <rect x="18" y="75" width="22" height="30" rx="4" fill="#FCE7F3" stroke="#F472B6" strokeWidth="2" />
    <path d="M22 80H36" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="65" x2="28" y2="78" stroke="#FB7185" strokeWidth="3" strokeLinecap="round" />
    <text x="25" y="94" fontSize="8" fill="#DB2777">💕</text>

    {/* Cat Body */}
    <ellipse cx="68" cy="85" rx="32" ry="26" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2.5" />
    {/* Cat Tail */}
    <path d="M96 88C104 88 112 80 110 70C108 65 102 65 100 70" stroke="#3F3534" strokeWidth="3.5" strokeLinecap="round" fill="none" />

    {/* Cat Head */}
    <ellipse cx="66" cy="56" rx="28" ry="24" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2.5" />

    {/* Ears */}
    <path d="M44 42L40 24L56 36Z" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M44 38L42 28L52 35Z" fill="#FBCFE8" />

    <path d="M88 42L92 24L76 36Z" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M88 38L90 28L80 35Z" fill="#FBCFE8" />

    {/* Blue Headphones */}
    <path d="M38 52C38 32 94 32 94 52" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" fill="none" />
    <ellipse cx="40" cy="54" rx="6" ry="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
    <ellipse cx="92" cy="54" rx="6" ry="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />

    {/* Cat Face */}
    <ellipse cx="58" cy="54" rx="2.5" ry="3.5" fill="#3F3534" />
    <ellipse cx="74" cy="54" rx="2.5" ry="3.5" fill="#3F3534" />
    <circle cx="59" cy="53" r="1" fill="#FFFFFF" />
    <circle cx="75" cy="53" r="1" fill="#FFFFFF" />
    <ellipse cx="52" cy="59" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="80" cy="59" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.8" />
    <path d="M66 57V60M63 60C64.5 62 67.5 62 69 60" stroke="#3F3534" strokeWidth="1.8" strokeLinecap="round" />

    {/* Front Paws resting */}
    <ellipse cx="54" cy="100" rx="7" ry="5" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" />
    <ellipse cx="78" cy="100" rx="7" ry="5" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" />
  </svg>
);

/**
 * 6. Cute White Cat Sleeping on Stacked Books (SVG Illustration)
 */
export const CuteCatSleeping: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Bottom Book (Lavender) */}
    <rect x="14" y="90" width="86" height="15" rx="3" fill="#DDD6FE" stroke="#8B5CF6" strokeWidth="2" />
    <line x1="20" y1="97" x2="80" y2="97" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />

    {/* Middle Book (Mint) */}
    <rect x="18" y="76" width="80" height="15" rx="3" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
    <line x1="24" y1="83" x2="74" y2="83" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />

    {/* Top Book (Pink/Coral) */}
    <rect x="22" y="62" width="72" height="15" rx="3" fill="#FECDD3" stroke="#E11D48" strokeWidth="2" />
    <line x1="28" y1="69" x2="68" y2="69" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />

    {/* Sleeping Cat */}
    <ellipse cx="62" cy="50" rx="26" ry="18" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" />

    {/* Ears flat */}
    <path d="M42 40L38 30L50 37Z" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" strokeLinejoin="round" />
    <path d="M43 38L40 33L48 37Z" fill="#FBCFE8" />

    <path d="M78 40L82 30L70 37Z" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" strokeLinejoin="round" />
    <path d="M77 38L80 33L72 37Z" fill="#FBCFE8" />

    {/* Sleeping Eyes (curved lines) */}
    <path d="M52 48C54 51 57 51 59 48" stroke="#3F3534" strokeWidth="2" strokeLinecap="round" />
    <path d="M66 48C68 51 71 51 73 48" stroke="#3F3534" strokeWidth="2" strokeLinecap="round" />

    {/* Blush & Nose */}
    <ellipse cx="48" cy="52" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="77" cy="52" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.8" />
    <path d="M62 52L63 53L64 52" stroke="#3F3534" strokeWidth="1.5" strokeLinecap="round" />

    {/* Zzz floating */}
    <text x="86" y="32" fontSize="12" fontWeight="bold" fill="#F472B6" fontFamily="sans-serif">z</text>
    <text x="94" y="24" fontSize="10" fontWeight="bold" fill="#F472B6" fontFamily="sans-serif">z</text>
    <text x="100" y="16" fontSize="8" fontWeight="bold" fill="#F472B6" fontFamily="sans-serif">z</text>
  </svg>
);

/**
 * 7. Cute Peeking Cat Doodle
 */
export const CuteCatPeeking: React.FC<{ className?: string }> = ({ className = 'w-16 h-12' }) => (
  <svg viewBox="0 0 60 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ears */}
    <path d="M12 28L8 10L24 22Z" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" strokeLinejoin="round" />
    <path d="M13 24L10 14L20 22Z" fill="#FBCFE8" />

    <path d="M48 28L52 10L36 22Z" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" strokeLinejoin="round" />
    <path d="M47 24L50 14L40 22Z" fill="#FBCFE8" />

    {/* Head Arc */}
    <path d="M10 40C10 20 50 20 50 40" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" />

    {/* Eyes & Face */}
    <circle cx="23" cy="29" r="2.5" fill="#3F3534" />
    <circle cx="37" cy="29" r="2.5" fill="#3F3534" />
    <circle cx="24" cy="28" r="0.8" fill="#FFFFFF" />
    <circle cx="38" cy="28" r="0.8" fill="#FFFFFF" />
    <ellipse cx="17" cy="33" rx="2.5" ry="1.5" fill="#FDA4AF" />
    <ellipse cx="43" cy="33" rx="2.5" ry="1.5" fill="#FDA4AF" />
    <path d="M28 32C29 34 31 34 32 32" stroke="#3F3534" strokeWidth="1.5" strokeLinecap="round" />

    {/* Tiny Paws peeking */}
    <ellipse cx="18" cy="40" rx="5" ry="3.5" fill="#FFFFFF" stroke="#3F3534" strokeWidth="1.5" />
    <ellipse cx="42" cy="40" rx="5" ry="3.5" fill="#FFFFFF" stroke="#3F3534" strokeWidth="1.5" />
  </svg>
);

/**
 * 8. Cute Chibi Boy Illustration (Akshay / Defense Aspirant)
 */
export const CuteChibiBoy: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Backpack Straps */}
    <rect x="20" y="44" width="8" height="24" rx="4" fill="#047857" stroke="#3F3534" strokeWidth="2" />
    <rect x="52" y="44" width="8" height="24" rx="4" fill="#047857" stroke="#3F3534" strokeWidth="2" />

    {/* Green Hoodie */}
    <path d="M22 52C22 46 58 46 58 52L62 76H18L22 52Z" fill="#10B981" stroke="#3F3534" strokeWidth="2.5" />
    <path d="M34 52L40 62L46 52" stroke="#3F3534" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Head */}
    <circle cx="40" cy="32" r="18" fill="#FFE4D6" stroke="#3F3534" strokeWidth="2" />

    {/* Dark Brown Messy Hair */}
    <path
      d="M22 30C22 18 30 14 40 14C50 14 58 18 58 30C58 26 54 22 48 24C44 19 36 21 34 26C30 23 24 26 22 30Z"
      fill="#451A03"
      stroke="#3F3534"
      strokeWidth="2"
    />

    {/* Big Shiny Eyes */}
    <ellipse cx="33" cy="33" rx="3.5" ry="4.5" fill="#1E293B" />
    <ellipse cx="47" cy="33" rx="3.5" ry="4.5" fill="#1E293B" />
    <circle cx="34" cy="31" r="1.5" fill="#FFFFFF" />
    <circle cx="48" cy="31" r="1.5" fill="#FFFFFF" />

    {/* Smile & Blush */}
    <ellipse cx="28" cy="38" rx="3" ry="1.8" fill="#F87171" opacity="0.75" />
    <ellipse cx="52" cy="38" rx="3" ry="1.8" fill="#F87171" opacity="0.75" />
    <path d="M37 38C38.5 40 41.5 40 43 38" stroke="#3F3534" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * 9. Cute Chibi Girl Doctor Illustration (Dr. Vamp / Future Doctor)
 */
export const CuteChibiGirl: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* White Doctor Coat & Blue Scrubs */}
    <path d="M22 52C22 46 58 46 58 52L62 76H18L22 52Z" fill="#38BDF8" stroke="#3F3534" strokeWidth="2.5" />
    <path d="M18 52L26 76H54L62 52H52L40 60L28 52H18Z" fill="#FFFFFF" stroke="#3F3534" strokeWidth="2" />

    {/* Stethoscope */}
    <path d="M30 52C30 62 50 62 50 52" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="40" cy="62" r="3" fill="#CBD5E1" stroke="#3F3534" strokeWidth="1.5" />

    {/* Long Dark Brown Hair (behind) */}
    <path d="M20 36C18 54 20 68 24 72H56C60 68 62 54 60 36" fill="#3B1D11" />

    {/* Head */}
    <circle cx="40" cy="32" r="18" fill="#FFE4D6" stroke="#3F3534" strokeWidth="2" />

    {/* Front Hair with bangs */}
    <path
      d="M22 28C22 16 32 12 40 12C48 12 58 16 58 28C55 24 49 22 44 26C40 20 34 22 31 27C27 24 23 25 22 28Z"
      fill="#3B1D11"
      stroke="#3F3534"
      strokeWidth="2"
    />

    {/* Shiny Eye & Playful Wink */}
    <ellipse cx="33" cy="33" rx="3.5" ry="4.5" fill="#1E293B" />
    <circle cx="34" cy="31" r="1.5" fill="#FFFFFF" />
    <path d="M44 33C46 31 49 31 51 33" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

    {/* Smile & Blush */}
    <ellipse cx="28" cy="38" rx="3" ry="1.8" fill="#F87171" opacity="0.75" />
    <ellipse cx="52" cy="38" rx="3" ry="1.8" fill="#F87171" opacity="0.75" />
    <path d="M37 38C38.5 40 41.5 40 43 38" stroke="#3F3534" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * 10. Globe on Stacked Books Illustration
 */
export const GlobeOnBooks: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Bottom Book */}
    <rect x="20" y="94" width="80" height="14" rx="3" fill="#E9D5FF" stroke="#7E22CE" strokeWidth="2" />
    <text x="36" y="104" fontSize="7" fontWeight="bold" fill="#6B21A8">Together</text>

    {/* Middle Book */}
    <rect x="22" y="82" width="76" height="13" rx="3" fill="#FED7AA" stroke="#EA580C" strokeWidth="2" />
    <text x="36" y="91" fontSize="7" fontWeight="bold" fill="#C2410C">Support</text>

    {/* Top Book */}
    <rect x="25" y="71" width="70" height="12" rx="3" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
    <text x="38" y="79" fontSize="7" fontWeight="bold" fill="#A16207">Learn</text>

    {/* Globe Stand */}
    <path d="M60 70V58M50 71H70" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 42C42 54 78 54 78 42" stroke="#475569" strokeWidth="2.5" fill="none" />

    {/* Globe Sphere */}
    <circle cx="60" cy="38" r="18" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
    {/* Continents (Green blobs) */}
    <path d="M52 30C55 28 62 29 64 34C60 38 54 36 52 30Z" fill="#86EFAC" />
    <path d="M64 42C67 40 73 42 71 47C66 49 63 46 64 42Z" fill="#86EFAC" />
    <path d="M48 42C49 46 54 48 53 50C48 50 46 45 48 42Z" fill="#86EFAC" />
  </svg>
);
