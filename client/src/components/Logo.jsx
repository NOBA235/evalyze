import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* SVG ICON - Scales from 30px on mobile to 36px on desktop */}
      <svg 
        className="w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] shrink-0 drop-shadow-[0_4px_6px_rgba(139,92,246,0.12)]" 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Main e shape */}
        <path
          d="
          M 90 60
          C 90 32, 68 15, 45 22
          C 20 30, 10 60, 25 82
          C 40 104, 75 104, 90 82
          "
          stroke="url(#grad)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Eyes */}
        <circle cx="42" cy="53" r="4.5" fill="#6366f1" />
        <circle cx="60" cy="53" r="4.5" fill="#6366f1" />

        {/* Smile */}
        <path
          d="M 43 65 Q 51 74 59 65"
          stroke="#6366f1"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Spark */}
        <path
          d="M 78 18 Q 78 26 86 26 Q 78 26 78 34 Q 78 26 70 26 Q 78 26 78 18 Z"
          fill="#8b5cf6"
        />
      </svg>

      {/* TEXT - Scales from text-xl on mobile to text-2xl on desktop */}
      <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent lowercase select-none">
        evalyze
      </span>
    </div>
  );
};

export default Logo;