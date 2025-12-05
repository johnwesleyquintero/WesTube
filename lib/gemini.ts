
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChannelConfig, GenerationRequest, GeneratedPackage } from "../types";

// Helper to get API Key from Local Storage or Env
const getApiKey = (): string => {
  return localStorage.getItem('wes_gemini_api_key') || process.env.API_KEY || '';
};

// Helper to get Client instance
const getClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateVideoPackage = async (
  request: GenerationRequest, 
  channelConfig: ChannelConfig
): Promise<GeneratedPackage> => {
  
  const ai = getClient();
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are WesTube Engine, a specialized AI producer for the channel "${channelConfig.name}".
    
    Channel Persona: ${channelConfig.persona}
    Tone: ${channelConfig.tone}
    Target Audience: ${channelConfig.audience}
    
    Your goal is to generate a complete YouTube video production package based on the user's topic.
    
    For "script": Provide a scene-by-scene breakdown (Intro, Body Paragraphs, Outro).
    For "thumbnailPrompts": Provide 3 distinct, highly visual descriptions.
    For "brandingNote": One-sentence directive on specific channel branding.
  `;

  const prompt = `
    Generate a video package for:
    Topic: "${request.topic}"
    Mood: "${request.mood}"
    Duration: ${request.duration}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      maxOutputTokens: 8192, 
      responseSchema: {
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
      }
    }
  });

  if (!response.text) {
    throw new Error("No response received from Gemini.");
  }

  try {
    return JSON.parse(response.text) as GeneratedPackage;
  } catch (e) {
    console.error("Failed to parse JSON", response.text);
    throw new Error("Failed to parse Gemini response.");
  }
};

export const generateThumbnail = async (prompt: string, aspectRatio: '16:9' = '16:9'): Promise<string> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt + " --high quality, youtube thumbnail style, 4k, hyper detailed" }
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
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio generated.");
  }
  return base64Audio;
};
