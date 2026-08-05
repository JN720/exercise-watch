import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Trash2, Music, Repeat } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { RepeatingSound, SoundConfig } from '../types/routine';
import { SoundPickerModal } from './SoundPickerModal';
import { PRESET_SOUNDS } from '../audio/presets';

interface RepeatingSoundEditorProps {
  item: RepeatingSound;
  userConfigs?: Record<string, SoundConfig>;
  onUpdate: (updated: RepeatingSound) => void;
  onDelete: (id: string) => void;
}

export const RepeatingSoundEditor: React.FC<RepeatingSoundEditorProps> = ({
  item,
  userConfigs,
  onUpdate,
  onDelete,
}) => {
  const [startSecStr, setStartSecStr] = useState(String(item.startTimeSeconds));
  const [intervalSecStr, setIntervalSecStr] = useState(String(item.intervalSeconds));
  const [countStr, setCountStr] = useState(
    item.repeatCount === 'indefinite' ? '0' : String(item.repeatCount)
  );
  const [isIndefinite, setIsIndefinite] = useState(item.repeatCount === 'indefinite');
  const [label, setLabel] = useState(item.label || '');
  const [soundId, setSoundId] = useState(item.soundId);
  const [pickerVisible, setPickerVisible] = useState(false);

  const activeSoundName =
    userConfigs?.[soundId]?.name || PRESET_SOUNDS[soundId as keyof typeof PRESET_SOUNDS]?.name || soundId;

  const handleStartChange = (text: string) => {
    setStartSecStr(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      onUpdate({ ...item, startTimeSeconds: num });
    }
  };

  const handleIntervalChange = (text: string) => {
    setIntervalSecStr(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      onUpdate({ ...item, intervalSeconds: num });
    }
  };

  const handleCountChange = (text: string) => {
    setCountStr(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0) {
      onUpdate({ ...item, repeatCount: num });
    }
  };

  const toggleIndefinite = () => {
    const newIndefinite = !isIndefinite;
    setIsIndefinite(newIndefinite);
    onUpdate({
      ...item,
      repeatCount: newIndefinite ? 'indefinite' : parseInt(countStr, 10) || 5,
    });
  };

  const handleLabelChange = (text: string) => {
    setLabel(text);
    onUpdate({ ...item, label: text });
  };

  const handleSelectSound = (newSoundId: string) => {
    setSoundId(newSoundId);
    onUpdate({ ...item, soundId: newSoundId });
    setPickerVisible(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <Repeat size={16} color={COLORS.secondary} />
          <Text style={styles.badgeTitle}>REPEATING SOUND</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(item.id)}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.paramsGrid}>
        <View style={styles.paramBox}>
          <Text style={styles.fieldLabel}>Start Time</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.numInput}
              keyboardType="numeric"
              value={startSecStr}
              onChangeText={handleStartChange}
            />
            <Text style={styles.unitText}>sec</Text>
          </View>
        </View>

        <View style={styles.paramBox}>
          <Text style={styles.fieldLabel}>Repeat Every</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.numInput}
              keyboardType="numeric"
              value={intervalSecStr}
              onChangeText={handleIntervalChange}
            />
            <Text style={styles.unitText}>sec</Text>
          </View>
        </View>
      </View>

      <View style={styles.repeatCountRow}>
        <Text style={styles.fieldLabel}>Repetitions</Text>
        <View style={styles.repeatOptionGroup}>
          <TouchableOpacity
            style={[styles.togglePill, isIndefinite && styles.togglePillActive]}
            onPress={toggleIndefinite}
          >
            <Text style={[styles.togglePillText, isIndefinite && styles.togglePillTextActive]}>
              Infinite ∞
            </Text>
          </TouchableOpacity>

          {!isIndefinite && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numInput}
                keyboardType="numeric"
                value={countStr}
                onChangeText={handleCountChange}
              />
              <Text style={styles.unitText}>times</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Label / Cue Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Cadence Tick, 5s Interval"
          placeholderTextColor={COLORS.textDim}
          value={label}
          onChangeText={handleLabelChange}
        />
      </View>

      <View style={styles.soundSelectorRow}>
        <Text style={styles.fieldLabel}>Selected Sound</Text>
        <TouchableOpacity
          style={styles.soundPickerBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.8}
        >
          <Music size={16} color={COLORS.secondary} />
          <Text style={styles.soundPickerText}>{activeSoundName}</Text>
        </TouchableOpacity>
      </View>

      <SoundPickerModal
        visible={pickerVisible}
        selectedSoundId={soundId}
        userConfigs={userConfigs}
        onSelectSound={handleSelectSound}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeTitle: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  paramsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  paramBox: {
    flex: 1,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  numInput: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  unitText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  repeatCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  repeatOptionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  togglePill: {
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  togglePillActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  togglePillText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  togglePillTextActive: {
    color: COLORS.bgDark,
  },
  inputGroup: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: COLORS.bgInput,
    color: COLORS.textMain,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  soundSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soundPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    gap: 8,
  },
  soundPickerText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
