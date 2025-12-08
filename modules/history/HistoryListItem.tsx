import React from 'react';
import { GeneratedPackage, ChannelId } from '../../types';
import { CHANNELS } from '../../constants';
import { formatDate } from '../../lib/utils';

interface HistoryListItemProps {
  item: GeneratedPackage;
  isSelected: boolean;
  onSelect: (item: GeneratedPackage) => void;
  onDownload: (e: React.MouseEvent, item: GeneratedPackage) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const HistoryListItem: React.FC<HistoryListItemProps> = ({
  item,
  isSelected,
  onSelect,
  onDownload,
  onDelete
}) => {
  const channel = item.channelId ? CHANNELS[item.channelId] : CHANNELS[ChannelId.TECH];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item);
    }
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={() => onSelect(item)}
      onKeyDown={handleKeyDown}
      className={`p-4 rounded-lg border cursor-pointer transition-all group relative outline-none focus-visible:ring-2 focus-visible:ring-wes-accent ${
        isSelected
          ? 'bg-wes-700/50 border-wes-accent shadow-md'
          : 'bg-wes-900 border-wes-700 hover:border-wes-600 hover:bg-wes-800/50'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${channel.color.replace('text-','bg-')}`}></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{channel.name}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{formatDate(item.createdAt)}</span>
      </div>
      
      {/* Title: Uses slate-200 (Dark in Light Mode, Light in Dark Mode) */}
      <h3 className={`font-bold text-sm mb-1 line-clamp-1 transition-colors ${isSelected ? 'text-wes-accent' : 'text-slate-200 group-hover:text-wes-accent'}`}>
        {item.title}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
        {item.description}
      </p>
      
      {/* Actions: Visible on focus-within for keyboard users, or group hover for mouse users */}
      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
         <button 
           onClick={(e) => onDownload(e, item)}
           className="p-1.5 text-slate-500 hover:text-wes-accent hover:bg-wes-800 rounded focus:opacity-100 focus:outline-none focus:text-wes-accent"
           title="Download JSON"
           aria-label={`Download ${item.title}`}
         >
           <i className="fa-solid fa-download"></i>
         </button>
         <button 
           onClick={(e) => onDelete(e, item.id || '')}
           className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-wes-800 rounded focus:opacity-100 focus:outline-none focus:text-red-400"
           title="Delete"
           aria-label={`Delete ${item.title}`}
         >
           <i className="fa-solid fa-trash"></i>
         </button>
      </div>
    </div>
  );
};