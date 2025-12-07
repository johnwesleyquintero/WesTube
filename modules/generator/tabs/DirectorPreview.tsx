
import React, { useEffect, useState, useRef } from 'react';
import { GeneratedPackage, ScriptScene } from '../../../../types';

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
  const cancelledRef = useRef(false);

  const startSequence = async () => {
    setIsInitializing(false);
    setIsPlaying(true);
    cancelledRef.current = false;

    // Iterate through scenes
    for (let i = 0; i < result.script.length; i++) {
      if (cancelledRef.current) break;
      setCurrentIndex(i);

      // Scroll script into view (optional logic here)
      
      try {
        // Play Audio and wait for it to finish
        // The playAudio function from useAudio returns a promise that resolves on 'ended'
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
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center animate-fadeIn">
      
      {/* Visual Stage */}
      <div className="relative w-full max-w-5xl aspect-video bg-wes-950 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10">
        
        {/* Visual Layer */}
        {currentScene.generatedVisual ? (
           <img 
             src={currentScene.generatedVisual} 
             className="w-full h-full object-cover animate-fadeIn duration-1000"
             alt={`Scene ${currentIndex}`}
           />
        ) : (
           <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-wes-900 to-black">
              <i className="fa-solid fa-clapperboard text-6xl text-wes-800 mb-6 animate-pulse"></i>
              <p className="text-xl text-slate-300 font-serif italic max-w-2xl leading-relaxed">
                "{currentScene.visual}"
              </p>
           </div>
        )}

        {/* Subtitle Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-8 px-8 text-center">
           <p className="text-xl md:text-2xl font-medium text-white drop-shadow-md leading-relaxed font-sans">
             {currentScene.audio}
           </p>
        </div>

        {/* Status Indicators */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
           <span className="text-[10px] font-bold text-white uppercase tracking-widest">
             REC • Scene {currentIndex + 1}/{result.script.length}
           </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-6">
         <button 
           onClick={onClose}
           className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold uppercase tracking-widest transition-all hover:scale-105"
         >
           Stop Preview
         </button>
         
         {!isPlaying && !isInitializing && (
            <button 
              onClick={startSequence}
              className="px-6 py-3 bg-wes-accent hover:bg-indigo-500 text-white rounded-full font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Replay
            </button>
         )}
      </div>

      {/* Audio Context Hint */}
      <div className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono">
         Voice: {voiceName} • {isPlaying ? 'Streaming Audio...' : 'Paused'}
      </div>

    </div>
  );
};
