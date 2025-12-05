import { ChannelId, ChannelConfig } from './types';

export const CHANNELS: Record<ChannelId, ChannelConfig> = {
  [ChannelId.PHILOSOPHY]: {
    id: ChannelId.PHILOSOPHY,
    name: "Philosophy & Life",
    icon: "fa-brain",
    color: "text-purple-400",
    persona: "The Sage",
    tone: "Deep, existential, Socratic, calm",
    audience: "Thinkers, seekers of meaning"
  },
  [ChannelId.TECH]: {
    id: ChannelId.TECH,
    name: "Tech & Automation",
    icon: "fa-microchip",
    color: "text-blue-400",
    persona: "The Architect",
    tone: "Precise, technical, efficient, fast-paced",
    audience: "Developers, engineers, hackers"
  },
  [ChannelId.MUSIC]: {
    id: ChannelId.MUSIC,
    name: "Creative Audio",
    icon: "fa-music",
    color: "text-pink-400",
    persona: "The Virtuoso",
    tone: "Abstract, sensory, rhythmic, flowing",
    audience: "Artists, producers, audiophiles"
  },
  [ChannelId.LORE]: {
    id: ChannelId.LORE,
    name: "Lore & Narrative",
    icon: "fa-book-skull",
    color: "text-amber-600",
    persona: "The Chronicler",
    tone: "Epic, descriptive, mysterious, immersive",
    audience: "RPG fans, anime lovers, writers"
  },
  [ChannelId.PRODUCTIVITY]: {
    id: ChannelId.PRODUCTIVITY,
    name: "Productivity & Biz",
    icon: "fa-chart-line",
    color: "text-emerald-400",
    persona: "The Strategist",
    tone: "Actionable, pragmatic, direct, high-energy",
    audience: "Entrepreneurs, hustlers, managers"
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
