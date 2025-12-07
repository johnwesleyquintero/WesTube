

import { ChannelId, ChannelConfig } from './types';

export const CHANNELS: Record<ChannelId, ChannelConfig> = {
  [ChannelId.PHILOSOPHY]: {
    id: ChannelId.PHILOSOPHY,
    name: "Philosophy & Life",
    icon: "fa-brain",
    color: "text-purple-400",
    persona: "The Sage",
    tone: "Deep, existential, Socratic, calm",
    audience: "Thinkers, seekers of meaning",
    voice: "Fenrir" // Deep, authoritative
  },
  [ChannelId.TECH]: {
    id: ChannelId.TECH,
    name: "Tech & Automation",
    icon: "fa-microchip",
    color: "text-blue-400",
    persona: "The Architect",
    tone: "Precise, technical, efficient, fast-paced",
    audience: "Developers, engineers, hackers",
    voice: "Zephyr" // Crisp, fast, modern
  },
  [ChannelId.MUSIC]: {
    id: ChannelId.MUSIC,
    name: "Creative Audio",
    icon: "fa-music",
    color: "text-pink-400",
    persona: "The Virtuoso",
    tone: "Abstract, sensory, rhythmic, flowing",
    audience: "Artists, producers, audiophiles",
    voice: "Kore" // Balanced, smooth
  },
  [ChannelId.LORE]: {
    id: ChannelId.LORE,
    name: "Lore & Narrative",
    icon: "fa-book-skull",
    color: "text-amber-600",
    persona: "The Chronicler",
    tone: "Epic, descriptive, mysterious, immersive",
    audience: "RPG fans, anime lovers, writers",
    voice: "Charon" // Deep, narrative focus
  },
  [ChannelId.PRODUCTIVITY]: {
    id: ChannelId.PRODUCTIVITY,
    name: "Productivity & Biz",
    icon: "fa-chart-line",
    color: "text-emerald-400",
    persona: "The Strategist",
    tone: "Actionable, pragmatic, direct, high-energy",
    audience: "Entrepreneurs, hustlers, managers",
    voice: "Puck" // Energetic, clear
  }
};

export const MOODS = [
  "Inspirational",
  "Dark/Gritty",
  "High Energy",
  "Calm/Zen",
  "Mystery/Suspense",
  "Academic/Educational",
  "Sarcastic/Witty"
];

export const DURATIONS = [
  "Short (<60s)",
  "Medium (5-8m)",
  "Long (15m+)",
  "Extra Long (1h+)"
];

export const VISUAL_STYLES = [
  "Channel Default",
  "Cinematic Realism",
  "Cyberpunk / Neon",
  "Minimalist / Flat",
  "Watercolor / Artistic",
  "Retro / VHS / 80s",
  "Dark / Gothic / Noir",
  "3D Render (Pixar Style)",
  "Line Art / Sketch"
];

export const VOICES = [
  { label: "Channel Default", value: "default" },
  { label: "Zephyr (Fast/Modern)", value: "Zephyr" },
  { label: "Fenrir (Deep/Authoritative)", value: "Fenrir" },
  { label: "Puck (Energetic/Clear)", value: "Puck" },
  { label: "Kore (Balanced/Smooth)", value: "Kore" },
  { label: "Charon (Deep/Narrative)", value: "Charon" }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
  { id: 'brainstorm', label: 'Neural Link', icon: 'fa-bolt' },
  { id: 'video', label: 'Motion Lab', icon: 'fa-film' },
  { id: 'history', label: 'Production History', icon: 'fa-clock-rotate-left' },
];