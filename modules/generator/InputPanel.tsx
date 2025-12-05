import React from 'react';
import { CHANNELS, MOODS } from '../../constants';
import { ChannelId, GenerationRequest } from '../../types';

interface InputPanelProps {
  topic: string;
  setTopic: (val: string) => void;
  selectedChannel: ChannelId;
  setSelectedChannel: (id: ChannelId) => void;
  mood: string;
  setMood: (val: string) => void;
  duration: GenerationRequest['duration'];
  setDuration: (val: GenerationRequest['duration']) => void;
  loading: boolean;
  handleGenerate: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  topic, setTopic,
  selectedChannel, setSelectedChannel,
  mood, setMood,
  duration, setDuration,
  loading, handleGenerate
}) => {
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
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Target Channel</label>
          <div className="grid grid-cols-1 gap-2.5">
            {Object.values(CHANNELS).map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`relative flex items-center p-3 rounded-xl border transition-all duration-300 group overflow-hidden ${
                  selectedChannel === channel.id
                    ? `bg-wes-accent/10 border-wes-accent/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]`
                    : 'bg-wes-900/40 border-white/5 hover:border-white/10 hover:bg-wes-900/60'
                }`}
              >
                {/* Active Glow Bar */}
                {selectedChannel === channel.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-wes-accent shadow-[0_0_10px_#6366f1]"></div>
                )}

                <div className={`w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center mr-4 ${channel.color} border border-white/5 group-hover:scale-105 transition-transform`}>
                  <i className={`fa-solid ${channel.icon} text-lg`}></i>
                </div>
                <div className="text-left">
                  <div className={`font-semibold text-sm ${selectedChannel === channel.id ? 'text-white' : 'text-slate-300'}`}>{channel.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{channel.persona}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Concept / Topic</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Describe your video concept..."
            className="w-full h-32 glass-input rounded-xl p-4 text-sm text-white placeholder-slate-600 resize-none font-medium"
          />
        </div>

        {/* Mood & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Mood</label>
            <div className="relative">
              <select 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full glass-input rounded-xl p-3 text-sm text-white appearance-none cursor-pointer"
              >
                {MOODS.map(m => <option key={m} value={m} className="bg-wes-900 text-slate-300">{m}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none"></i>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Duration</label>
            <div className="relative">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as any)}
                className="w-full glass-input rounded-xl p-3 text-sm text-white appearance-none cursor-pointer"
              >
                <option value="Short (<60s)" className="bg-wes-900 text-slate-300">Short (&lt;60s)</option>
                <option value="Medium (5-8m)" className="bg-wes-900 text-slate-300">Medium (5-8m)</option>
                <option value="Long (15m+)" className="bg-wes-900 text-slate-300">Long (15m+)</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none"></i>
            </div>
          </div>
        </div>

      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <button
          onClick={handleGenerate}
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
              <span>Initializing Neural Net...</span>
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