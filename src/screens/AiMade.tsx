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
  Image,
  ImageSourcePropType,
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
import { t, useTranslation } from '../i18n';
import InfoIcon from '../assets/svgs/InfoIcon';
import AddIcon from '../assets/svgs/AddIcon';
import ImageIcon from '../assets/svgs/ImageIcon';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
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

  const isSelfMade = route.params?.source === 'selfMade';
  const prompt = route.params?.prompt ?? (isSelfMade ? '' : 'Become a UI/UX Designer');

  const [habits, setHabits] = useState<TrackerCardItem[]>(isSelfMade ? [] : DEFAULT_HABITS);
  const [tasks, setTasks] = useState<TrackerCardItem[]>(isSelfMade ? [] : DEFAULT_TASKS);
  const [note, setNote] = useState(isSelfMade ? '' : DEFAULT_NOTE);
  const [goalTitle, setGoalTitle] = useState(isSelfMade ? '' : '');
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    if (isSelfMade && route.params?.selectedCoverIndex !== undefined) {
      setCoverIndex(route.params.selectedCoverIndex);
      if (route.params?.prompt !== undefined) setGoalTitle(route.params.prompt);
      navigation.setParams({ selectedCoverIndex: undefined });
    }
  }, [isSelfMade, route.params?.selectedCoverIndex, route.params?.prompt, navigation]);

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
      prompt: isSelfMade ? goalTitle : prompt,
      ...(isSelfMade ? { source: 'selfMade' as const } : {}),
      ...(isEdit
        ? { editHabitIndex: habitIndex, initialItem: habits[habitIndex] }
        : {}),
    });
  };

  const openAddTask = (taskIndex?: number) => {
    const isEdit = taskIndex !== undefined;
    navigation.navigate('AddTaskScreen', {
      mode: 'task',
      prompt: isSelfMade ? goalTitle : prompt,
      ...(isSelfMade ? { source: 'selfMade' as const } : {}),
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

  const handleCreateGoal = () => {
    Keyboard.dismiss();
    navigation.navigate('GoalPlanner', {
      goalTitle: goalTitle.trim() || t('addGoalsTitle'),
      selectedCoverIndex: coverIndex,
      fromSelfMade: true,
    });
  };

  const openSelectCover = () => {
    navigation.navigate('SelectCoverImage', {
      selectedIndex: coverIndex,
      returnToScreen: 'AiMade',
      prompt: goalTitle,
    });
  };

  const coverSource: ImageSourcePropType | null =
    COVER_IMAGE_SOURCES.length > 0 && coverIndex < COVER_IMAGE_SOURCES.length
      ? COVER_IMAGE_SOURCES[coverIndex]
      : null;

  return (
    <View
      style={[
        styles.container,
        {  backgroundColor: lightColors.secondaryBackground },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* AI-made: Header bar (back + "AI-made Goals" centered) + goal title below */}
        {!isSelfMade && (
          <>
            <View style={[styles.headerBar, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <BackArrowIcon width={24} height={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('aiMadeGoals')}</Text>
              <View style={styles.headerRight} />
            </View>
            <Text style={styles.goalTitleBelow} numberOfLines={1}>
              {prompt}
            </Text>
          </>
        )}

        {isSelfMade ? (
          <>
            {/* Self-made: Cover image placeholder on grey background */}
            <View style={styles.coverWrap}>


            

              
              {coverSource ? (
                <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <View style={styles.backBtnCircle}>
                    <BackArrowIcon width={24} height={24} />
                  </View>
                  <Text style={styles.coverPlaceholderText}>{t('coverImage')}</Text>
                  <Text style={styles.coverPlaceholderHint}>{t('tapCameraToSelect')}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.changeCoverBtn}
                onPress={openSelectCover}
                activeOpacity={0.8}
              >
                <ImageIcon width={43} height={43} />
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {/* White sheet/card like Image 2 */}
        <View style={[styles.contentCard, { backgroundColor: lightColors.secondaryBackground }]}>
          {isSelfMade && (
            <View style={[styles.section, styles.selfMadeHeaderSection]}>
              <View style={styles.goalTitleRow}>
                <TextInput
                  style={styles.goalTitleInput}
                  value={goalTitle}
                  onChangeText={setGoalTitle}
                  placeholder={t('addGoalsTitle')}
                  placeholderTextColor={lightColors.subText}
                />
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataTag}>{t('category')}</Text>
                <Text style={styles.metadataTag}>{t('noDueDate')}</Text>
                <Text style={styles.metadataTag}>{t('setReminder')}</Text>
              </View>
            </View>
          )}

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
              {/* Habits section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{`${t("habit")} (${habits.length})`}</Text>
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

              {/* Tasks section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{`${t("task")} (${tasks.length})`}</Text>
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

              {/* Note section */}
              <View style={styles.section}>
                <Textt i18nKey="note" style={styles.sectionTitle} />
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder={t('addYourNote')}
                  placeholderTextColor={lightColors.placeholderText}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>

          {/* Footer: Self-made = single Create Goals; else Regenerate + Continue */}
          <View style={[styles.actionsRow, { paddingBottom: insets.bottom }]}>
            {isSelfMade ? (
              <Button
                title={t('createGoals')}
                variant="primary"
                onPress={handleCreateGoal}
                style={styles.createGoalBtn}
                backgroundColor={lightColors.accent}
                textColor={lightColors.secondaryBackground}
              />
            ) : (
              <>
                <Button
                  title={t("regenerate")}
                  variant="outline"
                  onPress={handleRegenerate}
                  style={styles.regenerateBtn}
                  borderWidth={0}
                  backgroundColor={lightColors.skipbg}
                  textColor={lightColors.background}
                />
                <Button
                  title={t("continue")}
                  variant="primary"
                  onPress={handleContinue}
                  style={styles.continueBtn}
                  backgroundColor={lightColors.accent}
                  textColor={lightColors.secondaryBackground}
                />
              </>
            )}
          </View>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: lightColors.secondaryBackground,
    borderWidth: 1,
    borderColor: 'blue',
  },
  backBtn: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
    // paddingTop: 55,
  },
  headerRight: {
    width: 32,
  },
  goalTitleBelow: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    marginHorizontal: 24,
    // marginBottom: 8,
    // marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  selfMadeHeaderSection: {
    marginTop: 12,
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
    color: lightColors.text,
  },
  infoIcon: {
    fontSize: 14,
    color: lightColors.placeholderText,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    borderRadius: 8,
    backgroundColor: lightColors.skipbg,
    marginTop: 16,
  },
  addButtonText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.background,
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
    color: lightColors.text,
    minHeight: 100,
    marginBottom: 21,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  regenerateBtn: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 0,
    backgroundColor: lightColors.skipbg,
  },
  continueBtn: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 0,
    backgroundColor: lightColors.accent,
  },
  createGoalBtn: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 0,
    backgroundColor: lightColors.accent,
  },
  coverWrap: {

    height: 430,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 2,
  },
  coverPlaceholder: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.inputBackground,
    zIndex: 1,
  },
  coverPlaceholderText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.subText,
  },
  coverPlaceholderHint: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
    marginTop: 4,
  },
  changeCoverBtn: {
    position: 'absolute',
    bottom: 12,
    right: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lightColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  goalTitleRow: {
    marginBottom: 12,
  },
  goalTitleInput: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.text,
    backgroundColor: lightColors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metadataTag: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
  },
  contentCard: {
    flex: 1,
    backgroundColor: lightColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 16,
    paddingTop: 8,
  },
});
