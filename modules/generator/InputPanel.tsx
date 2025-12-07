


import React from 'react';
import { MOODS, DURATIONS } from '../../constants';
import { ChannelId, GenerationRequest, ChannelConfig } from '../../types';
import { GlassSelect } from '../../components/GlassSelect';
import { ChannelSelector } from './ChannelSelector';

interface InputPanelProps {
  formState: {
    topic: string;
    setTopic: (val: string) => void;
    selectedChannel: ChannelId;
    setSelectedChannel: (id: ChannelId) => void;
    mood: string;
    setMood: (val: string) => void;
    duration: GenerationRequest['duration'];
    setDuration: (val: GenerationRequest['duration']) => void;
    useResearch: boolean;
    setUseResearch: (val: boolean) => void;
    activeChannelConfig: ChannelConfig;
  };
  loading: boolean;
  onGenerate: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  formState,
  loading, 
  onGenerate
}) => {
  const { 
    topic, setTopic, 
    selectedChannel, setSelectedChannel, 
    mood, setMood, 
    duration, setDuration,
    useResearch, setUseResearch
  } = formState;

  return (
    <div className="w-full xl:w-1/3 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/50">
      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-lg font-bold text-white flex items-center tracking-tight">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-wes-accent/20 text-wes-accent mr-3 border border-wes-accent/20">
             <i className="fa-solid fa-satellite-dish text-sm"></i>
          </span>
          Mission Control
        </h2>
        <p className="text-xs text-slate-500 mt-1 ml-11">Configure production parameters.</p>
      </div>
      
      <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Channel Selector */}
        <ChannelSelector 
          selectedChannel={selectedChannel} 
          onSelect={setSelectedChannel} 
        />

        {/* Topic Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Concept / Topic</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Describe your video concept..."
            className="w-full h-32 glass-input rounded-xl p-4 text-sm text-white placeholder-slate-600 resize-none font-medium focus:outline-none focus:border-wes-accent focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all"
          />
        </div>

        {/* Research Toggle */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-wes-900/40">
           <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold text-wes-pop uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-brands fa-google"></i>
                  Deep Research
                </label>
                <p className="text-xs text-slate-500 mt-1">Ground content in live web data.</p>
              </div>
              
              <button 
                onClick={() => setUseResearch(!useResearch)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${useResearch ? 'bg-wes-pop' : 'bg-wes-800 border border-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-md ${useResearch ? 'left-7' : 'left-1'}`}></div>
              </button>
           </div>
        </div>

        {/* Mood & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <GlassSelect 
            label="Mood"
            options={MOODS}
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
          <GlassSelect 
            label="Duration"
            options={DURATIONS}
            value={duration}
            onChange={(e) => setDuration(e.target.value as any)}
          />
        </div>

      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <button
          onClick={onGenerate}
          disabled={loading || !topic}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-3
            ${loading || !topic 
              ? 'bg-wes-800/50 text-slate-600 border border-white/5 cursor-not-allowed' 
              : 'bg-gradient-to-r from-wes-accent to-wes-pop text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.02] border border-white/10'
            }`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
              <span>{useResearch ? "Researching & Generating..." : "Initializing Neural Net..."}</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-bolt text-sm"></i>
              <span>Generate Package</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};