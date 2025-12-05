import { useState } from 'react';
import { CHANNELS, MOODS } from '../constants';
import { ChannelId, GenerationRequest, GeneratedPackage } from '../types';
import { generateVideoPackage, generateThumbnail, generateSpeech } from '../lib/gemini';
import { playRawAudio, createWavBlob } from '../lib/audio';
import { saveHistoryItem } from '../lib/history';

export const useGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'assets' | 'seo'>('script');
  
  // Image Generation State
  const [generatingImage, setGeneratingImage] = useState<number | null>(null); // For Thumbnails
  const [generatingSceneVisual, setGeneratingSceneVisual] = useState<number | null>(null); // For Script Scenes

  // Audio Playback/Download State
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const [downloadingAudio, setDownloadingAudio] = useState<number | null>(null);
  const [audioCache, setAudioCache] = useState<Record<number, string>>({});

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
    setAudioCache({}); // Clear audio cache on new generation
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
        // ID and Date will be handled by Supabase on insert, but we set temp ones for UI
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
      // Note: Persisting this update to Supabase would require an UPDATE policy and call.
      
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
      // Enhance prompt for better B-Roll style
      const enhancedPrompt = `Cinematic shot, ${activeChannelConfig.tone} style: ${visualPrompt}`;
      const base64Image = await generateThumbnail(enhancedPrompt); // Reusing the generic image generator
      
      // Update the specific scene in the script
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

  const handlePlayAudio = async (text: string, index: number) => {
    if (playingScene !== null) return; // Prevent multiple streams
    setPlayingScene(index);

    try {
      let base64Audio = audioCache[index];
      
      // If not cached, generate it
      if (!base64Audio) {
        base64Audio = await generateSpeech(text, activeChannelConfig.voice);
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
    if (downloadingAudio !== null) return;
    setDownloadingAudio(index);

    try {
      let base64Audio = audioCache[index];
      
      // If not cached, generate it first
      if (!base64Audio) {
        base64Audio = await generateSpeech(text, activeChannelConfig.voice);
        setAudioCache(prev => ({ ...prev, [index]: base64Audio }));
      }

      // Create WAV blob and download
      const wavBlob = createWavBlob(base64Audio);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wes-narrator-${selectedChannel}-${index}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Audio download failed", e);
      alert("Failed to download audio.");
    } finally {
      setDownloadingAudio(null);
    }
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
    handleGenerateSceneVisual,
    handlePlayAudio,
    handleDownloadAudio,
    downloadPackage
  };
};
