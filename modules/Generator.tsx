import React from 'react';
import { useGenerator } from '../hooks/useGenerator';
import { InputPanel } from './generator/InputPanel';
import { OutputPanel } from './generator/OutputPanel';

export const Generator: React.FC = () => {
  const {
    // State
    loading,
    result,
    activeTab,
    setActiveTab,
    generatingImage,
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
    handleGenerateThumbnail,
    handlePlayAudio,
    handleDownloadAudio,
    downloadPackage
  } = useGenerator();

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
        playingScene={playingScene}
        downloadingAudio={downloadingAudio}
        downloadPackage={downloadPackage}
        handleGenerateThumbnail={handleGenerateThumbnail}
        handlePlayAudio={handlePlayAudio}
        handleDownloadAudio={handleDownloadAudio}
      />
    </div>
  );
};