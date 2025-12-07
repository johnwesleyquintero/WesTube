import React, { useState } from 'react';
import { GeneratedPackage } from '../../../types';
import { CopyButton } from '../../../components/CopyButton';
import { ScriptTableView } from './views/ScriptTableView';
import { ScriptStoryboardView } from './views/ScriptStoryboardView';

interface ScriptTabProps {
  result: GeneratedPackage;
  handleUpdateScript?: (idx: number, field: 'visual' | 'audio', val: string) => void;
  handlePlayAudio: (text: string, idx: number) => void;
  handleDownloadAudio: (text: string, idx: number) => void;
  handleGenerateSceneVisual?: (prompt: string, idx: number) => void;
  handleEditSceneVisual?: (base64: string, prompt: string, idx: number) => void;
  generatingSceneVisual?: number | null;
  editingSceneVisual?: number | null;
  playingScene: number | null;
  downloadingAudio: number | null;
}

export const ScriptTab: React.FC<ScriptTabProps> = ({
  result,
  handleUpdateScript,
  handlePlayAudio,
  handleDownloadAudio,
  handleGenerateSceneVisual,
  handleEditSceneVisual,
  generatingSceneVisual,
  editingSceneVisual,
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

      {viewMode === 'table' ? (
        <ScriptTableView 
          result={result}
          handleUpdateScript={handleUpdateScript}
          handleGenerateSceneVisual={handleGenerateSceneVisual}
          generatingSceneVisual={generatingSceneVisual}
          batchProcessing={batchProcessing}
          handlePlayAudio={handlePlayAudio}
          playingScene={playingScene}
          handleDownloadAudio={handleDownloadAudio}
          downloadingAudio={downloadingAudio}
        />
      ) : (
        <ScriptStoryboardView 
          result={result}
          handleUpdateScript={handleUpdateScript}
          handleGenerateSceneVisual={handleGenerateSceneVisual}
          handleEditSceneVisual={handleEditSceneVisual}
          generatingSceneVisual={generatingSceneVisual}
          editingSceneVisual={editingSceneVisual}
          batchProcessing={batchProcessing}
          handlePlayAudio={handlePlayAudio}
          playingScene={playingScene}
          handleDownloadAudio={handleDownloadAudio}
        />
      )}
    </div>
  );
};