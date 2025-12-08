import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", withText = false }) => (
  <div className="flex items-center gap-3">
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wesLogoGradient" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
          <stop offset="50%" stopColor="#a855f7" /> {/* Purple-500 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* Pink-500 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path 
        d="M48 72 L88 200 L128 96 L168 200 L208 72" 
        stroke="url(#wesLogoGradient)" 
        strokeWidth="32" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#glow)"
      />
    </svg>
    {withText && (
      <span className="text-xl font-bold tracking-widest text-slate-200">
        WES<span className="text-transparent bg-clip-text bg-gradient-to-r from-wes-accent to-wes-pop">TUBE</span>
      </span>
    )}
  </div>
);