import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Play, Pause, RotateCcw, Flag, Volume2, VolumeX } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Lap, Routine, StopwatchStatus } from '../types/routine';

interface StopwatchDisplayProps {
  elapsedMs: number;
  status: StopwatchStatus;
  laps: Lap[];
  isMuted: boolean;
  activeRoutine?: Routine | null;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAddLap: () => void;
  onToggleMute: () => void;
}

export function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const hh = String(hundredths).padStart(2, '0');

  return { mm, ss, hh };
}

export const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  elapsedMs,
  status,
  laps,
  isMuted,
  activeRoutine,
  onStart,
  onPause,
  onReset,
  onAddLap,
  onToggleMute,
}) => {
  const { mm, ss, hh } = formatTime(elapsedMs);

  const totalDurationSec = activeRoutine?.totalDurationSeconds || 0;
  const elapsedSec = elapsedMs / 1000;
  const progressPercent =
    totalDurationSec > 0 ? Math.min(100, (elapsedSec / totalDurationSec) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Active Routine Header */}
      {activeRoutine ? (
        <View style={styles.routineHeader}>
          <Text style={styles.routineTag}>ACTIVE ROUTINE</Text>
          <Text style={styles.routineTitle} numberOfLines={1}>
            {activeRoutine.name}
          </Text>
        </View>
      ) : (
        <View style={styles.routineHeader}>
          <Text style={styles.routineTag}>FREE STOPWATCH</Text>
          <Text style={styles.routineTitle}>Standard Mode</Text>
        </View>
      )}

      {/* Routine Target Duration Progress Bar */}
      {totalDurationSec > 0 && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
      )}

      {/* Main Digital Clock */}
      <View style={styles.clockCircle}>
        <View style={styles.clockInner}>
          <Text style={styles.timeDigits}>
            {mm}:{ss}
            <Text style={styles.msDigits}>.{hh}</Text>
          </Text>
          <Text style={styles.statusLabel}>{status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Controls Row */}
      <View style={styles.controlsRow}>
        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.btnCircle, styles.btnSecondary, status === 'idle' && styles.btnDisabled]}
          onPress={onReset}
          disabled={status === 'idle'}
          activeOpacity={0.8}
        >
          <RotateCcw size={22} color={status === 'idle' ? COLORS.textDim : COLORS.textMain} />
        </TouchableOpacity>

        {/* Main Start / Pause Button */}
        {status === 'running' ? (
          <TouchableOpacity
            style={[styles.btnMain, styles.btnPause]}
            onPress={onPause}
            activeOpacity={0.85}
          >
            <Pause size={32} color={COLORS.bgDark} fill={COLORS.bgDark} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnMain, styles.btnStart, SHADOWS.glowPrimary]}
            onPress={onStart}
            activeOpacity={0.85}
          >
            <Play size={32} color={COLORS.bgDark} fill={COLORS.bgDark} />
          </TouchableOpacity>
        )}

        {/* Lap Button */}
        <TouchableOpacity
          style={[styles.btnCircle, styles.btnSecondary, status === 'idle' && styles.btnDisabled]}
          onPress={onAddLap}
          disabled={status === 'idle'}
          activeOpacity={0.8}
        >
          <Flag size={22} color={status === 'idle' ? COLORS.textDim : COLORS.textMain} />
        </TouchableOpacity>

        {/* Mute Toggle Button */}
        <TouchableOpacity
          style={[styles.btnCircle, styles.btnSecondary]}
          onPress={onToggleMute}
          activeOpacity={0.8}
        >
          {isMuted ? (
            <VolumeX size={22} color={COLORS.error} />
          ) : (
            <Volume2 size={22} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Lap Splits List */}
      {laps.length > 0 && (
        <View style={styles.lapsContainer}>
          <Text style={styles.lapsHeaderTitle}>SPLITS ({laps.length})</Text>
          <ScrollView style={styles.lapsScrollView} nestedScrollEnabled>
            {laps.map((lap) => {
              const lapFormatted = formatTime(lap.lapTimeMs);
              const totalFormatted = formatTime(lap.totalTimeMs);
              return (
                <View key={lap.lapNumber} style={styles.lapRow}>
                  <Text style={styles.lapIndex}>Lap {lap.lapNumber}</Text>
                  <Text style={styles.lapSplitTime}>
                    +{lapFormatted.mm}:{lapFormatted.ss}.{lapFormatted.hh}
                  </Text>
                  <Text style={styles.lapTotalTime}>
                    {totalFormatted.mm}:{totalFormatted.ss}.{totalFormatted.hh}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  routineHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  routineTag: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  routineTitle: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: '700',
  },
  progressTrack: {
    width: '85%',
    height: 6,
    backgroundColor: COLORS.bgCardHover,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  clockCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    marginBottom: 28,
  },
  clockInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigits: {
    color: COLORS.textMain,
    fontSize: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  msDigits: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  btnMain: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnStart: {
    backgroundColor: COLORS.primary,
  },
  btnPause: {
    backgroundColor: COLORS.secondary,
  },
  btnCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    backgroundColor: COLORS.bgCardHover,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  lapsContainer: {
    width: '92%',
    maxHeight: 180,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lapsHeaderTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  lapsScrollView: {
    width: '100%',
  },
  lapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderHighlight,
  },
  lapIndex: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  lapSplitTime: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  lapTotalTime: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
