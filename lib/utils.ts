
// Shared utility functions for WesTube Engine

/**
 * Retrieves the API Key from Local Storage or Environment variables.
 * Prioritizes Local Storage to allow user overrides.
 */
export const getApiKey = (): string => {
  return localStorage.getItem('wes_gemini_api_key') || process.env.API_KEY || '';
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
 * Removes Markdown code blocks (```json ... ```).
 */
export const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  // Remove markdown code block syntax
  let cleaned = text.replace(/```json\n?|```/g, '');
  // Trim whitespace
  return cleaned.trim();
};
