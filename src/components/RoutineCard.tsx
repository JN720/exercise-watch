import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Edit3, Copy, Trash2, Zap, Repeat, Clock } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Routine } from '../types/routine';

interface RoutineCardProps {
  routine: Routine;
  isSelected?: boolean;
  onSelect: (routine: Routine) => void;
  onEdit: (routine: Routine) => void;
  onDuplicate: (routine: Routine) => void;
  onDelete: (routineId: string) => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const singleHitCount = routine.singleHits ? routine.singleHits.length : 0;
  const repeatingCount = routine.repeatingSounds ? routine.repeatingSounds.length : 0;

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.titleText}>{routine.name}</Text>
          {routine.description ? (
            <Text style={styles.descText} numberOfLines={2}>
              {routine.description}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => onSelect(routine)}
          activeOpacity={0.8}
        >
          <Play size={18} color={COLORS.bgDark} fill={COLORS.bgDark} />
          <Text style={styles.startBtnText}>START</Text>
        </TouchableOpacity>
      </View>

      {/* Badges Summary */}
      <View style={styles.badgeRow}>
        {routine.totalDurationSeconds ? (
          <View style={styles.badgeItem}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.badgeText}>{routine.totalDurationSeconds}s Total</Text>
          </View>
        ) : null}

        <View style={styles.badgeItem}>
          <Zap size={12} color={COLORS.primary} />
          <Text style={styles.badgeText}>{singleHitCount} Single Hits</Text>
        </View>

        <View style={styles.badgeItem}>
          <Repeat size={12} color={COLORS.secondary} />
          <Text style={styles.badgeText}>{repeatingCount} Repeating</Text>
        </View>
      </View>

      {/* Cue Preview Summary */}
      <View style={styles.previewBox}>
        {routine.singleHits.slice(0, 3).map((sh) => (
          <Text key={sh.id} style={styles.cuePreviewText} numberOfLines={1}>
            • @{sh.timeSeconds}s: <Text style={styles.highlightText}>{sh.label || sh.soundId}</Text>
          </Text>
        ))}
        {routine.repeatingSounds.slice(0, 2).map((rep) => (
          <Text key={rep.id} style={styles.cuePreviewText} numberOfLines={1}>
            • Repeat every {rep.intervalSeconds}s:{' '}
            <Text style={styles.highlightTextSec}>{rep.label || rep.soundId}</Text>
          </Text>
        ))}
      </View>

      {/* Actions Footer */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => onEdit(routine)}
          activeOpacity={0.7}
        >
          <Edit3 size={15} color={COLORS.primary} />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => onDuplicate(routine)}
          activeOpacity={0.7}
        >
          <Copy size={15} color={COLORS.textMuted} />
          <Text style={styles.actionBtnTextMuted}>Duplicate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => onDelete(routine.id)}
          activeOpacity={0.7}
        >
          <Trash2 size={15} color={COLORS.error} />
          <Text style={styles.actionBtnTextErr}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
    paddingRight: 10,
  },
  titleText: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  descText: {
    color: COLORS.textDim,
    fontSize: 13,
    lineHeight: 18,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  startBtnText: {
    color: COLORS.bgDark,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  cuePreviewText: {
    color: COLORS.textDim,
    fontSize: 12,
    marginBottom: 2,
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  highlightTextSec: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderHighlight,
  },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 4,
  },
  actionBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtnTextMuted: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtnTextErr: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
  },
});
