
import React, { useState } from 'react';
import { Logo } from './Logo';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onOpenSettings }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`
        glass-panel border-r-0 border-r border-white/5 flex flex-col h-screen transition-all duration-300 relative z-20
        ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64
      `}
    >
      {/* Desktop Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-9 z-50 w-6 h-6 bg-wes-900 border border-wes-700 rounded-full items-center justify-center text-slate-400 hover:text-white hover:border-wes-accent transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <i className={`fa-solid fa-chevron-${isCollapsed ? 'right' : 'left'} text-[10px]`}></i>
      </button>

      {/* Header */}
      <div className={`p-6 h-24 flex items-center ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="transition-all duration-300 overflow-hidden whitespace-nowrap">
           <Logo withText={!isCollapsed} className="w-8 h-8 flex-shrink-0" />
           {!isCollapsed && (
             <div className="flex items-center mt-1 pl-11 -mt-3">
               <div className="w-1.5 h-1.5 rounded-full bg-wes-success animate-pulse mr-2"></div>
               <p className="text-[10px] text-wes-pop font-mono uppercase tracking-widest opacity-80 animate-fadeIn">
                 Engine v2.2
               </p>
             </div>
           )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar overflow-x-hidden">
        <ul className="space-y-2 px-3">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`
                  w-full flex items-center py-3 text-sm font-medium transition-all duration-200 group relative rounded-lg
                  ${activeView === item.id 
                    ? 'text-white bg-wes-accent/10 border border-wes-accent/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                `}
                title={isCollapsed ? item.label : ''}
              >
                {/* Active Indicator Line (Left) */}
                {activeView === item.id && !isCollapsed && (
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-wes-accent rounded-r-full shadow-[0_0_10px_#6366f1]"></div>
                )}

                <i className={`fa-solid ${item.icon} w-6 text-center transition-all ${
                  isCollapsed ? 'text-lg' : ''
                } ${activeView === item.id ? 'text-wes-accent' : 'text-slate-500 group-hover:text-slate-300'}`}></i>
                
                <span className={`
                  ml-3 truncate transition-all duration-200
                  ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}
                `}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        {!isCollapsed ? (
          <div className="animate-fadeIn">
            <div className="bg-wes-950/50 border border-white/5 rounded-lg p-3 text-xs text-slate-400">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] uppercase">Token Usage</span>
                <span className="text-wes-success text-[10px] uppercase">Optimal</span>
              </div>
              <div className="w-full bg-wes-900 rounded-full h-1">
                <div className="bg-gradient-to-r from-wes-accent to-wes-pop h-1 rounded-full w-1/4 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                <span className="font-medium text-slate-300">WesAI Online</span>
              </div>
              <button 
                onClick={onOpenSettings}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-wes-accent transition-colors"
                title="Settings"
              >
                <i className="fa-solid fa-gear"></i>
              </button>
            </div>
          </div>
        ) : (
           <div className="flex flex-col items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-wes-success shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Tokens Healthy"></div>
              <button 
                onClick={onOpenSettings}
                className="text-slate-600 hover:text-wes-accent transition-colors"
                title="Settings"
              >
                <i className="fa-solid fa-gear"></i>
              </button>
           </div>
        )}
      </div>
    </aside>
  );
};
