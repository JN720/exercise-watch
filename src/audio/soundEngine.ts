import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { SoundConfig, SoundType } from '../types/routine';
import { PRESET_SOUNDS } from './presets';

// Configure iOS audio session so sounds play even when physical silent switch is ON
if (Platform.OS !== 'web') {
  Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
  }).catch(() => {});
}

// Cache generated expo-av sound instances for rapid playback
const nativeSoundCache: Record<string, string> = {};

function getWavDataUri(frequency: number, duration: number, waveType: string, volume: number): string {
  const cacheKey = `${frequency}_${duration}_${waveType}_${volume}`;
  if (nativeSoundCache[cacheKey]) {
    return nativeSoundCache[cacheKey];
  }

  const sampleRate = 22050; // 22.05kHz mono PCM for lightweight base64 payloads
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write WAV Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM Samples with envelope decay
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    const angle = 2 * Math.PI * frequency * t;

    if (waveType === 'square') {
      sample = Math.sin(angle) >= 0 ? 1 : -1;
    } else if (waveType === 'sawtooth') {
      sample = 2 * (t * frequency - Math.floor(0.5 + t * frequency));
    } else if (waveType === 'triangle') {
      sample = 2 * Math.abs(2 * (t * frequency - Math.floor(0.5 + t * frequency))) - 1;
    } else {
      sample = Math.sin(angle);
    }

    const envelope = Math.exp(-t * (4 / duration));
    const val = Math.max(-1, Math.min(1, sample * envelope * volume));
    const intSample = val < 0 ? val * 0x8000 : val * 0x7FFF;
    view.setInt16(44 + i * 2, intSample, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  const uri = `data:audio/wav;base64,${base64}`;
  nativeSoundCache[cacheKey] = uri;
  return uri;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Native audio player using expo-av Audio.Sound for iOS / Android in Expo Go
async function playNativeAudio(soundCfg: SoundConfig, volume: number): Promise<void> {
  try {
    const freq = soundCfg.frequency * (soundCfg.pitchModifier || 1.0);
    const duration = Math.max(0.08, soundCfg.duration || 0.2);
    const waveType = soundCfg.type || 'sine';

    const wavUri = getWavDataUri(freq, duration, waveType, volume);
    const { sound } = await Audio.Sound.createAsync(
      { uri: wavUri },
      { shouldPlay: true, volume: volume }
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (err) {
    // Fail-safe gracefully
  }
}

// Web Audio Context singleton (handles Web & React Native Web contexts)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSound(
  config: SoundConfig | SoundType | string,
  userConfigs?: Record<string, SoundConfig>,
  overrideVolume?: number
): void {
  try {
    let soundCfg: SoundConfig;
    if (typeof config === 'string') {
      if (userConfigs && userConfigs[config]) {
        soundCfg = userConfigs[config];
      } else if (PRESET_SOUNDS[config as SoundType]) {
        soundCfg = PRESET_SOUNDS[config as SoundType];
      } else {
        soundCfg = PRESET_SOUNDS.beep_high;
      }
    } else {
      soundCfg = config;
    }

    const volume = overrideVolume !== undefined ? overrideVolume : soundCfg.volume;

    // Platform Branching: Native iOS/Android vs Web Browser
    if (Platform.OS !== 'web') {
      playNativeAudio(soundCfg, volume);
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    // Web Audio Context playback
    if (soundCfg.soundId === 'boxing_bell') {
      playBoxingBell(ctx, soundCfg, volume);
    } else if (soundCfg.soundId === 'whistle') {
      playWhistle(ctx, soundCfg, volume);
    } else if (soundCfg.soundId === 'double_beep') {
      playDoubleBeep(ctx, soundCfg, volume);
    } else if (soundCfg.soundId === 'chime') {
      playChime(ctx, soundCfg, volume);
    } else {
      playStandardTone(ctx, soundCfg, volume);
    }
  } catch (err) {
    // Fail-safe gracefully
  }
}

function playStandardTone(ctx: AudioContext, cfg: SoundConfig, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const freq = cfg.frequency * (cfg.pitchModifier || 1.0);
  osc.type = cfg.type || 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + cfg.duration);
}

function playBoxingBell(ctx: AudioContext, cfg: SoundConfig, volume: number) {
  const freqs = [587.33, 880, 1174.66];
  freqs.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const mult = idx === 0 ? 1.0 : 0.4 / (idx + 1);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f * (cfg.pitchModifier || 1.0), ctx.currentTime);

    gain.gain.setValueAtTime(volume * mult, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + cfg.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + cfg.duration);
  });
}

function playWhistle(ctx: AudioContext, cfg: SoundConfig, volume: number) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  const baseFreq = cfg.frequency * (cfg.pitchModifier || 1.0);
  osc1.type = 'sawtooth';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  osc2.frequency.setValueAtTime(baseFreq + 35, ctx.currentTime);

  gain.gain.setValueAtTime(volume * 0.7, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + cfg.duration);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + cfg.duration);
  osc2.stop(ctx.currentTime + cfg.duration);
}

function playDoubleBeep(ctx: AudioContext, cfg: SoundConfig, volume: number) {
  const baseFreq = cfg.frequency * (cfg.pitchModifier || 1.0);

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  gain1.gain.setValueAtTime(volume, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.1);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(baseFreq * 1.15, ctx.currentTime + 0.14);
  gain2.gain.setValueAtTime(volume, ctx.currentTime + 0.14);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(ctx.currentTime + 0.14);
  osc2.stop(ctx.currentTime + 0.28);
}

function playChime(ctx: AudioContext, cfg: SoundConfig, volume: number) {
  const notes = [659.25, 830.61, 987.77];
  notes.forEach((f, idx) => {
    const startTime = ctx.currentTime + idx * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f * (cfg.pitchModifier || 1.0), startTime);

    gain.gain.setValueAtTime(volume * 0.8, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
}
