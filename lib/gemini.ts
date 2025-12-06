
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChannelConfig, GenerationRequest, GeneratedPackage } from "../types";
import { getApiKey, cleanJsonString } from "./utils";
import { constructSystemInstruction, constructUserPrompt, enhanceVisualPrompt } from "./prompts";

// Helper to get Client instance
const getClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

// Extracted Schema Definition for cleaner logic flow
const VIDEO_PACKAGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Clickable, SEO-optimized YouTube title" },
    hook: { type: Type.STRING, description: "The first 15 seconds hook script text" },
    description: { type: Type.STRING, description: "YouTube video description with keywords" },
    tags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "15 SEO tags"
    },
    brandingNote: { type: Type.STRING, description: "Specific branding instruction" },
    script: {
      type: Type.ARRAY,
      description: "Array of script scenes",
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "Time range e.g., '00:00 - 00:15'" },
          visual: { type: Type.STRING, description: "Visual description for this scene." },
          audio: { type: Type.STRING, description: "Narration line or SFX." }
        }
      }
    },
    thumbnailPrompts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 prompt variations for thumbnail generation"
    },
    musicPrompt: { type: Type.STRING, description: "Prompt for music generation tools" },
    imageGenPrompt: { type: Type.STRING, description: "General aesthetic prompt for background assets" }
  }
};

export const generateVideoPackage = async (
  request: GenerationRequest, 
  channelConfig: ChannelConfig
): Promise<GeneratedPackage> => {
  
  const ai = getClient();
  // Using gemini-2.5-flash for balance of speed and capability on free tier
  const model = "gemini-2.5-flash";

  const systemInstruction = constructSystemInstruction(channelConfig);
  const prompt = constructUserPrompt(request);

  // Optimized for Free Tier / Fast Dev:
  // We disable the thinking budget (set to 0) to minimize token usage and latency.
  // The 2.5-flash model is capable enough to generate the JSON schema without explicit thinking steps for this use case.
  const thinkingBudget = 0; 
  const maxOutputTokens = 8192; 

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      maxOutputTokens: maxOutputTokens,
      // @ts-ignore - Explicitly disabling thinking for speed
      thinkingConfig: { thinkingBudget }, 
      responseSchema: VIDEO_PACKAGE_SCHEMA
    }
  });

  if (!response.text) {
    throw new Error("No response received from Gemini.");
  }

  try {
    const cleanedText = cleanJsonString(response.text);
    const data = JSON.parse(cleanedText) as GeneratedPackage;
    return {
      ...data,
      channelId: request.channelId
    };
  } catch (e) {
    console.error("Failed to parse JSON", response.text);
    throw new Error("Failed to parse Gemini response.");
  }
};

export const generateThumbnail = async (prompt: string, aspectRatio: '16:9' = '16:9'): Promise<string> => {
  const ai = getClient();
  
  // Note: We are appending stylistic keywords here, but this could also move to prompts.ts if it gets complex
  const finalPrompt = prompt + " --high quality, youtube thumbnail style, 4k, hyper detailed";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: finalPrompt }
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated.");
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  if (!text || !text.trim()) {
    throw new Error("Text for speech generation cannot be empty.");
  }
  
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    // Use the strict array format for TTS contents
    contents: [
      {
        parts: [
          { text: text }
        ]
      }
    ],
    config: {
      // Use string literal 'AUDIO' to ensure compatibility if Modality enum is undefined in some builds
      responseModalities: ['AUDIO' as any],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio generated from API response.");
  }
  return base64Audio;
};
