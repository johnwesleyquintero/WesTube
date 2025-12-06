
import React from 'react';
import { GeneratedPackage } from '../../../../types';

interface ScriptTableViewProps {
  result: GeneratedPackage;
  handleUpdateScript?: (idx: number, field: 'visual' | 'audio', val: string) => void;
  handleGenerateSceneVisual?: (prompt: string, idx: number) => void;
  generatingSceneVisual?: number | null;
  batchProcessing: boolean;
  handlePlayAudio: (text: string, idx: number) => void;
  playingScene: number | null;
  handleDownloadAudio: (text: string, idx: number) => void;
  downloadingAudio: number | null;
}

export const ScriptTableView: React.FC<ScriptTableViewProps> = ({
  result,
  handleUpdateScript,
  handleGenerateSceneVisual,
  generatingSceneVisual,
  batchProcessing,
  handlePlayAudio,
  playingScene,
  handleDownloadAudio,
  downloadingAudio
}) => {
  return (
    <div className="glass-panel rounded-xl overflow-hidden animate-fadeIn">
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
  );
};
