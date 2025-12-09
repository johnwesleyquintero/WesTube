import React, { useState } from 'react';
import { GeneratedPackage } from '../../../../types';

interface ScriptTableViewProps {
  result: GeneratedPackage;
  handleUpdateScript?: (idx: number, field: 'visual' | 'audio', val: string) => void;
  handleRefineScript?: (idx: number, field: 'visual' | 'audio', instruction: string) => void;
  handleGenerateSceneVisual?: (prompt: string, idx: number) => void;
  generatingSceneVisual?: number | null;
  batchProcessing: boolean;
  handlePlayAudio: (text: string, idx: number) => void;
  playingScene: number | null;
  handleDownloadAudio: (text: string, idx: number) => void;
  downloadingAudio: number | null;
  refiningScene?: {index: number, field: 'visual' | 'audio'} | null;
}

export const ScriptTableView: React.FC<ScriptTableViewProps> = ({
  result,
  handleUpdateScript,
  handleRefineScript,
  handleGenerateSceneVisual,
  generatingSceneVisual,
  batchProcessing,
  handlePlayAudio,
  playingScene,
  handleDownloadAudio,
  downloadingAudio,
  refiningScene
}) => {
  const [refinementInput, setRefinementInput] = useState<{index: number, field: 'visual' | 'audio', text: string} | null>(null);

  const startRefinement = (index: number, field: 'visual' | 'audio') => {
    setRefinementInput({ index, field, text: '' });
  };

  const cancelRefinement = () => {
    setRefinementInput(null);
  };

  const submitRefinement = () => {
    if (refinementInput && handleRefineScript) {
      handleRefineScript(refinementInput.index, refinementInput.field, refinementInput.text);
      setRefinementInput(null);
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden animate-fadeIn border border-wes-700/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-wes-800/50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="px-5 py-3 w-28 border-b border-wes-700/50">Timeline</th>
              <th className="px-5 py-3 w-5/12 border-b border-wes-700/50">Visual Protocol</th>
              <th className="px-5 py-3 border-b border-wes-700/50">Audio Stream</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wes-700/50">
            {result.script.map((scene, idx) => {
              const isRefiningVisual = refiningScene?.index === idx && refiningScene?.field === 'visual';
              const isRefiningAudio = refiningScene?.index === idx && refiningScene?.field === 'audio';
              const isInputingVisual = refinementInput?.index === idx && refinementInput?.field === 'visual';
              const isInputingAudio = refinementInput?.index === idx && refinementInput?.field === 'audio';

              return (
                <tr key={idx} className="hover:bg-wes-800/30 transition-colors group">
                  <td className="px-5 py-5 font-mono text-wes-accent text-xs align-top">
                    <span className="bg-wes-accent/10 text-wes-accent px-2 py-1 rounded border border-wes-accent/20">
                      {scene.timestamp}
                    </span>
                  </td>
                  
                  {/* Visual Column */}
                  <td className="px-5 py-5 text-slate-300 text-xs align-top relative">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-full bg-wes-700 rounded-full mt-1"></div>
                      <div className="flex-1 space-y-3 relative group/edit">
                        {isInputingVisual ? (
                          <div className="bg-wes-900/95 p-2 rounded border border-wes-accent/30 animate-fadeIn backdrop-blur-sm shadow-xl z-20 absolute w-full">
                              <input 
                                autoFocus
                                className="w-full bg-transparent text-slate-200 outline-none placeholder-slate-500 mb-2"
                                placeholder="How should I change this?"
                                value={refinementInput.text}
                                onChange={(e) => setRefinementInput(prev => prev ? {...prev, text: e.target.value} : null)}
                                onKeyDown={(e) => e.key === 'Enter' && submitRefinement()}
                              />
                              <div className="flex gap-2">
                                <button onClick={cancelRefinement} className="px-2 py-1 text-[10px] bg-wes-800 text-slate-400 rounded hover:bg-wes-700 border border-wes-700">Cancel</button>
                                <button onClick={submitRefinement} className="px-2 py-1 text-[10px] bg-wes-accent text-white rounded hover:bg-wes-accent/80 font-bold shadow-lg shadow-wes-accent/20">Apply</button>
                              </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <textarea 
                              value={scene.visual}
                              disabled={isRefiningVisual}
                              onChange={(e) => handleUpdateScript?.(idx, 'visual', e.target.value)}
                              className={`w-full bg-transparent text-slate-300 text-xs leading-relaxed resize-none outline-none focus:bg-wes-800/50 focus:p-2 focus:rounded rounded -ml-2 p-2 border border-transparent focus:border-wes-accent/30 transition-all placeholder-slate-600 ${isRefiningVisual ? 'opacity-50 blur-sm' : ''}`}
                              rows={3}
                              placeholder="Describe the visual scene..."
                            />
                            {/* Magic Wand Trigger */}
                            {handleRefineScript && !isRefiningVisual && (
                                <button 
                                  onClick={() => startRefinement(idx, 'visual')}
                                  className="absolute -top-1 -right-1 text-slate-500 hover:text-wes-accent opacity-0 group-hover/edit:opacity-100 transition-opacity p-1 bg-wes-800/80 rounded border border-wes-700"
                                  title="Refine with AI"
                                >
                                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                                </button>
                            )}
                            {isRefiningVisual && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <i className="fa-solid fa-circle-notch fa-spin text-wes-accent"></i>
                                </div>
                            )}
                          </div>
                        )}

                        {scene.generatedVisual && (
                          <div className="relative rounded-lg overflow-hidden border border-wes-700/50 w-48 group/img shadow-lg">
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

                  {/* Audio Column */}
                  <td className="px-5 py-5 text-slate-200 align-top leading-relaxed relative">
                    <div className="flex flex-col gap-3 group/edit">
                      <div className="flex gap-2">
                          <button 
                            onClick={() => handlePlayAudio(scene.audio, idx)}
                            disabled={playingScene !== null || downloadingAudio !== null}
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${playingScene === idx ? 'bg-wes-accent text-white border-wes-accent' : 'bg-wes-800/50 border-wes-700/50 text-slate-500 hover:text-slate-200 hover:bg-wes-800'}`}
                          >
                            {playingScene === idx ? <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i> : <i className="fa-solid fa-play text-[10px] pl-0.5"></i>}
                          </button>
                          <button 
                            onClick={() => handleDownloadAudio(scene.audio, idx)}
                            disabled={playingScene !== null || downloadingAudio !== null}
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${downloadingAudio === idx ? 'bg-wes-success text-white border-wes-success' : 'bg-wes-800/50 border-wes-700/50 text-slate-500 hover:text-wes-success hover:bg-wes-800'}`}
                          >
                            {downloadingAudio === idx ? <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i> : <i className="fa-solid fa-download text-[10px]"></i>}
                          </button>
                      </div>

                      {isInputingAudio ? (
                          <div className="bg-wes-900/95 p-2 rounded border border-wes-accent/30 animate-fadeIn backdrop-blur-sm shadow-xl z-20 absolute w-full">
                            <input 
                              autoFocus
                              className="w-full bg-transparent text-slate-200 outline-none placeholder-slate-500 mb-2"
                              placeholder="How should I change this?"
                              value={refinementInput.text}
                              onChange={(e) => setRefinementInput(prev => prev ? {...prev, text: e.target.value} : null)}
                              onKeyDown={(e) => e.key === 'Enter' && submitRefinement()}
                            />
                            <div className="flex gap-2">
                                <button onClick={cancelRefinement} className="px-2 py-1 text-[10px] bg-wes-800 text-slate-400 rounded hover:bg-wes-700 border border-wes-700">Cancel</button>
                                <button onClick={submitRefinement} className="px-2 py-1 text-[10px] bg-wes-accent text-white rounded hover:bg-wes-accent/80 font-bold shadow-lg shadow-wes-accent/20">Apply</button>
                            </div>
                          </div>
                      ) : (
                        <div className="relative">
                          <textarea 
                              value={scene.audio}
                              disabled={isRefiningAudio}
                              onChange={(e) => handleUpdateScript?.(idx, 'audio', e.target.value)}
                              className={`w-full bg-transparent text-slate-200 font-light leading-relaxed resize-none outline-none focus:bg-wes-800/50 focus:p-2 focus:rounded rounded -ml-2 p-2 border border-transparent focus:border-wes-accent/30 transition-all ${isRefiningAudio ? 'opacity-50 blur-sm' : ''}`}
                              rows={4}
                          />
                          {/* Magic Wand Trigger */}
                          {handleRefineScript && !isRefiningAudio && (
                              <button 
                                onClick={() => startRefinement(idx, 'audio')}
                                className="absolute -top-1 -right-1 text-slate-500 hover:text-wes-accent opacity-0 group-hover/edit:opacity-100 transition-opacity p-1 bg-wes-800/80 rounded border border-wes-700"
                                title="Refine with AI"
                              >
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                              </button>
                          )}
                          {isRefiningAudio && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <i className="fa-solid fa-circle-notch fa-spin text-wes-accent"></i>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};