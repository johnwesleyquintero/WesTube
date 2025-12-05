import { useState, useCallback } from 'react';
import { generateSpeech } from '../lib/gemini';
import { playRawAudio, createWavBlob, resumeAudioContext } from '../lib/audio';
import { useToast } from '../context/ToastContext';

export const useAudio = () => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [audioCache, setAudioCache] = useState<Record<number, string>>({});
  const toast = useToast();

  const resetAudioState = useCallback(() => {
    setPlayingIndex(null);
    setDownloadingIndex(null);
    setAudioCache({});
  }, []);

  const playAudio = async (text: string, voice: string, index: number) => {
    if (playingIndex !== null) return; // Prevent multiple streams
    
    // Critical: Resume AudioContext immediately inside the click handler event loop
    // to prevent browser autoplay blocking.
    await resumeAudioContext();
    
    setPlayingIndex(index);

    try {
      let base64Audio = audioCache[index];
      
      // If not cached, generate it
      if (!base64Audio) {
        base64Audio = await generateSpeech(text, voice);
        setAudioCache(prev => ({ ...prev, [index]: base64Audio }));
      }

      // Play it
      await playRawAudio(base64Audio);
    } catch (e) {
      console.error("Audio playback failed", e);
      toast.error("Failed to generate audio preview.");
    } finally {
      setPlayingIndex(null);
    }
  };

  const downloadAudio = async (text: string, voice: string, index: number, filenamePrefix: string) => {
    if (downloadingIndex !== null) return;
    setDownloadingIndex(index);

    try {
      let base64Audio = audioCache[index];
      
      // If not cached, generate it first
      if (!base64Audio) {
        base64Audio = await generateSpeech(text, voice);
        setAudioCache(prev => ({ ...prev, [index]: base64Audio }));
      }

      // Create WAV blob and download
      const wavBlob = createWavBlob(base64Audio);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenamePrefix}-scene-${index}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audio downloaded successfully.");
    } catch (e) {
      console.error("Audio download failed", e);
      toast.error("Failed to download audio.");
    } finally {
      setDownloadingIndex(null);
    }
  };

  return {
    playingIndex,
    downloadingIndex,
    playAudio,
    downloadAudio,
    resetAudioState
  };
};