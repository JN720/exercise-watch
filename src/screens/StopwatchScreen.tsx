import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListMusic, ShieldAlert } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Routine, SoundConfig } from '../types/routine';
import { useStopwatch } from '../hooks/useStopwatch';
import { StopwatchDisplay } from '../components/StopwatchDisplay';
import { VisualFlash } from '../components/VisualFlash';
import { EventTimeline } from '../components/EventTimeline';

interface StopwatchScreenProps {
  activeRoutine: Routine | null;
  soundConfigs: Record<string, SoundConfig>;
  onNavigateToRoutines: () => void;
}

export const StopwatchScreen: React.FC<StopwatchScreenProps> = ({
  activeRoutine,
  soundConfigs,
  onNavigateToRoutines,
}) => {
  const [activeTrigger, setActiveTrigger] = useState<{
    soundId: string;
    label: string;
    timestamp: number;
  } | null>(null);

  const handleSoundTriggered = (soundId: string, label: string) => {
    setActiveTrigger({ soundId, label, timestamp: Date.now() });
  };

  const { elapsedMs, status, laps, isMuted, start, pause, reset, addLap, toggleMute } =
    useStopwatch({
      activeRoutine,
      soundConfigs,
      onSoundTrigger: handleSoundTriggered,
    });

  const elapsedSec = elapsedMs / 1000;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Text style={styles.appTitle}>ExerciseWatch</Text>
          <TouchableOpacity
            style={styles.selectRoutineBtn}
            onPress={onNavigateToRoutines}
            activeOpacity={0.8}
          >
            <ListMusic size={18} color={COLORS.primary} />
            <Text style={styles.selectRoutineBtnText}>
              {activeRoutine ? 'Change Routine' : 'Select Routine'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Visual Flash Alert Banner */}
        <VisualFlash activeTrigger={activeTrigger} />

        {/* Main Stopwatch Clock Display */}
        <StopwatchDisplay
          elapsedMs={elapsedMs}
          status={status}
          laps={laps}
          isMuted={isMuted}
          activeRoutine={activeRoutine}
          onStart={start}
          onPause={pause}
          onReset={reset}
          onAddLap={addLap}
          onToggleMute={toggleMute}
        />

        {/* Event Timeline (if active routine selected) */}
        {activeRoutine && (
          <View style={styles.sectionContainer}>
            <EventTimeline routine={activeRoutine} currentElapsedSec={elapsedSec} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  appTitle: {
    color: COLORS.textMain,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  selectRoutineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  selectRoutineBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionContainer: {
    width: '100%',
    marginTop: 10,
  },
});
