import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Sparkles } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Routine } from '../types/routine';
import { RoutineCard } from '../components/RoutineCard';

interface RoutineListScreenProps {
  routines: Routine[];
  activeRoutine: Routine | null;
  onSelectRoutine: (routine: Routine) => void;
  onCreateNewRoutine: () => void;
  onEditRoutine: (routine: Routine) => void;
  onDuplicateRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

export const RoutineListScreen: React.FC<RoutineListScreenProps> = ({
  routines,
  activeRoutine,
  onSelectRoutine,
  onCreateNewRoutine,
  onEditRoutine,
  onDuplicateRoutine,
  onDeleteRoutine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutines = routines.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerArea}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.pageTitle}>Routine Library</Text>
            <Text style={styles.pageSubtitle}>
              {routines.length} saved audio routines
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.createBtn, SHADOWS.glowPrimary]}
            onPress={onCreateNewRoutine}
            activeOpacity={0.85}
          >
            <Plus size={18} color={COLORS.bgDark} />
            <Text style={styles.createBtnText}>NEW ROUTINE</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search routines by name or description..."
            placeholderTextColor={COLORS.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList}>
        {filteredRoutines.length === 0 ? (
          <View style={styles.emptyState}>
            <Sparkles size={36} color={COLORS.textDim} />
            <Text style={styles.emptyTitle}>No routines found</Text>
            <Text style={styles.emptySubtitle}>
              Create a custom routine with single-hit & repeating audio cues!
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={onCreateNewRoutine}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyBtnText}>Create First Routine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredRoutines.map((item) => (
            <RoutineCard
              key={item.id}
              routine={item}
              isSelected={activeRoutine?.id === item.id}
              onSelect={onSelectRoutine}
              onEdit={onEditRoutine}
              onDuplicate={onDuplicateRoutine}
              onDelete={onDeleteRoutine}
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
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pageTitle: {
    color: COLORS.textMain,
    fontSize: 24,
    fontWeight: '800',
  },
  pageSubtitle: {
    color: COLORS.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  createBtnText: {
    color: COLORS.bgDark,
    fontSize: 12,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 14,
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: COLORS.textDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  emptyBtnText: {
    color: COLORS.bgDark,
    fontWeight: '800',
    fontSize: 14,
  },
});
