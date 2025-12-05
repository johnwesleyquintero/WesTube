# 🎛️ WesTube Engine v2.0
### **Your Private YouTube Content Production Network**

**Stack:** React + TypeScript + Vite + Tailwind CSS + Gemini API  
**Owner:** Wesley × WesAI  
**Goal:** One-click generation of multi-channel YouTube content

---

## 🧭 Overview
WesTube v2.0 is a **multi-channel YouTube production network** engine. It evolves the concept of a simple content generator into a robust system capable of managing distinct brand personas.
**Objective:** Generate content for **5 distinct channels** with **1+ video per day per channel** using a single interface.

---

## 🔥 Core Vision
- **Automated Empire:** One input generates aligned assets for multiple channels.
- **Persona-Driven:** Each channel has a unique voice, visual style, and audience.
- **Full Asset Generation:** Script → Narration → Music Prompts → Thumbnail Prompts → SEO.

---

## 🏗️ Channel Strategy (The "Shivs")

| Channel ID | Name | Icon | Persona | Tone |
| :--- | :--- | :--- | :--- | :--- |
| **Philosophy** | Philosophy & Life | 🧠 | The Sage | Deep, existential, Socratic |
| **Tech** | Tech & Automation | 💾 | The Architect | Precise, technical, fast-paced |
| **Music** | Creative Audio | 🎵 | The Virtuoso | Abstract, sensory, rhythmic |
| **Lore** | Lore & Narrative | 📖 | The Chronicler | Epic, mysterious, immersive |
| **Productivity** | Productivity & Biz | 📈 | The Strategist | Actionable, direct, high-energy |

---

## 🧩 Modules

1.  **Script Engine:** Generates scene-by-scene scripts with visual/audio cues.
2.  **Asset Lab:** Creates prompts for Thumbnails (Imagen/Midjourney) and Music (Suno/Udio).
3.  **SEO Mastery:** Auto-generates titles, hooks, descriptions, and tags.
4.  **Dashboard:** Central command center for managing generation tasks.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-repo/westube-engine.git
    cd westube-engine
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 📂 Project Structure

```
src/
├── components/   # Reusable UI components (Sidebar, etc.)
├── lib/          # API clients (Gemini) and helpers
├── modules/      # Core feature modules (Generator, etc.)
├── constants.ts  # Channel configurations & static data
├── types.ts      # TypeScript interfaces
├── App.tsx       # Main layout
└── index.tsx     # Entry point
```

---

## 🔮 Roadmap
- [x] **v2.0 MVP:** Text-based generation for Scripts, SEO, and Prompts.
- [ ] **v2.1:** Direct Image Generation integration.
- [ ] **v2.2:** Text-to-Speech (TTS) audio preview.
- [ ] **v2.5:** Automated batch exporting.

---
*Built with precision by WesAI.*
