import { useState, useCallback } from 'react';
import { CHANNELS, MOODS } from '../constants';
import { ChannelId, GenerationRequest, GeneratedPackage } from '../types';
import { generateVideoPackage } from '../lib/gemini';
import { saveHistoryItem } from '../lib/history';
import { useAudio } from './useAudio';
import { useAssetGenerator } from './useAssetGenerator';
import { updatePackageSceneVisual, updatePackageThumbnail } from '../lib/packageManipulation';
import { useToast } from '../context/ToastContext';

export const useGenerator = () => {
  // UI State
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'assets' | 'seo'>('script');
  
  // Data State
  const [result, setResult] = useState<GeneratedPackage | null>(null);

  // Form State
  const [topic, setTopic] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ChannelId>(ChannelId.TECH);
  const [mood, setMood] = useState(() => localStorage.getItem('wes_default_mood') || MOODS[0]);
  const [duration, setDuration] = useState<GenerationRequest['duration']>(() => 
    (localStorage.getItem('wes_default_duration') as GenerationRequest['duration']) || 'Medium (5-8m)'
  );

  const activeChannelConfig = CHANNELS[selectedChannel];
  const toast = useToast();

  // Sub-hooks
  const assetGen = useAssetGenerator();
  const audioGen = useAudio();

  // Actions
  const handleGenerate = useCallback(async () => {
    if (!topic) {
      toast.error("Please enter a topic before generating.");
      return;
    }
    
    setLoading(true);
    setResult(null);
    audioGen.resetAudioState();
    setActiveTab('script');
    
    try {
      const data = await generateVideoPackage({
        topic,
        channelId: selectedChannel,
        mood,
        duration
      }, activeChannelConfig);
      
      const packageWithMeta = {
        ...data,
        id: 'temp-pending', 
        createdAt: new Date().toISOString()
      };
      
      // Save to Cloud
      await saveHistoryItem(packageWithMeta);
      
      setResult(packageWithMeta);
      toast.success("Package generated and saved to cloud.");
    } catch (error) {
      console.error(error);
      toast.error("Error generating content. Please check API Key configuration.");
    } finally {
      setLoading(false);
    }
  }, [topic, selectedChannel, mood, duration, activeChannelConfig, audioGen, toast]);

  const handleUpdateScript = useCallback((index: number, field: 'visual' | 'audio', value: string) => {
    if (!result) return;
    
    // Invalidate audio cache if audio text changes
    if (field === 'audio') {
      audioGen.invalidateCache(index);
    }

    setResult(prev => {
      if (!prev) return null;
      const updatedScript = [...prev.script];
      updatedScript[index] = {
        ...updatedScript[index],
        [field]: value
      };
      return {
        ...prev,
        script: updatedScript
      };
    });
  }, [result, audioGen]);

  const handleGenerateThumbnail = useCallback(async (prompt: string, index: number) => {
    if (!result) return;
    
    const base64Image = await assetGen.generateThumbnailAsset(prompt, index);
    if (!base64Image) return; // Hook handles error toast

    setResult(prev => prev ? updatePackageThumbnail(prev, index, base64Image) : null);
    toast.success("Thumbnail asset rendered successfully.");
  }, [result, assetGen, toast]);

  const handleGenerateSceneVisual = useCallback(async (visualPrompt: string, index: number) => {
    if (!result) return;
    
    const base64Image = await assetGen.generateSceneAsset(visualPrompt, index, activeChannelConfig);
    if (!base64Image) return; // Hook handles error toast

    setResult(prev => prev ? updatePackageSceneVisual(prev, index, base64Image) : null);
    toast.success("Scene visual rendered successfully.");
  }, [result, assetGen, activeChannelConfig, toast]);

  const handlePlayAudio = useCallback((text: string, index: number) => {
    audioGen.playAudio(text, activeChannelConfig.voice, index);
  }, [activeChannelConfig.voice, audioGen]);

  const handleDownloadAudio = useCallback((text: string, index: number) => {
    audioGen.downloadAudio(text, activeChannelConfig.voice, index, `wes-narrator-${selectedChannel}`);
  }, [activeChannelConfig.voice, audioGen, selectedChannel]);

  const downloadPackage = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wes-tube-${selectedChannel}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info("Project JSON downloaded.");
  }, [result, selectedChannel, toast]);

  // Structured Return
  return {
    // 1. Inputs (Form)
    formState: {
      topic, setTopic,
      selectedChannel, setSelectedChannel,
      mood, setMood,
      duration, setDuration,
      activeChannelConfig
    },

    // 2. UI State
    uiState: {
      loading,
      activeTab, setActiveTab,
      generatingImage: assetGen.generatingImage,
      generatingSceneVisual: assetGen.generatingSceneVisual,
      playingScene: audioGen.playingIndex,
      downloadingAudio: audioGen.downloadingIndex
    },

    // 3. Data
    dataState: {
      result
    },
    
    // 4. Actions
    actions: {
      handleGenerate,
      handleUpdateScript,
      handleGenerateThumbnail,
      handleGenerateSceneVisual,
      handlePlayAudio,
      handleDownloadAudio,
      downloadPackage
    }
  };
};