import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Trash2, Music, Check, Volume2 } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { SingleHitSound, SoundConfig } from '../types/routine';
import { SoundPickerModal } from './SoundPickerModal';
import { PRESET_SOUNDS } from '../audio/presets';

interface SingleHitEditorProps {
  item: SingleHitSound;
  userConfigs?: Record<string, SoundConfig>;
  onUpdate: (updated: SingleHitSound) => void;
  onDelete: (id: string) => void;
}

export const SingleHitEditor: React.FC<SingleHitEditorProps> = ({
  item,
  userConfigs,
  onUpdate,
  onDelete,
}) => {
  const [timeSecStr, setTimeSecStr] = useState(String(item.timeSeconds));
  const [label, setLabel] = useState(item.label || '');
  const [soundId, setSoundId] = useState(item.soundId);
  const [pickerVisible, setPickerVisible] = useState(false);

  const activeSoundName =
    userConfigs?.[soundId]?.name || PRESET_SOUNDS[soundId as keyof typeof PRESET_SOUNDS]?.name || soundId;

  const handleTimeChange = (text: string) => {
    setTimeSecStr(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      onUpdate({ ...item, timeSeconds: num });
    }
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
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeLabel}>TRIGGER AT</Text>
          <View style={styles.timeInputRow}>
            <TextInput
              style={styles.timeInput}
              keyboardType="numeric"
              value={timeSecStr}
              onChangeText={handleTimeChange}
            />
            <Text style={styles.unitText}>sec</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(item.id)}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.labelTitle}>Label / Cue Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Sprint Start, Rest, Warning"
          placeholderTextColor={COLORS.textDim}
          value={label}
          onChangeText={handleLabelChange}
        />
      </View>

      <View style={styles.soundSelectorRow}>
        <Text style={styles.labelTitle}>Selected Sound</Text>
        <TouchableOpacity
          style={styles.soundPickerBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.8}
        >
          <Music size={16} color={COLORS.primary} />
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
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBadgeLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeInput: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  unitText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteBtn: {
    padding: 6,
  },
  inputGroup: {
    marginBottom: 10,
  },
  labelTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
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
    marginTop: 4,
  },
  soundPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  soundPickerText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
