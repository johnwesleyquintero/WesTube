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

  return (
    <div 
      onClick={() => onSelect(item)}
      className={`p-4 rounded-lg border cursor-pointer transition-all group ${
        isSelected
          ? 'bg-wes-700 border-wes-accent shadow-md'
          : 'bg-wes-900 border-wes-700 hover:border-slate-500 hover:bg-wes-900/80'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${channel.color.replace('text-','bg-')}`}></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{channel.name}</span>
        </div>
        <span className="text-[10px] text-slate-600 font-mono">{formatDate(item.createdAt)}</span>
      </div>
      
      <h3 className="font-bold text-slate-200 text-sm mb-1 line-clamp-1 group-hover:text-white transition-colors">
        {item.title}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
        {item.description}
      </p>
      
      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
           onClick={(e) => onDownload(e, item)}
           className="p-1.5 text-slate-500 hover:text-wes-accent hover:bg-wes-800 rounded"
           title="Download JSON"
         >
           <i className="fa-solid fa-download"></i>
         </button>
         <button 
           onClick={(e) => onDelete(e, item.id || '')}
           className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-wes-800 rounded"
           title="Delete"
         >
           <i className="fa-solid fa-trash"></i>
         </button>
      </div>
    </div>
  );
};
