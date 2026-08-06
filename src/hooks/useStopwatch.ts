import { useState, useRef, useEffect, useCallback } from 'react';
import { StopwatchStatus, Lap, Routine, SingleHitSound, RepeatingSound, SoundConfig, AudioSettings } from '../types/routine';
import { playSound } from '../audio/soundEngine';

interface UseStopwatchOptions {
  activeRoutine?: Routine | null;
  soundConfigs?: Record<string, SoundConfig>;
  audioSettings?: AudioSettings;
  onSoundTrigger?: (soundId: string, label: string) => void;
}

export function useStopwatch({ activeRoutine, soundConfigs, audioSettings, onSoundTrigger }: UseStopwatchOptions = {}) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [status, setStatus] = useState<StopwatchStatus>('idle');
  const [laps, setLaps] = useState<Lap[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // References for precise timer loop
  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Trigger tracking references
  const triggeredSingleHitsRef = useRef<Set<string>>(new Set());
  // Map of repeatingSoundId -> Set of triggered interval indices
  const triggeredRepeatIntervalsRef = useRef<Map<string, Set<number>>>(new Map());

  const resetTriggers = useCallback(() => {
    triggeredSingleHitsRef.current.clear();
    triggeredRepeatIntervalsRef.current.clear();
  }, []);

  // Evaluate sound triggers against current elapsed time in seconds
  const evaluateRoutineSounds = useCallback((elapsedSeconds: number) => {
    if (!activeRoutine) return;

    const masterVol = audioSettings?.masterVolume !== undefined ? audioSettings.masterVolume : 1.0;

    // 1. Evaluate Single-Hit Sounds
    if (activeRoutine.singleHits && activeRoutine.singleHits.length > 0) {
      activeRoutine.singleHits.forEach((sh: SingleHitSound) => {
        if (!triggeredSingleHitsRef.current.has(sh.id)) {
          if (elapsedSeconds >= sh.timeSeconds) {
            triggeredSingleHitsRef.current.add(sh.id);
            if (!isMuted) {
              playSound(sh.soundId, soundConfigs, sh.volume, masterVol);
            }
            if (onSoundTrigger) {
              onSoundTrigger(sh.soundId, sh.label || `Single hit at ${sh.timeSeconds}s`);
            }
          }
        }
      });
    }

    // 2. Evaluate Repeating Sounds
    if (activeRoutine.repeatingSounds && activeRoutine.repeatingSounds.length > 0) {
      activeRoutine.repeatingSounds.forEach((rep: RepeatingSound) => {
        if (rep.intervalSeconds <= 0) return;
        
        const timeFromStart = elapsedSeconds - rep.startTimeSeconds;
        if (timeFromStart >= 0) {
          const intervalIndex = Math.floor(timeFromStart / rep.intervalSeconds);

          let executedSet = triggeredRepeatIntervalsRef.current.get(rep.id);
          if (!executedSet) {
            executedSet = new Set<number>();
            triggeredRepeatIntervalsRef.current.set(rep.id, executedSet);
          }

          if (!executedSet.has(intervalIndex)) {
            const isWithinLimit =
              rep.repeatCount === 'indefinite' || intervalIndex < rep.repeatCount;

            if (isWithinLimit) {
              executedSet.add(intervalIndex);
              if (!isMuted) {
                playSound(rep.soundId, soundConfigs, rep.volume, masterVol);
              }
              if (onSoundTrigger) {
                onSoundTrigger(
                  rep.soundId,
                  rep.label || `Repeat #${intervalIndex + 1} (${rep.intervalSeconds}s interval)`
                );
              }
            }
          }
        }
      });
    }
  }, [activeRoutine, soundConfigs, isMuted, audioSettings, onSoundTrigger]);

  // Main animation / timer frame loop
  const tick = useCallback(() => {
    const now = performance.now();
    const currentTotalMs = accumulatedMsRef.current + (now - startTimeRef.current);
    setElapsedMs(currentTotalMs);

    const elapsedSec = currentTotalMs / 1000;
    evaluateRoutineSounds(elapsedSec);

    animFrameIdRef.current = requestAnimationFrame(tick);
  }, [evaluateRoutineSounds]);

  const start = useCallback(() => {
    if (status === 'running') return;

    startTimeRef.current = performance.now();
    setStatus('running');
    animFrameIdRef.current = requestAnimationFrame(tick);
  }, [status, tick]);

  const pause = useCallback(() => {
    if (status !== 'running') return;

    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    accumulatedMsRef.current += performance.now() - startTimeRef.current;
    setStatus('paused');
  }, [status]);

  const reset = useCallback(() => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    accumulatedMsRef.current = 0;
    startTimeRef.current = 0;
    setElapsedMs(0);
    setStatus('idle');
    setLaps([]);
    resetTriggers();
  }, [resetTriggers]);

  const addLap = useCallback(() => {
    if (status === 'idle') return;

    setLaps((prevLaps) => {
      const prevTotalMs = prevLaps.length > 0 ? prevLaps[0].totalTimeMs : 0;
      const lapTimeMs = elapsedMs - prevTotalMs;
      const newLap: Lap = {
        lapNumber: prevLaps.length + 1,
        lapTimeMs,
        totalTimeMs: elapsedMs,
      };
      return [newLap, ...prevLaps];
    });
  }, [status, elapsedMs]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Cleanup on unmount or status change
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Reset triggers when active routine changes
  useEffect(() => {
    resetTriggers();
  }, [activeRoutine?.id, resetTriggers]);

  return {
    elapsedMs,
    status,
    laps,
    isMuted,
    start,
    pause,
    reset,
    addLap,
    toggleMute,
  };
}
