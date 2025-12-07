
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getApiKey } from '../lib/utils';
import { CHANNELS } from '../constants';
import { ChannelId } from '../types';

export interface TurnLog {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const useLiveConnection = (channelId: ChannelId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0); // For visualizer
  const [transcripts, setTranscripts] = useState<TurnLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Refs for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Refs for session management
  const sessionRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Current partial transcriptions
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');

  const cleanupAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  }, []);

  const connect = async () => {
    setError(null);
    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error("API Key missing");

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      // Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey });
      const channelConfig = CHANNELS[channelId];

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: channelConfig.voice || 'Kore' } }
            },
            systemInstruction: `You are WesAI, the executive producer for the YouTube channel "${channelConfig.name}". 
            Persona: ${channelConfig.persona}. Tone: ${channelConfig.tone}.
            We are in a live brainstorming session. Your goal is to help me develop video concepts. 
            Be concise, conversational, and encouraging. Ask clarifying questions to flesh out ideas.`,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        }
      };

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: config.model,
        config: config.config,
        callbacks: {
            onopen: () => {
                console.log("Live Session Connected");
                setIsConnected(true);

                // Setup Input Processing
                const source = inputCtx.createMediaStreamSource(stream);
                inputSourceRef.current = source;
                
                // Use ScriptProcessor for raw PCM access (16k mono)
                const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;

                processor.onaudioprocess = (e) => {
                    if (isMuted) return;

                    const inputData = e.inputBuffer.getChannelData(0);
                    
                    // Simple Volume Meter Calculation
                    let sum = 0;
                    for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                    setVolume(Math.sqrt(sum / inputData.length) * 5); // Boost visual

                    // Convert Float32 to Int16 PCM for Gemini
                    const pcmData = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        pcmData[i] = inputData[i] * 32768;
                    }

                    // Base64 Encode
                    const bytes = new Uint8Array(pcmData.buffer);
                    let binary = '';
                    const len = bytes.byteLength;
                    for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    const base64 = btoa(binary);

                    sessionPromise.then(session => {
                        session.sendRealtimeInput({
                            media: {
                                mimeType: 'audio/pcm;rate=16000',
                                data: base64
                            }
                        });
                    });
                };

                source.connect(processor);
                processor.connect(inputCtx.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
                // Handle Audio Output
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    const binaryString = atob(audioData);
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    const dataInt16 = new Int16Array(bytes.buffer);
                    const buffer = outputCtx.createBuffer(1, dataInt16.length, 24000);
                    const channelData = buffer.getChannelData(0);
                    for (let i = 0; i < dataInt16.length; i++) {
                        channelData[i] = dataInt16[i] / 32768.0;
                    }

                    const source = outputCtx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(outputCtx.destination);
                    
                    // Schedule next chunk
                    const currentTime = outputCtx.currentTime;
                    const startTime = Math.max(currentTime, nextStartTimeRef.current);
                    source.start(startTime);
                    nextStartTimeRef.current = startTime + buffer.duration;
                    
                    sourcesRef.current.add(source);
                    source.onended = () => sourcesRef.current.delete(source);
                }

                // Handle Transcriptions
                if (msg.serverContent?.inputTranscription) {
                    currentInputTransRef.current += msg.serverContent.inputTranscription.text;
                }
                if (msg.serverContent?.outputTranscription) {
                    currentOutputTransRef.current += msg.serverContent.outputTranscription.text;
                }

                if (msg.serverContent?.turnComplete) {
                     // Flush transcripts to UI
                     if (currentInputTransRef.current.trim()) {
                         setTranscripts(prev => [...prev, {
                             role: 'user', 
                             text: currentInputTransRef.current,
                             timestamp: new Date()
                         }]);
                         currentInputTransRef.current = '';
                     }
                     if (currentOutputTransRef.current.trim()) {
                         setTranscripts(prev => [...prev, {
                             role: 'model', 
                             text: currentOutputTransRef.current,
                             timestamp: new Date()
                         }]);
                         currentOutputTransRef.current = '';
                     }
                }
            },
            onclose: () => {
                console.log("Live Session Closed");
                setIsConnected(false);
            },
            onerror: (err) => {
                console.error("Live Session Error", err);
                setError("Connection interrupted");
                setIsConnected(false);
            }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to initialize Live Session");
      cleanupAudio();
    }
  };

  const disconnect = () => {
    cleanupAudio();
    // We cannot explicitly "close" the session object in the current SDK safely without checking types,
    // but cleaning up the websocket via garbage collection and closing streams usually suffices.
    setIsConnected(false);
    sessionRef.current = null;
  };

  useEffect(() => {
    return () => {
        disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    isMuted,
    toggleMute: () => setIsMuted(!isMuted),
    volume,
    transcripts,
    error
  };
};
