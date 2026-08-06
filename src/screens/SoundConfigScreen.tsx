import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Volume2, Sliders, Play, RotateCcw, Disc, Sparkles } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { SoundConfig, SoundType, AudioSettings } from '../types/routine';
import { PRESET_SOUNDS } from '../audio/presets';
import { playSound } from '../audio/soundEngine';

interface SoundConfigScreenProps {
  soundConfigs: Record<string, SoundConfig>;
  audioSettings: AudioSettings;
  onSaveSoundConfig: (config: SoundConfig) => void;
  onUpdateAudioSettings: (settings: AudioSettings) => void;
}

export const SoundConfigScreen: React.FC<SoundConfigScreenProps> = ({
  soundConfigs,
  audioSettings,
  onSaveSoundConfig,
  onUpdateAudioSettings,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('beep_high');

  const currentConfig = soundConfigs[selectedKey] || PRESET_SOUNDS[selectedKey as SoundType] || PRESET_SOUNDS.beep_high;

  const [frequency, setFrequency] = useState(String(currentConfig.frequency));
  const [duration, setDuration] = useState(String(currentConfig.duration));
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'sawtooth' | 'triangle'>(currentConfig.type || 'sine');
  const [volume, setVolume] = useState(String(currentConfig.volume));

  const handleSelectSoundKey = (key: string) => {
    setSelectedKey(key);
    const cfg = soundConfigs[key] || PRESET_SOUNDS[key as SoundType] || PRESET_SOUNDS.beep_high;
    setFrequency(String(cfg.frequency));
    setDuration(String(cfg.duration));
    setWaveType(cfg.type || 'sine');
    setVolume(String(cfg.volume));
  };

  const handleTestSound = () => {
    const customConfig: SoundConfig = {
      ...currentConfig,
      frequency: parseFloat(frequency) || 440,
      duration: parseFloat(duration) || 0.2,
      type: waveType,
      volume: parseFloat(volume) || 0.8,
    };
    playSound(customConfig, undefined, undefined, audioSettings.masterVolume);
  };

  const handleSaveConfig = () => {
    const updated: SoundConfig = {
      ...currentConfig,
      frequency: parseFloat(frequency) || currentConfig.frequency,
      duration: parseFloat(duration) || currentConfig.duration,
      type: waveType,
      volume: parseFloat(volume) || currentConfig.volume,
    };
    onSaveSoundConfig(updated);
  };

  const handleResetToPreset = () => {
    const preset = PRESET_SOUNDS[selectedKey as SoundType];
    if (preset) {
      setFrequency(String(preset.frequency));
      setDuration(String(preset.duration));
      setWaveType(preset.type);
      setVolume(String(preset.volume));
      onSaveSoundConfig(preset);
    }
  };

  const handleMasterVolumeChange = (val: number) => {
    onUpdateAudioSettings({
      ...audioSettings,
      masterVolume: val,
    });
  };

  const handleToggleDuckMusic = (val: boolean) => {
    onUpdateAudioSettings({
      ...audioSettings,
      duckMusic: val,
    });
  };

  const masterVolPercent = Math.round(audioSettings.masterVolume * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sound Synthesizer Studio</Text>
        <Text style={styles.headerSubtitle}>
          Configure master volume, music ducking, and tone parameters
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Global Audio Settings Section */}
        <View style={styles.globalCard}>
          <View style={styles.globalCardHeader}>
            <View style={styles.titleGroup}>
              <Sparkles size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Global Audio & Music Settings</Text>
            </View>
          </View>

          {/* Master Volume Slider */}
          <View style={styles.fieldBlock}>
            <View style={styles.fieldRowHeader}>
              <View style={styles.fieldTitleGroup}>
                <Volume2 size={18} color={COLORS.primary} />
                <Text style={styles.fieldTitleBold}>Master Volume</Text>
              </View>
              <Text style={styles.percentBadge}>{masterVolPercent}%</Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={audioSettings.masterVolume}
              onValueChange={handleMasterVolumeChange}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.bgInput}
              thumbTintColor={COLORS.primary}
            />
          </View>

          {/* Music Ducking Switch */}
          <View style={[styles.fieldRowHeader, { marginTop: 12 }]}>
            <View style={styles.fieldTitleGroup}>
              <Disc size={18} color={COLORS.secondary} />
              <View style={styles.duckTextGroup}>
                <Text style={styles.fieldTitleBold}>Drown Out Playing Music</Text>
                <Text style={styles.fieldSubtext}>
                  Lowers background music (Spotify/Apple Music) when workout cues play.
                </Text>
              </View>
            </View>

            <Switch
              value={audioSettings.duckMusic}
              onValueChange={handleToggleDuckMusic}
              trackColor={{ false: COLORS.bgInput, true: 'rgba(255, 179, 0, 0.4)' }}
              thumbColor={audioSettings.duckMusic ? COLORS.secondary : COLORS.textDim}
            />
          </View>
        </View>

        {/* Sound Selection Chips */}
        <Text style={styles.sectionLabel}>SELECT SOUND PRESET TO CUSTOMIZE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {Object.keys(soundConfigs).map((key) => {
            const isSelected = key === selectedKey;
            const soundName = soundConfigs[key]?.name || key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => handleSelectSoundKey(key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {soundName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Synthesizer Tuning Controls */}
        <View style={styles.tuningCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.titleGroup}>
              <Sliders size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>{currentConfig.name}</Text>
            </View>

            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestSound}
              activeOpacity={0.8}
            >
              <Play size={16} color={COLORS.bgDark} fill={COLORS.bgDark} />
              <Text style={styles.testBtnText}>TEST AUDIO</Text>
            </TouchableOpacity>
          </View>

          {/* Frequency */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldTitle}>Frequency (Hz)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={frequency}
                onChangeText={setFrequency}
              />
              <Text style={styles.unitText}>Hz</Text>
            </View>
          </View>

          {/* Tone Duration */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldTitle}>Duration (sec)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />
              <Text style={styles.unitText}>s</Text>
            </View>
          </View>

          {/* Waveform Selector */}
          <View style={styles.waveformSection}>
            <Text style={styles.fieldTitle}>Waveform Type</Text>
            <View style={styles.waveRow}>
              {(['sine', 'triangle', 'square', 'sawtooth'] as const).map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.waveBtn, waveType === w && styles.waveBtnActive]}
                  onPress={() => setWaveType(w)}
                >
                  <Text style={[styles.waveText, waveType === w && styles.waveTextActive]}>
                    {w.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preset Tone Base Volume */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldTitle}>Base Preset Volume (0.0 - 1.0)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={volume}
                onChangeText={setVolume}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetToPreset}
              activeOpacity={0.8}
            >
              <RotateCcw size={16} color={COLORS.textDim} />
              <Text style={styles.resetBtnText}>Reset Preset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveConfigBtn}
              onPress={handleSaveConfig}
              activeOpacity={0.8}
            >
              <Text style={styles.saveConfigBtnText}>SAVE SOUND</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: COLORS.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  globalCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  globalCardHeader: {
    marginBottom: 14,
  },
  fieldBlock: {
    marginBottom: 12,
  },
  fieldRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  fieldTitleBold: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '700',
  },
  percentBadge: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  duckTextGroup: {
    flex: 1,
  },
  fieldSubtext: {
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: 6,
  },
  sectionLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tuningCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '700',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  testBtnText: {
    color: COLORS.bgDark,
    fontSize: 11,
    fontWeight: '800',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  fieldTitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'center',
  },
  unitText: {
    color: COLORS.textDim,
    fontSize: 12,
    marginLeft: 4,
  },
  waveformSection: {
    marginBottom: 16,
  },
  waveRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  waveBtn: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  waveBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  waveText: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
  },
  waveTextActive: {
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderHighlight,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  resetBtnText: {
    color: COLORS.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  saveConfigBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  saveConfigBtnText: {
    color: COLORS.bgDark,
    fontSize: 12,
    fontWeight: '800',
  },
});
