import React, { useState } from 'react';
import { GeneratedPackage, ChannelConfig } from '../../types';
import { Loader } from '../../components/Loader';
import { ScriptTab } from './tabs/ScriptTab';
import { AssetsTab } from './tabs/AssetsTab';
import { SeoTab } from './tabs/SeoTab';
import { VideoTab } from './tabs/VideoTab';
import { LocationTab } from './tabs/LocationTab';
import { exportProductionKit } from '../../lib/export';
import { useToast } from '../../context/ToastContext';

interface OutputPanelProps {
  uiState: {
    loading: boolean;
    activeTab: 'script' | 'assets' | 'seo' | 'video' | 'locations';
    setActiveTab: (tab: 'script' | 'assets' | 'seo' | 'video' | 'locations') => void;
    generatingImage: number | null;
    generatingSceneVisual: number | null;
    editingImage?: number | null;
    editingSceneVisual?: number | null;
    refiningScene?: {index: number, field: 'visual' | 'audio'} | null;
    playingScene: number | null;
    downloadingAudio: number | null;
    scouting: boolean;
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
    handleScoutLocations?: () => void;
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
    <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative shadow-2xl shadow-black/50 min-h-[500px]">
      {!result && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-60 p-6 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-wes-800 flex items-center justify-center mb-6 border border-wes-700">
             <i className="fa-solid fa-terminal text-3xl md:text-4xl text-slate-500"></i>
          </div>
          <p className="text-lg md:text-xl font-medium text-slate-400 tracking-tight">System Ready</p>
          <p className="text-xs md:text-sm font-mono mt-2">Awaiting Input Stream...</p>
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
          <div className="p-4 border-b border-wes-700 bg-wes-800/30 flex flex-col gap-4 shrink-0">
            {/* Title Row */}
            <div className="flex items-center space-x-3 w-full">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_8px] ${activeChannelConfig.color.replace('text-', 'bg-').replace('400', '500')} ${activeChannelConfig.color.replace('text-', 'shadow-')}`}></div>
                <h2 className="text-sm font-bold text-slate-200 truncate tracking-wide flex-1">{result.title}</h2>
            </div>
            
            {/* Tabs & Actions Row - Scrollable on mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                <div className="flex bg-wes-800 rounded-lg p-1 border border-wes-700 overflow-x-auto max-w-full no-scrollbar">
                  {(['script', 'assets', 'seo', 'video', 'locations'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all whitespace-nowrap flex-shrink-0 ${
                        activeTab === tab 
                        ? 'bg-wes-accent text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' 
                        : 'text-slate-500 hover:text-slate-200 hover:bg-wes-700'
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
                  w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all border whitespace-nowrap
                  ${isExporting 
                    ? 'bg-wes-800 text-slate-400 border-wes-700 cursor-wait' 
                    : 'bg-gradient-to-r from-wes-success/80 to-emerald-600 text-white border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105'}
                `}
                title="Export Script, Metadata, and Assets as ZIP"
              >
                {isExporting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>{exportStatus || 'Building...'}</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-file-zipper"></i>
                    <span>Export Kit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-wes-800/10">
            
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

            {activeTab === 'locations' && (
              <LocationTab 
                result={result}
                onScout={actions.handleScoutLocations || (() => {})}
                isScouting={uiState.scouting}
              />
            )}

          </div>
        </>
      )}
    </div>
  );
});