import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { AgentMode } from "../types";
import { float32ToPCM16, arrayBufferToBase64, base64ToArrayBuffer } from "./audioUtils";

const SYSTEM_INSTRUCTIONS: Record<AgentMode, string> = {
  [AgentMode.MONITOR]: "You are a listening assistant. Your ONLY job is to listen to hold music or silence. As soon as a HUMAN speaks to you, say 'User Alert' clearly and stop talking.",
  [AgentMode.CASUAL]: "You are covering for the user on a phone call. Be polite, casual, and vague. Use fillers like 'yeah', 'uh-huh', 'totally'. Keep the conversation flowing but don't commit to anything major unless instructed.",
  [AgentMode.NEGOTIATE]: "You are a ruthless negotiator. Your goal is to lower the bill or get a better deal. Do not accept the first offer. Be firm, ask for supervisors, and cite 'competitor offers'.",
  [AgentMode.FILIBUSTER]: "ATTACK MODE. Your goal is to waste the other person's time. Feign confusion. Ask them to repeat things. Give irrelevant personal details. Misunderstand basic questions. Be polite but infinitely frustrating. Loop conversations."
};

export class LiveClient {
  private client: GoogleGenAI;
  private session: any = null;
  
  // Audio Components
  private audioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  
  private currentMode: AgentMode = AgentMode.CASUAL;
  private userGoal: string = "";
  private onVolumeChange: (user: number, ai: number) => void;
  private onAlert: () => void;

  constructor(
    onVolumeChange: (u: number, a: number) => void,
    onAlert: () => void
  ) {
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.onVolumeChange = onVolumeChange;
    this.onAlert = onAlert;
  }

  // Starts the microphone, recording, and volume monitoring
  async startAudio() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.recordingDestination = this.audioContext.createMediaStreamDestination();
    this.recordedChunks = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.inputSource = this.audioContext.createMediaStreamSource(stream);

    // 1. Route Mic to Recording
    this.inputSource.connect(this.recordingDestination);

    // 2. Route Mic to Processor for Volume & AI Input
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.inputSource.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    // 3. Start Recorder
    this.mediaRecorder = new MediaRecorder(this.recordingDestination.stream);
    this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
    };
    this.mediaRecorder.start();

    // 4. Audio Processing Loop (Volume + AI Sending)
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate user volume for visualizer
      let sum = 0;
      for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
      const volume = Math.sqrt(sum / inputData.length);
      this.onVolumeChange(volume * 100, 0); // AI volume is 0 here, updated in handleMessage

      // Send to Gemini if session exists
      if (this.session) {
        const pcm16 = float32ToPCM16(inputData);
        const uint8 = new Uint8Array(pcm16.buffer);
        const base64 = arrayBufferToBase64(uint8.buffer);

        this.session.sendRealtimeInput({
            media: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64
            }
        });
      }
    };
  }

  // Connects to Gemini API (Cruise Control Engaged)
  async connectAI(mode: AgentMode, goal: string) {
    this.currentMode = mode;
    this.userGoal = goal;
    const instruction = `${SYSTEM_INSTRUCTIONS[mode]} ${goal ? `\n\nADDITIONAL OBJECTIVE: ${goal}` : ''}`;

    this.session = await this.client.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: instruction,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      },
      callbacks: {
        onopen: () => console.log("AI Connected"),
        onmessage: this.handleMessage.bind(this),
        onclose: () => console.log('Live session closed'),
        onerror: (err) => console.error('Live session error', err),
      }
    });
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Audio Output from AI
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.audioContext && this.recordingDestination) {
      const buffer = base64ToArrayBuffer(audioData);
      const audioBuffer = await this.decodeAudio(buffer);
      
      this.onVolumeChange(0, 50); // Fake AI volume spike for visualizer
      setTimeout(() => this.onVolumeChange(0, 0), audioBuffer.duration * 1000);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // 1. Play to User Speakers
      source.connect(this.audioContext.destination);
      
      // 2. Record AI Output
      source.connect(this.recordingDestination);
      
      source.start();
    }
  }

  async disconnectAI() {
    // Only disconnects the websocket session, keeps audio context alive
    if (this.session) {
        // We can't explicitly close cleanly in SDK currently without just dropping ref, 
        // but assuming this stops sending.
        this.session = null;
    }
  }

  async stopAudio(): Promise<Blob | null> {
    return new Promise((resolve) => {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
            resolve(null);
            return;
        }

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            this.recordedChunks = [];
            this.cleanup();
            resolve(blob);
        };
        this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    this.inputSource?.disconnect();
    this.processor?.disconnect();
    this.recordingDestination?.disconnect();
    this.audioContext?.close();
    
    this.inputSource = null;
    this.processor = null;
    this.recordingDestination = null;
    this.audioContext = null;
    this.session = null;
    this.mediaRecorder = null;
  }

  private async decodeAudio(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error("No Audio Context");
    
    // Manual decoding for raw PCM 24kHz (Gemini default)
    const dataView = new DataView(arrayBuffer);
    const float32 = new Float32Array(arrayBuffer.byteLength / 2);
    for (let i = 0; i < float32.length; i++) {
        float32[i] = dataView.getInt16(i * 2, true) / 32768;
    }

    const audioBuffer = this.audioContext.createBuffer(1, float32.length, 24000);
    audioBuffer.copyToChannel(float32, 0);
    return audioBuffer;
  }
}