import React, { useEffect } from 'react';
import { useGenerator } from '../hooks/useGenerator';
import { InputPanel } from './generator/InputPanel';
import { OutputPanel } from './generator/OutputPanel';

interface GeneratorProps {
  initialTab?: string;
}

export const Generator: React.FC<GeneratorProps> = ({ initialTab }) => {
  const {
    // State
    loading,
    result,
    activeTab,
    setActiveTab,
    generatingImage,
    generatingSceneVisual,
    playingScene,
    downloadingAudio,
    topic,
    setTopic,
    selectedChannel,
    setSelectedChannel,
    mood,
    setMood,
    duration,
    setDuration,
    activeChannelConfig,
    
    // Handlers
    handleGenerate,
    handleUpdateScript,
    handleGenerateThumbnail,
    handleGenerateSceneVisual,
    handlePlayAudio,
    handleDownloadAudio,
    downloadPackage
  } = useGenerator();

  // Sync sidebar navigation with internal tabs
  useEffect(() => {
    if (initialTab && ['script', 'assets', 'seo'].includes(initialTab)) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab, setActiveTab]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full overflow-hidden">
      {/* Input Column (Mission Control) */}
      <InputPanel 
        topic={topic}
        setTopic={setTopic}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        mood={mood}
        setMood={setMood}
        duration={duration}
        setDuration={setDuration}
        loading={loading}
        handleGenerate={handleGenerate}
      />

      {/* Output Column (Results) */}
      <OutputPanel 
        loading={loading}
        result={result}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeChannelConfig={activeChannelConfig}
        generatingImage={generatingImage}
        generatingSceneVisual={generatingSceneVisual}
        playingScene={playingScene}
        downloadingAudio={downloadingAudio}
        downloadPackage={downloadPackage}
        handleUpdateScript={handleUpdateScript}
        handleGenerateThumbnail={handleGenerateThumbnail}
        handleGenerateSceneVisual={handleGenerateSceneVisual}
        handlePlayAudio={handlePlayAudio}
        handleDownloadAudio={handleDownloadAudio}
      />
    </div>
  );
};