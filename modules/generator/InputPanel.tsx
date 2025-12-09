import React from 'react';
import { MOODS, DURATIONS, VISUAL_STYLES, VOICES } from '../../constants';
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
    visualStyle: string;
    setVisualStyle: (val: string) => void;
    voice: string;
    setVoice: (val: string) => void;
    activeChannelConfig: ChannelConfig;
    hasContext?: boolean;
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
    useResearch, setUseResearch,
    visualStyle, setVisualStyle,
    voice, setVoice,
    hasContext
  } = formState;

  return (
    <div className="w-full xl:w-1/3 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-wes-950/20 max-h-[calc(100vh-8rem)] xl:max-h-full">
      <div className="p-4 md:p-6 border-b border-wes-700 bg-wes-800/30">
        <h2 className="text-lg font-bold text-slate-200 flex items-center tracking-tight">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-wes-accent/20 text-wes-accent mr-3 border border-wes-accent/20">
             <i className="fa-solid fa-satellite-dish text-sm"></i>
          </span>
          Mission Control
        </h2>
        <p className="text-xs text-slate-500 mt-1 ml-11 hidden sm:block">Configure production parameters.</p>
      </div>
      
      <div className="p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Channel Selector */}
        <ChannelSelector 
          selectedChannel={selectedChannel} 
          onSelect={setSelectedChannel} 
        />

        {/* Topic Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Concept / Topic</label>
            {hasContext && (
               <span className="text-[10px] font-bold text-wes-success animate-pulse flex items-center gap-1">
                 <i className="fa-solid fa-link"></i> Neural Link Active
               </span>
            )}
          </div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Describe your video concept..."
            className={`w-full h-24 md:h-32 glass-input rounded-xl p-4 text-sm text-slate-200 placeholder-slate-400 resize-none font-medium focus:outline-none focus:border-wes-accent focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all ${hasContext ? 'border-wes-success/30 bg-wes-success/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`}
          />
        </div>

        {/* Research Toggle */}
        <div className="glass-panel p-4 rounded-xl border border-wes-700 bg-wes-800/30">
           <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold text-wes-pop uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-brands fa-google"></i>
                  Deep Research
                </label>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">Ground content in live web data.</p>
              </div>
              
              <button 
                onClick={() => setUseResearch(!useResearch)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative border ${useResearch ? 'bg-wes-pop border-wes-pop' : 'bg-wes-700 border-wes-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-md ${useResearch ? 'left-7' : 'left-1'}`}></div>
              </button>
           </div>
        </div>

        {/* Director's Overrides */}
        <div className="space-y-4 pt-2 border-t border-wes-700/50">
             <div className="flex items-center gap-2 mb-2">
                 <i className="fa-solid fa-sliders text-slate-400 text-xs"></i>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Director's Overrides</h3>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassSelect 
                  label="Visual Aesthetic"
                  options={VISUAL_STYLES}
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                />
                <GlassSelect 
                  label="Narrator Voice"
                  options={VOICES}
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                />
             </div>
        </div>

        {/* Mood & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="p-4 md:p-6 border-t border-wes-700 bg-wes-800/30">
        <button
          onClick={onGenerate}
          disabled={loading || !topic}
          className={`w-full py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-3
            ${loading || !topic 
              ? 'bg-wes-800 text-slate-500 border border-wes-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-wes-accent to-wes-pop text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.02] border border-transparent'
            }`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-brain fa-pulse text-sm"></i>
              <div className="flex flex-col items-start leading-none ml-2">
                 <span>REASONING ACTIVE</span>
                 <span className="text-[9px] opacity-80 font-normal normal-case mt-1">Planning structure...</span>
              </div>
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