import React, { useState } from 'react';
import { GeneratedPackage } from '../../../../types';

interface ScriptStoryboardViewProps {
  result: GeneratedPackage;
  handleUpdateScript?: (idx: number, field: 'visual' | 'audio', val: string) => void;
  handleRefineScript?: (idx: number, field: 'visual' | 'audio', instruction: string) => void;
  handleGenerateSceneVisual?: (prompt: string, idx: number) => void;
  handleEditSceneVisual?: (base64: string, prompt: string, idx: number) => void;
  generatingSceneVisual?: number | null;
  editingSceneVisual?: number | null;
  batchProcessing: boolean;
  handlePlayAudio: (idx: number) => void;
  playingScene: number | null;
  handleDownloadAudio: (idx: number) => void;
  refiningScene?: {index: number, field: 'visual' | 'audio'} | null;
}

export const ScriptStoryboardView: React.FC<ScriptStoryboardViewProps> = ({
  result,
  handleUpdateScript,
  handleRefineScript,
  handleGenerateSceneVisual,
  handleEditSceneVisual,
  generatingSceneVisual,
  editingSceneVisual,
  batchProcessing,
  handlePlayAudio,
  playingScene,
  handleDownloadAudio,
  refiningScene
}) => {
  const [editModeIndex, setEditModeIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  
  // New state for Text Refinement Overlay
  const [refinementInput, setRefinementInput] = useState<{index: number, field: 'visual' | 'audio', text: string} | null>(null);

  const submitEdit = (idx: number, base64: string) => {
    if (handleEditSceneVisual && editPrompt.trim()) {
      handleEditSceneVisual(base64, editPrompt, idx);
      setEditModeIndex(null);
      setEditPrompt('');
    }
  };

  const startRefinement = (index: number, field: 'visual' | 'audio') => {
    setRefinementInput({ index, field, text: '' });
  };

  const submitRefinement = () => {
    if (refinementInput && handleRefineScript) {
      handleRefineScript(refinementInput.index, refinementInput.field, refinementInput.text);
      setRefinementInput(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      {result.script.map((scene, idx) => {
          const isRefiningVisual = refiningScene?.index === idx && refiningScene?.field === 'visual';
          const isRefiningAudio = refiningScene?.index === idx && refiningScene?.field === 'audio';

          return (
          <div key={idx} className="glass-panel rounded-xl overflow-hidden flex flex-col border border-wes-700 hover:border-wes-600 transition-colors shadow-lg">
            {/* Top: Visual Area */}
            <div className="relative aspect-video bg-wes-950 border-b border-wes-700 group">
              {scene.generatedVisual ? (
                <>
                  <img 
                    src={scene.generatedVisual} 
                    alt={`Scene ${idx}`} 
                    className={`w-full h-full object-cover transition-all ${editingSceneVisual === idx ? 'opacity-40 blur-sm' : ''}`}
                  />
                  
                  {/* Edit Loading State */}
                  {editingSceneVisual === idx && (
                     <div className="absolute inset-0 flex items-center justify-center z-20">
                         <div className="bg-black/80 px-3 py-1.5 rounded-full border border-wes-accent/50 flex items-center gap-2">
                             <i className="fa-solid fa-circle-notch fa-spin text-wes-accent"></i>
                             <span className="text-[10px] font-bold text-white">Refining...</span>
                         </div>
                     </div>
                  )}

                  {/* Controls (Hidden if editing) */}
                  {editModeIndex !== idx && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <a href={scene.generatedVisual} download={`scene-${idx}.png`} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all transform hover:scale-110" title="Download">
                          <i className="fa-solid fa-download"></i>
                        </a>
                        
                        {handleEditSceneVisual && (
                           <button 
                             onClick={() => setEditModeIndex(idx)}
                             disabled={generatingSceneVisual === idx || batchProcessing || editingSceneVisual === idx}
                             className="w-10 h-10 rounded-full bg-wes-accent/80 hover:bg-wes-accent text-white flex items-center justify-center backdrop-blur-md transition-all transform hover:scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                             title="Refine with AI"
                           >
                             <i className="fa-solid fa-wand-magic"></i>
                           </button>
                        )}

                        {handleGenerateSceneVisual && (
                          <button 
                            onClick={() => handleGenerateSceneVisual(scene.visual, idx)}
                            disabled={generatingSceneVisual === idx || batchProcessing}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all transform hover:scale-110"
                            title="Regenerate Completely"
                          >
                            <i className="fa-solid fa-rotate-right"></i>
                          </button>
                        )}
                    </div>
                  )}

                  {/* Edit Input Overlay */}
                  {editModeIndex === idx && !editingSceneVisual && (
                     <div className="absolute inset-0 bg-black/90 backdrop-blur-md p-3 flex flex-col animate-fadeIn z-30">
                        <label className="text-[10px] font-bold text-wes-accent uppercase mb-1">Modify Scene</label>
                        <textarea 
                           autoFocus
                           value={editPrompt}
                           onChange={(e) => setEditPrompt(e.target.value)}
                           className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-white resize-none outline-none focus:border-wes-accent mb-2"
                           placeholder="e.g. Add rain..."
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setEditModeIndex(null)}
                                className="flex-1 py-1 bg-white/10 hover:bg-white/20 text-[10px] rounded text-slate-300"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => submitEdit(idx, scene.generatedVisual!)}
                                className="flex-1 py-1 bg-wes-accent hover:bg-wes-accent/80 text-[10px] rounded text-white font-bold"
                            >
                                Refine
                            </button>
                        </div>
                     </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                  <i className="fa-regular fa-image text-3xl opacity-40"></i>
                  {handleGenerateSceneVisual && (
                      <button 
                        onClick={() => handleGenerateSceneVisual(scene.visual, idx)}
                        disabled={generatingSceneVisual === idx || batchProcessing}
                        className="px-4 py-2 bg-wes-800 hover:bg-wes-700 text-slate-300 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider border border-wes-700 transition-all hover:scale-105"
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
              
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 z-10">
                Scene {idx + 1} • {scene.timestamp}
              </div>
            </div>

            {/* Bottom: Script Area */}
            <div className="p-4 flex flex-col gap-3 flex-1 bg-gradient-to-b from-wes-900/50 to-transparent relative">
              
              {/* Text Refinement Overlay */}
              {refinementInput?.index === idx && (
                 <div className="absolute inset-0 z-40 bg-wes-950/95 p-4 flex flex-col animate-fadeIn backdrop-blur-sm">
                     <label className="text-[10px] font-bold text-wes-accent uppercase mb-2">
                        Modify {refinementInput.field === 'visual' ? 'Visual' : 'Audio'} Script
                     </label>
                     <textarea 
                        autoFocus
                        value={refinementInput.text}
                        onChange={(e) => setRefinementInput(prev => prev ? {...prev, text: e.target.value} : null)}
                        className="flex-1 bg-wes-800 border border-wes-accent/30 rounded p-2 text-xs text-slate-200 resize-none outline-none focus:border-wes-accent mb-3 placeholder-slate-500"
                        placeholder="Instruction: e.g. 'Make it funnier'..."
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submitRefinement()}
                     />
                     <div className="flex gap-2 mt-auto">
                        <button 
                          onClick={() => setRefinementInput(null)} 
                          className="flex-1 py-2 bg-wes-800 text-slate-400 border border-wes-700 text-xs rounded hover:bg-wes-700"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={submitRefinement} 
                          className="flex-1 py-2 bg-wes-accent text-white text-xs font-bold rounded hover:bg-wes-accent/80 shadow-lg shadow-wes-accent/20"
                        >
                          Apply Change
                        </button>
                     </div>
                 </div>
              )}

              {/* Visual Prompt (Mini) */}
              <div className="relative group/edit">
                <i className="fa-solid fa-eye absolute top-2.5 left-2 text-wes-accent/50 text-[10px]"></i>
                <textarea 
                    value={scene.visual}
                    onChange={(e) => handleUpdateScript?.(idx, 'visual', e.target.value)}
                    disabled={isRefiningVisual}
                    className={`w-full bg-wes-800/30 text-slate-400 text-xs p-2 pl-6 rounded border border-transparent focus:border-wes-accent/30 focus:bg-wes-800/50 outline-none resize-none min-h-[60px] ${isRefiningVisual ? 'opacity-50 blur-sm' : ''}`}
                    placeholder="Visual direction..."
                />
                {handleRefineScript && !isRefiningVisual && (
                    <button 
                      onClick={() => startRefinement(idx, 'visual')}
                      className="absolute top-1 right-1 text-slate-500 hover:text-wes-accent opacity-0 group-hover/edit:opacity-100 transition-opacity p-1 bg-wes-800/80 rounded border border-wes-700"
                    >
                      <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                    </button>
                )}
                {isRefiningVisual && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-circle-notch fa-spin text-wes-accent"></i>
                  </div>
                )}
              </div>

              {/* Audio Script */}
              <div className="flex-1 relative group/edit">
                <i className="fa-solid fa-microphone absolute top-2.5 left-2 text-wes-pop/50 text-[10px]"></i>
                <textarea 
                    value={scene.audio}
                    onChange={(e) => handleUpdateScript?.(idx, 'audio', e.target.value)}
                    disabled={isRefiningAudio}
                    className={`w-full h-full bg-transparent text-slate-200 text-sm p-2 pl-6 rounded border border-transparent focus:border-wes-700 outline-none resize-none leading-relaxed ${isRefiningAudio ? 'opacity-50 blur-sm' : ''}`}
                    placeholder="Narration..."
                />
                {handleRefineScript && !isRefiningAudio && (
                    <button 
                      onClick={() => startRefinement(idx, 'audio')}
                      className="absolute top-1 right-1 text-slate-500 hover:text-wes-accent opacity-0 group-hover/edit:opacity-100 transition-opacity p-1 bg-wes-800/80 rounded border border-wes-700"
                    >
                      <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                    </button>
                )}
                 {isRefiningAudio && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-circle-notch fa-spin text-wes-accent"></i>
                  </div>
                )}
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-between border-t border-wes-700 pt-3 mt-1">
                <div className="flex gap-2">
                    <button 
                      onClick={() => handlePlayAudio(idx)}
                      disabled={playingScene !== null}
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 transition-colors border ${playingScene === idx ? 'bg-wes-accent text-white border-wes-accent' : 'bg-wes-800/50 border-wes-700/50 text-slate-500 hover:text-slate-200 hover:bg-wes-800'}`}
                    >
                      {playingScene === idx ? <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i> : <i className="fa-solid fa-play"></i>}
                      <span className="uppercase text-[10px] font-bold">Preview</span>
                    </button>
                    
                    {/* Cached Indicator */}
                    {scene.generatedAudio && (
                       <span className="text-[10px] font-mono text-wes-success bg-wes-success/10 px-2 py-0.5 rounded border border-wes-success/20 flex items-center gap-1 animate-fadeIn" title="Audio cached">
                         <i className="fa-solid fa-bolt text-[8px]"></i> Cached
                       </span>
                    )}
                </div>
                <button 
                    onClick={() => handleDownloadAudio(idx)}
                    className="text-slate-500 hover:text-wes-success transition-colors"
                    title="Download Audio"
                >
                    <i className="fa-solid fa-download"></i>
                </button>
              </div>
            </div>
          </div>
          );
      })}
    </div>
  );
};