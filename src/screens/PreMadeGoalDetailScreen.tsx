import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../components/Button';
import TrackerCard, { type TrackerCardItem } from '../components/TrackerCard';
import type { RootStackParamList } from '../navigations/RootNavigation';
import ShareIcon from '../assets/svgs/ShareIcon';
import { useGoals } from '../context/GoalsContext';
import type { GoalItem } from '../context/GoalsContext';
import Textt from '../components/Textt';
import { t } from '../i18n';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
import ConfirmModal from '../components/ConfirmModal';
import InfoIcon from '../assets/svgs/InfoIcon';
import SetUpGoalsModal from '../components/SetUpGoalsModal';
import type { GoalCategory } from '../components/CategoryModal';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import TimeIcon from '../assets/svgs/TimeIcon';
import EditIcon from '../assets/svgs/EditIcon';
import { usePreMadeGoals } from '../hooks/usePreMadeGoals';
import { useGoalStore } from '../../store/goalStore';
import ImageIcon from '../assets/svgs/ImageIcon';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Show task due date on cards without raw ISO / Z suffix (API often stores timestamptz as ISO string). */
function formatTaskDueDateForCard(raw: string | null | undefined, fallback?: string | null): string | undefined {
  if (raw != null && typeof raw === 'string' && raw.trim() !== '') {
    const s = raw.trim();
    const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (ymd) {
      const y = Number(ymd[1]);
      const m = Number(ymd[2]);
      const d = Number(ymd[3]);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`;
      }
    }
    return s;
  }
  if (fallback != null && fallback.trim() !== '') return fallback;
  return undefined;
}

function formatTime(hours: number, minutes: number, am: boolean): string {
  const h = am ? (hours === 12 ? 12 : hours) : hours === 12 ? 0 : hours + 12;
  return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

function parseReminderTime(value?: string | null): { hours: number; minutes: number; am: boolean } | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  const am = m[3].toUpperCase() === 'AM';
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes, am };
}

function daysUntilDue(d: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

type PreMadeGoalDetailRouteProp = RouteProp<RootStackParamList, 'PreMadeGoalDetail'>;
type PreMadeGoalDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'PreMadeGoalDetail'>;

const COVER_HEIGHT = 430;

type Mode = 'preMade' | 'myGoal' | 'selfMade';

const PreMadeGoalDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PreMadeGoalDetailNavProp>();
  const route = useRoute<PreMadeGoalDetailRouteProp>();
  const { goals, addGoal, markAchieved, removeGoal, itemCompletions, updateGoalDetails } = useGoals();
  const { preMadeGoals } = usePreMadeGoals();
  const todayStr = new Date().toISOString().slice(0, 10);

  const { goalId, myGoalId, selfMadePayload } = route.params ?? {};

  const mode: Mode = myGoalId ? 'myGoal' : selfMadePayload ? 'selfMade' : 'preMade';

  const preMadeGoal = useMemo(
    () => (goalId ? preMadeGoals.find((g) => g.id === goalId) : null),
    [goalId, preMadeGoals]
  );
  const myGoal = useMemo(
    () => (myGoalId ? goals.find((g) => g.id === myGoalId) : null),
    [goals, myGoalId]
  );

  const initialDueDate = useMemo(() => {
    if (mode === 'myGoal' && myGoal?.dueDate) return myGoal.dueDate instanceof Date ? myGoal.dueDate : new Date(myGoal.dueDate as unknown as number);
    if (mode === 'selfMade' && selfMadePayload?.dueDate != null) return new Date(selfMadePayload.dueDate);
    return null;
  }, [mode, myGoal?.dueDate, selfMadePayload?.dueDate]);

  const initialCategory = useMemo<GoalCategory | null>(() => {
    if (mode === 'preMade' && preMadeGoal) return preMadeGoal.category;
    if (mode === 'myGoal') return (myGoal?.category as GoalCategory | null) ?? null;
    return null;
  }, [mode, preMadeGoal, myGoal?.category]);

  const initialReminderDate = useMemo<Date | null>(() => {
    if (mode === 'myGoal' && myGoal?.reminderDate) {
      return myGoal.reminderDate instanceof Date
        ? myGoal.reminderDate
        : new Date(myGoal.reminderDate as unknown as number);
    }
    return null;
  }, [mode, myGoal?.reminderDate]);

  const initialReminderTime = useMemo(
    () => (mode === 'myGoal' ? parseReminderTime(myGoal?.reminderTime) : null),
    [mode, myGoal?.reminderTime]
  );

  const [dueDate, setDueDate] = useState<Date | null>(() => initialDueDate);
  const [categoryValue, setCategoryValue] = useState<GoalCategory | null>(initialCategory);
  const [reminderDate, setReminderDate] = useState<Date | null>(initialReminderDate);
  const [reminderTime, setReminderTime] = useState<{ hours: number; minutes: number; am: boolean } | null>(initialReminderTime);
  const [setUpGoalsModalVisible, setSetUpGoalsModalVisible] = useState(false);
  const [draftCoverIndex, setDraftCoverIndex] = useState<number | null>(null);
  const [isPreMadeDraftEditing, setIsPreMadeDraftEditing] = useState(false);
  const draftHabits = useGoalStore((s) => s.draftHabits);
  const draftTasks = useGoalStore((s) => s.draftTasks);
  const setDraftHabits = useGoalStore((s) => s.setDraftHabits);
  const setDraftTasks = useGoalStore((s) => s.setDraftTasks);
  const resetDraft = useGoalStore((s) => s.resetDraft);

  useEffect(() => {
    setDueDate(initialDueDate);
  }, [initialDueDate]);

  useEffect(() => {
    setCategoryValue(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setReminderDate(initialReminderDate);
  }, [initialReminderDate]);

  useEffect(() => {
    setReminderTime(initialReminderTime);
  }, [initialReminderTime]);

  useEffect(() => {
    if (mode !== 'preMade') return;
    resetDraft();
    setIsPreMadeDraftEditing(false);
    setDraftCoverIndex(null);
  }, [goalId, mode, resetDraft]);

  const reminderDisplay = reminderDate && reminderTime
    ? `${formatDate(reminderDate)} - ${formatTime(reminderTime.hours, reminderTime.minutes, reminderTime.am)}`
    : '';
  const reminderTimeOnly = reminderTime
    ? formatTime(reminderTime.hours, reminderTime.minutes, reminderTime.am)
    : '';
  const dueDateDaysLabel = dueDate
    ? daysUntilDue(dueDate) >= 0
      ? `D-${daysUntilDue(dueDate)} days`
      : 'Overdue'
    : null;

  const coverSource: ImageSourcePropType | null = useMemo(() => {
    if (mode === 'preMade' && preMadeGoal) {
      if (
        typeof draftCoverIndex === 'number' &&
        draftCoverIndex >= 0 &&
        draftCoverIndex < COVER_IMAGE_SOURCES.length
      ) {
        return COVER_IMAGE_SOURCES[draftCoverIndex];
      }
      return preMadeGoal.coverImage;
    }
    if (mode === 'myGoal' && myGoal && COVER_IMAGE_SOURCES.length) {
      const idx = myGoal.coverIndex % COVER_IMAGE_SOURCES.length;
      return COVER_IMAGE_SOURCES[idx];
    }
    if (mode === 'selfMade' && selfMadePayload && COVER_IMAGE_SOURCES.length) {
      const idx = selfMadePayload.coverIndex % COVER_IMAGE_SOURCES.length;
      return COVER_IMAGE_SOURCES[idx];
    }
    return null;
  }, [mode, preMadeGoal, myGoal, selfMadePayload, draftCoverIndex]);

  const handleChangeCover = () => {
    if (mode !== 'preMade') return;
    const selectedIndex =
      typeof draftCoverIndex === 'number'
        ? draftCoverIndex
        : preMadeGoal?.coverIndex ?? 0;
    navigation.navigate('SelectCoverImage', {
      selectedIndex,
      onCoverSelected: (index: number) => {
        setDraftCoverIndex(index);
      },
    });
  };

  const title = mode === 'preMade' && preMadeGoal
    ? preMadeGoal.title
    : mode === 'myGoal' && myGoal
      ? myGoal.title
      : selfMadePayload?.title ?? '';

  const habitItems: TrackerCardItem[] = useMemo(() => {
    if (mode === 'preMade' && preMadeGoal) {
      const source = isPreMadeDraftEditing ? draftHabits : preMadeGoal.habits.map((h) => ({
        title: h.title,
        selectedDays: h.selectedDays,
        reminderTime: h.reminderTime ?? undefined,
        variant: 'habit' as const,
      }));
      return source.map((h) => ({
        ...h,
        selectedDays: h.selectedDays?.length ? h.selectedDays : [],
        variant: 'habit' as const,
      }));
    }
    if (mode === 'myGoal' && myGoal?.items) {
      return myGoal.items
        .filter((i): i is GoalItem & { type: 'habit' } => i.type === 'habit')
        .map((h) => ({
          title: h.title,
          selectedDays: h.selectedDays ?? [0, 1, 2, 3, 4, 5, 6],
          reminderTime: h.reminderTime ?? null,
          variant: 'habit' as const,
        }));
    }
    if (mode === 'selfMade' && selfMadePayload) {
      return selfMadePayload.habits.map((h) => ({
        title: h.title,
        selectedDays: h.selectedDays && h.selectedDays.length > 0 ? h.selectedDays : [0, 1, 2, 3, 4, 5, 6],
        reminderTime: h.reminderTime ?? null,
        variant: 'habit' as const,
      }));
    }
    return [];
  }, [mode, preMadeGoal, myGoal, selfMadePayload, isPreMadeDraftEditing, draftHabits]);

  const taskItems: TrackerCardItem[] = useMemo(() => {
    if (mode === 'preMade' && preMadeGoal) {
      const source = isPreMadeDraftEditing ? draftTasks : preMadeGoal.tasks.map((t) => ({
        title: t.title,
        selectedDays: [],
        dueDate: t.dueDate ?? undefined,
        reminderTime: t.reminderTime ?? undefined,
        variant: 'task' as const,
      }));
      return source.map((t) => ({
        ...t,
        selectedDays: [],
        variant: 'task' as const,
      }));
    }
    if (mode === 'myGoal' && myGoal?.items) {
      const dueStr = myGoal.dueDate
        ? `${MONTHS_SHORT[myGoal.dueDate.getMonth()]} ${myGoal.dueDate.getDate()}, ${myGoal.dueDate.getFullYear()}`
        : null;
      return myGoal.items
        .filter((i): i is GoalItem & { type: 'task' } => i.type === 'task')
        .map((t) => ({
          title: t.title,
          selectedDays: [],
          dueDate: formatTaskDueDateForCard(t.dueDate, dueStr),
          reminderTime: t.reminderTime ?? null,
          variant: 'task' as const,
        }));
    }
    if (mode === 'selfMade' && selfMadePayload) {
      const goalDueStr = selfMadePayload.dueDate
        ? (() => {
            const d = new Date(selfMadePayload.dueDate!);
            return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
          })()
        : null;
      return selfMadePayload.tasks.map((t) => ({
        title: t.title,
        selectedDays: [],
        dueDate: t.dueDate ?? goalDueStr ?? undefined,
        reminderTime: t.reminderTime ?? null,
        variant: 'task' as const,
      }));
    }
    return [];
  }, [mode, preMadeGoal, myGoal, selfMadePayload, isPreMadeDraftEditing, draftTasks]);

  const noteText = mode === 'preMade' && preMadeGoal
    ? preMadeGoal.note
    : mode === 'selfMade' && selfMadePayload
      ? selfMadePayload.note || ''
      : "To achieve this goal, it's essential to follow key steps in the journey. Begin by researching and identifying areas that align with your interests and strengths.";

  const preMadeAlreadyAdded = useMemo(
    () => mode === 'preMade' && preMadeGoal && goals.some((g) => g.source === 'preMade' && g.title === preMadeGoal.title && !g.achieved),
    [mode, preMadeGoal, goals]
  );

  const notFound = (mode === 'preMade' && !preMadeGoal) || (mode === 'myGoal' && !myGoal) || (mode === 'selfMade' && !selfMadePayload);

  if (notFound) {
    return (
      <View style={styles.container}>
        <Textt i18nKey="goalNotFound" style={styles.errorText} />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Textt i18nKey="goBack" style={styles.backLink} />
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddGoal = () => {
    if (mode !== 'preMade' || !preMadeGoal) return;
    if (!dueDate) {
      Alert.alert(
        t('cannotCreateGoal'),
        t('pleaseSetDueDateToCreateGoal')
      );
      return;
    }
    const existingGoal = goals.find((g) => g.source === 'preMade' && g.title === preMadeGoal.title && !g.achieved);
    if (existingGoal) {
      navigation.navigate('MainTabs', { screen: 'My Goals' });
      return;
    }
    const coverIndex = (() => {
      if (typeof draftCoverIndex === 'number' && draftCoverIndex >= 0) {
        return draftCoverIndex;
      }
      if (typeof preMadeGoal.coverIndex === 'number' && preMadeGoal.coverIndex >= 0) {
        return preMadeGoal.coverIndex;
      }
      const preMadeUri =
        preMadeGoal.coverImage && typeof preMadeGoal.coverImage === 'object' && 'uri' in preMadeGoal.coverImage
          ? preMadeGoal.coverImage.uri
          : null;
      if (typeof preMadeUri === 'string' && COVER_IMAGE_SOURCES.length > 0) {
        const matchedIndex = COVER_IMAGE_SOURCES.findIndex(
          (src) => typeof src === 'object' && src != null && 'uri' in src && src.uri === preMadeUri
        );
        if (matchedIndex >= 0) return matchedIndex;
      }
      return 0;
    })();
    const goalReminderTime = reminderTimeOnly || undefined;
    addGoal({
      title: preMadeGoal.title,
      category: categoryValue ?? null,
      reminderDate: reminderDate != null ? new Date(reminderDate.getTime()) : null,
      reminderTime: goalReminderTime ?? null,
      preMadeTemplateId: preMadeGoal.id,
      coverIndex,
      source: 'preMade',
      habitsTotal: habitItems.length,
      habitsDone: 0,
      tasksTotal: taskItems.length,
      tasksDone: 0,
      dueDate: dueDate ?? null,
      achieved: false,
      items: [
        ...habitItems.map((h, i) => ({
          id: `pre-${preMadeGoal.id}-habit-${i}`,
          type: 'habit' as const,
          title: h.title,
          reminderTime: h.reminderTime ?? goalReminderTime,
          selectedDays: h.selectedDays?.length ? h.selectedDays : [0, 1, 2, 3, 4, 5, 6],
        })),
        ...taskItems.map((t, i) => ({
          id: `pre-${preMadeGoal.id}-task-${i}`,
          type: 'task' as const,
          title: t.title,
          reminderTime: t.reminderTime ?? goalReminderTime,
          dueDate: t.dueDate ?? dueDate.toISOString(),
        })),
      ],
    });
    resetDraft();
    setIsPreMadeDraftEditing(false);
    setDraftCoverIndex(null);
    navigation.navigate('MainTabs', { screen: 'My Goals' });
  };

  const openPreMadeItemEditor = (type: 'habit' | 'task', index: number) => {
    if (mode !== 'preMade' || !preMadeGoal) return;
    if (!isPreMadeDraftEditing) {
      setDraftHabits(
        preMadeGoal.habits.map((h) => ({
          title: h.title,
          selectedDays: h.selectedDays?.length ? h.selectedDays : [0, 1, 2, 3, 4, 5, 6],
          reminderTime: h.reminderTime ?? undefined,
          variant: 'habit' as const,
        }))
      );
      setDraftTasks(
        preMadeGoal.tasks.map((t) => ({
          title: t.title,
          selectedDays: [],
          dueDate: t.dueDate ?? undefined,
          reminderTime: t.reminderTime ?? undefined,
          variant: 'task' as const,
        }))
      );
      setIsPreMadeDraftEditing(true);
    }
    navigation.navigate('AddTaskScreen', {
      mode: type,
      source: 'selfMade',
      initialItem: {
        ...(type === 'habit'
          ? (draftHabits[index] ?? {
              title: preMadeGoal.habits[index]?.title ?? '',
              selectedDays: preMadeGoal.habits[index]?.selectedDays ?? [0, 1, 2, 3, 4, 5, 6],
              reminderTime: preMadeGoal.habits[index]?.reminderTime ?? undefined,
              variant: 'habit' as const,
            })
          : (draftTasks[index] ?? {
              title: preMadeGoal.tasks[index]?.title ?? '',
              selectedDays: [],
              dueDate: preMadeGoal.tasks[index]?.dueDate ?? undefined,
              reminderTime: preMadeGoal.tasks[index]?.reminderTime ?? undefined,
              variant: 'task' as const,
            })),
        variant: type,
      },
      ...(type === 'habit' ? { editHabitIndex: index } : { editTaskIndex: index }),
    });
  };

  const handleCreateGoal = () => {
    if (mode !== 'selfMade' || !selfMadePayload) return;
    const items: GoalItem[] = [
      ...selfMadePayload.habits.map((h, i) => ({
        id: `self-habit-${Date.now()}-${i}`,
        type: 'habit' as const,
        title: h.title,
        reminderTime: h.reminderTime,
        selectedDays: h.selectedDays && h.selectedDays.length > 0 ? h.selectedDays : [0, 1, 2, 3, 4, 5, 6],
      })),
      ...selfMadePayload.tasks.map((t, i) => ({
        id: `self-task-${Date.now()}-${i}`,
        type: 'task' as const,
        title: t.title,
        reminderTime: t.reminderTime,
        dueDate: t.dueDate ?? undefined,
      })),
    ];
    addGoal({
      title: selfMadePayload.title,
      category: categoryValue ?? null,
      reminderDate: reminderDate != null ? new Date(reminderDate.getTime()) : null,
      reminderTime: reminderTimeOnly || null,
      coverIndex: selfMadePayload.coverIndex,
      source: 'selfMade',
      habitsTotal: selfMadePayload.habits.length,
      habitsDone: 0,
      tasksTotal: selfMadePayload.tasks.length,
      tasksDone: 0,
      dueDate: selfMadePayload.dueDate ? new Date(selfMadePayload.dueDate) : null,
      achieved: false,
      items,
    });
    navigation.navigate('MainTabs', { screen: 'My Goals' });
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [achieveModalVisible, setAchieveModalVisible] = useState(false);

  const handleGoToMyGoals = () => {
    navigation.navigate('MainTabs', { screen: 'My Goals' });
  };

  const hasIncompleteItems = myGoal && (myGoal.habitsDone < myGoal.habitsTotal || myGoal.tasksDone < myGoal.tasksTotal);

  const handleAchieve = () => {
    if (mode !== 'myGoal' || !myGoal) return;
    if (myGoal.achieved) {
      markAchieved(myGoal.id, false);
      navigation.goBack();
      return;
    }
    if (hasIncompleteItems) {
      setAchieveModalVisible(true);
    } else {
      markAchieved(myGoal.id, true);
      navigation.navigate('GoalAchievedScreen', { goalId: myGoal.id });
    }
  };

  const handleAchieveConfirm = () => {
    if (mode !== 'myGoal' || !myGoal) return;
    markAchieved(myGoal.id, true);
    setAchieveModalVisible(false);
    navigation.navigate('GoalAchievedScreen', { goalId: myGoal.id });
  };

  const handleDeletePress = () => {
    if (mode !== 'myGoal' || !myGoal) return;
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (mode !== 'myGoal' || !myGoal) return;
    removeGoal(myGoal.id);
    setDeleteModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          {coverSource && (
            <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
          )}
          <View style={[styles.coverOverlay, { paddingTop: insets.top + 15 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.coverBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <View style={styles.coverBtnCircle}>
                <BackArrowIcon width={28} height={28} />
              </View>
            </TouchableOpacity>
            <View style={styles.coverSpacer} />
            <TouchableOpacity style={styles.coverBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <View style={styles.coverBtnCircle}>
                <ShareIcon width={28} height={28} />
              </View>
            </TouchableOpacity>
          </View>
          {mode === 'preMade' && (
            <TouchableOpacity
              style={styles.changeCoverBtn}
              onPress={handleChangeCover}
              activeOpacity={0.8}
            >
              <ImageIcon width={43} height={43} />
            </TouchableOpacity>
          )}
        </View>
        {/* Goals title + category, due date, reminder; Edit opens Set up Goals modal */}
        <View style={styles.addGoalsSection}>
          <View style={styles.goalTitleDisplayRow}>
            <Text style={styles.goalTitleDisplayText} numberOfLines={1}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={() => setSetUpGoalsModalVisible(true)}
              style={styles.goalTitleEditCircle}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <EditIcon width={18} height={18} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metadataRowPills}
            style={styles.metadataRowPillsScroll}
          >
            {categoryValue != null && (
              <TouchableOpacity
                style={styles.metadataPillCategory}
                onPress={() => setSetUpGoalsModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.metadataPillTextDark} numberOfLines={1}>
                  {categoryValue}
                </Text>
              </TouchableOpacity>
            )}
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
          {mode === 'preMade' && preMadeGoal && (
            <View style={styles.userCountRow}>
              <Ionicons name="people-outline" size={16} color={lightColors.subText} />
              <Text style={styles.userCount}>{preMadeGoal.userCount}</Text>
            </View>
          )}
        </View>

        <SetUpGoalsModal
          visible={setUpGoalsModalVisible}
          goalTitle={title}
          category={categoryValue}
          dueDate={dueDate}
          reminderDate={reminderDate}
          reminderTime={reminderTime}
          onCancel={() => setSetUpGoalsModalVisible(false)}
          onConfirm={(data) => {
            if (mode === 'myGoal' && myGoal) {
              updateGoalDetails(myGoal.id, {
                title: data.goalTitle.trim() || myGoal.title,
                category: data.category,
                dueDate: data.dueDate,
                reminderDate: data.reminderDate,
                reminderTime:
                  data.reminderDate && data.reminderTime
                    ? formatTime(data.reminderTime.hours, data.reminderTime.minutes, data.reminderTime.am)
                    : null,
              });
            }
            setCategoryValue(data.category);
            setDueDate(data.dueDate);
            setReminderDate(data.reminderDate);
            setReminderTime(data.reminderTime);
            setSetUpGoalsModalVisible(false);
          }}
          t={t}
        />

        



        

        <View style={styles.contentSection}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Habit ({habitItems.length})</Text>
              <InfoIcon width={20} height={20} />
            </View>
            {mode === 'myGoal' && myGoal
              ? myGoal.items
                  .filter((i): i is GoalItem & { type: 'habit' } => i.type === 'habit')
                  .map((goalItem) => {
                    const item: TrackerCardItem = {
                      title: goalItem.title,
                      selectedDays: goalItem.selectedDays ?? [0, 1, 2, 3, 4, 5, 6],
                      reminderTime: goalItem.reminderTime ?? null,
                      variant: 'habit',
                    };
                    const completed = (itemCompletions[goalItem.id] ?? []).includes(todayStr);
                    return (
                      <TrackerCard
                        key={goalItem.id}
                        item={item}
                        completed={completed}
                        onPress={() =>
                          navigation.navigate('HabitDetailScreen', {
                            goalId: myGoal.id,
                            itemId: goalItem.id,
                          })
                        }
                      />
                    );
                  })
              : habitItems.map((item, index) => (
                  <TrackerCard
                    key={`habit-${index}`}
                    item={{ ...item, variant: 'habit' }}
                    onPress={
                      mode === 'preMade'
                        ? () => openPreMadeItemEditor('habit', index)
                        : undefined
                    }
                  />
                ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Task ({taskItems.length})</Text>
              <InfoIcon width={20} height={20} />
            </View>
            {mode === 'myGoal' && myGoal
              ? (() => {
                  const dueStr = myGoal.dueDate
                    ? `${MONTHS_SHORT[myGoal.dueDate.getMonth()]} ${myGoal.dueDate.getDate()}, ${myGoal.dueDate.getFullYear()}`
                    : null;
                  return myGoal.items
                    .filter((i): i is GoalItem & { type: 'task' } => i.type === 'task')
                    .map((goalItem) => {
                      const item: TrackerCardItem = {
                        title: goalItem.title,
                        selectedDays: [],
                        dueDate: formatTaskDueDateForCard(goalItem.dueDate, dueStr),
                        reminderTime: goalItem.reminderTime ?? null,
                        variant: 'task',
                      };
                      const completed = (itemCompletions[goalItem.id] ?? []).includes(todayStr);
                      return (
                        <TrackerCard
                          key={goalItem.id}
                          item={item}
                          completed={completed}
                          onPress={() =>
                            navigation.navigate('TaskDetailScreen', {
                              goalId: myGoal.id,
                              itemId: goalItem.id,
                            })
                          }
                        />
                      );
                    });
                })()
              : taskItems.map((item, index) => (
                  <TrackerCard
                    key={`task-${index}`}
                    item={{ ...item, variant: 'task' }}
                    onPress={
                      mode === 'preMade'
                        ? () => openPreMadeItemEditor('task', index)
                        : undefined
                    }
                  />
                ))}
          </View>

          <View style={styles.section}>
            <Textt i18nKey="note" style={styles.sectionTitle} />
            <Text style={styles.noteText}>{noteText || '—'}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        {mode === 'preMade' && !preMadeAlreadyAdded && (
          <Button
            title={t('addGoals') as string}
            variant="primary"
            onPress={handleAddGoal}
            style={styles.addGoalBtn}
            backgroundColor={lightColors.accent}
            textColor={lightColors.secondaryBackground}
          />
        )}
        {mode === 'selfMade' && (
          <Button
            title={t('createGoal') as string}
            variant="primary"
            onPress={handleCreateGoal}
            style={styles.addGoalBtn}
            backgroundColor={lightColors.accent}
            textColor={lightColors.secondaryBackground}
          />
        )}
        {mode === 'myGoal' && myGoal && !myGoal.achieved && (
          <>
            <Button
              title={t('achieveGoals') as string}
              variant="primary"
              onPress={handleAchieve}
              style={styles.achieveBtnFull}
              backgroundColor={lightColors.background}
              textColor={lightColors.secondaryBackground}
            />
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeletePress}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>{t('deleteGoals') as string}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ConfirmModal
        visible={deleteModalVisible}
        title={t('deleteGoals') as string}
        message={t('deleteGoalConfirmShort') as string}
        messageLine2={t('deleteGoalConfirmLine2') as string}
        cancelLabel={t('cancel') as string}
        confirmLabel={t('yesDelete') as string}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmModal
        visible={achieveModalVisible}
        title={t('achieveGoals') as string}
        message={t('achieveGoalsConfirmMessage') as string}
        messageLine2={t('achieveGoalsConfirmQuestion') as string}
        cancelLabel={t('cancel') as string}
        confirmLabel={t('yesAchieve') as string}
        onCancel={() => setAchieveModalVisible(false)}
        onConfirm={handleAchieveConfirm}
        titleColor={lightColors.text}
      />
    </View>
  );
};

export default PreMadeGoalDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
  },
  errorText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.text,
    textAlign: 'center',
    marginTop: 48,
  },
  backLink: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.accent,
    textAlign: 'center',
    marginTop: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  coverWrap: {
    height: COVER_HEIGHT,
    backgroundColor: lightColors.inputBackground,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  coverBtn: {
    padding: 4,
  },
  coverBtnCircle: {
    width: 48,
    height: 48,
    borderRadius: 1000,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverSpacer: {
    flex: 1,
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
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
  },
  metadataPillTextDark: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
  },
  metadataPillWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 0,
    flexShrink: 0,
  },
  dueDateTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 22,
    color: lightColors.text,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: lightColors.skipbg,
  },
  categoryTagText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 14,
    color: lightColors.accent,
  },
  userCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  userCount: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
  },
  contentSection: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 18,
    color: lightColors.text,
  },
  // checkbox: {
  //   width: 20,
  //   height: 20,
  //   borderRadius: 4,
  //   borderWidth: 2,
  //   borderColor: lightColors.border,
  // },
  noteText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
    lineHeight: 22,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: lightColors.secondaryBackground,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
  },
  addGoalBtn: {
    width: '100%',
    borderRadius: 100,
  },
  saveGoalsBtn: {
    width: '100%',
    borderRadius: 100,
    marginBottom: 12,
  },
  achieveBtnFull: {
    width: '100%',
    borderRadius: 100,
    marginBottom: 12,
  },
  deleteBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: lightColors.background,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.background,
  },
});
