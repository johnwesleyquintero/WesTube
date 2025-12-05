import { GoogleGenAI, Type } from "@google/genai";
import { ChannelConfig, GenerationRequest, GeneratedPackage } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

export const generateVideoPackage = async (
  request: GenerationRequest, 
  channelConfig: ChannelConfig
): Promise<GeneratedPackage> => {
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are WesTube Engine, a specialized AI producer for the channel "${channelConfig.name}".
    
    Channel Persona: ${channelConfig.persona}
    Tone: ${channelConfig.tone}
    Target Audience: ${channelConfig.audience}
    
    Your goal is to generate a complete YouTube video production package based on the user's topic.
    The content must STRICTLY adhere to the channel's persona and tone.
    
    For "script", provide a scene-by-scene breakdown.
    For "thumbnailPrompts", provide 3 distinct, highly visual descriptions for an AI image generator.
    For "musicPrompt", describe the audio mood, bpm, and instruments.
    For "brandingNote", give a one-sentence directive on how the specific channel branding applies here.
  `;

  const prompt = `
    Generate a video package for:
    Topic: "${request.topic}"
    Mood: "${request.mood}"
    Format/Duration: "${request.duration}"
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
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
            description: "Scene by scene script",
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING, description: "e.g., 00:00 - 00:15" },
                visual: { type: Type.STRING, description: "Visual description for B-Roll or Animation" },
                audio: { type: Type.STRING, description: "Spoken narration or sound effects" }
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
  if (!apiKey) throw new Error("API Key missing");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt + " --high quality, youtube thumbnail style, 4k, hyper detailed" }
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "1K" // Flash image supports this
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