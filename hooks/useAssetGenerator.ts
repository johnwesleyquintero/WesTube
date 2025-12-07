

import { useState } from 'react';
import { generateThumbnail, editGeneratedImage } from '../lib/gemini';
import { enhanceVisualPrompt } from '../lib/prompts';
import { ChannelConfig } from '../types';
import { useToast } from '../context/ToastContext';

export const useAssetGenerator = () => {
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);
  const [generatingSceneVisual, setGeneratingSceneVisual] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<number | null>(null); // For Thumbnails
  const [editingSceneVisual, setEditingSceneVisual] = useState<number | null>(null); // For Storyboard
  
  const toast = useToast();

  const generateThumbnailAsset = async (prompt: string, index: number, style?: string, tone?: string): Promise<string | null> => {
    setGeneratingImage(index);
    try {
      const finalPrompt = enhanceVisualPrompt(prompt, tone || 'Cinematic', style);
      const base64Image = await generateThumbnail(finalPrompt);
      return base64Image;
    } catch (error) {
      console.error("Image generation failed", error);
      toast.error("Failed to generate image. Please try again.");
      return null;
    } finally {
      setGeneratingImage(null);
    }
  };

  const editThumbnailAsset = async (base64Image: string, instruction: string, index: number): Promise<string | null> => {
    setEditingImage(index);
    try {
      const newBase64 = await editGeneratedImage(base64Image, instruction);
      toast.success("Thumbnail refined successfully.");
      return newBase64;
    } catch (error) {
      console.error("Image editing failed", error);
      toast.error("Failed to refine image.");
      return null;
    } finally {
      setEditingImage(null);
    }
  };

  const generateSceneAsset = async (
      visualPrompt: string, 
      index: number, 
      channelConfig: ChannelConfig,
      styleOverride?: string
    ): Promise<string | null> => {
    setGeneratingSceneVisual(index);
    try {
      // Use the centralized prompt enhancer with style override
      const enhancedPrompt = enhanceVisualPrompt(visualPrompt, channelConfig.tone, styleOverride);
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

  const editSceneAsset = async (base64Image: string, instruction: string, index: number): Promise<string | null> => {
    setEditingSceneVisual(index);
    try {
       const newBase64 = await editGeneratedImage(base64Image, instruction);
       toast.success("Scene visual refined successfully.");
       return newBase64;
    } catch (error) {
       console.error("Scene editing failed", error);
       toast.error("Failed to refine scene.");
       return null;
    } finally {
      setEditingSceneVisual(null);
    }
  };

  return {
    generatingImage,
    generatingSceneVisual,
    editingImage,
    editingSceneVisual,
    generateThumbnailAsset,
    editThumbnailAsset,
    generateSceneAsset,
    editSceneAsset
  };
};