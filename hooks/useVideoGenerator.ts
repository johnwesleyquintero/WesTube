import { useState, useCallback } from 'react';
import { generateVeoVideo } from '../lib/gemini';
import { useToast } from '../context/ToastContext';

export const useVideoGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>(''); // For status messages
  const toast = useToast();

  const generateVideo = useCallback(async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string | null> => {
    setIsGenerating(true);
    setProgress('Initializing Veo Model...');
    
    try {
      // 1. Check for Paid API Key (Required for Veo)
      // Accessing window.aistudio via type assertion to avoid "Subsequent property declarations" conflict
      // if it is already defined as AIStudio in other definition files.
      const aistudio = (window as any).aistudio;
      
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setProgress('Waiting for API Key selection...');
          await aistudio.openSelectKey();
          // We assume success after the dialog closes, or the user can try again if they cancelled.
        }
      }

      // 2. Start Generation
      setProgress('Generating video (this may take a minute)...');
      
      const videoUrl = await generateVeoVideo(prompt, aspectRatio);
      
      toast.success("Video generated successfully.");
      return videoUrl;

    } catch (error: any) {
      console.error("Video generation failed", error);
      
      // Handle the "Requested entity was not found" error specifically for key issues
      const aistudio = (window as any).aistudio;
      if (error.message && error.message.includes("Requested entity was not found") && aistudio) {
        toast.error("API Key Issue. Please re-select your key.");
        await aistudio.openSelectKey();
      } else {
        toast.error(error.message || "Failed to generate video.");
      }
      return null;
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  }, [toast]);

  return {
    isGenerating,
    progress,
    generateVideo
  };
};