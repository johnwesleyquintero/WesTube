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
}

export interface ScriptScene {
  timestamp: string;
  visual: string;
  audio: string;
}

export interface GeneratedPackage {
  title: string;
  hook: string;
  description: string;
  tags: string[];
  script: ScriptScene[];
  thumbnailPrompts: string[];
  // Base64 strings of generated images, mapped by index to prompts
  generatedImages?: Record<number, string>;
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