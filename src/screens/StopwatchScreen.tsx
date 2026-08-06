import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListMusic, Volume2, Sliders } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Routine, SoundConfig, AudioSettings } from '../types/routine';
import { useStopwatch } from '../hooks/useStopwatch';
import { StopwatchDisplay } from '../components/StopwatchDisplay';
import { VisualFlash } from '../components/VisualFlash';
import { EventTimeline } from '../components/EventTimeline';
import { AudioSettingsModal } from '../components/AudioSettingsModal';

interface StopwatchScreenProps {
  activeRoutine: Routine | null;
  soundConfigs: Record<string, SoundConfig>;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (settings: AudioSettings) => void;
  onNavigateToRoutines: () => void;
}

export const StopwatchScreen: React.FC<StopwatchScreenProps> = ({
  activeRoutine,
  soundConfigs,
  audioSettings,
  onUpdateAudioSettings,
  onNavigateToRoutines,
}) => {
  const [activeTrigger, setActiveTrigger] = useState<{
    soundId: string;
    label: string;
    timestamp: number;
  } | null>(null);

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const handleSoundTriggered = (soundId: string, label: string) => {
    setActiveTrigger({ soundId, label, timestamp: Date.now() });
  };

  const { elapsedMs, status, laps, isMuted, start, pause, reset, addLap, toggleMute } =
    useStopwatch({
      activeRoutine,
      soundConfigs,
      audioSettings,
      onSoundTrigger: handleSoundTriggered,
    });

  const elapsedSec = elapsedMs / 1000;
  const volPercent = Math.round(audioSettings.masterVolume * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Text style={styles.appTitle}>ExerciseWatch</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.audioSettingsBtn}
              onPress={() => setSettingsModalVisible(true)}
              activeOpacity={0.8}
            >
              <Volume2 size={16} color={COLORS.secondary} />
              <Text style={styles.audioSettingsText}>{volPercent}%</Text>
              {audioSettings.duckMusic && (
                <View style={styles.duckBadge}>
                  <Text style={styles.duckBadgeText}>DUCK</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectRoutineBtn}
              onPress={onNavigateToRoutines}
              activeOpacity={0.8}
            >
              <ListMusic size={16} color={COLORS.primary} />
              <Text style={styles.selectRoutineBtnText}>
                {activeRoutine ? 'Routine' : 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
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

      {/* Audio & Music Settings Modal */}
      <AudioSettingsModal
        visible={settingsModalVisible}
        settings={audioSettings}
        onUpdateSettings={onUpdateAudioSettings}
        onClose={() => setSettingsModalVisible(false)}
      />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    gap: 5,
  },
  audioSettingsText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  duckBadge: {
    backgroundColor: 'rgba(255, 179, 0, 0.25)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  duckBadgeText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '800',
  },
  selectRoutineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  selectRoutineBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionContainer: {
    width: '100%',
    marginTop: 10,
  },
});
