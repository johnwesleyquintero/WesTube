

export enum ChannelId {
  PHILOSOPHY = 'philosophy',
  TECH = 'tech',
  MUSIC = 'music',
  LORE = 'lore',
  PRODUCTIVITY = 'productivity'
}

export interface ChannelConfig {
  id: ChannelId;
  name: string;
  icon: string;
  color: string;
  persona: string;
  tone: string;
  audience: string;
  voice: string; // Gemini TTS Voice Name (e.g., 'Fenrir', 'Zephyr')
}

export interface ScriptScene {
  timestamp: string;
  visual: string;
  audio: string;
  generatedVisual?: string; // Base64 image string for the scene
}

export interface GeneratedPackage {
  id?: string;
  createdAt?: string;
  channelId?: ChannelId;
  title: string;
  hook: string;
  description: string;
  tags: string[];
  script: ScriptScene[];
  thumbnailPrompts: string[];
  // Base64 strings of generated images, mapped by index to prompts
  generatedImages?: Record<number, string>;
  // Video URIs mapped by index (or 'custom' key)
  generatedVideos?: Record<string, string>;
  musicPrompt: string;
  imageGenPrompt: string;
  brandingNote: string;
}

export interface GenerationRequest {
  topic: string;
  channelId: ChannelId;
  mood: string;
  duration: 'Short (<60s)' | 'Medium (5-8m)' | 'Long (15m+)';
}

// Toast System Types
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}