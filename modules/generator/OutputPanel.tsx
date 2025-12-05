import React, { useState } from 'react';
import { GeneratedPackage, ChannelConfig } from '../../types';

interface OutputPanelProps {
  loading: boolean;
  result: GeneratedPackage | null;
  activeTab: 'script' | 'assets' | 'seo';
  setActiveTab: (tab: 'script' | 'assets' | 'seo') => void;
  activeChannelConfig: ChannelConfig;
  generatingImage: number | null;
  generatingSceneVisual?: number | null;
  playingScene: number | null;
  downloadingAudio: number | null;
  downloadPackage: () => void;
  handleGenerateThumbnail: (prompt: string, idx: number) => void;
  handleGenerateSceneVisual?: (prompt: string, idx: number) => void;
  handlePlayAudio: (text: string, idx: number) => void;
  handleDownloadAudio: (text: string, idx: number) => void;
}

// -- Helper Component: Copy Button --
const CopyButton: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-slate-500 hover:text-wes-accent transition-all flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-white/5 ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <i className="fa-solid fa-check text-wes-success"></i>
          <span className="text-wes-success">Copied</span>
        </>
      ) : (
        <>
          <i className="fa-regular fa-copy"></i>
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

const Loader = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-6">
    <div className="relative">
       <div className="w-16 h-16 rounded-full border-2 border-wes-accent/20 border-t-wes-accent animate-spin"></div>
       <div className="absolute inset-0 rounded-full border-2 border-wes-pop/20 border-b-wes-pop animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
       <div className="absolute inset-0 flex items-center justify-center">
         <i className="fa-solid fa-brain text-wes-accent animate-pulse"></i>
       </div>
    </div>
    <div className="text-center">
        <p className="text-white font-mono text-sm tracking-widest uppercase">Processing</p>
        <p className="text-slate-500 text-xs mt-1">Aligning channel persona...</p>
    </div>
  </div>
);

