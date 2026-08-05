import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine, SoundConfig } from '../types/routine';
import { PRESET_SOUNDS } from '../audio/presets';

const ROUTINES_STORAGE_KEY = '@exercise_watch_routines_v1';
const SOUND_CONFIGS_STORAGE_KEY = '@exercise_watch_sound_configs_v1';

export const INITIAL_PRESET_ROUTINES: Routine[] = [
  {
    id: 'preset_hiit_30_15',
    name: 'HIIT 30s Work / 15s Rest',
    description: 'High intensity interval training with sprint whistle and rest beep cues.',
    totalDurationSeconds: 180,
    singleHits: [
      { id: 'sh_1', timeSeconds: 0, soundId: 'whistle', label: 'Sprint Start!' },
      { id: 'sh_2', timeSeconds: 30, soundId: 'beep_low', label: 'Rest (15s)' },
      { id: 'sh_3', timeSeconds: 45, soundId: 'whistle', label: 'Sprint 2 Start!' },
      { id: 'sh_4', timeSeconds: 75, soundId: 'beep_low', label: 'Rest (15s)' },
      { id: 'sh_5', timeSeconds: 90, soundId: 'whistle', label: 'Sprint 3 Start!' },
      { id: 'sh_6', timeSeconds: 120, soundId: 'beep_low', label: 'Rest (15s)' },
      { id: 'sh_7', timeSeconds: 135, soundId: 'whistle', label: 'Final Sprint!' },
      { id: 'sh_8', timeSeconds: 165, soundId: 'double_beep', label: 'Cool Down' },
      { id: 'sh_9', timeSeconds: 180, soundId: 'boxing_bell', label: 'Workout Finished!' },
    ],
    repeatingSounds: [
      {
        id: 'rep_1',
        startTimeSeconds: 0,
        intervalSeconds: 5,
        repeatCount: 'indefinite',
        soundId: 'tick',
        label: 'Pacing Metronome (Every 5s)',
        volume: 0.4,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset_boxing_round',
    name: 'Boxing 3-Minute Round',
    description: 'Classic 3-minute round with start bell, 30s warning chime, and final bell.',
    totalDurationSeconds: 180,
    singleHits: [
      { id: 'b_1', timeSeconds: 0, soundId: 'boxing_bell', label: 'Round Start!' },
      { id: 'b_2', timeSeconds: 150, soundId: 'double_beep', label: '30s Warning!' },
      { id: 'b_3', timeSeconds: 180, soundId: 'boxing_bell', label: 'Round End Bell' },
    ],
    repeatingSounds: [
      {
        id: 'b_rep',
        startTimeSeconds: 30,
        intervalSeconds: 30,
        repeatCount: 4,
        soundId: 'chime',
        label: '30s Checkpoint Chime',
        volume: 0.8,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset_cadence_runner',
    name: 'Cadence Runner (Repeating Tick)',
    description: 'Infinite cadence tick every 2 seconds for steady-state running pace.',
    singleHits: [
      { id: 'c_1', timeSeconds: 0, soundId: 'whistle', label: 'Start Running' },
      { id: 'c_2', timeSeconds: 60, soundId: 'chime', label: '1 Minute Passed' },
      { id: 'c_3', timeSeconds: 120, soundId: 'chime', label: '2 Minutes Passed' },
      { id: 'c_4', timeSeconds: 300, soundId: 'double_beep', label: '5 Minutes Milestone' },
    ],
    repeatingSounds: [
      {
        id: 'c_rep',
        startTimeSeconds: 0,
        intervalSeconds: 2,
        repeatCount: 'indefinite',
        soundId: 'woodblock',
        label: '2s Cadence Pulse',
        volume: 0.7,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset_tabata_sprint',
    name: 'Tabata 20/10 Protocol',
    description: '20s maximum effort work followed by 10s rest repeating intervals.',
    totalDurationSeconds: 240,
    singleHits: [
      { id: 't_1', timeSeconds: 0, soundId: 'boxing_bell', label: 'Tabata Cycle 1' },
      { id: 't_2', timeSeconds: 240, soundId: 'boxing_bell', label: 'Tabata Complete!' },
    ],
    repeatingSounds: [
      {
        id: 't_rep_work',
        startTimeSeconds: 0,
        intervalSeconds: 30,
        repeatCount: 8,
        soundId: 'beep_high',
        label: 'Sprint (20s)',
        volume: 0.9,
      },
      {
        id: 't_rep_rest',
        startTimeSeconds: 20,
        intervalSeconds: 30,
        repeatCount: 8,
        soundId: 'beep_low',
        label: 'Rest (10s)',
        volume: 0.9,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export async function loadRoutines(): Promise<Routine[]> {
  try {
    const raw = await AsyncStorage.getItem(ROUTINES_STORAGE_KEY);
    if (!raw) {
      // Save presets as initial data
      await saveRoutines(INITIAL_PRESET_ROUTINES);
      return INITIAL_PRESET_ROUTINES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PRESET_ROUTINES;
  } catch (err) {
    return INITIAL_PRESET_ROUTINES;
  }
}

export async function saveRoutines(routines: Routine[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
  } catch (err) {
    // Fail safe
  }
}

export async function saveRoutine(routine: Routine): Promise<Routine[]> {
  const current = await loadRoutines();
  const existingIndex = current.findIndex((r) => r.id === routine.id);
  
  let updated: Routine[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...routine, updatedAt: Date.now() };
  } else {
    updated = [routine, ...current];
  }

  await saveRoutines(updated);
  return updated;
}

export async function deleteRoutine(routineId: string): Promise<Routine[]> {
  const current = await loadRoutines();
  const updated = current.filter((r) => r.id !== routineId);
  await saveRoutines(updated);
  return updated;
}

export async function loadSoundConfigs(): Promise<Record<string, SoundConfig>> {
  try {
    const raw = await AsyncStorage.getItem(SOUND_CONFIGS_STORAGE_KEY);
    if (!raw) {
      return PRESET_SOUNDS;
    }
    const parsed = JSON.parse(raw);
    return { ...PRESET_SOUNDS, ...parsed };
  } catch (err) {
    return PRESET_SOUNDS;
  }
}

export async function saveSoundConfig(config: SoundConfig): Promise<Record<string, SoundConfig>> {
  const current = await loadSoundConfigs();
  const updated = { ...current, [config.soundId]: config };
  try {
    await AsyncStorage.setItem(SOUND_CONFIGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {}
  return updated;
}
