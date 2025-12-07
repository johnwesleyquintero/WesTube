

import { useState, useCallback, useEffect } from 'react';
import { CHANNELS, MOODS, VISUAL_STYLES, VOICES } from '../constants';
import { ChannelId, GenerationRequest, GeneratedPackage } from '../types';
import { generateVideoPackage, refineScriptSegment, scoutLocations } from '../lib/gemini';
import { saveHistoryItem } from '../lib/history';
import { useAudio } from './useAudio';
import { useAssetGenerator } from './useAssetGenerator';
import { updatePackageSceneVisual, updatePackageThumbnail } from '../lib/packageManipulation';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';

export const useGenerator = () => {
  // UI State
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'assets' | 'seo' | 'video' | 'locations'>('script');
  
  // Refinement State
  const [refiningScene, setRefiningScene] = useState<{index: number, field: 'visual' | 'audio'} | null>(null);
  
  // Location Scout State
  const [scouting, setScouting] = useState(false);

  // Data State
  const [result, setResult] = useState<GeneratedPackage | null>(null);

  // Context Bridge
  const { projectData, clearProjectData } = useProject();

  // Form State
  const [topic, setTopic] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ChannelId>(ChannelId.TECH);
  const [mood, setMood] = useState(() => localStorage.getItem('wes_default_mood') || MOODS[0]);
  const [duration, setDuration] = useState<GenerationRequest['duration']>(() => 
    (localStorage.getItem('wes_default_duration') as GenerationRequest['duration']) || 'Medium (5-8m)'
  );
  const [useResearch, setUseResearch] = useState(false);
  
  // Director's Overrides
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0]);
  const [voice, setVoice] = useState(VOICES[0].value);

  // Hydrate from Project Context (Neural Link Bridge)
  useEffect(() => {
    if (projectData.topic) {
      setTopic(projectData.topic);
    }
    if (projectData.channelId) {
      setSelectedChannel(projectData.channelId);
    }
  }, [projectData]);

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
      // Pass Overrides in Request
      const data = await generateVideoPackage({
        topic,
        channelId: selectedChannel,
        mood,
        duration,
        useResearch,
        visualStyle,
        voice: voice === 'default' ? undefined : voice
      }, activeChannelConfig);
      
      const packageWithMeta = {
        ...data,
        id: 'temp-pending', 
        createdAt: new Date().toISOString()
      };
      
      // Save to Cloud
      await saveHistoryItem(packageWithMeta);
      
      setResult(packageWithMeta);
      toast.success(useResearch ? "Researched & generated package." : "Package generated and saved.");
      
      // Clear the context after successful generation so we don't stick to it
      if (projectData.topic) clearProjectData();

    } catch (error) {
      console.error(error);
      toast.error("Error generating content. Please check API Key configuration.");
    } finally {
      setLoading(false);
    }
  }, [topic, selectedChannel, mood, duration, useResearch, visualStyle, voice, activeChannelConfig, audioGen, toast, projectData, clearProjectData]);

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

  const handleRefineScript = useCallback(async (index: number, field: 'visual' | 'audio', instruction: string) => {
    if (!result) return;
    setRefiningScene({ index, field });
    
    try {
      const refinedText = await refineScriptSegment(
        result.script[index][field], 
        instruction, 
        field, 
        activeChannelConfig.tone
      );
      
      handleUpdateScript(index, field, refinedText);
      toast.success("Script segment refined.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to refine text.");
    } finally {
      setRefiningScene(null);
    }
  }, [result, activeChannelConfig, handleUpdateScript, toast]);

  const handleGenerateThumbnail = useCallback(async (prompt: string, index: number) => {
    if (!result) return;
    
    const base64Image = await assetGen.generateThumbnailAsset(prompt, index, result.visualStyle, activeChannelConfig.tone);
    if (!base64Image) return; // Hook handles error toast

    setResult(prev => prev ? updatePackageThumbnail(prev, index, base64Image) : null);
    toast.success("Thumbnail asset rendered successfully.");
  }, [result, assetGen, activeChannelConfig, toast]);

  const handleEditThumbnail = useCallback(async (base64: string, prompt: string, index: number) => {
    if (!result) return;

    const newBase64 = await assetGen.editThumbnailAsset(base64, prompt, index);
    if (!newBase64) return;

    setResult(prev => prev ? updatePackageThumbnail(prev, index, newBase64) : null);
  }, [result, assetGen]);

  const handleGenerateSceneVisual = useCallback(async (visualPrompt: string, index: number) => {
    if (!result) return;
    
    const base64Image = await assetGen.generateSceneAsset(
      visualPrompt, 
      index, 
      activeChannelConfig, 
      result.visualStyle // Pass the visual style from the result package
    );
    if (!base64Image) return; // Hook handles error toast

    setResult(prev => prev ? updatePackageSceneVisual(prev, index, base64Image) : null);
    toast.success("Scene visual rendered successfully.");
  }, [result, assetGen, activeChannelConfig, toast]);

  const handleEditSceneVisual = useCallback(async (base64: string, prompt: string, index: number) => {
    if (!result) return;

    const newBase64 = await assetGen.editSceneAsset(base64, prompt, index);
    if (!newBase64) return;

    setResult(prev => prev ? updatePackageSceneVisual(prev, index, newBase64) : null);
  }, [result, assetGen]);

  const handleVideoGenerated = useCallback((key: string, url: string) => {
    setResult(prev => {
      if (!prev) return null;
      return {
        ...prev,
        generatedVideos: {
          ...(prev.generatedVideos || {}),
          [key]: url
        }
      };
    });
  }, []);

  const handlePlayAudio = useCallback((text: string, index: number) => {
    // Determine which voice to use: Package override > Channel Default
    const targetVoice = result?.voice && result.voice !== 'default' 
      ? result.voice 
      : activeChannelConfig.voice;

    audioGen.playAudio(text, targetVoice, index);
  }, [result, activeChannelConfig, audioGen]);

  const handleDownloadAudio = useCallback((text: string, index: number) => {
    const targetVoice = result?.voice && result.voice !== 'default' 
      ? result.voice 
      : activeChannelConfig.voice;
      
    audioGen.downloadAudio(text, targetVoice, index, `wes-narrator-${selectedChannel}`);
  }, [result, activeChannelConfig, audioGen, selectedChannel]);

  const handleScoutLocations = useCallback(async () => {
    if (!result) return;
    setScouting(true);
    try {
      const locationData = await scoutLocations(result.title, activeChannelConfig.persona);
      setResult(prev => prev ? { ...prev, locations: locationData } : null);
      toast.success("Locations scouted via Google Maps.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to scout locations.");
    } finally {
      setScouting(false);
    }
  }, [result, activeChannelConfig, toast]);

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
      useResearch, setUseResearch,
      visualStyle, setVisualStyle,
      voice, setVoice,
      activeChannelConfig,
      hasContext: !!projectData.topic // Expose for UI
    },

    // 2. UI State
    uiState: {
      loading,
      activeTab, setActiveTab,
      generatingImage: assetGen.generatingImage,
      generatingSceneVisual: assetGen.generatingSceneVisual,
      editingImage: assetGen.editingImage,
      editingSceneVisual: assetGen.editingSceneVisual,
      refiningScene,
      playingScene: audioGen.playingIndex,
      downloadingAudio: audioGen.downloadingIndex,
      scouting
    },

    // 3. Data
    dataState: {
      result
    },
    
    // 4. Actions
    actions: {
      handleGenerate,
      handleUpdateScript,
      handleRefineScript,
      handleGenerateThumbnail,
      handleEditThumbnail,
      handleGenerateSceneVisual,
      handleEditSceneVisual,
      handleVideoGenerated,
      handlePlayAudio,
      handleDownloadAudio,
      handleScoutLocations,
      downloadPackage
    }
  };
};