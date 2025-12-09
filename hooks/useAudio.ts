import { useState, useCallback } from 'react';
import { generateSpeech } from '../lib/gemini';
import { playRawAudio, createWavBlob, resumeAudioContext } from '../lib/audio';
import { useToast } from '../context/ToastContext';

export const useAudio = () => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const toast = useToast();

  const resetAudioState = useCallback(() => {
    setPlayingIndex(null);
    setDownloadingIndex(null);
  }, []);

  const generateAudio = async (text: string, voice: string): Promise<string | null> => {
    try {
      const base64Audio = await generateSpeech(text, voice);
      return base64Audio;
    } catch (e: any) {
      console.error("Audio generation failed", e);
      const msg = e instanceof Error ? e.message : "Failed to generate audio.";
      toast.error(msg);
      return null;
    }
  };

  const playAudioData = async (base64Audio: string, index: number) => {
    if (playingIndex !== null) return; // Prevent multiple streams
    
    // Critical: Resume AudioContext immediately inside the click handler
    await resumeAudioContext();
    
    setPlayingIndex(index);

    try {
      await playRawAudio(base64Audio);
    } catch (e: any) {
      console.error("Audio playback failed", e);
      toast.error("Playback failed.");
    } finally {
      setPlayingIndex(null);
    }
  };

  const downloadAudioData = async (base64Audio: string, index: number, filenamePrefix: string) => {
    if (downloadingIndex !== null) return;
    setDownloadingIndex(index);

    try {
      // Create WAV blob and download
      const wavBlob = createWavBlob(base64Audio);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenamePrefix}-scene-${index}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audio downloaded successfully.");
    } catch (e: any) {
      console.error("Audio download failed", e);
      toast.error("Failed to download audio.");
    } finally {
      setDownloadingIndex(null);
    }
  };

  return {
    playingIndex,
    downloadingIndex,
    generateAudio,
    playAudioData,
    downloadAudioData,
    resetAudioState
  };
};