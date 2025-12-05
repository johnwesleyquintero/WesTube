import { useState } from 'react';
import { CHANNELS, MOODS } from '../constants';
import { ChannelId, GenerationRequest, GeneratedPackage } from '../types';
import { generateVideoPackage, generateThumbnail, generateSpeech } from '../lib/gemini';
import { playRawAudio } from '../lib/audio';

export const useGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'assets' | 'seo'>('script');
  
  // Image Generation State
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);

  // Audio Playback State
  const [playingScene, setPlayingScene] = useState<number | null>(null);
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
      
      setResult(data);
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
      setResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          generatedImages: {
            ...(prev.generatedImages || {}),
            [index]: base64Image
          }
        };
      });
    } catch (error) {
      console.error("Image generation failed", error);
      alert("Failed to generate image.");
    } finally {
      setGeneratingImage(null);
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
    playingScene,
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
    downloadPackage
  };
};