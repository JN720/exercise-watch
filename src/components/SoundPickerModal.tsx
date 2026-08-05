import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Volume2, X, Check } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { PRESET_SOUNDS } from '../audio/presets';
import { playSound } from '../audio/soundEngine';
import { SoundConfig, SoundType } from '../types/routine';

interface SoundPickerModalProps {
  visible: boolean;
  selectedSoundId: string;
  userConfigs?: Record<string, SoundConfig>;
  onSelectSound: (soundId: string) => void;
  onClose: () => void;
}

export const SoundPickerModal: React.FC<SoundPickerModalProps> = ({
  visible,
  selectedSoundId,
  userConfigs,
  onSelectSound,
  onClose,
}) => {
  const soundList = Object.values(userConfigs || PRESET_SOUNDS);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Audio Cue Sound</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.soundList}>
            {soundList.map((sound) => {
              const isSelected = selectedSoundId === sound.soundId;
              return (
                <TouchableOpacity
                  key={sound.soundId}
                  style={[styles.soundRow, isSelected && styles.soundRowSelected]}
                  onPress={() => {
                    onSelectSound(sound.soundId);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.soundInfo}>
                    <Text style={[styles.soundName, isSelected && styles.soundNameSelected]}>
                      {sound.name}
                    </Text>
                    <Text style={styles.soundDetail}>
                      {sound.frequency}Hz • {sound.type} wave
                    </Text>
                  </View>

                  <View style={styles.actionsGroup}>
                    {/* Preview Sound Button */}
                    <TouchableOpacity
                      style={styles.previewBtn}
                      onPress={() => playSound(sound.soundId, userConfigs)}
                      activeOpacity={0.7}
                    >
                      <Volume2 size={18} color={COLORS.primary} />
                    </TouchableOpacity>

                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Check size={14} color={COLORS.bgDark} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  soundList: {
    width: '100%',
  },
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  soundRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: '600',
  },
  soundNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  soundDetail: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewBtn: {
    backgroundColor: COLORS.bgCardHover,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkBadge: {
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