export const OutputPanel: React.FC<OutputPanelProps> = ({
  loading, result, activeTab, setActiveTab, activeChannelConfig,
  generatingImage, generatingSceneVisual, playingScene, downloadingAudio, downloadPackage, 
  handleGenerateThumbnail, handleGenerateSceneVisual, handlePlayAudio, handleDownloadAudio
}) => {
  return (
    <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative shadow-2xl shadow-black/50">
      {!result && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 opacity-60">
          <div className="w-24 h-24 rounded-full bg-wes-800/50 flex items-center justify-center mb-6 border border-white/5">
             <i className="fa-solid fa-terminal text-4xl text-slate-600"></i>
          </div>
          <p className="text-xl font-medium text-slate-500 tracking-tight">System Ready</p>
          <p className="text-sm font-mono mt-2">Awaiting Input Stream...</p>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-wes-950/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <Loader />
        </div>
      )}

      {result && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${activeChannelConfig.color.replace('text-', 'bg-').replace('400', '500')} ${activeChannelConfig.color.replace('text-', 'shadow-')}`}></div>
                <h2 className="text-sm font-bold text-white truncate max-w-[200px] tracking-wide">{result.title}</h2>
            </div>
            
            <div className="flex space-x-3">
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                  {(['script', 'assets', 'seo'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                        activeTab === tab 
                        ? 'bg-wes-accent text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' 
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

              <button 
                onClick={downloadPackage}
                className="text-xs bg-wes-800 hover:bg-wes-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10"
              >
                <i className="fa-solid fa-download"></i>
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-wes-900/20">
            
            {/* SCRIPT TAB */}
            {activeTab === 'script' && (
              <div className="space-y-6 animate-fadeIn">
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

                  <div className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <h3 className="text-lg font-bold text-white tracking-tight">Scene Breakdown</h3>
                        <span className="text-xs text-slate-500 font-mono">{result.script.length} Scenes Generated</span>
                    </div>
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
                                  <div className="flex-1">
                                    <p className="mb-4 leading-relaxed">{scene.visual}</p>
                                    
                                    {/* B-Roll Image or Generate Button */}
                                    {scene.generatedVisual ? (
                                      <div className="relative rounded-lg overflow-hidden border border-white/10 w-full md:w-48 group/img shadow-lg">
                                        <img src={scene.generatedVisual} alt="B-roll" className="w-full h-auto object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-end p-2">
                                          <a 
                                            href={scene.generatedVisual} 
                                            download={`broll-${idx}.png`}
                                            className="text-white hover:text-wes-accent transition-colors"
                                          >
                                            <i className="fa-solid fa-download"></i>
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      handleGenerateSceneVisual && (
                                        <button 
                                          onClick={() => handleGenerateSceneVisual(scene.visual, idx)}
                                          disabled={generatingSceneVisual === idx}
                                          className="text-[10px] bg-black/30 hover:bg-wes-accent/20 text-slate-400 hover:text-white px-3 py-1.5 rounded border border-white/10 hover:border-wes-accent/30 transition-all flex items-center gap-2 opacity-60 group-hover:opacity-100"
                                        >
                                          {generatingSceneVisual === idx ? (
                                            <i className="fa-solid fa-circle-notch fa-spin text-wes-accent"></i>
                                          ) : (
                                            <i className="fa-solid fa-image"></i>
                                          )}
                                          Generate Visual Asset
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 text-slate-200 align-top leading-relaxed">
                                <div className="flex flex-col gap-3">
                                  <div className="flex gap-2">
                                      {/* Play Button */}
                                      <button 
                                        onClick={() => handlePlayAudio(scene.audio, idx)}
                                        disabled={playingScene !== null || downloadingAudio !== null}
                                        className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                                          playingScene === idx 
                                            ? 'bg-wes-accent text-white border-wes-accent shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                                            : 'bg-black/30 border-white/10 text-slate-500 hover:text-white hover:border-wes-accent/50'
                                        } ${(playingScene !== null && playingScene !== idx) || downloadingAudio !== null ? 'opacity-30 cursor-not-allowed' : ''}`}
                                        title="Play Narration"
                                      >
                                        {playingScene === idx ? (
                                          <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i>
                                        ) : (
                                          <i className="fa-solid fa-play text-[10px] pl-0.5"></i>
                                        )}
                                      </button>

                                      {/* Download Button */}
                                      <button 
                                        onClick={() => handleDownloadAudio(scene.audio, idx)}
                                        disabled={playingScene !== null || downloadingAudio !== null}
                                        className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                                          downloadingAudio === idx 
                                            ? 'bg-wes-success text-white border-wes-success shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                                            : 'bg-black/30 border-white/10 text-slate-500 hover:text-wes-success hover:border-wes-success/50'
                                        } ${(playingScene !== null) || (downloadingAudio !== null && downloadingAudio !== idx) ? 'opacity-30 cursor-not-allowed' : ''}`}
                                        title="Download WAV"
                                      >
                                        {downloadingAudio === idx ? (
                                          <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i>
                                        ) : (
                                          <i className="fa-solid fa-download text-[10px]"></i>
                                        )}
                                      </button>
                                  </div>
                                  <p className="text-slate-300 font-light">{scene.audio}</p>
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
                      <span className="w-8 h-8 rounded-lg bg-wes-pop/10 flex items-center justify-center mr-3 border border-wes-pop/20 text-wes-pop">
                        <i className="fa-solid fa-image"></i>
                      </span>
                      Thumbnail Lab
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {result.thumbnailPrompts.map((prompt, i) => (
                        <div key={i} className="glass-panel rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg">
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[10px] font-bold text-wes-pop uppercase tracking-widest bg-wes-pop/10 px-2 py-1 rounded">Variant {i+1}</span>
                                  <CopyButton text={prompt} />
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">{prompt}</p>
                              </div>
                              <button 
                                onClick={() => handleGenerateThumbnail(prompt, i)}
                                disabled={generatingImage === i}
                                className="self-start px-5 py-2.5 bg-wes-pop/10 hover:bg-wes-pop/20 text-wes-pop border border-wes-pop/20 hover:border-wes-pop/40 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                              >
                                {generatingImage === i ? (
                                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                                ) : (
                                  <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                                )}
                                Render Asset
                              </button>
                            </div>
                            
                            <div className="w-full md:w-72 bg-black/50 min-h-[180px] flex items-center justify-center border-t md:border-t-0 md:border-l border-white/5 relative group">
                              {result.generatedImages?.[i] ? (
                                <>
                                  <img 
                                    src={result.generatedImages[i]} 
                                    alt={`Thumbnail ${i+1}`} 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                    <a 
                                      href={result.generatedImages[i]} 
                                      download={`wes-thumbnail-${i}.png`}
                                      className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:scale-105 transition-transform"
                                      title="Download Image"
                                    >
                                      <i className="fa-solid fa-download mr-1"></i> Save
                                    </a>
                                  </div>
                                </>
                              ) : (
                                <div className="text-slate-600 flex flex-col items-center">
                                  <i className="fa-regular fa-image text-3xl mb-2 opacity-50"></i>
                                  <span className="text-[10px] uppercase tracking-widest">Preview Area</span>
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
                      <span className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center mr-3 border border-pink-500/20 text-pink-500">
                        <i className="fa-solid fa-headphones"></i>
                      </span>
                      Sonic Architecture
                    </h3>
                    <div className="glass-panel p-6 rounded-xl border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.05)]">
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Prompt Engineering (Suno/Udio)</h4>
                           <CopyButton text={result.musicPrompt} />
                        </div>
                        <p className="text-sm text-pink-100/80 font-mono bg-pink-500/10 p-4 rounded-lg border border-pink-500/20 mb-6">{result.musicPrompt}</p>
                        
                        <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2">Visual Aesthetic Guideline</h4>
                        <p className="text-sm text-slate-300 font-light">{result.imageGenPrompt}</p>
                    </div>
                  </div>
                </div>
            )}

            {/* SEO TAB */}
            {activeTab === 'seo' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="glass-panel p-8 rounded-xl">
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Optimized Title</label>
                        <CopyButton text={result.title} />
                      </div>
                      <div className="text-2xl text-white font-bold select-all bg-black/20 p-4 rounded-lg border border-white/10 leading-snug">
                        {result.title}
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <CopyButton text={result.description} />
                      </div>
                      <textarea 
                        readOnly 
                        className="w-full h-48 bg-black/20 p-4 rounded-lg border border-white/10 text-sm text-slate-300 font-mono resize-none focus:outline-none custom-scrollbar"
                        value={result.description}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Keywords / Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map(tag => (
                          <span key={tag} className="text-xs bg-wes-800/50 text-slate-300 px-3 py-1.5 rounded-full border border-white/10 select-all cursor-pointer hover:bg-wes-accent/20 hover:text-white hover:border-wes-accent/40 transition-all">
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