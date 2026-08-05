import { SoundConfig, SoundType } from '../types/routine';

export const PRESET_SOUNDS: Record<SoundType, SoundConfig> = {
  beep_high: {
    soundId: 'beep_high',
    name: 'High Beep',
    frequency: 1046.5, // C6
    type: 'sine',
    duration: 0.18,
    decay: 0.12,
    volume: 0.9,
  },
  beep_low: {
    soundId: 'beep_low',
    name: 'Low Beep',
    frequency: 440, // A4
    type: 'sine',
    duration: 0.22,
    decay: 0.15,
    volume: 0.85,
  },
  boxing_bell: {
    soundId: 'boxing_bell',
    name: 'Boxing Bell',
    frequency: 587.33, // D5 harmonic bell sound
    type: 'triangle',
    duration: 0.7,
    decay: 0.6,
    volume: 1.0,
  },
  whistle: {
    soundId: 'whistle',
    name: 'Referee Whistle',
    frequency: 2400, // High trill frequency
    type: 'sawtooth',
    duration: 0.35,
    decay: 0.1,
    volume: 0.85,
  },
  woodblock: {
    soundId: 'woodblock',
    name: 'Woodblock Tick',
    frequency: 800,
    type: 'square',
    duration: 0.06,
    decay: 0.04,
    volume: 0.75,
  },
  chime: {
    soundId: 'chime',
    name: 'Digital Chime',
    frequency: 1318.5, // E6
    type: 'sine',
    duration: 0.45,
    decay: 0.35,
    volume: 0.9,
  },
  double_beep: {
    soundId: 'double_beep',
    name: 'Double Warning Beep',
    frequency: 987.77, // B5
    type: 'sine',
    duration: 0.3,
    decay: 0.1,
    volume: 0.95,
  },
  tick: {
    soundId: 'tick',
    name: 'Metronome Tick',
    frequency: 1200,
    type: 'sine',
    duration: 0.03,
    decay: 0.02,
    volume: 0.65,
  },
  custom: {
    soundId: 'custom',
    name: 'Custom Synthesizer Tone',
    frequency: 600,
    type: 'sine',
    duration: 0.25,
    decay: 0.2,
    volume: 0.8,
  },
};
