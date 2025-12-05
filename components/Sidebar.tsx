import React from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
    { id: 'scripts', label: 'Script Engine', icon: 'fa-file-lines' },
    { id: 'assets', label: 'Asset Lab', icon: 'fa-photo-film' },
    { id: 'seo', label: 'SEO Mastery', icon: 'fa-magnifying-glass-chart' },
    { id: 'history', label: 'Production History', icon: 'fa-clock-rotate-left' },
  ];

  return (
    <aside className="w-64 bg-wes-800 border-r border-wes-700 flex flex-col h-screen fixed left-0 top-0 z-20 hidden md:flex">
      <div className="p-6 border-b border-wes-700">
        <h1 className="text-xl font-bold tracking-wider text-wes-accent">
          <i className="fa-solid fa-layer-group mr-2"></i>
          WES<span className="text-white">TUBE</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Engine v2.0</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150
                  ${activeView === item.id 
                    ? 'text-white bg-wes-700 border-l-4 border-wes-accent' 
                    : 'text-slate-400 hover:text-white hover:bg-wes-700/50'
                  }`}
              >
                <i className={`fa-solid ${item.icon} w-6`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-wes-700">
        <div className="bg-wes-900 rounded-lg p-3 text-xs text-slate-400">
          <div className="flex justify-between items-center mb-2">
            <span>Tokens</span>
            <span className="text-wes-success">Healthy</span>
          </div>
          <div className="w-full bg-wes-700 rounded-full h-1.5">
            <div className="bg-wes-accent h-1.5 rounded-full w-1/4"></div>
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-slate-500">
          <i className="fa-solid fa-robot mr-2"></i>
          <span>WesAI Active</span>
        </div>
      </div>
    </aside>
  );
};
