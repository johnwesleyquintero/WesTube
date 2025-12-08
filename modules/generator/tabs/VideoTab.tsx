
import React, { useState } from 'react';
import { GeneratedPackage } from '../../../types';
import { useVideoGenerator } from '../../../hooks/useVideoGenerator';
import { CopyButton } from '../../../components/CopyButton';

interface VideoTabProps {
  result: GeneratedPackage;
  onVideoGenerated: (key: string, url: string) => void;
  savedVideos: Record<string, string>;
}

export const VideoTab: React.FC<VideoTabProps> = ({ result, onVideoGenerated, savedVideos }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const { isGenerating, progress, generateVideo } = useVideoGenerator();

  const handleGenerate = async (prompt: string, key: string, imageContext?: string) => {
    if (!prompt.trim()) return;
    const url = await generateVideo(prompt, selectedAspectRatio, imageContext);
    if (url) {
      onVideoGenerated(key, url);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
            <h3 className="text-lg font-bold text-slate-200 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mr-3 border border-red-500/20 text-red-500">
                <i className="fa-solid fa-film"></i>
              </span>
              Veo Motion Lab
            </h3>
            <p className="text-xs text-slate-500 mt-1 ml-11">Powered by Veo 3.1 • Image-to-Video Capable</p>
         </div>
         
         <div className="flex bg-wes-900/40 rounded-lg p-1 border border-wes-700">
             <button 
               onClick={() => setSelectedAspectRatio('16:9')}
               className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${selectedAspectRatio === '16:9' ? 'bg-wes-accent text-white' : 'text-slate-500 hover:text-slate-200'}`}
             >
               Landscape (16:9)
             </button>
             <button 
               onClick={() => setSelectedAspectRatio('9:16')}
               className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${selectedAspectRatio === '9:16' ? 'bg-wes-accent text-white' : 'text-slate-500 hover:text-slate-200'}`}
             >
               Shorts (9:16)
             </button>
         </div>
      </div>

      {/* Progress Bar (Overlay) */}
      {isGenerating && (
         <div className="glass-panel p-4 rounded-xl border border-wes-accent/30 bg-wes-accent/5 animate-pulse relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
               <i className="fa-solid fa-circle-notch fa-spin text-wes-accent"></i>
               <span className="text-sm font-bold text-slate-200">{progress}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-wes-accent/10 to-transparent w-1/2 -skew-x-12 animate-slide-shine"></div>
         </div>
      )}

      {/* Custom Generation */}
      <div className="glass-panel p-6 rounded-xl border border-wes-700">
         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Custom Prompt</label>
         <div className="flex gap-4">
            <input 
              type="text" 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="A cyberpunk city with neon rain, cinematic lighting..."
              className="flex-1 glass-input rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-red-500/50 transition-all placeholder-slate-500"
            />
            <button 
              onClick={() => handleGenerate(customPrompt, `custom-${Date.now()}`)}
              disabled={isGenerating || !customPrompt}
              className="px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Generate
            </button>
         </div>
         {savedVideos[`custom-${Date.now()}`] && (
            <div className="mt-4"></div>
         )}
      </div>

      {/* Script Scene Integration */}
      <div className="space-y-4">
         <h4 className="text-sm font-bold text-slate-200 border-b border-wes-700 pb-2">Scenes from Script</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {result.script.map((scene, idx) => (
               <div key={idx} className="bg-wes-900/40 border border-wes-700 rounded-xl p-4 hover:border-wes-600 transition-colors flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-mono text-wes-accent bg-wes-accent/10 px-2 py-0.5 rounded">
                        {scene.timestamp}
                     </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-4 line-clamp-3 flex-1">{scene.visual}</p>
                  
                  {savedVideos[`scene-${idx}`] ? (
                     <div className="relative rounded-lg overflow-hidden aspect-video bg-black mt-auto">
                        <video 
                           src={savedVideos[`scene-${idx}`]} 
                           controls 
                           className="w-full h-full object-contain"
                        />
                        <a 
                           href={savedVideos[`scene-${idx}`]} 
                           download={`wes-video-scene-${idx}.mp4`}
                           className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded hover:bg-wes-accent transition-colors"
                        >
                           <i className="fa-solid fa-download text-xs"></i>
                        </a>
                     </div>
                  ) : (
                     <div className="mt-auto space-y-3">
                        {/* If we have a generated static visual, show it as context */}
                        {scene.generatedVisual && (
                           <div className="relative rounded-lg overflow-hidden aspect-video border border-wes-700 group">
                              <img 
                                 src={scene.generatedVisual} 
                                 alt="Static Source" 
                                 className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                 <span className="bg-black/60 backdrop-blur-sm text-[10px] px-2 py-1 rounded text-white border border-white/10">Source Asset</span>
                              </div>
                           </div>
                        )}

                        {scene.generatedVisual ? (
                           <button 
                              onClick={() => handleGenerate(scene.visual, `scene-${idx}`, scene.generatedVisual)}
                              disabled={isGenerating}
                              className="w-full py-2.5 bg-gradient-to-r from-wes-pop to-wes-accent hover:from-wes-pop/80 hover:to-wes-accent/80 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2"
                           >
                              <i className="fa-solid fa-wand-magic-sparkles"></i>
                              Animate Asset
                           </button>
                        ) : (
                           <button 
                              onClick={() => handleGenerate(scene.visual, `scene-${idx}`)}
                              disabled={isGenerating}
                              className="w-full py-2.5 bg-wes-800 hover:bg-wes-700 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-wes-700"
                           >
                              Generate from Text
                           </button>
                        )}
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>

      {/* Gallery of Custom Generations */}
      {Object.keys(savedVideos).filter(k => k.startsWith('custom')).length > 0 && (
         <div className="space-y-4 pt-8 border-t border-wes-700">
             <h4 className="text-sm font-bold text-slate-200">Custom Generations</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(savedVideos).filter(([k]) => k.startsWith('custom')).map(([key, url]) => (
                   <div key={key} className="glass-panel p-2 rounded-xl">
                      <video src={url} controls className="w-full h-auto rounded-lg aspect-video bg-black" />
                      <div className="flex justify-end mt-2 px-1">
                         <a href={url} download="wes-custom-video.mp4" className="text-xs text-slate-500 hover:text-slate-300"><i className="fa-solid fa-download"></i> Download</a>
                      </div>
                   </div>
                ))}
             </div>
         </div>
      )}

    </div>
  );
};