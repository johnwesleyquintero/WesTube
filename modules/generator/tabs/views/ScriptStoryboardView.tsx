
import React from 'react';
import { GeneratedPackage } from '../../../../types';

interface ScriptStoryboardViewProps {
  result: GeneratedPackage;
  handleUpdateScript?: (idx: number, field: 'visual' | 'audio', val: string) => void;
  handleGenerateSceneVisual?: (prompt: string, idx: number) => void;
  generatingSceneVisual?: number | null;
  batchProcessing: boolean;
  handlePlayAudio: (text: string, idx: number) => void;
  playingScene: number | null;
  handleDownloadAudio: (text: string, idx: number) => void;
}

export const ScriptStoryboardView: React.FC<ScriptStoryboardViewProps> = ({
  result,
  handleUpdateScript,
  handleGenerateSceneVisual,
  generatingSceneVisual,
  batchProcessing,
  handlePlayAudio,
  playingScene,
  handleDownloadAudio
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
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
  );
};
