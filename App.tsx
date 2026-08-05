import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Timer, ListMusic, Sliders } from 'lucide-react-native';
import { COLORS } from './src/constants/theme';
import { Routine, SoundConfig } from './src/types/routine';
import {
  loadRoutines,
  saveRoutine,
  deleteRoutine,
  loadSoundConfigs,
  saveSoundConfig,
} from './src/storage/routineStorage';
import { StopwatchScreen } from './src/screens/StopwatchScreen';
import { RoutineListScreen } from './src/screens/RoutineListScreen';
import { RoutineEditScreen } from './src/screens/RoutineEditScreen';
import { SoundConfigScreen } from './src/screens/SoundConfigScreen';

type TabType = 'stopwatch' | 'routines' | 'sound_lab' | 'routine_editor';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('stopwatch');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [soundConfigs, setSoundConfigs] = useState<Record<string, SoundConfig>>({});
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // Load initial data from persistent storage
  useEffect(() => {
    async function init() {
      const loadedRoutines = await loadRoutines();
      setRoutines(loadedRoutines);
      if (loadedRoutines.length > 0) {
        setActiveRoutine(loadedRoutines[0]);
      }
      const loadedConfigs = await loadSoundConfigs();
      setSoundConfigs(loadedConfigs);
    }
    init();
  }, []);

  const handleSelectRoutine = (routine: Routine) => {
    setActiveRoutine(routine);
    setCurrentTab('stopwatch');
  };

  const handleCreateNewRoutine = () => {
    const newRoutine: Routine = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: 'New Custom Routine',
      description: 'Custom exercise routine with audio cues.',
      totalDurationSeconds: 120,
      singleHits: [
        { id: `sh_1`, timeSeconds: 0, soundId: 'whistle', label: 'Workout Start!' },
        { id: `sh_2`, timeSeconds: 60, soundId: 'double_beep', label: 'Halfway Mark' },
        { id: `sh_3`, timeSeconds: 120, soundId: 'boxing_bell', label: 'Workout Complete!' },
      ],
      repeatingSounds: [
        {
          id: `rep_1`,
          startTimeSeconds: 0,
          intervalSeconds: 10,
          repeatCount: 'indefinite',
          soundId: 'tick',
          label: '10s Interval Tick',
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEditingRoutine(newRoutine);
    setCurrentTab('routine_editor');
  };

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setCurrentTab('routine_editor');
  };

  const handleDuplicateRoutine = async (routine: Routine) => {
    const duplicated: Routine = {
      ...routine,
      id: `copy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${routine.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updatedList = await saveRoutine(duplicated);
    setRoutines(updatedList);
  };

  const handleDeleteRoutine = async (routineId: string) => {
    const updatedList = await deleteRoutine(routineId);
    setRoutines(updatedList);
    if (activeRoutine?.id === routineId) {
      setActiveRoutine(updatedList.length > 0 ? updatedList[0] : null);
    }
  };

  const handleSaveEditedRoutine = async (saved: Routine) => {
    const updatedList = await saveRoutine(saved);
    setRoutines(updatedList);
    if (activeRoutine?.id === saved.id || !activeRoutine) {
      setActiveRoutine(saved);
    }
    setEditingRoutine(null);
    setCurrentTab('routines');
  };

  const handleSaveSoundConfig = async (config: SoundConfig) => {
    const updated = await saveSoundConfig(config);
    setSoundConfigs(updated);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <View style={styles.appWrapper}>
        {/* Active View Container */}
        <View style={styles.mainView}>
          {currentTab === 'stopwatch' && (
            <StopwatchScreen
              activeRoutine={activeRoutine}
              soundConfigs={soundConfigs}
              onNavigateToRoutines={() => setCurrentTab('routines')}
            />
          )}

          {currentTab === 'routines' && (
            <RoutineListScreen
              routines={routines}
              activeRoutine={activeRoutine}
              onSelectRoutine={handleSelectRoutine}
              onCreateNewRoutine={handleCreateNewRoutine}
              onEditRoutine={handleEditRoutine}
              onDuplicateRoutine={handleDuplicateRoutine}
              onDeleteRoutine={handleDeleteRoutine}
            />
          )}

          {currentTab === 'routine_editor' && editingRoutine && (
            <RoutineEditScreen
              routine={editingRoutine}
              userConfigs={soundConfigs}
              onSave={handleSaveEditedRoutine}
              onCancel={() => {
                setEditingRoutine(null);
                setCurrentTab('routines');
              }}
            />
          )}

          {currentTab === 'sound_lab' && (
            <SoundConfigScreen
              soundConfigs={soundConfigs}
              onSaveSoundConfig={handleSaveSoundConfig}
            />
          )}
        </View>

        {/* Bottom Tab Bar (hidden during full screen editing) */}
        {currentTab !== 'routine_editor' && (
          <SafeAreaView edges={['bottom']} style={styles.tabBarContainer}>
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabItem, currentTab === 'stopwatch' && styles.tabItemActive]}
                onPress={() => setCurrentTab('stopwatch')}
                activeOpacity={0.8}
              >
                <Timer
                  size={20}
                  color={currentTab === 'stopwatch' ? COLORS.primary : COLORS.textDim}
                />
                <Text
                  style={[styles.tabLabel, currentTab === 'stopwatch' && styles.tabLabelActive]}
                >
                  Stopwatch
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, currentTab === 'routines' && styles.tabItemActive]}
                onPress={() => setCurrentTab('routines')}
                activeOpacity={0.8}
              >
                <ListMusic
                  size={20}
                  color={currentTab === 'routines' ? COLORS.primary : COLORS.textDim}
                />
                <Text
                  style={[styles.tabLabel, currentTab === 'routines' && styles.tabLabelActive]}
                >
                  Routines
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, currentTab === 'sound_lab' && styles.tabItemActive]}
                onPress={() => setCurrentTab('sound_lab')}
                activeOpacity={0.8}
              >
                <Sliders
                  size={20}
                  color={currentTab === 'sound_lab' ? COLORS.primary : COLORS.textDim}
                />
                <Text
                  style={[styles.tabLabel, currentTab === 'sound_lab' && styles.tabLabelActive]}
                >
                  Sound Studio
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  mainView: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabItemActive: {},
  tabLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
