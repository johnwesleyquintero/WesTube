import React, { useEffect, useState, useRef } from 'react';
import { GeneratedPackage, ScriptScene } from '../../../types';
import { AudioOrb } from '../../../components/AudioOrb';

interface DirectorPreviewProps {
  result: GeneratedPackage;
  playAudio: (text: string, idx: number) => Promise<void>;
  onClose: () => void;
  voiceName: string;
}

export const DirectorPreview: React.FC<DirectorPreviewProps> = ({ 
  result, 
  playAudio, 
  onClose,
  voiceName 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Simulated volume for visualization
  const [simulatedVolume, setSimulatedVolume] = useState(0);
  
  const cancelledRef = useRef(false);
  const animationFrameRef = useRef<number>(0);

  // Visualization loop: When playing, generate "fake" volume data to make the Orb alive
  // Since we are using raw audio buffers, real-time analysis requires deeper refactoring.
  // This simulation provides 90% of the UX value.
  const animateOrb = () => {
    if (isPlaying) {
      // Random fluctuation between 0.3 and 0.8
      const volatility = Math.random() * 0.5 + 0.3;
      setSimulatedVolume(volatility);
    } else {
      setSimulatedVolume(0);
    }
    animationFrameRef.current = requestAnimationFrame(animateOrb);
  };

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateOrb);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying]);

  const startSequence = async () => {
    setIsInitializing(false);
    setIsPlaying(true);
    cancelledRef.current = false;

    // Iterate through scenes
    for (let i = 0; i < result.script.length; i++) {
      if (cancelledRef.current) break;
      setCurrentIndex(i);
      
      try {
        // Play Audio and wait for it to finish
        await playAudio(result.script[i].audio, i);
      } catch (e) {
        console.error("Playback error:", e);
        // If error, wait a small duration to simulate reading time
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    
    setIsPlaying(false);
  };

  useEffect(() => {
    let timer: number;
    // Auto-start after a brief buffer
    if (isInitializing) {
      timer = window.setTimeout(startSequence, 1000);
    }
    return () => {
      clearTimeout(timer);
      cancelledRef.current = true;
    };
  }, []);

  const currentScene: ScriptScene = result.script[currentIndex];

  return (
    <div className="fixed inset-0 z-[60] bg-wes-950/95 flex flex-col items-center justify-center animate-fadeIn backdrop-blur-sm">
      
      {/* Visual Stage */}
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 group">
        
        {/* Visual Layer */}
        {currentScene.generatedVisual ? (
           <img 
             src={currentScene.generatedVisual} 
             className="w-full h-full object-cover animate-fadeIn duration-1000 opacity-80 group-hover:opacity-40 transition-opacity"
             alt={`Scene ${currentIndex}`}
           />
        ) : (
           <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-wes-900 to-black">
              <i className="fa-solid fa-clapperboard text-6xl text-wes-800 mb-6 animate-pulse"></i>
           </div>
        )}

        {/* The Director's Orb - Visualizing the AI Voice */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
           <div className="relative">
              {/* Orb Container */}
              <AudioOrb 
                 isActive={isPlaying} 
                 volume={simulatedVolume} 
                 className="w-64 h-64 md:w-96 md:h-96 opacity-90 mix-blend-screen"
              />
              {!currentScene.generatedVisual && (
                  <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 text-4xl font-bold font-mono pointer-events-none">
                    NO SIGNAL
                  </p>
              )}
           </div>
        </div>

        {/* Subtitle Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-24 pb-12 px-12 text-center z-20">
           <p className="text-xl md:text-3xl font-medium text-white drop-shadow-2xl leading-relaxed font-sans text-balance">
             "{currentScene.audio}"
           </p>
           <p className="text-sm text-wes-accent mt-4 font-mono uppercase tracking-widest opacity-80">
              {currentScene.visual}
           </p>
        </div>

        {/* Status Indicators */}
        <div className="absolute top-6 left-6 z-30 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-3">
           <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
           <span className="text-xs font-bold text-white uppercase tracking-widest">
             REC • Scene {currentIndex + 1}/{result.script.length}
           </span>
        </div>

        {/* Voice Indicator */}
        <div className="absolute top-6 right-6 z-30 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <i className="fa-solid fa-wave-square text-wes-accent text-xs"></i>
            <span className="text-xs font-mono text-slate-300 uppercase tracking-widest">
                Voice: {voiceName}
            </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-6">
         <button 
           onClick={onClose}
           className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full font-bold uppercase tracking-widest transition-all border border-white/5 hover:border-white/20"
         >
           Cut / Exit
         </button>
         
         {!isPlaying && !isInitializing && (
            <button 
              onClick={startSequence}
              className="px-8 py-3 bg-wes-accent hover:bg-indigo-500 text-white rounded-full font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
            >
              <i className="fa-solid fa-rotate-right"></i>
              Replay Sequence
            </button>
         )}
      </div>

    </div>
  );
};