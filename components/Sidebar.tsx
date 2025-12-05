import React, { useState } from 'react';
import { Logo } from './Logo';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onOpenSettings }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
    { id: 'scripts', label: 'Script Engine', icon: 'fa-file-lines' },
    { id: 'assets', label: 'Asset Lab', icon: 'fa-photo-film' },
    { id: 'seo', label: 'SEO Mastery', icon: 'fa-magnifying-glass-chart' },
    { id: 'history', label: 'Production History', icon: 'fa-clock-rotate-left' },
  ];

  return (
    <aside 
      className={`
        bg-wes-800 border-r border-wes-700 flex flex-col h-screen transition-all duration-300 relative
        ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64
      `}
    >
      {/* Desktop Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-9 z-50 w-6 h-6 bg-wes-800 border border-wes-700 rounded-full items-center justify-center text-slate-400 hover:text-white hover:border-wes-accent transition-colors shadow-lg"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <i className={`fa-solid fa-chevron-${isCollapsed ? 'right' : 'left'} text-[10px]`}></i>
      </button>

      {/* Header */}
      <div className={`p-6 border-b border-wes-700 h-20 flex items-center ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="transition-all duration-300 overflow-hidden whitespace-nowrap">
           <Logo withText={!isCollapsed} className="w-8 h-8 flex-shrink-0" />
           {!isCollapsed && (
             <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest pl-10 -mt-3 animate-fadeIn">
               Engine v2.0
             </p>
           )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar overflow-x-hidden">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`
                  w-full flex items-center py-3 text-sm font-medium transition-colors duration-150 group relative
                  ${activeView === item.id 
                    ? 'text-white bg-wes-700 border-l-4 border-wes-accent' 
                    : 'text-slate-400 hover:text-white hover:bg-wes-700/50 border-l-4 border-transparent'
                  }
                  ${isCollapsed ? 'justify-center px-0' : 'px-6'}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <i className={`fa-solid ${item.icon} w-6 text-center transition-all ${isCollapsed ? 'text-lg' : ''}`}></i>
                
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
      <div className="p-4 border-t border-wes-700">
        {!isCollapsed ? (
          <div className="animate-fadeIn">
            <div className="bg-wes-900 rounded-lg p-3 text-xs text-slate-400">
              <div className="flex justify-between items-center mb-2">
                <span>Tokens</span>
                <span className="text-wes-success">Healthy</span>
              </div>
              <div className="w-full bg-wes-700 rounded-full h-1.5">
                <div className="bg-wes-accent h-1.5 rounded-full w-1/4"></div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-xs text-slate-500">
                <i className="fa-solid fa-robot mr-2"></i>
                <span>WesAI Active</span>
              </div>
              <button 
                onClick={onOpenSettings}
                className="w-6 h-6 rounded hover:bg-wes-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="Settings"
              >
                <i className="fa-solid fa-gear"></i>
              </button>
            </div>
          </div>
        ) : (
           <div className="flex flex-col items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-wes-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Tokens Healthy"></div>
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