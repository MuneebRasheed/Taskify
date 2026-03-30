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
import {  useTranslation } from '../i18n';
import InfoIcon from '../assets/svgs/InfoIcon';
import AddIcon from '../assets/svgs/AddIcon';
import ImageIcon from '../assets/svgs/ImageIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import TimeIcon from '../assets/svgs/TimeIcon';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
import CategoryModal, { type GoalCategory } from '../components/CategoryModal';
import CalendarModal from '../components/CalendarModal';
import TimePickerModal from '../components/TimePickerModal';
import SetUpGoalsModal from '../components/SetUpGoalsModal';
import EditIcon from '../assets/svgs/EditIcon';
import Header from '../components/Header';
import type { GoalItem } from '../context/GoalsContext';
import { useGoalStore } from '../../store/goalStore';

type AiMadeRouteProp = RouteProp<RootStackParamList, 'AiMade'>;
type AiMadeNavProp = NativeStackNavigationProp<RootStackParamList, 'AiMade'>;

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(hours: number, minutes: number, am: boolean): string {
  const h = am ? (hours === 12 ? 12 : hours) : hours === 12 ? 0 : hours + 12;
  return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

function daysUntilDue(d: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AiMadeNavProp>();
  const route = useRoute<AiMadeRouteProp>();
  const coverIndextest = useGoalStore((s) => s.selectedCoverIndex);

  console.log("coverIndex..... goal",coverIndextest); 

  const isSelfMade = route.params?.source === 'selfMade';
  const promptParam = route.params?.prompt;
  const initialHabitsParam = route.params?.initialHabits;
  const initialTasksParam = route.params?.initialTasks;
  const initialNoteParam = route.params?.initialNote;
  const initialGoalTitleParam = route.params?.initialGoalTitle;

  const prompt =
    promptParam ?? (isSelfMade ? '' : 'Become a UI/UX Designer');

  const draftHabits = useGoalStore((s) => s.draftHabits);
  const draftTasks = useGoalStore((s) => s.draftTasks);
  const setDraftHabits = useGoalStore((s) => s.setDraftHabits);
  const setDraftTasks = useGoalStore((s) => s.setDraftTasks);

  const [habits, setHabits] = useState<TrackerCardItem[]>(() =>
    initialHabitsParam && initialHabitsParam.length > 0
      ? initialHabitsParam
      : DEFAULT_HABITS
  );
  const [tasks, setTasks] = useState<TrackerCardItem[]>(() =>
    initialTasksParam && initialTasksParam.length > 0
      ? initialTasksParam
      : DEFAULT_TASKS
  );

  const habitsList = isSelfMade ? draftHabits : habits;
  const tasksList = isSelfMade ? draftTasks : tasks;
  const [note, setNote] = useState(
    isSelfMade ? '' : initialNoteParam ?? DEFAULT_NOTE
  );
  const [goalTitle, setGoalTitle] = useState(
    isSelfMade ? '' : initialGoalTitleParam ?? prompt
  );
  const [coverIndex, setCoverIndex] = useState(0);
  const [category, setCategory] = useState<GoalCategory | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [reminderTime, setReminderTime] = useState<{ hours: number; minutes: number; am: boolean } | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [dueDateModalVisible, setDueDateModalVisible] = useState(false);
  const [reminderDateModalVisible, setReminderDateModalVisible] = useState(false);
  const [reminderTimeModalVisible, setReminderTimeModalVisible] = useState(false);
  const [setUpGoalsModalVisible, setSetUpGoalsModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const reminderDisplay =
    reminderDate && reminderTime
      ? `${formatDate(reminderDate)} - ${formatTime(reminderTime.hours, reminderTime.minutes, reminderTime.am)}`
      : '';
  const reminderTimeOnly =
    reminderTime
      ? formatTime(reminderTime.hours, reminderTime.minutes, reminderTime.am)
      : '';
  const dueDateDaysLabel = dueDate
    ? daysUntilDue(dueDate) >= 0
      ? `D-${daysUntilDue(dueDate)} days`
      : 'Overdue'
    : null;

  useEffect(() => {
    if (isSelfMade && route.params?.selectedCoverIndex !== undefined) {
      setCoverIndex(route.params.selectedCoverIndex);
      if (route.params?.prompt !== undefined) setGoalTitle(route.params.prompt);
      navigation.setParams({ selectedCoverIndex: undefined });
    }
  }, [isSelfMade, route.params?.selectedCoverIndex, route.params?.prompt, navigation]);

  useEffect(() => {
    if (coverIndextest !== undefined) {
      setCoverIndex(coverIndextest);
      // console.log("coverIndex..... goal",coverIndextest); 
    }
  }, [coverIndextest]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Sync draft store only on mount when in self-made flow (so we don't overwrite when returning from AddTaskScreen)
  useEffect(() => {
    if (isSelfMade) {
      setDraftHabits(initialHabitsParam ?? []);
      setDraftTasks(initialTasksParam ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddHabit = (habitIndex?: number) => {
    const isEdit = habitIndex !== undefined;
    navigation.navigate('AddTaskScreen', {
      mode: 'habit',
      prompt: isSelfMade ? goalTitle : prompt,
      ...(isSelfMade ? { source: 'selfMade' as const } : {}),
      ...(isEdit
        ? { editHabitIndex: habitIndex, initialItem: habitsList[habitIndex] }
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
        ? { editTaskIndex: taskIndex, initialItem: tasksList[taskIndex] }
        : {}),
    });
  };

  const handleRegenerate = () => {
    Keyboard.dismiss();
    navigation.navigate('AiGenetratingScreen');
  };

  const handleContinue = () => {
    Keyboard.dismiss();
    navigation.navigate('FinalScreen', {
      goalTitle: isSelfMade ? goalTitle : prompt,
      coverIndex,
      category,
      dueDate: dueDate ? dueDate.getTime() : null,
      reminderDate: reminderDate ? reminderDate.getTime() : null,
      reminderTime,
      habits: habitsList,
      tasks: tasksList,
      note,
      fromSelfMade: isSelfMade,
    });
  };

  const handleCreateGoal = () => {
    console.log("handleCreateGoal.....");
    Keyboard.dismiss();
    const title = goalTitle.trim() || t('addGoalsTitle');
    navigation.navigate('PreMadeGoalDetail', {
      selfMadePayload: {
        title,
        coverIndex,
        dueDate: dueDate ? dueDate.getTime() : null,
        note,
        habits: habitsList.map((h) => ({
          title: h.title,
          reminderTime: h.reminderTime,
          selectedDays: h.selectedDays ?? [],
        })),
        tasks: tasksList.map((t) => ({
          title: t.title,
          reminderTime: t.reminderTime,
          dueDate: t.dueDate ?? null,
        })),
      },
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
            <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
              <Header
                leftIcon={<BackArrowIcon width={28} height={28} />}
                onLeftPress={() => navigation.navigate('MainTabs')}
                title={t('aiMadeGoals')}
                rightIcon={<View />}
                style={styles.header}
              />
            </View>
            <Text style={styles.goalTitleBelow} numberOfLines={1}>
              {prompt}
            </Text>
          </>
        )}

        {isSelfMade ? (
          <>
            {/* Full screen scrollable: cover (with back + title overlaid) + Add a Goals Title + habits + tasks + note + Create Goals */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                style={styles.selfMadeScroll}
                contentContainerStyle={[
                  styles.selfMadeScrollContent,
                  { paddingBottom: insets.bottom + (keyboardVisible ? 24 : 140) },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Cover image with back button and title overlaid on top (under/inside cover like image) */}
                <View style={styles.coverWrap}>
                  {coverSource ? (
                    <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.coverPlaceholder}>
                      <Text style={styles.coverPlaceholderText}>{t('coverImage')}</Text>
                      <Text style={styles.coverPlaceholderHint}>{t('tapCameraToSelect')}</Text>
                    </View>
                  )}
                  <View style={[styles.coverOverlay, { paddingTop: insets.top }]}>
                    <Header
                      leftIcon={
                        <View style={styles.coverBackBtnCircle}>
                          <BackArrowIcon width={28} height={28} />
                        </View>
                      }
                      onLeftPress={() => navigation.goBack()}
                      title={t('selfMadeGoals')}
                      rightIcon={<View style={styles.coverHeaderSpacer} />}
                      style={styles.headerOnCover}
                      titleStyle={styles.coverHeaderTitleText}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.changeCoverBtn}
                    onPress={openSelectCover}
                    activeOpacity={0.8}
                  >
                    <ImageIcon width={43} height={43} />
                  </TouchableOpacity>
                </View>

                {/* Add a Goals Title section – display only; edit via Edit icon → Set up Goals modal */}
                <View style={styles.addGoalsSection}>
                  <View style={styles.goalTitleDisplayRow}>
                    <Text style={styles.goalTitleDisplayText} numberOfLines={1}>
                      {goalTitle || t('addGoalsTitle')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSetUpGoalsModalVisible(true)}
                      style={styles.goalTitleEditCircle}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <EditIcon width={18} height={18}/>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.metadataRowPills}
                    style={styles.metadataRowPillsScroll}
                  >
                    <TouchableOpacity
                      style={styles.metadataPillCategory}
                      onPress={() => setSetUpGoalsModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.metadataPillTextDark} numberOfLines={1}>
                        {category ?? t('category')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.metadataPillWithIcon}
                      onPress={() => setSetUpGoalsModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <CalendarIcon width={18} height={18} />
                      {dueDate ? (
                        <View style={styles.dueDateTextWrap}>
                          <Text style={styles.metadataPillTextDark} numberOfLines={1}>{dueDateDaysLabel}</Text>
                          <Text style={styles.metadataPillTextDark} numberOfLines={1}>{formatDate(dueDate)}</Text>
                        </View>
                      ) : (
                        <Text style={styles.metadataPillTextDark} numberOfLines={1}>{t('noDueDate')}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.metadataPillWithIcon}
                      onPress={() => setSetUpGoalsModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <TimeIcon width={18} height={18} />
                      <Text style={styles.metadataPillTextDark} numberOfLines={1}>
                        {reminderDisplay || reminderTimeOnly || t('setReminder')}
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                <SetUpGoalsModal
                  visible={setUpGoalsModalVisible}
                  goalTitle={goalTitle}
                  category={category}
                  dueDate={dueDate}
                  reminderDate={reminderDate}
                  reminderTime={reminderTime}
                  onCancel={() => setSetUpGoalsModalVisible(false)}
                  onConfirm={(data) => {
                    setGoalTitle(data.goalTitle);
                    setCategory(data.category);
                    setDueDate(data.dueDate);
                    setReminderDate(data.reminderDate);
                    setReminderTime(data.reminderTime);
                    setSetUpGoalsModalVisible(false);
                  }}
                  t={t}
                />

                {/* Habits section – unchanged */}
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{`${t("habit")} (${habitsList.length})`}</Text>
                    <InfoIcon width={20} height={20} />
                  </View>
                  {habitsList.map((item, index) => (
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

                {/* Tasks section – unchanged */}
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{`${t("task")} (${tasksList.length})`}</Text>
                    <InfoIcon width={20} height={20} />
                  </View>
                  {tasksList.map((item, index) => (
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

                {/* Note section – unchanged */}
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

            {/* Create Goals button – fixed footer (hidden when keyboard is open) */}
            {!keyboardVisible && (
              <View style={[styles.selfMadeActionsWrap, { paddingBottom: insets.bottom + 16 }]}>
                <Button
                  title={t('createGoals')}
                  variant="primary"
                  onPress={handleCreateGoal}
                  style={styles.createGoalBtn}
                  backgroundColor={lightColors.accent}
                  textColor={lightColors.secondaryBackground}
                />
              </View>
            )}

          </>
        ) : (
          <>
            {/* White sheet/card for AI-made */}
            <View style={[styles.contentCard, { backgroundColor: lightColors.secondaryBackground }]}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                  style={styles.scroll}
                  contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionTitle}>{`${t("habit")} (${habitsList.length})`}</Text>
                      <InfoIcon width={20} height={20} />
                    </View>
                  {habitsList.map((item, index) => (
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

                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{`${t("task")} (${tasksList.length})`}</Text>
                    <InfoIcon width={20} height={20} />
                  </View>
                  {tasksList.map((item, index) => (
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

            {!keyboardVisible && (
              <View style={[styles.actionsRow, { paddingBottom: insets.bottom }]}>
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
              </View>
            )}
          </View>
        </>
        )}
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
  headerWrap: {
    // backgroundColor: 'yellow',
  },
  header: {
    // backgroundColor: 'green',
  },
  goalTitleBelow: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    marginHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingBottom: 20,
    // backgroundColor: 'red',
    // marginBottom: 8,
    // marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
    // backgroundColor: 'blue',
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
    backgroundColor: lightColors.inputBackground,
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
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
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
  /* Self-made: back + title overlaid on cover */
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  headerOnCover: {
    backgroundColor: 'transparent',
  },
  coverBackBtnCircle: {
    width: 48,
    height: 48,
    borderRadius: 1000,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTitleText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  coverHeaderTitleText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
  },
  coverHeaderSpacer: {
    width: 48,
  },
  selfMadeScroll: {
    flex: 1,
  },
  selfMadeScrollContent: {
    paddingBottom: 32,
    backgroundColor: lightColors.secondaryBackground,
  },
  addGoalsSection: {
    marginHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: lightColors.secondaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  goalTitleDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  goalTitleDisplayInput: {
    flex: 1,
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    paddingVertical: 4,
  },
  goalTitleDisplayText: {
    flex: 1,
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 22,
    color: lightColors.text,
    paddingVertical: 4,
  },
  goalTitleEditCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.secondaryBackground,
    borderWidth: 1,
    borderColor: lightColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metadataRowPillsScroll: {
    flexGrow: 0,
    marginHorizontal: -24,
  },
  metadataRowPills: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 4,
  },
  metadataPillCategory: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.inputBackground,
    borderRadius: 4,
    color: lightColors.text,
  },
  metadataPillWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 0,
    flexShrink: 0,
  },
  metadataPillTextDark: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
  },
  dueDateTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  selfMadeActionsWrap: {
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
});
