import React from 'react';
import { CHANNELS } from '../../constants';
import { ChannelId } from '../../types';

interface ChannelSelectorProps {
  selectedChannel: ChannelId;
  onSelect: (id: ChannelId) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({ selectedChannel, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Target Channel</label>
      <div className="grid grid-cols-1 gap-2.5">
        {Object.values(CHANNELS).map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelect(channel.id)}
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
  );
};
