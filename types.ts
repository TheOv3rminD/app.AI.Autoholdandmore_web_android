export enum CallState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  AI_ENGAGED = 'AI_ENGAGED', // Cruise Control On
  ALERT = 'ALERT' // AI is summoning user
}

export enum AgentMode {
  MONITOR = 'MONITOR', // Listen for human (Wait on hold)
  CASUAL = 'CASUAL', // Talk to boring friend
  NEGOTIATE = 'NEGOTIATE', // Bill negotiator
  FILIBUSTER = 'FILIBUSTER' // Social engineering / Time waster
}

export interface AudioVisualizerData {
  userVolume: number;
  aiVolume: number;
}

export enum ControlMode {
  CRUISE = 'CRUISE',
  PERSISTENT = 'PERSISTENT',
  STEALTH = 'STEALTH',
  ATTACK = 'ATTACK'
}

export enum Sender {
  TARGET = 'TARGET',
  AI_AGENT = 'AI_AGENT',
  USER = 'USER'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  modeUsed?: ControlMode;
}

export enum TargetPersona {
  BORING_FRIEND = 'BORING_FRIEND',
  GLACIAL_SUPPORT = 'GLACIAL_SUPPORT',
  HOSTILE_NEGOTIATOR = 'HOSTILE_NEGOTIATOR',
  EX_PARTNER = 'EX_PARTNER'
}

export interface TelemetryData {
  timestamp: string | number;
  sentiment: number;
  verbosity: number;
  aggression: number;
  stealthIntegrity: number;
}