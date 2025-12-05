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
    <div className="w-full xl:w-1/3 bg-wes-800 rounded-xl border border-wes-700 flex flex-col overflow-hidden shadow-xl">
      <div className="p-5 border-b border-wes-700 bg-wes-800">
        <h2 className="text-lg font-bold text-white flex items-center">
          <i className="fa-solid fa-satellite-dish mr-3 text-wes-accent"></i>
          Mission Control
        </h2>
        <p className="text-sm text-slate-400">Define generation parameters.</p>
      </div>
      
      <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Channel Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Channel</label>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(CHANNELS).map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`flex items-center p-3 rounded-lg border transition-all duration-200 group ${
                  selectedChannel === channel.id
                    ? `bg-wes-700 border-wes-accent shadow-[0_0_15px_rgba(59,130,246,0.15)] translate-x-1`
                    : 'bg-wes-900 border-wes-700 hover:border-slate-500 opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full bg-wes-900 flex items-center justify-center mr-3 ${channel.color} group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${channel.icon}`}></i>
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm text-slate-200">{channel.name}</div>
                  <div className="text-xs text-slate-500 truncate w-48">{channel.persona}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Concept / Topic</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The future of AI agents in 2025..."
            className="w-full h-24 bg-wes-900 border border-wes-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-wes-accent resize-none placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Mood & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mood</label>
            <select 
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-wes-900 border border-wes-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-wes-accent"
            >
              {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as any)}
              className="w-full bg-wes-900 border border-wes-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-wes-accent"
            >
              <option value="Short (<60s)">Short (&lt;60s)</option>
              <option value="Medium (5-8m)">Medium (5-8m)</option>
              <option value="Long (15m+)">Long (15m+)</option>
            </select>
          </div>
        </div>

      </div>

      <div className="p-5 border-t border-wes-700 bg-wes-800">
        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          className={`w-full py-4 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2
            ${loading || !topic 
              ? 'bg-wes-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/50 hover:shadow-blue-900/70 active:scale-[0.98]'
            }`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-bolt"></i>
              <span>Generate Package</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};