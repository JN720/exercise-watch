import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Plus, Zap, Repeat, Clock } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Routine, SingleHitSound, RepeatingSound, SoundConfig } from '../types/routine';
import { SingleHitEditor } from '../components/SingleHitEditor';
import { RepeatingSoundEditor } from '../components/RepeatingSoundEditor';
import { EventTimeline } from '../components/EventTimeline';

interface RoutineEditScreenProps {
  routine: Routine;
  userConfigs?: Record<string, SoundConfig>;
  onSave: (routine: Routine) => void;
  onCancel: () => void;
}

export const RoutineEditScreen: React.FC<RoutineEditScreenProps> = ({
  routine: initialRoutine,
  userConfigs,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialRoutine.name || '');
  const [description, setDescription] = useState(initialRoutine.description || '');
  const [totalDurationStr, setTotalDurationStr] = useState(
    initialRoutine.totalDurationSeconds ? String(initialRoutine.totalDurationSeconds) : ''
  );
  const [singleHits, setSingleHits] = useState<SingleHitSound[]>(
    initialRoutine.singleHits ? [...initialRoutine.singleHits] : []
  );
  const [repeatingSounds, setRepeatingSounds] = useState<RepeatingSound[]>(
    initialRoutine.repeatingSounds ? [...initialRoutine.repeatingSounds] : []
  );

  const handleAddSingleHit = () => {
    const newHit: SingleHitSound = {
      id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timeSeconds: singleHits.length > 0 ? singleHits[singleHits.length - 1].timeSeconds + 10 : 10,
      soundId: 'beep_high',
      label: `Cue #${singleHits.length + 1}`,
      volume: 0.9,
    };
    setSingleHits([...singleHits, newHit]);
  };

  const handleUpdateSingleHit = (updated: SingleHitSound) => {
    setSingleHits(singleHits.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleDeleteSingleHit = (id: string) => {
    setSingleHits(singleHits.filter((h) => h.id !== id));
  };

  const handleAddRepeatingSound = () => {
    const newRep: RepeatingSound = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      startTimeSeconds: 0,
      intervalSeconds: 5,
      repeatCount: 'indefinite',
      soundId: 'woodblock',
      label: `Cadence #${repeatingSounds.length + 1}`,
      volume: 0.8,
    };
    setRepeatingSounds([...repeatingSounds, newRep]);
  };

  const handleUpdateRepeatingSound = (updated: RepeatingSound) => {
    setRepeatingSounds(repeatingSounds.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDeleteRepeatingSound = (id: string) => {
    setRepeatingSounds(repeatingSounds.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    const totalSec = totalDurationStr ? parseFloat(totalDurationStr) : undefined;
    const updatedRoutine: Routine = {
      ...initialRoutine,
      name: name.trim() || 'Untitled Routine',
      description: description.trim(),
      totalDurationSeconds: totalSec && !isNaN(totalSec) ? totalSec : undefined,
      singleHits,
      repeatingSounds,
      updatedAt: Date.now(),
    };
    onSave(updatedRoutine);
  };

  const currentPreviewRoutine: Routine = {
    ...initialRoutine,
    name,
    description,
    totalDurationSeconds: totalDurationStr ? parseFloat(totalDurationStr) : undefined,
    singleHits,
    repeatingSounds,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onCancel} activeOpacity={0.8}>
          <ArrowLeft size={20} color={COLORS.textMain} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Routine</Text>

        <TouchableOpacity
          style={[styles.saveBtn, SHADOWS.glowPrimary]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Save size={16} color={COLORS.bgDark} />
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>General Settings</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Routine Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. HIIT Sprint Workout"
              placeholderTextColor={COLORS.textDim}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your workout routine..."
              placeholderTextColor={COLORS.textDim}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Target Duration (Optional)</Text>
            <View style={styles.durationInputRow}>
              <Clock size={18} color={COLORS.primary} />
              <TextInput
                style={styles.durationInput}
                placeholder="Total seconds (e.g. 180)"
                placeholderTextColor={COLORS.textDim}
                keyboardType="numeric"
                value={totalDurationStr}
                onChangeText={setTotalDurationStr}
              />
              <Text style={styles.unitText}>seconds</Text>
            </View>
          </View>
        </View>

        {/* Live Event Timeline */}
        <EventTimeline routine={currentPreviewRoutine} />

        {/* Single-Hit Sounds Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderTitleGroup}>
            <Zap size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>Single-Hit Sounds ({singleHits.length})</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddSingleHit}
            activeOpacity={0.8}
          >
            <Plus size={14} color={COLORS.bgDark} />
            <Text style={styles.addBtnText}>Add Hit</Text>
          </TouchableOpacity>
        </View>

        {singleHits.length === 0 ? (
          <Text style={styles.emptyHintText}>
            No single-hit sounds added yet. Click "+ Add Hit" to trigger a sound at a specific timestamp.
          </Text>
        ) : (
          singleHits.map((item) => (
            <SingleHitEditor
              key={item.id}
              item={item}
              userConfigs={userConfigs}
              onUpdate={handleUpdateSingleHit}
              onDelete={handleDeleteSingleHit}
            />
          ))
        )}

        {/* Repeating Sounds Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={styles.sectionHeaderTitleGroup}>
            <Repeat size={18} color={COLORS.secondary} />
            <Text style={styles.sectionTitleText}>
              Repeating Sounds ({repeatingSounds.length})
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: COLORS.secondary }]}
            onPress={handleAddRepeatingSound}
            activeOpacity={0.8}
          >
            <Plus size={14} color={COLORS.bgDark} />
            <Text style={styles.addBtnText}>Add Repeating</Text>
          </TouchableOpacity>
        </View>

        {repeatingSounds.length === 0 ? (
          <Text style={styles.emptyHintText}>
            No repeating sounds added yet. Click "+ Add Repeating" to repeat a sound every N seconds.
          </Text>
        ) : (
          repeatingSounds.map((item) => (
            <RepeatingSoundEditor
              key={item.id}
              item={item}
              userConfigs={userConfigs}
              onUpdate={handleUpdateRepeatingSound}
              onDelete={handleDeleteRepeatingSound}
            />
          ))
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderHighlight,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  saveBtnText: {
    color: COLORS.bgDark,
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.bgInput,
    color: COLORS.textMain,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  durationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  durationInput: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 14,
  },
  unitText: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  addBtnText: {
    color: COLORS.bgDark,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyHintText: {
    color: COLORS.textDim,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 16,
  },
});
