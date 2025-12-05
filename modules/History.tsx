import React, { useEffect, useState } from 'react';
import { getHistory, deleteHistoryItem } from '../lib/history';
import { GeneratedPackage, ChannelId } from '../types';
import { CHANNELS } from '../constants';
import { OutputPanel } from './generator/OutputPanel';
import { generateSpeech } from '../lib/gemini';
import { playRawAudio, createWavBlob } from '../lib/audio';

export const History: React.FC = () => {
  const [history, setHistory] = useState<GeneratedPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GeneratedPackage | null>(null);
  const [viewerTab, setViewerTab] = useState<'script' | 'assets' | 'seo'>('script');

  // Audio State
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const [downloadingAudio, setDownloadingAudio] = useState<number | null>(null);
  const [audioCache, setAudioCache] = useState<Record<number, string>>({});

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

  // Reset audio cache when switching items
  useEffect(() => {
    setAudioCache({});
    setPlayingScene(null);
    setDownloadingAudio(null);
  }, [selectedItem]);

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
  const getActiveChannelConfig = () => {
    if (!selectedItem || !selectedItem.channelId) return CHANNELS[ChannelId.TECH];
    return CHANNELS[selectedItem.channelId] || CHANNELS[ChannelId.TECH];
  };

  const handlePlayAudio = async (text: string, index: number) => {
    if (!selectedItem || playingScene !== null) return;
    setPlayingScene(index);

    try {
      let base64Audio = audioCache[index];
      const config = getActiveChannelConfig();
      
      // If not cached, generate it
      if (!base64Audio) {
        base64Audio = await generateSpeech(text, config.voice);
        setAudioCache(prev => ({ ...prev, [index]: base64Audio }));
      }

      // Play it
      await playRawAudio(base64Audio);
    } catch (e) {
      console.error("Audio playback failed", e);
      alert("Failed to generate audio preview.");
    } finally {
      setPlayingScene(null);
    }
  };

  const handleDownloadAudio = async (text: string, index: number) => {
    if (!selectedItem || downloadingAudio !== null) return;
    setDownloadingAudio(index);

    try {
      let base64Audio = audioCache[index];
      const config = getActiveChannelConfig();
      
      // If not cached, generate it first
      if (!base64Audio) {
        base64Audio = await generateSpeech(text, config.voice);
        setAudioCache(prev => ({ ...prev, [index]: base64Audio }));
      }

      // Create WAV blob and download
      const wavBlob = createWavBlob(base64Audio);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wes-narrator-${selectedItem.id}-scene-${index}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Audio download failed", e);
      alert("Failed to download audio.");
    } finally {
      setDownloadingAudio(null);
    }
  };

  // Helper to format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Unknown Date';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

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
            history.map(item => {
              const channel = item.channelId ? CHANNELS[item.channelId] : CHANNELS[ChannelId.TECH]; // Fallback
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all group ${
                    selectedItem?.id === item.id
                      ? 'bg-wes-700 border-wes-accent shadow-md'
                      : 'bg-wes-900 border-wes-700 hover:border-slate-500 hover:bg-wes-900/80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${channel.color.replace('text-','bg-')}`}></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{channel.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">{formatDate(item.createdAt)}</span>
                  </div>
                  
                  <h3 className="font-bold text-slate-200 text-sm mb-1 line-clamp-1 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       onClick={(e) => handleDownload(e, item)}
                       className="p-1.5 text-slate-500 hover:text-wes-accent hover:bg-wes-800 rounded"
                       title="Download JSON"
                     >
                       <i className="fa-solid fa-download"></i>
                     </button>
                     <button 
                       onClick={(e) => handleDelete(e, item.id || '')}
                       className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-wes-800 rounded"
                       title="Delete"
                     >
                       <i className="fa-solid fa-trash"></i>
                     </button>
                  </div>
                </div>
              );
            })
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
             
             {/* Reusing OutputPanel in Read-Only Mode */}
             <OutputPanel 
                loading={false}
                result={selectedItem}
                activeTab={viewerTab}
                setActiveTab={setViewerTab}
                activeChannelConfig={getActiveChannelConfig()}
                generatingImage={null}
                playingScene={playingScene}
                downloadingAudio={downloadingAudio}
                downloadPackage={() => {
                  const blob = new Blob([JSON.stringify(selectedItem, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `wes-history-${selectedItem.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                handleGenerateThumbnail={() => alert('Live generation is disabled in History view.')}
                handlePlayAudio={handlePlayAudio}
                handleDownloadAudio={handleDownloadAudio}
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