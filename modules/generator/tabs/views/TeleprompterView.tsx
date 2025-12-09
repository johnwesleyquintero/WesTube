
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedPackage } from '../../../../types';

interface TeleprompterViewProps {
  result: GeneratedPackage;
  onClose: () => void;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({ result, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1-10
  const [fontSize, setFontSize] = useState(4); // 1-7 (xl to 7xl)
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorY, setMirrorY] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Auto-scroll logic
  const animate = (time: number) => {
    if (lastTimeRef.current !== 0 && scrollRef.current && isPlaying) {
      // Speed multiplier
      const delta = (time - lastTimeRef.current) * (speed * 0.05);
      scrollRef.current.scrollTop += delta;
    }
    lastTimeRef.current = time;
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0; // Reset time to prevent jumps
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, speed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      if (e.code === 'Escape') {
        onClose();
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSpeed(prev => Math.min(prev + 1, 10));
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSpeed(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fontSizeClasses = [
    'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl'
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-fadeIn font-sans selection:bg-white selection:text-black">
      
      {/* Safe Area Markers (Center Line) */}
      <div className="absolute top-1/2 left-4 right-4 h-px bg-red-500/20 pointer-events-none z-10 flex justify-between items-center">
        <i className="fa-solid fa-caret-right text-red-500"></i>
        <i className="fa-solid fa-caret-left text-red-500"></i>
      </div>

      {/* Main Scrolling Area */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative px-8 md:px-32 py-[50vh] ${mirrorX ? '-scale-x-100' : ''} ${mirrorY ? '-scale-y-100' : ''}`}
        onClick={() => setIsPlaying(!isPlaying)}
      >
        <div className={`max-w-5xl mx-auto font-bold leading-relaxed transition-all duration-300 ${fontSizeClasses[fontSize]}`}>
           {/* Intro */}
           <div className="mb-24 text-center opacity-50 pb-12 border-b border-white/20">
              <h1 className="uppercase tracking-widest text-[0.5em] text-wes-accent mb-4">Start Recording</h1>
              <p className="text-[0.8em]">{result.title}</p>
           </div>

           {/* Script Body */}
           {result.script.map((scene, idx) => (
             <div key={idx} className="mb-16">
                {/* Visual Cue - Muted */}
                <div className="text-[0.4em] font-mono text-indigo-400 mb-4 uppercase tracking-wider bg-indigo-900/30 inline-block px-3 py-1 rounded">
                   [{scene.visual}]
                </div>
                
                {/* Spoken Text - Bright */}
                <div className="text-white drop-shadow-md">
                   {scene.audio}
                </div>
             </div>
           ))}

           {/* Outro */}
           <div className="mt-24 text-center opacity-50 pt-12 border-t border-white/20">
              <p className="uppercase tracking-widest text-[0.5em] text-red-500">End Recording</p>
           </div>
        </div>
      </div>

      {/* Controls Bar (Glassmorphism) */}
      <div className="h-20 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-6 shrink-0 relative z-20">
         
         <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-white text-black' : 'bg-wes-accent text-white hover:bg-indigo-500'}`}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
            <div className="text-xs text-slate-400 font-mono hidden md:block">
               PRESS [SPACE] TO TOGGLE
            </div>
         </div>

         {/* Settings Cluster */}
         <div className="flex items-center gap-6">
            
            {/* Speed Control */}
            <div className="flex flex-col items-center gap-1 w-32">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scroll Speed</label>
               <input 
                 type="range" 
                 min="0" 
                 max="10" 
                 step="0.5"
                 value={speed}
                 onChange={(e) => setSpeed(parseFloat(e.target.value))}
                 className="w-full accent-wes-accent h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
               />
            </div>

            <div className="w-px h-8 bg-white/10 hidden md:block"></div>

            {/* Font Size */}
            <div className="flex flex-col items-center gap-1 w-32 hidden md:flex">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Text Size</label>
               <input 
                 type="range" 
                 min="0" 
                 max="7" 
                 step="1"
                 value={fontSize}
                 onChange={(e) => setFontSize(parseInt(e.target.value))}
                 className="w-full accent-wes-pop h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
               />
            </div>

            <div className="w-px h-8 bg-white/10 hidden md:block"></div>

            {/* Mirror Controls */}
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setMirrorX(!mirrorX)}
                 className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${mirrorX ? 'bg-wes-accent text-white border-wes-accent' : 'border-white/20 text-slate-400 hover:text-white'}`}
                 title="Flip Horizontal"
               >
                 <i className="fa-solid fa-arrows-left-right text-xs"></i>
               </button>
               <button 
                 onClick={() => setMirrorY(!mirrorY)}
                 className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${mirrorY ? 'bg-wes-accent text-white border-wes-accent' : 'border-white/20 text-slate-400 hover:text-white'}`}
                 title="Flip Vertical"
               >
                 <i className="fa-solid fa-arrows-up-down text-xs"></i>
               </button>
            </div>
         </div>

         <button 
            onClick={onClose}
            className="ml-6 px-4 py-2 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors border border-transparent hover:border-white/20"
         >
            Exit Studio
         </button>
      </div>
    </div>
  );
};
