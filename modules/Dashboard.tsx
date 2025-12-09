import React, { useEffect, useState } from 'react';
import { getHistory } from '../lib/history';
import { GeneratedPackage, ChannelId } from '../types';
import { CHANNELS } from '../constants';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState<GeneratedPackage[]>([]);
  const [stats, setStats] = useState({ total: 0, topChannel: 'N/A' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch recent 3 for display
        const recent = await getHistory(3);
        setRecentProjects(recent);

        // Fetch all just to get the count (Optimization: Real app would use a count query)
        const all = await getHistory(); 
        
        // Calculate Top Channel
        const channelCounts: Record<string, number> = {};
        all.forEach(p => {
            const cId = p.channelId || ChannelId.TECH;
            channelCounts[cId] = (channelCounts[cId] || 0) + 1;
        });
        
        const topChannelId = Object.keys(channelCounts).reduce((a, b) => channelCounts[a] > channelCounts[b] ? a : b, ChannelId.TECH);

        setStats({
          total: all.length,
          topChannel: CHANNELS[topChannelId as ChannelId]?.name || 'Tech'
        });

      } catch (e) {
        console.error("Dashboard data load failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar animate-fadeIn">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-wes-accent to-wes-pop">Wesley</span>.
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-light max-w-xl">
            WesTube Engine v2.3 is online. Neural modules are primed for production.
            Your digital empire is currently operating at <span className="text-wes-success font-mono">100% efficiency</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-wes-800/50 border border-wes-700 rounded-lg text-xs">
              <span className="text-slate-500 uppercase tracking-widest mr-2">API Status</span>
              <span className="text-wes-success font-bold"><i className="fa-solid fa-circle text-[8px] mr-1.5 mb-0.5"></i>Connected</span>
           </div>
           <div className="px-4 py-2 bg-wes-800/50 border border-wes-700 rounded-lg text-xs">
              <span className="text-slate-500 uppercase tracking-widest mr-2">Model</span>
              <span className="text-slate-300 font-bold">Gemini 2.5 Flash</span>
           </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Metric 1 */}
         <div className="glass-panel p-6 rounded-xl border border-wes-700/50 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fa-solid fa-layer-group text-6xl text-wes-accent"></i>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Productions</h3>
            <div className="text-4xl font-bold text-slate-200 font-mono">
               {isLoading ? '...' : stats.total}
            </div>
            <div className="mt-4 text-xs text-wes-accent flex items-center gap-1">
               <i className="fa-solid fa-arrow-trend-up"></i>
               <span>Lifetime Volume</span>
            </div>
         </div>

         {/* Metric 2 */}
         <div className="glass-panel p-6 rounded-xl border border-wes-700/50 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fa-solid fa-crown text-6xl text-wes-pop"></i>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Top Channel</h3>
            <div className="text-2xl font-bold text-slate-200 truncate pr-8">
               {isLoading ? '...' : stats.topChannel}
            </div>
            <div className="mt-5 text-xs text-wes-pop flex items-center gap-1">
               <i className="fa-solid fa-star"></i>
               <span>Highest Activity</span>
            </div>
         </div>

         {/* Metric 3 (Static for now) */}
         <div className="glass-panel p-6 rounded-xl border border-wes-700/50 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fa-solid fa-bolt text-6xl text-wes-success"></i>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">System Health</h3>
            <div className="text-2xl font-bold text-wes-success">
               Optimal
            </div>
            <div className="mt-5 text-xs text-slate-500">
               <span>Latency: 45ms</span>
            </div>
         </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
           <i className="fa-solid fa-rocket text-wes-accent mr-2"></i>
           Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <button 
             onClick={() => onNavigate('scripts')}
             className="group glass-panel p-6 rounded-xl text-left border border-wes-700/50 hover:border-wes-accent/50 hover:bg-wes-accent/5 transition-all relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-wes-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                 <div className="w-12 h-12 rounded-lg bg-wes-accent/20 flex items-center justify-center text-wes-accent mb-4 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-pen-nib text-xl"></i>
                 </div>
                 <h3 className="text-slate-200 font-bold mb-1">New Script</h3>
                 <p className="text-xs text-slate-500">Generate a full video package from a topic.</p>
              </div>
           </button>

           <button 
             onClick={() => onNavigate('brainstorm')}
             className="group glass-panel p-6 rounded-xl text-left border border-wes-700/50 hover:border-wes-pop/50 hover:bg-wes-pop/5 transition-all relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-wes-pop/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                 <div className="w-12 h-12 rounded-lg bg-wes-pop/20 flex items-center justify-center text-wes-pop mb-4 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-microphone-lines text-xl"></i>
                 </div>
                 <h3 className="text-slate-200 font-bold mb-1">Neural Brainstorm</h3>
                 <p className="text-xs text-slate-500">Live voice session with Gemini 2.5.</p>
              </div>
           </button>

           <button 
             onClick={() => onNavigate('video')}
             className="group glass-panel p-6 rounded-xl text-left border border-wes-700/50 hover:border-red-500/50 hover:bg-red-500/5 transition-all relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                 <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-film text-xl"></i>
                 </div>
                 <h3 className="text-slate-200 font-bold mb-1">Veo Studio</h3>
                 <p className="text-xs text-slate-500">Generate videos from text or images.</p>
              </div>
           </button>
        </div>
      </div>

      {/* Recent Transmissions */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-bold text-slate-200 flex items-center">
             <i className="fa-solid fa-clock-rotate-left text-slate-400 mr-2"></i>
             Recent Transmissions
           </h2>
           <button 
             onClick={() => onNavigate('history')}
             className="text-xs text-wes-accent hover:text-slate-200 transition-colors"
           >
             View All Archives <i className="fa-solid fa-arrow-right ml-1"></i>
           </button>
        </div>

        <div className="space-y-3">
           {isLoading ? (
              <div className="flex flex-col gap-3">
                 {[1,2,3].map(i => (
                    <div key={i} className="h-20 bg-wes-800/50 rounded-xl animate-pulse"></div>
                 ))}
              </div>
           ) : recentProjects.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-xl border-dashed border-wes-700">
                 <p className="text-slate-500 text-sm">No transmissions found. Start the engine.</p>
              </div>
           ) : (
              recentProjects.map((project) => {
                 const channel = CHANNELS[project.channelId || ChannelId.TECH];
                 return (
                    <div 
                      key={project.id}
                      onClick={() => onNavigate('history')}
                      className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-wes-800/30 transition-colors cursor-pointer group border-l-4 border-l-transparent hover:border-l-wes-accent"
                    >
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${channel.color.replace('text-', 'bg-').replace('400', '500')}/20 ${channel.color}`}>
                          <i className={`fa-solid ${channel.icon}`}></i>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-wes-accent transition-colors">
                             {project.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                             {formatDate(project.createdAt)} • {channel.name}
                          </p>
                       </div>
                       <div className="text-right hidden sm:block">
                          <span className="text-[10px] bg-wes-800/50 border border-wes-700 px-2 py-1 rounded text-slate-400">
                             {project.script.length} Scenes
                          </span>
                       </div>
                       <i className="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:translate-x-1 transition-transform"></i>
                    </div>
                 );
              })
           )}
        </div>
      </div>

    </div>
  );
};