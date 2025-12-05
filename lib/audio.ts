/**
 * Handles decoding and playback of Raw PCM audio data from Gemini API.
 * Gemini TTS returns raw PCM 16-bit mono audio at 24kHz.
 */

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
      sampleRate: 24000 
    });
  }
  return audioContext;
};

export const playRawAudio = async (base64String: string, sampleRate = 24000): Promise<void> => {
  const ctx = getAudioContext();
  
  // Ensure context is running (browsers suspend it until user interaction)
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // 1. Decode Base64 string to Binary String
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 2. Convert Raw PCM (16-bit integers) to AudioBuffer (Float32)
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  // Normalize 16-bit int to float [-1.0, 1.0]
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  // 3. Play
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  
  return new Promise<void>((resolve) => {
    source.onended = () => resolve();
  });
};