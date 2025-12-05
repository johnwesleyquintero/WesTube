import React from 'react';
import { GeneratedPackage, ChannelConfig } from '../../types';

interface OutputPanelProps {
  loading: boolean;
  result: GeneratedPackage | null;
  activeTab: 'script' | 'assets' | 'seo';
  setActiveTab: (tab: 'script' | 'assets' | 'seo') => void;
  activeChannelConfig: ChannelConfig;
  generatingImage: number | null;
  playingScene: number | null;
  downloadPackage: () => void;
  handleGenerateThumbnail: (prompt: string, idx: number) => void;
  handlePlayAudio: (text: string, idx: number) => void;
}

const Loader = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-pulse">
    <div className="w-12 h-12 border-4 border-wes-accent border-t-transparent rounded-full animate-spin"></div>
    <p className="text-wes-accent font-mono text-sm">Contacting WesAI Neural Network...</p>
    <p className="text-slate-500 text-xs">Aligning channel persona...</p>
  </div>
);

export const OutputPanel: React.FC<OutputPanelProps> = ({
  loading, result, activeTab, setActiveTab, activeChannelConfig,
  generatingImage, playingScene, downloadPackage, handleGenerateThumbnail, handlePlayAudio
}) => {
  return (
    <div className="flex-1 bg-wes-900 rounded-xl border border-wes-700 flex flex-col overflow-hidden relative shadow-xl">
      {!result && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-50">
          <i className="fa-solid fa-server text-6xl mb-4"></i>
          <p className="text-xl font-medium">System Ready</p>
          <p className="text-sm">Select a channel and topic to begin.</p>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-wes-900 z-10 flex items-center justify-center">
          <Loader />
        </div>
      )}

      {result && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-wes-700 bg-wes-800 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${activeChannelConfig.color.replace('text-', 'bg-')}`}></div>
                <h2 className="text-sm font-bold text-white truncate max-w-[200px]">{result.title}</h2>
            </div>
            
            <div className="flex space-x-2">
                <div className="flex bg-wes-900 rounded-lg p-1 border border-wes-700">
                  {(['script', 'assets', 'seo'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 text-xs rounded-md transition-all capitalize ${
                        activeTab === tab 
                        ? 'bg-wes-700 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

              <button 
                onClick={downloadPackage}
                className="text-xs bg-wes-700 hover:bg-wes-600 text-white px-3 py-1.5 rounded transition-colors border border-wes-600"
              >
                <i className="fa-solid fa-download mr-1"></i> JSON
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* SCRIPT TAB */}
            {activeTab === 'script' && (
              <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-wes-800/50 p-4 rounded-lg border border-wes-700">
                      <h3 className="text-xs font-bold text-wes-accent uppercase mb-2">The Hook (0-15s)</h3>
                      <p className="text-lg text-white font-serif leading-relaxed">"{result.hook}"</p>
                    </div>
                    <div className="bg-wes-800/50 p-4 rounded-lg border border-wes-700">
                        <h3 className="text-xs font-bold text-wes-accent uppercase mb-2">Branding Directive</h3>
                        <p className="text-sm text-slate-300 italic">{result.brandingNote}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <h3 className="text-lg font-bold text-white"><i className="fa-solid fa-film mr-2 text-slate-500"></i>Scene Breakdown</h3>
                    </div>
                    <div className="bg-wes-800 rounded-lg border border-wes-700 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-wes-900 text-slate-400 uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3 w-24">Time</th>
                            <th className="px-4 py-3 w-1/3">Visual Cue</th>
                            <th className="px-4 py-3">Narration / Audio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-wes-700">
                          {result.script.map((scene, idx) => (
                            <tr key={idx} className="hover:bg-wes-700/30 transition-colors">
                              <td className="px-4 py-4 font-mono text-wes-accent text-xs align-top pt-5">{scene.timestamp}</td>
                              <td className="px-4 py-4 text-slate-300 text-xs align-top">
                                <span className="bg-wes-900 px-2 py-1 rounded text-slate-400 inline-block mb-1 border border-wes-700/50">B-Roll</span>
                                <p className="italic">{scene.visual}</p>
                              </td>
                              <td className="px-4 py-4 text-slate-200 align-top leading-relaxed">
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => handlePlayAudio(scene.audio, idx)}
                                    disabled={playingScene !== null}
                                    className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                      playingScene === idx 
                                        ? 'bg-wes-accent text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                                        : 'bg-wes-700 text-slate-400 hover:bg-wes-600 hover:text-white'
                                    } ${playingScene !== null && playingScene !== idx ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    title="Play Narration"
                                  >
                                    {playingScene === idx ? (
                                      <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                                    ) : (
                                      <i className="fa-solid fa-play text-xs pl-0.5"></i>
                                    )}
                                  </button>
                                  <p>{scene.audio}</p>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            )}

            {/* ASSETS TAB */}
            {activeTab === 'assets' && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Thumbnail Section */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <i className="fa-solid fa-image mr-2 text-purple-400"></i>
                      Thumbnail Lab
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {result.thumbnailPrompts.map((prompt, i) => (
                        <div key={i} className="bg-wes-800 rounded-lg border border-wes-700 overflow-hidden flex flex-col md:flex-row">
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Concept {i+1}</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed mb-4">{prompt}</p>
                              </div>
                              <button 
                                onClick={() => handleGenerateThumbnail(prompt, i)}
                                disabled={generatingImage === i}
                                className="self-start px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center"
                              >
                                {generatingImage === i ? (
                                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                                ) : (
                                  <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                                )}
                                Generate Visual
                              </button>
                            </div>
                            
                            <div className="w-full md:w-64 bg-black/40 min-h-[160px] flex items-center justify-center border-t md:border-t-0 md:border-l border-wes-700 relative">
                              {result.generatedImages?.[i] ? (
                                <div className="relative w-full h-full group">
                                  <img 
                                    src={result.generatedImages[i]} 
                                    alt={`Thumbnail ${i+1}`} 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a 
                                      href={result.generatedImages[i]} 
                                      download={`wes-thumbnail-${i}.png`}
                                      className="px-3 py-2 bg-wes-accent text-white rounded-full text-xs font-bold hover:bg-blue-600 transition-colors"
                                      title="Download Image"
                                    >
                                      <i className="fa-solid fa-download mr-1"></i> Save
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-600 flex flex-col items-center">
                                  <i className="fa-regular fa-image text-3xl mb-2"></i>
                                  <span className="text-xs">No Preview</span>
                                </div>
                              )}
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Music Section */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <i className="fa-solid fa-headphones mr-2 text-pink-400"></i>
                      Sonic Architecture
                    </h3>
                    <div className="bg-wes-800 p-5 rounded-lg border border-wes-700">
                        <h4 className="text-xs font-bold text-pink-400 uppercase mb-2">Music Prompt (Suno/Udio)</h4>
                        <p className="text-sm text-slate-200 font-mono bg-wes-900 p-3 rounded border border-wes-700 mb-4">{result.musicPrompt}</p>
                        
                        <h4 className="text-xs font-bold text-pink-400 uppercase mb-2">General Visual Aesthetic</h4>
                        <p className="text-sm text-slate-300">{result.imageGenPrompt}</p>
                    </div>
                  </div>
                </div>
            )}

            {/* SEO TAB */}
            {activeTab === 'seo' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-wes-800 p-6 rounded-lg border border-wes-700">
                    <div className="mb-6">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Optimized Title</label>
                      <div className="text-xl text-white font-bold select-all bg-wes-900 p-3 rounded border border-wes-700">
                        {result.title}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Description</label>
                      <textarea 
                        readOnly 
                        className="w-full h-48 bg-wes-900 p-3 rounded border border-wes-700 text-sm text-slate-300 font-mono resize-none focus:outline-none"
                        value={result.description}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map(tag => (
                          <span key={tag} className="text-xs bg-wes-700 text-slate-200 px-3 py-1.5 rounded-full border border-wes-600 select-all cursor-pointer hover:bg-wes-600 hover:border-wes-500 transition-colors">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
            )}

          </div>
        </>
      )}
    </div>
  );
};