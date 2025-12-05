import { useState } from 'react';
import { generateThumbnail } from '../lib/gemini';
import { enhanceVisualPrompt } from '../lib/prompts';
import { ChannelConfig } from '../types';
import { useToast } from '../context/ToastContext';

export const useAssetGenerator = () => {
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);
  const [generatingSceneVisual, setGeneratingSceneVisual] = useState<number | null>(null);
  const toast = useToast();

  const generateThumbnailAsset = async (prompt: string, index: number): Promise<string | null> => {
    setGeneratingImage(index);
    try {
      const base64Image = await generateThumbnail(prompt);
      return base64Image;
    } catch (error) {
      console.error("Image generation failed", error);
      toast.error("Failed to generate image. Please try again.");
      return null;
    } finally {
      setGeneratingImage(null);
    }
  };

  const generateSceneAsset = async (visualPrompt: string, index: number, channelConfig: ChannelConfig): Promise<string | null> => {
    setGeneratingSceneVisual(index);
    try {
      // Use the centralized prompt enhancer
      const enhancedPrompt = enhanceVisualPrompt(visualPrompt, channelConfig.tone);
      const base64Image = await generateThumbnail(enhancedPrompt);
      return base64Image;
    } catch (error) {
      console.error("Scene visual generation failed", error);
      toast.error("Failed to generate scene visual.");
      return null;
    } finally {
      setGeneratingSceneVisual(null);
    }
  };

  return {
    generatingImage,
    generatingSceneVisual,
    generateThumbnailAsset,
    generateSceneAsset
  };
};