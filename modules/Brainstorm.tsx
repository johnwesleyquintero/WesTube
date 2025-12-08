
import React, { useState, useEffect, useRef } from 'react';
import { useLiveConnection } from '../hooks/useLiveConnection';
import { ChannelId } from '../types';
import { CHANNELS } from '../constants';
import { ChannelSelector } from './generator/ChannelSelector';
import { AudioOrb } from '../components/AudioOrb';
import { CopyButton } from '../components/CopyButton';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';

interface BrainstormProps {
  onNavigate?: (view: string) => void;
}

export const Brainstorm: React.FC<BrainstormProps> = ({ onNavigate }) => {
  const [selectedChannel, setSelectedChannel] = useState<ChannelId>(ChannelId.TECH);
  const { 
    connect, 
    disconnect, 
    isConnected, 
    isMuted, 
    toggleMute, 
    volume, 
    transcripts, 
    error 
  } = useLiveConnection(selectedChannel);
  
  const { setProjectData } = useProject();
  const toast = useToast();

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const activeChannelConfig = CHANNELS[selectedChannel];

  const handleSynthesize = () => {
    if (transcripts.length === 0) return;

    // Combine transcript into a context block
    const fullTranscript = transcripts.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n');
    const topicSummary = `Actionable Item from Neural Link Session (${new Date().toLocaleDateString()}):\n\n${fullTranscript}`;

    // Inject into Project Context
    setProjectData({
      topic: topicSummary,
      channelId: selectedChannel,
      brainstormContext: fullTranscript
    });

    toast.success("Neural data linked to Generator.");

    // Navigate to Dashboard/Generator
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full overflow-hidden animate-fadeIn">
      
      {/* Left: Controls & Visuals */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        
        {/* Main Stage */}
        <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex flex-col items-center justify-center bg-wes-950/40 shadow-2xl">
           
           {/* Background Ambiance */}
           <div className={`absolute inset-0 transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-20'}`}>
              <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full filter blur-[100px] opacity-20 animate-pulse-slow ${activeChannelConfig.color.replace('text-', 'bg-')}`}></div>
           </div>

           {/* Header Overlay */}
           <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-wes-success animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                {isConnected ? 'Neural Link Active' : 'System Offline'}
              </span>
           </div>

           {/* The Orb */}
           <div className="relative z-10 mb-12">
              <AudioOrb isActive={isConnected} volume={volume} />
              <div className="text-center mt-6">
                 <h2 className="text-2xl font-bold text-slate-200 tracking-tight flex items-center justify-center gap-3">
                   {activeChannelConfig.persona}
                 </h2>
                 <p className="text-sm text-slate-400 font-mono mt-2 uppercase tracking-widest">
                   {isConnected ? 'Listening...' : 'Ready to Connect'}
                 </p>
              </div>
           </div>

           {/* Control Deck */}
           <div className="absolute bottom-10 z-20 flex items-center gap-6">
              {!isConnected ? (
                <button 
                  onClick={connect}
                  className="px-8 py-4 bg-wes-accent hover:bg-indigo-500 text-white rounded-full font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:scale-105 transition-all flex items-center gap-3"
                >
                  <i className="fa-solid fa-bolt"></i>
                  Initialize Link
                </button>
              ) : (
                <>
                  <button 
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${isMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-wes-800/50 border-white/10 text-white hover:bg-wes-700'}`}
                  >
                    <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
                  </button>

                  <button 
                    onClick={disconnect}
                    className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Terminate
                  </button>
                </>
              )}
           </div>

           {error && (
             <div className="absolute top-6 right-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-xs font-bold animate-fadeIn">
               <i className="fa-solid fa-triangle-exclamation mr-2"></i>
               {error}
             </div>
           )}
        </div>
      </div>

      {/* Right: Transcript & Config */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
         
         {/* Channel Select (Only when offline) */}
         {!isConnected && (
            <div className="glass-panel p-6 rounded-2xl animate-fadeIn">
               <ChannelSelector selectedChannel={selectedChannel} onSelect={setSelectedChannel} />
            </div>
         )}

         {/* Transcript Log */}
         <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col overflow-hidden bg-wes-900/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                 <i className="fa-solid fa-align-left text-wes-pop"></i>
                 Neural Log
              </h3>
              {/* Synthesize Button - The Neural Bridge */}
              {transcripts.length > 0 && onNavigate && (
                 <button 
                   onClick={handleSynthesize}
                   className="text-[10px] bg-wes-success/10 text-wes-success hover:bg-wes-success/20 border border-wes-success/20 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center gap-2 animate-fadeIn"
                 >
                   <i className="fa-solid fa-wand-magic-sparkles"></i>
                   Synthesize Package
                 </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
               {transcripts.length === 0 ? (
                  <div className="text-center text-slate-500 mt-20">
                     <i className="fa-regular fa-comments text-3xl mb-3 opacity-30"></i>
                     <p className="text-xs">No data captured.</p>
                  </div>
               ) : (
                  transcripts.map((turn, i) => (
                     <div key={i} className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`
                           max-w-[90%] rounded-xl p-3 text-xs leading-relaxed
                           ${turn.role === 'user' 
                              ? 'bg-wes-accent/20 text-slate-200 border border-wes-accent/30 rounded-tr-none' 
                              : 'bg-wes-800 text-slate-300 border border-wes-700 rounded-tl-none'}
                        `}>
                           {turn.text}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                           {turn.role === 'user' ? 'You' : 'WesAI'} • {turn.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                     </div>
                  ))
               )}
               <div ref={transcriptEndRef} />
            </div>

            {/* Export Action */}
            {transcripts.length > 0 && (
               <div className="mt-4 pt-4 border-t border-wes-700 flex justify-end">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-slate-500 uppercase font-bold">Copy Transcript</span>
                     <CopyButton text={transcripts.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n')} />
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};