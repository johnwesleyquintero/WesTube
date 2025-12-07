import React, { useState } from 'react';
import { GeneratedPackage, ChannelConfig } from '../../types';
import { Loader } from '../../components/Loader';
import { ScriptTab } from './tabs/ScriptTab';
import { AssetsTab } from './tabs/AssetsTab';
import { SeoTab } from './tabs/SeoTab';
import { VideoTab } from './tabs/VideoTab';
import { exportProductionKit } from '../../lib/export';
import { useToast } from '../../context/ToastContext';

interface OutputPanelProps {
  uiState: {
    loading: boolean;
    activeTab: 'script' | 'assets' | 'seo' | 'video';
    setActiveTab: (tab: 'script' | 'assets' | 'seo' | 'video') => void;
    generatingImage: number | null;
    generatingSceneVisual: number | null;
    editingImage?: number | null;
    editingSceneVisual?: number | null;
    refiningScene?: {index: number, field: 'visual' | 'audio'} | null;
    playingScene: number | null;
    downloadingAudio: number | null;
  };
  dataState: {
    result: GeneratedPackage | null;
  };
  actions: {
    downloadPackage: () => void;
    handleUpdateScript: (idx: number, field: 'visual' | 'audio', val: string) => void;
    handleRefineScript?: (idx: number, field: 'visual' | 'audio', instruction: string) => void;
    handleGenerateThumbnail: (prompt: string, idx: number) => void;
    handleEditThumbnail: (base64: string, prompt: string, idx: number) => void;
    handleGenerateSceneVisual: (prompt: string, idx: number) => void;
    handleEditSceneVisual: (base64: string, prompt: string, idx: number) => void;
    handlePlayAudio: (text: string, idx: number) => void;
    handleDownloadAudio: (text: string, idx: number) => void;
    handleVideoGenerated?: (key: string, url: string) => void;
  };
  formState: {
    activeChannelConfig: ChannelConfig;
  };
}

export const OutputPanel: React.FC<OutputPanelProps> = React.memo(({
  uiState, dataState, actions, formState
}) => {
  const { result } = dataState;
  const { activeChannelConfig } = formState;
  const { loading, activeTab, setActiveTab } = uiState;
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const toast = useToast();

  const handleExportKit = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      await exportProductionKit(result, (msg) => setExportStatus(msg));
      toast.success("Production Kit Exported Successfully.");
    } catch (e) {
      toast.error("Failed to export production kit.");
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

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
                  {(['script', 'assets', 'seo', 'video'] as const).map((tab) => (
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

              {/* Export Production Kit Button */}
              <button 
                onClick={handleExportKit}
                disabled={isExporting}
                className={`
                  flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all border
                  ${isExporting 
                    ? 'bg-wes-800 text-slate-400 border-wes-700 cursor-wait' 
                    : 'bg-gradient-to-r from-wes-success/80 to-emerald-600 text-white border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105'}
                `}
                title="Export Script, Metadata, and Assets as ZIP"
              >
                {isExporting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span className="hidden xl:inline">{exportStatus || 'Building...'}</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-file-zipper"></i>
                    <span className="hidden xl:inline">Export Kit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-wes-900/20">
            
            {activeTab === 'script' && (
              <ScriptTab 
                result={result}
                handleUpdateScript={actions.handleUpdateScript}
                handleRefineScript={actions.handleRefineScript}
                handlePlayAudio={actions.handlePlayAudio}
                handleDownloadAudio={actions.handleDownloadAudio}
                handleGenerateSceneVisual={actions.handleGenerateSceneVisual}
                handleEditSceneVisual={actions.handleEditSceneVisual}
                generatingSceneVisual={uiState.generatingSceneVisual}
                editingSceneVisual={uiState.editingSceneVisual}
                refiningScene={uiState.refiningScene}
                playingScene={uiState.playingScene}
                downloadingAudio={uiState.downloadingAudio}
              />
            )}

            {activeTab === 'assets' && (
              <AssetsTab 
                result={result}
                handleGenerateThumbnail={actions.handleGenerateThumbnail}
                handleEditThumbnail={actions.handleEditThumbnail}
                generatingImage={uiState.generatingImage}
                editingImage={uiState.editingImage}
              />
            )}

            {activeTab === 'seo' && (
              <SeoTab result={result} />
            )}

            {activeTab === 'video' && (
              <VideoTab 
                result={result}
                onVideoGenerated={actions.handleVideoGenerated || (() => {})}
                savedVideos={result.generatedVideos || {}}
              />
            )}

          </div>
        </>
      )}
    </div>
  );
});