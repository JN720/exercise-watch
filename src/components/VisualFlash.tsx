import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface VisualFlashProps {
  activeTrigger: { soundId: string; label: string; timestamp: number } | null;
}

export const VisualFlash: React.FC<VisualFlashProps> = ({ activeTrigger }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!activeTrigger) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeTrigger]);

  if (!visible || !activeTrigger) return null;

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.pulseDot} />
      <Text style={styles.bannerText}>
        <Text style={styles.soundBadge}>[{activeTrigger.soundId.toUpperCase()}]</Text>{' '}
        {activeTrigger.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 10,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  bannerText: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  soundBadge: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
