export type SoundType = 
  | 'beep_high'
  | 'beep_low'
  | 'boxing_bell'
  | 'whistle'
  | 'woodblock'
  | 'chime'
  | 'double_beep'
  | 'tick'
  | 'custom';

export interface SoundConfig {
  soundId: SoundType | string;
  name: string;
  frequency: number; // Hz (e.g., 880Hz for high beep)
  type: 'sine' | 'square' | 'sawtooth' | 'triangle';
  duration: number; // seconds (e.g., 0.15s)
  decay: number; // seconds
  volume: number; // 0 to 1
  pitchModifier?: number; // multiplier e.g. 1.0
}

export interface SingleHitSound {
  id: string;
  timeSeconds: number; // time when sound plays (e.g. 15.0 for 15s)
  soundId: SoundType | string;
  label: string;
  volume?: number;
}

export interface RepeatingSound {
  id: string;
  startTimeSeconds: number; // time when repeating starts (e.g. 0 or 30)
  intervalSeconds: number; // repeat every N seconds (e.g. 5)
  repeatCount: number | 'indefinite'; // number of repetitions or infinite
  soundId: SoundType | string;
  label: string;
  volume?: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  totalDurationSeconds?: number; // optional target routine duration
  singleHits: SingleHitSound[];
  repeatingSounds: RepeatingSound[];
  customSoundConfigs?: Record<string, SoundConfig>;
  createdAt: number;
  updatedAt: number;
}

export interface Lap {
  lapNumber: number;
  lapTimeMs: number;
  totalTimeMs: number;
}

export type StopwatchStatus = 'idle' | 'running' | 'paused';
