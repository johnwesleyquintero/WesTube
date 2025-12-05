import React, { useState } from 'react';
import { GeneratedPackage } from '../../../types';
import { CopyButton } from '../../../components/CopyButton';

interface ScriptTabProps {
  result: GeneratedPackage;
  handleUpdateScript?: (idx: number, field: 'visual' | 'audio', val: string) => void;
  handlePlayAudio: (text: string, idx: number) => void;
  handleDownloadAudio: (text: string, idx: number) => void;
  handleGenerateSceneVisual?: (prompt: string, idx: number) => void;
  generatingSceneVisual?: number | null;
  playingScene: number | null;
  downloadingAudio: number | null;
}

export const ScriptTab: React.FC<ScriptTabProps> = ({
  result,
  handleUpdateScript,
  handlePlayAudio,
  handleDownloadAudio,
  handleGenerateSceneVisual,
  generatingSceneVisual,
  playingScene,
  downloadingAudio
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [batchProcessing, setBatchProcessing] = useState(false);

  const downloadScriptTxt = () => {
    let text = `TITLE: ${result.title}\nHOOK: ${result.hook}\n\n`;
    result.script.forEach((scene, i) => {
      text += `[${scene.timestamp}]\nVISUAL: ${scene.visual}\nAUDIO: ${scene.audio}\n\n`;
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${result.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchRender = async () => {
    if (!handleGenerateSceneVisual) return;
    if (!confirm(`This will attempt to generate ${result.script.filter(s => !s.generatedVisual).length} images. Continue?`)) return;
    
    setBatchProcessing(true);
    // Sequential execution to respect rate limits and state updates
    for (let i = 0; i < result.script.length; i++) {
      // Check if image already exists to avoid re-gen
      if (!result.script[i].generatedVisual) {
         try {
           // We await each call to ensure state updates propagate correctly in the parent
           await handleGenerateSceneVisual(result.script[i].visual, i);
           // Small artificial delay to be kind to the API rate limit
           await new Promise(r => setTimeout(r, 1000));
         } catch (e) {
           console.error(`Failed to batch render scene ${i}`, e);
         }
      }
    }
    setBatchProcessing(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hook & Branding Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-xl bg-gradient-to-br from-wes-800/40 to-transparent">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">The Hook (0-15s)</h3>
            <CopyButton text={result.hook} />
          </div>
          <p className="text-lg text-white font-serif leading-relaxed italic border-l-2 border-wes-accent/50 pl-4">{result.hook}</p>
        </div>
        <div className="glass-panel p-5 rounded-xl bg-gradient-to-br from-wes-800/40 to-transparent">
            <h3 className="text-[10px] font-bold text-wes-pop uppercase tracking-widest mb-3">Branding Directive</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{result.brandingNote}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center px-1 gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-clapperboard text-wes-pop"></i>
              Director's Board
            </h3>
            <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">{result.script.length} Scenes</span>
          </div>

          <div className="flex items-center gap-3">
             {/* View Toggle */}
             <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs transition-all ${viewMode === 'table' ? 'bg-wes-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <i className="fa-solid fa-table-list"></i>
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs transition-all ${viewMode === 'grid' ? 'bg-wes-accent text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <i className="fa-solid fa-border-all"></i>
                  <span className="hidden sm:inline">Storyboard</span>
                </button>
             </div>

             {/* Batch Render */}
             {handleGenerateSceneVisual && (
                <button
                  onClick={handleBatchRender}
                  disabled={batchProcessing || generatingSceneVisual !== null}
                  className="text-xs bg-wes-pop/10 text-wes-pop border border-wes-pop/20 hover:bg-wes-pop/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 font-bold uppercase tracking-wider"
                  title="Generate visuals for all scenes"
                >
                  {batchProcessing ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  )}
                  <span className="hidden sm:inline">Render All</span>
                </button>
             )}

             <button 
                onClick={downloadScriptTxt}
                className="text-slate-400 hover:text-white px-3 py-1.5 hover:bg-white/5 rounded transition-colors"
                title="Export Text"
              >
                <i className="fa-solid fa-file-lines"></i>
              </button>
          </div>
      </div>

      {/* VIEW: TABLE */}
      {viewMode === 'table' && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/30 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-5 py-3 w-28 border-b border-white/5">Timeline</th>
                <th className="px-5 py-3 w-5/12 border-b border-white/5">Visual Protocol</th>
                <th className="px-5 py-3 border-b border-white/5">Audio Stream</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {result.script.map((scene, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-5 font-mono text-wes-accent text-xs align-top">
                    <span className="bg-wes-accent/10 text-wes-accent px-2 py-1 rounded border border-wes-accent/20">
                      {scene.timestamp}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-slate-300 text-xs align-top">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-full bg-wes-700 rounded-full mt-1"></div>
                      <div className="flex-1 space-y-3">
                        <textarea 
                          value={scene.visual}
                          onChange={(e) => handleUpdateScript?.(idx, 'visual', e.target.value)}
                          className="w-full bg-transparent text-slate-300 text-xs leading-relaxed resize-none outline-none focus:bg-black/20 focus:p-2 focus:rounded rounded -ml-2 p-2 border border-transparent focus:border-wes-accent/30 transition-all placeholder-slate-600"
                          rows={3}
                          placeholder="Describe the visual scene..."
                        />
                        {scene.generatedVisual && (
                          <div className="relative rounded-lg overflow-hidden border border-white/10 w-48 group/img shadow-lg">
                            <img src={scene.generatedVisual} alt="B-roll" className="w-full h-auto object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" />
                            <a href={scene.generatedVisual} download={`scene-${idx}.png`} className="absolute bottom-2 right-2 text-white bg-black/50 p-1.5 rounded hover:bg-wes-accent transition-colors"><i className="fa-solid fa-download text-xs"></i></a>
                          </div>
                        )}
                        {!scene.generatedVisual && handleGenerateSceneVisual && (
                           <button 
                              onClick={() => handleGenerateSceneVisual(scene.visual, idx)}
                              disabled={generatingSceneVisual === idx || batchProcessing}
                              className="text-[10px] text-slate-500 hover:text-wes-accent flex items-center gap-1.5 transition-colors"
                           >
                              <i className="fa-solid fa-image"></i> Generate
                           </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-slate-200 align-top leading-relaxed">
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                          <button 
                            onClick={() => handlePlayAudio(scene.audio, idx)}
                            disabled={playingScene !== null || downloadingAudio !== null}
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${playingScene === idx ? 'bg-wes-accent text-white border-wes-accent' : 'bg-black/30 border-white/10 text-slate-500 hover:text-white'}`}
                          >
                            {playingScene === idx ? <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i> : <i className="fa-solid fa-play text-[10px] pl-0.5"></i>}
                          </button>
                          <button 
                            onClick={() => handleDownloadAudio(scene.audio, idx)}
                            disabled={playingScene !== null || downloadingAudio !== null}
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${downloadingAudio === idx ? 'bg-wes-success text-white border-wes-success' : 'bg-black/30 border-white/10 text-slate-500 hover:text-wes-success'}`}
                          >
                            {downloadingAudio === idx ? <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i> : <i className="fa-solid fa-download text-[10px]"></i>}
                          </button>
                      </div>
                      <textarea 
                          value={scene.audio}
                          onChange={(e) => handleUpdateScript?.(idx, 'audio', e.target.value)}
                          className="w-full bg-transparent text-slate-200 font-light leading-relaxed resize-none outline-none focus:bg-black/20 focus:p-2 focus:rounded rounded -ml-2 p-2 border border-transparent focus:border-wes-accent/30 transition-all"
                          rows={4}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: STORYBOARD (GRID) */}
      {viewMode === 'grid' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.script.map((scene, idx) => (
               <div key={idx} className="glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5 hover:border-white/10 transition-colors shadow-lg">
                  {/* Top: Visual Area */}
                  <div className="relative aspect-video bg-black/40 border-b border-white/5 group">
                     {scene.generatedVisual ? (
                        <>
                           <img src={scene.generatedVisual} alt={`Scene ${idx}`} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                               <a href={scene.generatedVisual} download={`scene-${idx}.png`} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all transform hover:scale-110">
                                  <i className="fa-solid fa-download"></i>
                               </a>
                               {handleGenerateSceneVisual && (
                                 <button 
                                   onClick={() => handleGenerateSceneVisual(scene.visual, idx)}
                                   disabled={generatingSceneVisual === idx || batchProcessing}
                                   className="w-10 h-10 rounded-full bg-wes-accent/80 hover:bg-wes-accent text-white flex items-center justify-center backdrop-blur-md transition-all transform hover:scale-110"
                                   title="Regenerate"
                                 >
                                   <i className="fa-solid fa-rotate-right"></i>
                                 </button>
                               )}
                           </div>
                        </>
                     ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                           <i className="fa-regular fa-image text-3xl opacity-40"></i>
                           {handleGenerateSceneVisual && (
                              <button 
                                onClick={() => handleGenerateSceneVisual(scene.visual, idx)}
                                disabled={generatingSceneVisual === idx || batchProcessing}
                                className="px-4 py-2 bg-wes-800 hover:bg-wes-700 text-slate-300 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 transition-all hover:scale-105"
                              >
                                {generatingSceneVisual === idx ? (
                                   <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Rendering...</>
                                ) : (
                                   <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Generate Asset</>
                                )}
                              </button>
                           )}
                        </div>
                     )}
                     
                     <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                        Scene {idx + 1} • {scene.timestamp}
                     </div>
                  </div>

                  {/* Bottom: Script Area */}
                  <div className="p-4 flex flex-col gap-3 flex-1 bg-gradient-to-b from-wes-900/50 to-transparent">
                     {/* Visual Prompt (Mini) */}
                     <div className="relative">
                        <i className="fa-solid fa-eye absolute top-2.5 left-2 text-wes-accent/50 text-[10px]"></i>
                        <textarea 
                           value={scene.visual}
                           onChange={(e) => handleUpdateScript?.(idx, 'visual', e.target.value)}
                           className="w-full bg-black/20 text-slate-400 text-xs p-2 pl-6 rounded border border-transparent focus:border-wes-accent/30 focus:bg-black/40 outline-none resize-none min-h-[60px]"
                           placeholder="Visual direction..."
                        />
                     </div>

                     {/* Audio Script */}
                     <div className="flex-1 relative">
                        <i className="fa-solid fa-microphone absolute top-2.5 left-2 text-wes-pop/50 text-[10px]"></i>
                        <textarea 
                           value={scene.audio}
                           onChange={(e) => handleUpdateScript?.(idx, 'audio', e.target.value)}
                           className="w-full h-full bg-transparent text-slate-200 text-sm p-2 pl-6 rounded border border-transparent focus:border-white/10 outline-none resize-none leading-relaxed"
                           placeholder="Narration..."
                        />
                     </div>

                     {/* Audio Controls */}
                     <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                        <div className="flex gap-2">
                           <button 
                              onClick={() => handlePlayAudio(scene.audio, idx)}
                              disabled={playingScene !== null}
                              className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${playingScene === idx ? 'text-wes-accent' : 'text-slate-500 hover:text-white'}`}
                           >
                              {playingScene === idx ? <i className="fa-solid fa-stop"></i> : <i className="fa-solid fa-play"></i>}
                              <span className="uppercase text-[10px] font-bold">Preview</span>
                           </button>
                        </div>
                        <button 
                           onClick={() => handleDownloadAudio(scene.audio, idx)}
                           className="text-slate-500 hover:text-wes-success transition-colors"
                           title="Download Audio"
                        >
                           <i className="fa-solid fa-download"></i>
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};