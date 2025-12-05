
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

  // Calculate target duration and segments
  let targetSeconds = 60; // Default Short
  if (request.duration.includes('Medium')) targetSeconds = 300; // 5 mins
  if (request.duration.includes('Long')) targetSeconds = 600; // Cap at 10 mins to prevent token overflow

  const segmentCount = Math.floor(targetSeconds / 5);

  const systemInstruction = `
    You are WesTube Engine, a specialized AI producer for the channel "${channelConfig.name}".
    
    Channel Persona: ${channelConfig.persona}
    Tone: ${channelConfig.tone}
    Target Audience: ${channelConfig.audience}
    
    Your goal is to generate a complete YouTube video production package based on the user's topic.
    
    CRITICAL RULE: VISUAL PACING
    The video must be broken down into STRICT 5-SECOND INTERVALS.
    Do not generate broad "scenes". You must generate a specific visual cue for every single 5-second block of the video.
    The audio/narration for that block must fit within 5 seconds (approx 10-15 words).
    
    For a ${request.duration} video, you must generate approx ${segmentCount} items in the "script" array.
    
    For "script": Provide the 5-second interval breakdown.
    For "thumbnailPrompts": Provide 3 distinct, highly visual descriptions.
    For "brandingNote": One-sentence directive on specific channel branding.
  `;

  const prompt = `
    Generate a video package for:
    Topic: "${request.topic}"
    Mood: "${request.mood}"
    Target Duration: ${targetSeconds} seconds (${segmentCount} intervals of 5s each).
    
    Ensure the "script" array contains exactly ${segmentCount} items, covering timestamps from 00:00 up to the end.
    Example timestamps: "00:00-00:05", "00:05-00:10", "00:10-00:15", etc.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      // We increase max output tokens to accommodate the long script array
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
            description: `Array of exactly ${segmentCount} items. One item per 5 seconds.`,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING, description: "Interval e.g., '00:00 - 00:05'" },
                visual: { type: Type.STRING, description: "Specific visual prompt for this 5s clip. Highly descriptive." },
                audio: { type: Type.STRING, description: "Narration line or SFX for this 5s clip." }
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
