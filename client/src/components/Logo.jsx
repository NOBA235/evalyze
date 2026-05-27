import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none">
      
      {/* SVG ICON - Force-sized with inline style to prevent Tailwind 0px collapse */}
      <svg 
        style={{ width: '34px', height: '34px', display: 'block' }} 
        className="shrink-0 drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]"
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main e shape */}
        <path
          d="
          M 90 60
          C 90 32, 68 15, 45 22
          C 20 30, 10 60, 25 82
          C 40 104, 75 104, 90 82
          "
          stroke="#8b5cf6"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Eyes */}
        <circle cx="42" cy="53" r="5" fill="#6366f1" />
        <circle cx="60" cy="53" r="5" fill="#6366f1" />

        {/* Smile */}
        <path
          d="M 43 65 Q 51 74 59 65"
          stroke="#6366f1"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Spark */}
        <path
          d="M 78 18 Q 78 26 86 26 Q 78 26 78 34 Q 78 26 70 26 Q 78 26 78 18 Z"
          fill="#22d3ee"
        />
      </svg>

      {/* TEXT BRAND */}
      <span 
        style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-violet-600 lowercase"
      >
        evalyze
      </span>
    </div>
  );
};

export default Logo;