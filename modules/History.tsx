import React, { useEffect, useState, useCallback } from 'react';
import { getHistory, deleteHistoryItem } from '../lib/history';
import { GeneratedPackage, ChannelId } from '../types';
import { CHANNELS } from '../constants';
import { OutputPanel } from './generator/OutputPanel';
import { useAudio } from '../hooks/useAudio';
import { useAssetGenerator } from '../hooks/useAssetGenerator';
import { updatePackageSceneVisual, updatePackageThumbnail } from '../lib/packageManipulation';
import { HistoryListItem } from './history/HistoryListItem';

export const History: React.FC = () => {
  const [history, setHistory] = useState<GeneratedPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GeneratedPackage | null>(null);
  const [viewerTab, setViewerTab] = useState<'script' | 'assets' | 'seo'>('script');

  // Shared Logic Hooks
  const { 
    generatingImage, 
    generatingSceneVisual, 
    generateThumbnailAsset, 
    generateSceneAsset 
  } = useAssetGenerator();

  const { 
    playingIndex, 
    downloadingIndex, 
    playAudio, 
    downloadAudio,
    resetAudioState,
    invalidateCache
  } = useAudio();

  const refreshHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  // Reset audio cache when switching items (by ID), NOT on every state update
  useEffect(() => {
    resetAudioState();
  }, [selectedItem?.id, resetAudioState]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this record from the cloud?')) {
      await deleteHistoryItem(id);
      await refreshHistory();
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleDownload = (e: React.MouseEvent, item: GeneratedPackage) => {
    e.stopPropagation();
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wes-history-${item.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to get active channel config safely
  const getActiveChannelConfig = useCallback(() => {
    if (!selectedItem || !selectedItem.channelId) return CHANNELS[ChannelId.TECH];
    return CHANNELS[selectedItem.channelId] || CHANNELS[ChannelId.TECH];
  }, [selectedItem]);

  const handlePlayAudio = useCallback((text: string, index: number) => {
    if (!selectedItem || !text) return;
    playAudio(text, getActiveChannelConfig().voice, index);
  }, [selectedItem, playAudio, getActiveChannelConfig]);

  const handleDownloadAudio = useCallback((text: string, index: number) => {
    if (!selectedItem || !text) return;
    downloadAudio(text, getActiveChannelConfig().voice, index, `wes-narrator-${selectedItem.id}`);
  }, [selectedItem, downloadAudio, getActiveChannelConfig]);

  // --- Optimized Update Logic using packageUtils ---

  const handleGenerateThumbnail = async (prompt: string, index: number) => {
    if (!selectedItem) return;
    
    const base64Image = await generateThumbnailAsset(prompt, index);
    if (!base64Image) return;

    const updatedItem = updatePackageThumbnail(selectedItem, index, base64Image);
    
    setSelectedItem(updatedItem);
    // Persist to local list view
    setHistory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleGenerateSceneVisual = async (visualPrompt: string, index: number) => {
    if (!selectedItem) return;
    
    const base64Image = await generateSceneAsset(visualPrompt, index, getActiveChannelConfig());
    if (!base64Image) return;

    const updatedItem = updatePackageSceneVisual(selectedItem, index, base64Image);
    
    setSelectedItem(updatedItem);
    // Persist to local list view
    setHistory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleUpdateScript = useCallback((index: number, field: 'visual' | 'audio', value: string) => {
    if (!selectedItem) return;
    
    if (field === 'audio') {
      invalidateCache(index);
    }

    const updatedScript = [...selectedItem.script];
    updatedScript[index] = {
      ...updatedScript[index],
      [field]: value
    };
    
    const updatedItem = {
      ...selectedItem,
      script: updatedScript
    };

    setSelectedItem(updatedItem);
    setHistory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  }, [selectedItem, invalidateCache]);

  const handleDownloadPackage = useCallback(() => {
    if (!selectedItem) return;
    const blob = new Blob([JSON.stringify(selectedItem, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wes-history-${selectedItem.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedItem]);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden gap-6">
      
      {/* List Column */}
      <div className={`${selectedItem ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col bg-wes-800 rounded-xl border border-wes-700 shadow-xl overflow-hidden`}>
        <div className="p-5 border-b border-wes-700 bg-wes-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center">
              <i className="fa-solid fa-clock-rotate-left mr-3 text-slate-400"></i>
              Cloud Archive
            </h2>
            <p className="text-sm text-slate-400">Saved productions.</p>
          </div>
          <button onClick={refreshHistory} className="text-slate-400 hover:text-white p-2">
            <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">
              <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i>
              <p>Syncing database...</p>
            </div>
          ) : history.length === 0 ? (
             <div className="text-center py-10 text-slate-500">
               <i className="fa-solid fa-box-open text-4xl mb-3 opacity-50"></i>
               <p>No history found in cloud.</p>
             </div>
          ) : (
            history.map(item => (
              <HistoryListItem 
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onSelect={setSelectedItem}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Viewer Column */}
      <div className={`flex-1 flex-col ${selectedItem ? 'flex' : 'hidden md:flex'}`}>
         {selectedItem ? (
           <div className="h-full flex flex-col">
             <div className="md:hidden mb-2">
               <button onClick={() => setSelectedItem(null)} className="text-slate-400 text-sm flex items-center">
                 <i className="fa-solid fa-arrow-left mr-2"></i> Back to List
               </button>
             </div>
             
             {/* Reusing OutputPanel in Live Mode */}
             <OutputPanel 
                uiState={{
                  loading: false,
                  activeTab: viewerTab,
                  setActiveTab: setViewerTab,
                  generatingImage: generatingImage,
                  generatingSceneVisual: generatingSceneVisual,
                  playingScene: playingIndex,
                  downloadingAudio: downloadingIndex
                }}
                dataState={{
                  result: selectedItem
                }}
                formState={{
                  activeChannelConfig: getActiveChannelConfig()
                }}
                actions={{
                  downloadPackage: handleDownloadPackage,
                  handleUpdateScript: handleUpdateScript,
                  handleGenerateThumbnail: handleGenerateThumbnail,
                  handleGenerateSceneVisual: handleGenerateSceneVisual,
                  handlePlayAudio: handlePlayAudio,
                  handleDownloadAudio: handleDownloadAudio
                }}
             />
           </div>
         ) : (
           <div className="h-full bg-wes-800/20 rounded-xl border border-wes-700/50 flex flex-col items-center justify-center text-slate-600 border-dashed">
             <i className="fa-solid fa-cloud text-6xl mb-4 opacity-50"></i>
             <p className="text-xl font-medium">Select a record</p>
             <p className="text-sm">View details of past productions stored in Supabase</p>
           </div>
         )}
      </div>

    </div>
  );
};