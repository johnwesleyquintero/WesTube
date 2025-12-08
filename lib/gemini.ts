

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChannelConfig, GenerationRequest, GeneratedPackage, LocationScoutData } from "../types";
import { getApiKey, cleanJsonString } from "./utils";
import { constructSystemInstruction, constructUserPrompt, enhanceVisualPrompt } from "./prompts";

// Helper to get Client instance
const getClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
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
    imageGenPrompt: { type: Type.STRING, description: "General aesthetic prompt for background assets" },
    // We allow the model to summarize what it found if research was injected
    researchSummary: { type: Type.STRING, description: "A brief summary of the key facts/research used." }
  }
};

/**
 * Phase 1: Research Agent
 * Uses the googleSearch tool to gather live context. 
 * Does NOT use JSON schema, as per SDK limitations with Tools + Schema.
 */
const performDeepResearch = async (topic: string): Promise<{ summary: string, links: string[] }> => {
  const ai = getClient();
  const model = "gemini-2.5-flash"; // Flash is fast and good for search

  const researchPrompt = `
    Research the following topic for a YouTube video: "${topic}".
    Find key facts, recent news, or interesting details. 
    Summarize the findings in 3-4 bullet points.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: researchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      // Note: No responseMimeType or responseSchema allowed here
    }
  });

  const summary = response.text || "No research data found.";
  
  // Extract URLs from groundingChunks
  const links: string[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  chunks.forEach((chunk: any) => {
    if (chunk.web && chunk.web.uri) {
      links.push(chunk.web.uri);
    }
  });

  // Remove duplicates
  const uniqueLinks = Array.from(new Set(links));

  return { summary, links: uniqueLinks };
};

/**
 * Phase 1.5: Location Scout (Maps Grounding)
 * Uses googleMaps tool to find real-world locations.
 */
export const scoutLocations = async (topic: string, channelPersona: string): Promise<LocationScoutData> => {
  const ai = getClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    You are a Location Scout for a YouTube channel with the persona: "${channelPersona}".
    The video topic is: "${topic}".
    
    Find 3-4 real-world locations that are relevant to this topic.
    If the topic is abstract (e.g. "Productivity"), find metaphorical locations like famous libraries, co-working spaces, or HQs.
    If the topic is historical, find relevant sites.
    
    Provide a brief, engaging analysis of why each location fits the video.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      // DO NOT set responseMimeType or responseSchema when using tools
    }
  });

  const analysis = response.text || "No location analysis generated.";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return {
    analysis,
    groundingChunks: chunks
  };
};

/**
 * Phase 2: The Architect
 * Generates the JSON package, optionally using the research from Phase 1.
 */
export const generateVideoPackage = async (
  request: GenerationRequest, 
  channelConfig: ChannelConfig
): Promise<GeneratedPackage> => {
  
  const ai = getClient();
  const model = "gemini-2.5-flash";

  let finalPrompt = constructUserPrompt(request);
  let researchData = { summary: "", links: [] as string[] };

  // 1. Conditional Research Phase
  if (request.useResearch) {
    try {
      researchData = await performDeepResearch(request.topic);
      finalPrompt += `\n\n[IMPORTANT - REAL-TIME RESEARCH DATA]:\nUse the following gathered facts to inform the script and SEO:\n${researchData.summary}\n`;
    } catch (e) {
      console.warn("Research phase failed, falling back to base knowledge.", e);
    }
  }

  const systemInstruction = constructSystemInstruction(channelConfig);

  // Optimized for Quality Reasoning
  // We allocate tokens for "thinking" to allow the model to plan the script structure/pacing
  const thinkingBudget = 2048; 
  const maxOutputTokens = 8192 + thinkingBudget; 

  const response = await ai.models.generateContent({
    model,
    contents: finalPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      maxOutputTokens: maxOutputTokens,
      // @ts-ignore
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
    
    // Merge the research links and overrides back into the package
    return {
      ...data,
      channelId: request.channelId,
      sources: researchData.links,
      // If the model didn't fill it, use the raw summary
      researchSummary: data.researchSummary || researchData.summary,
      // Persist Overrides
      visualStyle: request.visualStyle,
      voice: request.voice
    };
  } catch (e) {
    console.error("Failed to parse JSON", response.text);
    throw new Error("Failed to parse Gemini response.");
  }
};

/**
 * Phase 3: The Editor (Granular Refinement)
 */
export const refineScriptSegment = async (
  originalText: string, 
  instruction: string, 
  type: 'visual' | 'audio',
  tone: string
): Promise<string> => {
  const ai = getClient();
  const model = "gemini-2.5-flash"; // Flash is perfect for fast edits
  
  const prompt = `
    You are a professional video script editor. 
    Your task is to rewrite the following ${type} script segment.
    
    Target Tone: ${tone}
    User Instruction: "${instruction}"
    
    Original Text:
    "${originalText}"
    
    Output ONLY the refined text. Do not output markdown, quotes, or conversational filler.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text?.trim() || originalText;
};

export const generateThumbnail = async (prompt: string, aspectRatio: '16:9' = '16:9'): Promise<string> => {
  const ai = getClient();
  
  // Note: prompt already enhanced before calling this function
  const finalPrompt = prompt; 

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

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated.");
};

export const editGeneratedImage = async (base64Image: string, editInstruction: string): Promise<string> => {
  const ai = getClient();

  // Strip prefix if present to get pure base64 data
  const data = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
  // Simple mime detection
  const mimeType = base64Image.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0] || 'image/png';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: data,
            mimeType: mimeType
          },
        },
        {
          text: editInstruction + " --maintain consistent style, high quality"
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No edited image generated.");
}

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  if (!text || !text.trim()) {
    throw new Error("Text for speech generation cannot be empty.");
  }
  
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [
      {
        parts: [
          { text: text }
        ]
      }
    ],
    config: {
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

export const generateVeoVideo = async (
  prompt: string, 
  aspectRatio: '16:9' | '9:16' = '16:9',
  imageContext?: string // Optional Base64 Data URI
): Promise<string> => {
  const apiKey = process.env.API_KEY || getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // Prepare call parameters
  const model = 'veo-3.1-fast-generate-preview';
  const config = {
    numberOfVideos: 1,
    resolution: '720p', // Veo fast preview
    aspectRatio: aspectRatio
  };

  let operation;

  if (imageContext) {
    // IMAGE-TO-VIDEO MODE
    // Strip the "data:image/png;base64," prefix
    const [header, base64Data] = imageContext.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    const cleanBase64 = base64Data || imageContext;

    operation = await ai.models.generateVideos({
      model,
      prompt: prompt, // Prompt is still required/helpful for Veo image-to-video
      image: {
        imageBytes: cleanBase64,
        mimeType: mimeType
      },
      config
    });
  } else {
    // TEXT-TO-VIDEO MODE
    operation = await ai.models.generateVideos({
      model,
      prompt: prompt,
      config
    });
  }

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!downloadLink) {
    throw new Error("Video generation completed but no URI returned.");
  }

  const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  
  if (!videoResponse.ok) {
     throw new Error(`Failed to fetch video data: ${videoResponse.statusText}`);
  }

  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};