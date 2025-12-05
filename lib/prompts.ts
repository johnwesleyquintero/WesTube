
import { ChannelConfig, GenerationRequest } from "../types";

/**
 * Constructs the System Instruction for the AI Producer.
 * This defines the persona, tone, and output constraints.
 */
export const constructSystemInstruction = (channelConfig: ChannelConfig): string => {
  return `
    You are WesTube Engine, a specialized AI producer for the channel "${channelConfig.name}".
    
    Channel Persona: ${channelConfig.persona}
    Tone: ${channelConfig.tone}
    Target Audience: ${channelConfig.audience}
    
    Your goal is to generate a complete YouTube video production package based on the user's topic.
    
    For "script": Provide a scene-by-scene breakdown (Intro, Body Paragraphs, Outro).
    For "thumbnailPrompts": Provide 3 distinct, highly visual descriptions.
    For "brandingNote": One-sentence directive on specific channel branding.
  `;
};

/**
 * Constructs the User Prompt based on the input request.
 */
export const constructUserPrompt = (request: GenerationRequest): string => {
  return `
    Generate a video package for:
    Topic: "${request.topic}"
    Mood: "${request.mood}"
    Duration: ${request.duration}
  `;
};

/**
 * Enhances a visual prompt with channel-specific cinematic directives.
 */
export const enhanceVisualPrompt = (basePrompt: string, tone: string): string => {
  return `Cinematic shot, ${tone} style: ${basePrompt} --high quality, youtube thumbnail style, 4k, hyper detailed`;
};
