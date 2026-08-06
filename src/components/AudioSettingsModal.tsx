import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { Volume2, VolumeX, Volume1, X, Disc, Sparkles } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { AudioSettings } from '../types/routine';
import { playSound } from '../audio/soundEngine';

interface AudioSettingsModalProps {
  visible: boolean;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: AudioSettings) => void;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  visible,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleVolumeChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      masterVolume: val,
    });
  };

  const handleToggleDuckMusic = (val: boolean) => {
    onUpdateSettings({
      ...settings,
      duckMusic: val,
    });
  };

  const percent = Math.round(settings.masterVolume * 100);

  const renderVolumeIcon = () => {
    if (settings.masterVolume === 0) {
      return <VolumeX size={22} color={COLORS.error} />;
    } else if (settings.masterVolume < 0.5) {
      return <Volume1 size={22} color={COLORS.primary} />;
    } else {
      return <Volume2 size={22} color={COLORS.primary} />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleGroup}>
              <Sparkles size={20} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Audio Controls & Music</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Master Volume Section */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.labelGroup}>
                {renderVolumeIcon()}
                <Text style={styles.sectionTitle}>Master Routine Volume</Text>
              </View>
              <Text style={styles.percentageBadge}>{percent}%</Text>
            </View>

            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                value={settings.masterVolume}
                onValueChange={handleVolumeChange}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.bgInput}
                thumbTintColor={COLORS.primary}
              />
            </View>
          </View>

          {/* Music Ducking Section */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.labelGroup}>
                <Disc size={22} color={COLORS.secondary} />
                <View style={styles.textGroup}>
                  <Text style={styles.sectionTitle}>Drown Out Playing Music</Text>
                  <Text style={styles.subtext}>
                    Automatically lowers Spotify / Apple Music volume when workout cues play.
                  </Text>
                </View>
              </View>

              <Switch
                value={settings.duckMusic}
                onValueChange={handleToggleDuckMusic}
                trackColor={{ false: COLORS.bgInput, true: 'rgba(255, 179, 0, 0.4)' }}
                thumbColor={settings.duckMusic ? COLORS.secondary : COLORS.textDim}
              />
            </View>
          </View>

          {/* Test Audio Button */}
          <TouchableOpacity
            style={styles.testBtn}
            onPress={() => playSound('whistle', undefined, undefined, settings.masterVolume)}
            activeOpacity={0.85}
          >
            <Volume2 size={18} color={COLORS.bgDark} />
            <Text style={styles.testBtnText}>TEST WORKOUT CUE AUDIO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  sectionBox: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  textGroup: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  subtext: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  percentageBadge: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  sliderContainer: {
    marginTop: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  testBtnText: {
    color: COLORS.bgDark,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
