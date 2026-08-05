import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { Routine } from '../types/routine';

interface EventTimelineProps {
  routine: Routine;
  currentElapsedSec?: number;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ routine, currentElapsedSec = 0 }) => {
  // Compute max duration for timeline bounds
  let maxTime = routine.totalDurationSeconds || 60;
  
  routine.singleHits.forEach((sh) => {
    if (sh.timeSeconds > maxTime) maxTime = sh.timeSeconds + 10;
  });

  routine.repeatingSounds.forEach((rep) => {
    const end = rep.repeatCount === 'indefinite' ? rep.startTimeSeconds + rep.intervalSeconds * 8 : rep.startTimeSeconds + rep.intervalSeconds * rep.repeatCount;
    if (end > maxTime) maxTime = end + 10;
  });

  maxTime = Math.max(30, maxTime);

  const getLeftPercent = (sec: number) => {
    return Math.min(100, Math.max(0, (sec / maxTime) * 100));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.timelineTitle}>AUDIO TIMELINE</Text>
        <Text style={styles.timeRangeLabel}>0s - {Math.round(maxTime)}s</Text>
      </View>

      <View style={styles.trackArea}>
        {/* Main Background Track */}
        <View style={styles.trackLine} />

        {/* Current Playback Marker */}
        {currentElapsedSec > 0 && (
          <View
            style={[
              styles.currentMarker,
              { left: `${getLeftPercent(currentElapsedSec)}%` },
            ]}
          />
        )}

        {/* Repeating Sound Markers */}
        {routine.repeatingSounds.map((rep) => {
          const maxRepeats = rep.repeatCount === 'indefinite' ? 12 : rep.repeatCount;
          const markers = [];
          for (let i = 0; i < maxRepeats; i++) {
            const t = rep.startTimeSeconds + i * rep.intervalSeconds;
            if (t > maxTime) break;
            markers.push(
              <View
                key={`${rep.id}_${i}`}
                style={[
                  styles.repeatDot,
                  { left: `${getLeftPercent(t)}%` },
                ]}
              />
            );
          }
          return <React.Fragment key={rep.id}>{markers}</React.Fragment>;
        })}

        {/* Single-Hit Sound Markers */}
        {routine.singleHits.map((sh) => (
          <View
            key={sh.id}
            style={[
              styles.singleHitDot,
              { left: `${getLeftPercent(sh.timeSeconds)}%` },
            ]}
          >
            <View style={styles.singleHitInner} />
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBadge, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Single Hit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBadge, { backgroundColor: COLORS.secondary }]} />
          <Text style={styles.legendText}>Repeating Interval</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timelineTitle: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timeRangeLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  trackArea: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 6,
  },
  trackLine: {
    height: 4,
    backgroundColor: COLORS.bgCardHover,
    borderRadius: 2,
    width: '100%',
  },
  currentMarker: {
    position: 'absolute',
    width: 3,
    height: 32,
    backgroundColor: COLORS.accent,
    borderRadius: 1.5,
    zIndex: 10,
  },
  singleHitDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  singleHitInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bgDark,
  },
  repeatDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginLeft: -4,
    zIndex: 3,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
