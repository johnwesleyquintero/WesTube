import React from 'react';
import { GeneratedPackage } from '../../../types';

interface LocationTabProps {
  result: GeneratedPackage;
  onScout: () => void;
  isScouting: boolean;
}

export const LocationTab: React.FC<LocationTabProps> = ({ result, onScout, isScouting }) => {
  const hasLocations = result.locations && result.locations.groundingChunks.length > 0;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3 border border-emerald-500/20 text-emerald-500">
              <i className="fa-solid fa-map-location-dot"></i>
            </span>
            Location Scout
          </h3>
          <p className="text-xs text-slate-500 mt-1 ml-11">Powered by Google Maps Grounding</p>
        </div>
        
        <button 
           onClick={onScout}
           disabled={isScouting}
           className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
           {isScouting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass-location"></i>}
           {hasLocations ? 'Rescout Area' : 'Scout Locations'}
        </button>
      </div>

      {!hasLocations && !isScouting && (
         <div className="glass-panel p-12 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-slate-500">
            <i className="fa-solid fa-earth-americas text-4xl mb-4 opacity-50"></i>
            <p className="text-sm font-medium">No location data found.</p>
            <p className="text-xs mt-2">Initialize the scout to find real-world grounding for this script.</p>
         </div>
      )}

      {isScouting && (
        <div className="glass-panel p-12 rounded-xl flex flex-col items-center justify-center animate-pulse">
            <i className="fa-solid fa-satellite text-4xl text-emerald-500 mb-4 animate-bounce"></i>
            <p className="text-white font-bold tracking-widest uppercase text-sm">Triangulating Coordinates</p>
            <p className="text-emerald-500/60 text-xs mt-2 font-mono">Accessing Global Maps API...</p>
        </div>
      )}

      {hasLocations && result.locations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Analysis Panel */}
           <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 bg-emerald-900/10">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">Scout Report</h4>
              <div className="prose prose-invert prose-sm text-slate-300 leading-relaxed font-light">
                 <div dangerouslySetInnerHTML={{ __html: result.locations.analysis.replace(/\n/g, '<br/>') }} />
              </div>
           </div>

           {/* Map Cards */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Identified Coordinates</h4>
              
              {result.locations.groundingChunks.map((chunk, idx) => {
                 if (chunk.maps) {
                    return (
                        <div key={idx} className="glass-panel p-4 rounded-xl border border-white/5 hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h5 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">{chunk.maps.title}</h5>
                                 <p className="text-xs text-slate-500 mt-1 font-mono">Place ID: {chunk.maps.placeId || 'Unknown'}</p>
                              </div>
                              <a 
                                href={chunk.maps.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                              >
                                 <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                              </a>
                           </div>
                           <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                               <a 
                                 href={chunk.maps.uri}
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-slate-300 transition-colors"
                               >
                                 View on Maps
                               </a>
                           </div>
                        </div>
                    );
                 }
                 return null;
              })}
           </div>

        </div>
      )}

    </div>
  );
};