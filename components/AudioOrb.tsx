import React, { useEffect, useRef } from 'react';

interface AudioOrbProps {
  isActive: boolean;
  volume: number; // 0.0 to 1.0
  className?: string;
  theme?: 'dark' | 'light'; // Explicitly pass theme to handle canvas colors
}

export const AudioOrb: React.FC<AudioOrbProps> = ({ isActive, volume, className = '', theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  // Define colors based on theme
  const colors = {
    dark: {
      coreActive: '#ffffff',
      coreIdle: '#475569',
      glowStart: 'rgba(99, 102, 241, 0.8)',
      glowEnd: 'rgba(139, 92, 246, 0.4)',
      ring1: 'rgba(139, 92, 246, ',
      ring2: 'rgba(99, 102, 241, '
    },
    light: {
      coreActive: '#4338ca', // Indigo 700
      coreIdle: '#94a3b8',   // Slate 400
      glowStart: 'rgba(67, 56, 202, 0.6)',
      glowEnd: 'rgba(124, 58, 237, 0.3)',
      ring1: 'rgba(124, 58, 237, ',
      ring2: 'rgba(67, 56, 202, '
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    
    // Scale canvas for retina
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const baseRadius = Math.min(rect.width, rect.height) * 0.25;

    const currentColors = colors[theme] || colors.dark;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      time += 0.05;
      
      const scale = isActive ? 1 + (volume * 1.5) : 0.8 + (Math.sin(time) * 0.05);
      const currentRadius = baseRadius * scale;
      
      // Core Gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius * 1.5);
      if (isActive) {
        gradient.addColorStop(0, currentColors.glowStart);
        gradient.addColorStop(0.5, currentColors.glowEnd);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        gradient.addColorStop(0, theme === 'light' ? 'rgba(203, 213, 225, 0.5)' : 'rgba(51, 65, 85, 0.5)'); 
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Outer Rings (Orbitals)
      if (isActive) {
        ctx.strokeStyle = `${currentColors.ring1}${0.3 + (volume * 0.5)})`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, currentRadius * 1.2, currentRadius * 1.1, time, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `${currentColors.ring2}${0.3 + (volume * 0.5)})`;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, currentRadius * 1.3, currentRadius * 1.4, -time * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? currentColors.coreActive : currentColors.coreIdle;
      ctx.fill();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, volume, theme]);

  return <canvas ref={canvasRef} className={`w-64 h-64 ${className}`} />;
};