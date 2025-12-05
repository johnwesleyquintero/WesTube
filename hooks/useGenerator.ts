import { useState } from 'react';
import { CHANNELS, MOODS } from '../constants';
import { ChannelId, GenerationRequest, GeneratedPackage } from '../types';
import { generateVideoPackage, generateThumbnail } from '../lib/gemini';
import { saveHistoryItem } from '../lib/history';
import { useAudio } from './useAudio';

export const useGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'assets' | 'seo'>('script');
  
  // Image Generation State
  const [generatingImage, setGeneratingImage] = useState<number | null>(null); // For Thumbnails
  const [generatingSceneVisual, setGeneratingSceneVisual] = useState<number | null>(null); // For Script Scenes

  // Audio Hook
  const { 
    playingIndex, 
    downloadingIndex, 
    playAudio, 
    downloadAudio, 
    resetAudioState 
  } = useAudio();

  // Form State
  const [topic, setTopic] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ChannelId>(ChannelId.TECH);
  const [mood, setMood] = useState(() => localStorage.getItem('wes_default_mood') || MOODS[0]);
  const [duration, setDuration] = useState<GenerationRequest['duration']>(() => 
    (localStorage.getItem('wes_default_duration') as GenerationRequest['duration']) || 'Medium (5-8m)'
  );

  const activeChannelConfig = CHANNELS[selectedChannel];

  const handleGenerate = async () => {
    if (!topic) return;
    
    setLoading(true);
    setResult(null);
    resetAudioState();
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
    } catch (error) {
      console.error(error);
      alert("Error generating content. Please check API Key configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateThumbnail = async (prompt: string, index: number) => {
    if (!result) return;
    setGeneratingImage(index);
    try {
      const base64Image = await generateThumbnail(prompt);
      
      const updatedResult = {
        ...result,
        generatedImages: {
          ...(result.generatedImages || {}),
          [index]: base64Image
        }
      };
      
      setResult(updatedResult);
      
    } catch (error) {
      console.error("Image generation failed", error);
      alert("Failed to generate image.");
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleGenerateSceneVisual = async (visualPrompt: string, index: number) => {
    if (!result) return;
    setGeneratingSceneVisual(index);
    try {
      const enhancedPrompt = `Cinematic shot, ${activeChannelConfig.tone} style: ${visualPrompt}`;
      const base64Image = await generateThumbnail(enhancedPrompt); 
      
      const updatedScript = [...result.script];
      updatedScript[index] = {
        ...updatedScript[index],
        generatedVisual: base64Image
      };

      const updatedResult = {
        ...result,
        script: updatedScript
      };
      
      setResult(updatedResult);
      
    } catch (error) {
      console.error("Scene visual generation failed", error);
      alert("Failed to generate scene visual.");
    } finally {
      setGeneratingSceneVisual(null);
    }
  };

  const handlePlayAudio = (text: string, index: number) => {
    playAudio(text, activeChannelConfig.voice, index);
  };

  const handleDownloadAudio = (text: string, index: number) => {
    downloadAudio(text, activeChannelConfig.voice, index, `wes-narrator-${selectedChannel}`);
  };

  const downloadPackage = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wes-tube-${selectedChannel}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    // State
    loading,
    result,
    activeTab,
    setActiveTab,
    generatingImage,
    generatingSceneVisual,
    playingScene: playingIndex,
    downloadingAudio: downloadingIndex,
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
    handleGenerateSceneVisual,
    handlePlayAudio,
    handleDownloadAudio,
    downloadPackage
  };
};