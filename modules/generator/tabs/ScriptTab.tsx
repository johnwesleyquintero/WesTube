import React from 'react';
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

  return (
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
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white tracking-tight">Scene Breakdown</h3>
              <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">{result.script.length} Scenes</span>
            </div>
            <button 
              onClick={downloadScriptTxt}
              className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-white flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded transition-colors"
            >
              <i className="fa-solid fa-file-lines"></i>
              Export .txt
            </button>
        </div>
        <div className="glass-panel rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/30 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-5 py-3 w-28 border-b border-white/5">Timeline</th>
                <th className="px-5 py-3 w-5/12 border-b border-white/5">Visual Protocol (Editable)</th>
                <th className="px-5 py-3 border-b border-white/5">Audio Stream (Editable)</th>
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
                        {/* Editable Visual Prompt */}
                        <textarea 
                          value={scene.visual}
                          onChange={(e) => handleUpdateScript?.(idx, 'visual', e.target.value)}
                          className="w-full bg-transparent text-slate-300 text-xs leading-relaxed resize-none outline-none focus:bg-black/20 focus:p-2 focus:rounded rounded -ml-2 p-2 border border-transparent focus:border-wes-accent/30 transition-all placeholder-slate-600"
                          rows={3}
                          placeholder="Describe the visual scene..."
                        />
                        
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
                            title="Play Narration (Regenerates if edited)"
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
                      
                      {/* Editable Audio Script */}
                      <textarea 
                          value={scene.audio}
                          onChange={(e) => handleUpdateScript?.(idx, 'audio', e.target.value)}
                          className="w-full bg-transparent text-slate-200 font-light leading-relaxed resize-none outline-none focus:bg-black/20 focus:p-2 focus:rounded rounded -ml-2 p-2 border border-transparent focus:border-wes-accent/30 transition-all"
                          rows={4}
                          placeholder="Enter narration text..."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};