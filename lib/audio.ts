
/**
 * Handles decoding and playback of Raw PCM audio data from Gemini API.
 * Gemini TTS returns raw PCM 16-bit mono audio at 24kHz.
 */

import { base64ToBytes, writeStringToDataView } from "./utils";

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    // We do NOT force a sampleRate here. Most browsers/OS lock this to 44.1k or 48k.
    // We let the browser handle the context rate, and we define the buffer rate later (24k).
    // The Web Audio API handles the resampling automatically.
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const resumeAudioContext = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

export const playRawAudio = async (base64String: string, sampleRate = 24000): Promise<void> => {
  const ctx = getAudioContext();
  
  // Ensure context is running (browsers suspend it until user interaction)
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // 1. Decode Base64 string to Bytes using utility
  const bytes = base64ToBytes(base64String);
  const len = bytes.length;

  // 2. Convert Raw PCM (16-bit integers) to AudioBuffer (Float32)
  // Ensure we have an even number of bytes for Int16Array
  const alignedLen = len % 2 === 0 ? len : len - 1;
  const dataInt16 = new Int16Array(bytes.buffer, 0, alignedLen / 2);
  
  const frameCount = dataInt16.length;
  // Here we explicitly tell the buffer that this data is 24kHz
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

/**
 * Converts Base64 Raw PCM (16-bit, Mono, 24kHz) to a standard WAV file Blob.
 */
export const createWavBlob = (base64String: string, sampleRate = 24000): Blob => {
  const bytes = base64ToBytes(base64String);
  const len = bytes.length;
  
  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  // RIFF identifier
  writeStringToDataView(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + len, true);
  // RIFF type
  writeStringToDataView(view, 8, 'WAVE');
  // format chunk identifier
  writeStringToDataView(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeStringToDataView(view, 36, 'data');
  // data chunk length
  view.setUint32(40, len, true);

  // Copy PCM data into the buffer after the header
  new Uint8Array(buffer, 44).set(bytes);

  return new Blob([buffer], { type: 'audio/wav' });
};
