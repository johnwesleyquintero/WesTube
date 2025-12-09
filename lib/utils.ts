

// Shared utility functions for WesTube Engine

/**
 * Retrieves the API Key from Environment variables or Local Storage.
 * Prioritizes user-provided key in localStorage ('wes_api_key') over process.env.
 */
export const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('wes_api_key');
    if (storedKey) return storedKey;
  }
  return process.env.API_KEY || '';
};

/**
 * Formats an ISO date string into a readable format.
 * Format: "Oct 24, 10:30 AM"
 */
export const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Unknown Date';
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

/**
 * Delays execution for a specified number of milliseconds.
 * Useful for debouncing or smooth UI transitions.
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sanitizes a raw string from LLM to ensure it is valid JSON.
 * uses Regex to extract the first valid JSON object or array from the text,
 * ignoring markdown code blocks or conversational filler.
 */
export const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  
  // 1. Remove Markdown code blocks first
  let cleaned = text.replace(/```json\n?|```/g, '');

  // 2. Find the first '{' or '[' and the last '}' or ']'
  const firstOpenBrace = cleaned.indexOf('{');
  const firstOpenBracket = cleaned.indexOf('[');
  
  let startIndex = -1;
  
  // Determine if it starts with Object or Array
  if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
    startIndex = firstOpenBrace;
  } else if (firstOpenBracket !== -1) {
    startIndex = firstOpenBracket;
  }

  if (startIndex !== -1) {
    const lastCloseBrace = cleaned.lastIndexOf('}');
    const lastCloseBracket = cleaned.lastIndexOf(']');
    const endIndex = Math.max(lastCloseBrace, lastCloseBracket);
    
    if (endIndex > startIndex) {
      cleaned = cleaned.substring(startIndex, endIndex + 1);
    }
  }

  return cleaned.trim();
};

/**
 * Decodes a Base64 string into a Uint8Array.
 * Used for processing raw audio/image data from Gemini.
 */
export const base64ToBytes = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Writes an ASCII string into a DataView at a specific offset.
 * Helper for WAV file header generation.
 */
export const writeStringToDataView = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};