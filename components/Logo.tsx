import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", withText = false }) => (
  <div className="flex items-center gap-2">
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wesLogoGradient" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
          <stop offset="50%" stopColor="#818cf8" /> {/* Indigo-400 */}
          <stop offset="100%" stopColor="#c084fc" /> {/* Purple-400 */}
        </linearGradient>
      </defs>
      <path 
        d="M48 72 L88 200 L128 96 L168 200 L208 72" 
        stroke="url(#wesLogoGradient)" 
        strokeWidth="32" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
    {withText && (
      <span className="text-xl font-bold tracking-wider text-wes-accent">
        WES<span className="text-white">TUBE</span>
      </span>
    )}
  </div>
);