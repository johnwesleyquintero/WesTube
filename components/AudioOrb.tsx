
import React, { useEffect, useRef } from 'react';

interface AudioOrbProps {
  isActive: boolean;
  volume: number; // 0.0 to 1.0
  className?: string;
}

export const AudioOrb: React.FC<AudioOrbProps> = ({ isActive, volume, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
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

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      time += 0.05;
      
      // Calculate dynamic radius based on volume
      // Smooth out volume for jitter reduction could be done here, but assuming prop is relatively smooth
      const scale = isActive ? 1 + (volume * 1.5) : 0.8 + (Math.sin(time) * 0.05);
      const currentRadius = baseRadius * scale;
      
      // Core Gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius * 1.5);
      if (isActive) {
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)'); // Inner Indigo
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)'); // Mid Violet
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(51, 65, 85, 0.5)'); // Idle Slate
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Outer Rings (Orbitals)
      if (isActive) {
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + (volume * 0.5)})`;
        ctx.lineWidth = 2;
        
        // Ring 1
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, currentRadius * 1.2, currentRadius * 1.1, time, 0, Math.PI * 2);
        ctx.stroke();

        // Ring 2
        ctx.strokeStyle = `rgba(99, 102, 241, ${0.3 + (volume * 0.5)})`;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, currentRadius * 1.3, currentRadius * 1.4, -time * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#fff' : '#475569';
      ctx.fill();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, volume]);

  return <canvas ref={canvasRef} className={`w-64 h-64 ${className}`} />;
};
