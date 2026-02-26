import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from '../components/Button';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import TrackerCard, { type TrackerCardItem } from '../components/TrackerCard';
import Textt from '../components/Textt';
import InfoIcon from '../assets/svgs/InfoIcon';
import AddIcon from '../assets/svgs/AddIcon';

type AiMadeRouteProp = RouteProp<RootStackParamList, 'AiMade'>;
type AiMadeNavProp = NativeStackNavigationProp<RootStackParamList, 'AiMade'>;

const DEFAULT_HABITS: TrackerCardItem[] = [
  {
    title: 'Make UI/UX design portfolio',
    selectedDays: [0, 2, 4],
    reminderTime: '09:00 AM',
    variant: 'habit',
  },
  {
    title: 'Learn Figma design software',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: undefined,
    variant: 'habit',
  },
  {
    title: 'Build my own Design System',
    selectedDays: [0, 1, 3, 5],
    reminderTime: '14:00 PM',
    variant: 'habit',
  },
];

const DEFAULT_TASKS: TrackerCardItem[] = [
  {
    title: 'Find a UI/UX design online course',
    selectedDays: [],
    dueDate: 'Today, Dec 22, 2024',
    reminderTime: '16:00 PM',
    variant: 'task',
  },
  {
    title: 'Join a UI/UX design community',
    selectedDays: [],
    dueDate: '20 Jan, 2025',
    reminderTime: undefined,
    variant: 'task',
  },
];

const DEFAULT_NOTE =
  "To achieve the goal of becoming a UI/UX Designer, it's essential to follow key steps in the journey. Begin by researching various career paths within the field and identifying areas of specialization that align with personal interests and strengths.";

const AiMadeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AiMadeNavProp>();
  const route = useRoute<AiMadeRouteProp>();

  const prompt = route.params?.prompt ?? 'Become a UI/UX Designer';

  const [habits, setHabits] = useState<TrackerCardItem[]>(DEFAULT_HABITS);
  const [tasks, setTasks] = useState<TrackerCardItem[]>(DEFAULT_TASKS);
  const [note, setNote] = useState(DEFAULT_NOTE);

  useEffect(() => {
    const addedHabit = route.params?.addedHabit;
    const addedTask = route.params?.addedTask;
    const updatedHabit = route.params?.updatedHabit;
    const updatedTask = route.params?.updatedTask;
    if (addedHabit) {
      setHabits((prev) => [...prev, addedHabit]);
      navigation.setParams({ addedHabit: undefined });
    }
    if (addedTask) {
      setTasks((prev) => [...prev, addedTask]);
      navigation.setParams({ addedTask: undefined });
    }
    if (updatedHabit) {
      setHabits((prev) =>
        prev.map((h, i) => (i === updatedHabit.index ? updatedHabit.item : h))
      );
      navigation.setParams({ updatedHabit: undefined });
    }
    if (updatedTask) {
      setTasks((prev) =>
        prev.map((t, i) => (i === updatedTask.index ? updatedTask.item : t))
      );
      navigation.setParams({ updatedTask: undefined });
    }
  }, [
    route.params?.addedHabit,
    route.params?.addedTask,
    route.params?.updatedHabit,
    route.params?.updatedTask,
  ]);

  const openAddHabit = (habitIndex?: number) => {
    const isEdit = habitIndex !== undefined;
    navigation.navigate('AddTaskScreen', {
      mode: 'habit',
      prompt,
      ...(isEdit
        ? { editHabitIndex: habitIndex, initialItem: habits[habitIndex] }
        : {}),
    });
  };

  const openAddTask = (taskIndex?: number) => {
    const isEdit = taskIndex !== undefined;
    navigation.navigate('AddTaskScreen', {
      mode: 'task',
      prompt,
      ...(isEdit
        ? { editTaskIndex: taskIndex, initialItem: tasks[taskIndex] }
        : {}),
    });
  };

  const handleRegenerate = () => {
    Keyboard.dismiss();
    navigation.navigate('AiGenetratingScreen');
  };

  const handleContinue = () => {
    Keyboard.dismiss();
    navigation.navigate('GoalPlanner', { goalTitle: prompt });
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: lightColors.background },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Part 1: Header – back arrow + page title (fixed) */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AiGenetratingScreen')}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackArrowIcon width={24} height={24} />
          </TouchableOpacity>
          <Textt i18nKey="aiMadeGoals" style={styles.headerTitle} />
          <View style={styles.headerRight} />
        </View>

        {/* Part 2: Main goal title (fixed) */}
        <Text style={styles.goalTitle} numberOfLines={1}>
          {prompt}
        </Text>

        {/* ScrollView: Part 3, 4, 5 only */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 24 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Part 3: Habits section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{`Habit (${habits.length})`}</Text>
                <InfoIcon width={20} height={20} />
              </View>
              {habits.map((item, index) => (
                <TrackerCard
                  key={`habit-${index}`}
                  item={{ ...item, variant: 'habit' }}
                  onPress={() => openAddHabit(index)}
                />
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openAddHabit()}
                activeOpacity={0.7}
              >
                <AddIcon width={15} height={15} />
                <Textt i18nKey="addHabit" style={styles.addButtonText} />
              </TouchableOpacity>
            </View>

            {/* Part 4: Tasks section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{`Task (${tasks.length})`}</Text>
                <InfoIcon width={20} height={20} />
              </View>
              {tasks.map((item, index) => (
                <TrackerCard
                  key={`task-${index}`}
                  item={{ ...item, variant: 'task' }}
                  onPress={() => openAddTask(index)}
                />
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openAddTask()}
                activeOpacity={0.7}
              >
                <AddIcon width={15} height={15} />
                <Textt i18nKey="addTask" style={styles.addButtonText} />
              </TouchableOpacity>
            </View>

            {/* Part 5: Note section */}
            <View style={styles.section}>
              <Textt i18nKey="note" style={styles.sectionTitle} />
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add details or instructions about your habits or tasks..."
                placeholderTextColor={palette.gray500}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Part 6: Regenerate + Continue buttons (fixed) – same pill style as Onboarding */}
        <View style={[styles.actionsRow, { paddingBottom: insets.bottom}]}>
          <Button
            title="Regenerate"
            variant="outline"
            onPress={handleRegenerate}
            style={styles.regenerateBtn}
            borderWidth={0}
            backgroundColor={palette.skipbg}
            textColor={palette.orange}
          />
          <Button
            title="Continue"
            variant="primary"
            onPress={handleContinue}
            style={styles.continueBtn}
            backgroundColor={lightColors.primary}
            textColor={palette.white}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AiMadeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
  },
  headerRight: {
    width: 32,
  },
  goalTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    borderBottomWidth: 1,
    borderColor: lightColors.border,
    marginHorizontal: 24,
    paddingBottom: 20,
    // marginBottom: 20,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionHeaderRow: {
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: palette.blackText,
  },
  infoIcon: {
    fontSize: 14,
    color: palette.gray500,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: palette.skipbg,
    marginTop: 16,
  },
  addButtonText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: palette.orange,
  },
  noteInput: {
    marginTop: 16,
height : 300,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 18,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: palette.blackText,
    minHeight: 100,
    marginBottom: 21,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: lightColors.border,
  },
  regenerateBtn: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 0,
    backgroundColor: palette.skipbg,
  },
  continueBtn: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 0,
    backgroundColor: palette.orange,
  },
});
