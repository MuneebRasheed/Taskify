import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import ShareIcon from '../assets/svgs/ShareIcon';
import { useGoals } from '../context/GoalsContext';
import type { SavedGoal, GoalItem, ItemCompletions } from '../context/GoalsContext';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
import type { RootStackParamList } from '../navigations/RootNavigation';
import TrackerCard, { type TrackerCardItem } from '../components/TrackerCard';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { t, useTranslation } from '../i18n';

type MyGoalDetailRouteProp = RouteProp<RootStackParamList, 'MyGoalDetail'>;
type MyGoalDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'MyGoalDetail'>;

const COVER_HEIGHT = 430;

function formatDueDate(d: Date | null): string {
  if (!d) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} AM`;
  return `${date} - ${time}`;
}

function formatTaskDueDate(dueDate?: string): string | null {
  if (!dueDate) return null;
  const trimmed = dueDate.trim();
  if (!trimmed) return null;

  // Keep already user-friendly values as-is.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntil(d: Date | null): number | null {
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

const DEFAULT_NOTE =
  "To achieve this goal, it's essential to follow key steps in the journey. Begin by researching and identifying areas that align with your interests and strengths.";

const MyGoalDetailScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MyGoalDetailNavProp>();
  const route = useRoute<MyGoalDetailRouteProp>();
  const { goals, markAchieved, removeGoal, restoreGoal, itemCompletions } = useGoals();
  const goalId = route.params?.goalId;

  const goal = useMemo(() => goals.find((g) => g.id === goalId), [goals, goalId]);

  const coverSource = useMemo(() => {
    if (!goal) return null;
    const idx = goal.coverIndex % COVER_IMAGE_SOURCES.length;
    return COVER_IMAGE_SOURCES[idx];
  }, [goal]);

  const habitItems: TrackerCardItem[] = useMemo(() => {
    if (!goal?.items) return [];
    return goal.items
      .filter((i): i is GoalItem & { type: 'habit' } => i.type === 'habit')
      .map((h) => ({
        title: h.title,
        selectedDays: h.selectedDays ?? [],
        reminderTime: h.reminderTime ?? null,
        variant: 'habit' as const,
      }));
  }, [goal]);

  const taskItems: TrackerCardItem[] = useMemo(() => {
    if (!goal?.items) return [];
    return goal.items
      .filter((i): i is GoalItem & { type: 'task' } => i.type === 'task')
      .map((t) => ({
        title: t.title,
        selectedDays: [],
        dueDate: formatTaskDueDate(t.dueDate),
        reminderTime: t.reminderTime ?? null,
        variant: 'task' as const,
      }));
  }, [goal]);

  const daysLeft = useMemo(() => daysUntil(goal?.dueDate ?? null), [goal?.dueDate]);
  const dueDateFormatted = useMemo(() => formatDueDate(goal?.dueDate ?? null), [goal?.dueDate]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  // Toast state for undo
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastAction, setToastAction] = useState<'delete' | 'achieve' | null>(null);
  const deletedGoalRef = useRef<{ goal: SavedGoal; completions: ItemCompletions } | null>(null);
  const previousAchievedStateRef = useRef<boolean | null>(null);

  const handleAchieve = () => {
    const currentGoal = goal || deletedGoalRef.current?.goal;
    if (!currentGoal) return;
    const newAchievedState = !currentGoal.achieved;
    previousAchievedStateRef.current = currentGoal.achieved;
    
    markAchieved(currentGoal.id, newAchievedState);
    
    // Show toast with undo option
    setToastMessage(newAchievedState ? t('goalAchieved') : t('goalUnachieved'));
    setToastAction('achieve');
    setToastVisible(true);
    
    // Don't navigate immediately - let user see the undo option
  };

  const handleDeletePress = () => setDeleteModalVisible(true);

  const handleDeleteConfirm = () => {
    if (!goal) return;
    
    // Store goal and its completions for undo
    const goalCompletions: ItemCompletions = {};
    (goal.items ?? []).forEach((item) => {
      if (itemCompletions[item.id]) {
        goalCompletions[item.id] = itemCompletions[item.id];
      }
    });
    
    deletedGoalRef.current = { goal, completions: goalCompletions };
    
    removeGoal(goal.id);
    setDeleteModalVisible(false);
    
    // Navigate back immediately with toast params including full goal data for undo
    navigation.navigate('MainTabs', {
      screen: 'My Goals',
      params: {
        showToast: true,
        toastMessage: t('goalDeleted'),
        toastAction: 'delete' as const,
        deletedGoalId: goal.id,
        deletedGoalData: goal,
        deletedGoalCompletions: goalCompletions,
      }
    });
  };

  const handleUndo = () => {
    if (toastAction === 'delete' && deletedGoalRef.current) {
      // Restore deleted goal
      restoreGoal(deletedGoalRef.current.goal, deletedGoalRef.current.completions);
      deletedGoalRef.current = null;
    } else if (toastAction === 'achieve' && previousAchievedStateRef.current !== null) {
      const currentGoal = goal || deletedGoalRef.current?.goal;
      if (currentGoal) {
        // Revert achieved state
        markAchieved(currentGoal.id, previousAchievedStateRef.current);
      }
      previousAchievedStateRef.current = null;
    }
    
    setToastVisible(false);
  };

  const handleToastHide = () => {
    setToastVisible(false);
    
    // Navigate after toast is hidden if action wasn't undone
    if (toastAction === 'delete' && deletedGoalRef.current !== null) {
      navigation.goBack();
      deletedGoalRef.current = null;
    }
    
    previousAchievedStateRef.current = null;
  };

  const handleShare = () => {
    // Placeholder: could use Share API
  };

  // If goal is deleted and toast is not visible, show a loading state or navigate
  if (!goal && !toastVisible && !deletedGoalRef.current) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Goal not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Use deleted goal data if goal is deleted but toast is visible
  const displayGoal = goal || deletedGoalRef.current?.goal;
  
  if (!displayGoal) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Goal not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover with back & share */}
        <View style={styles.coverWrap}>
          {coverSource && (
            <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
          )}
          <View style={[styles.coverOverlay, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.coverBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <View style={styles.coverBtnCircle}>
                <BackArrowIcon width={28} height={28 } />
              </View>
            </TouchableOpacity>
            <View style={styles.coverSpacer} />
            <TouchableOpacity onPress={handleShare} style={styles.coverBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <View style={styles.coverBtnCircle}>
                <ShareIcon width={28} height={28} />
              </View>
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity style={styles.cameraBtn}>
            <Ionicons name="camera" size={20} color={lightColors.secondaryBackground} />
          </TouchableOpacity> */}
        </View>

        {/* Title + edit */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{displayGoal.title}</Text>
          <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="pencil" size={20} color={lightColors.subText} />
          </TouchableOpacity>
        </View>

        {/* Metadata: Current/Achieved, days, due date */}
        <View style={styles.metaRow}>
          <View style={[styles.tag, displayGoal.achieved && styles.tagAchieved]}>
            <Text style={[styles.tagText, displayGoal.achieved && styles.tagTextAchieved]}>
              {displayGoal.achieved ? (t('achieved') as string) : (t('current') as string)}
            </Text>
          </View>
          {daysLeft != null && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={lightColors.subText} />
              <Text style={styles.metaText}>{daysLeft} days</Text>
            </View>
          )}
          {dueDateFormatted ? (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={lightColors.subText} />
              <Text style={styles.metaText} numberOfLines={1}>{dueDateFormatted}</Text>
            </View>
          ) : null}
        </View>

        {/* Habit section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habit ({habitItems.length})</Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="information-circle-outline" size={20} color={lightColors.subText} />
            </TouchableOpacity>
          </View>
          {habitItems.map((item, index) => (
            <TrackerCard key={`habit-${index}`} item={{ ...item, variant: 'habit' }} />
          ))}
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={20} color={lightColors.secondaryBackground} />
            <Text style={styles.addBtnText}>Add Habit</Text>
          </TouchableOpacity>
        </View>

        {/* Task section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Task ({taskItems.length})</Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="information-circle-outline" size={20} color={lightColors.subText} />
            </TouchableOpacity>
          </View>
          {taskItems.map((item, index) => (
            <TrackerCard key={`task-${index}`} item={{ ...item, variant: 'task' }} />
          ))}
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={20} color={lightColors.secondaryBackground} />
            <Text style={styles.addBtnText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note</Text>
          <Text style={styles.noteText}>{DEFAULT_NOTE}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button
          title={(t('achieveGoals') as string)}
          variant="primary"
          onPress={handleAchieve}
          style={styles.primaryBtn}
          backgroundColor={lightColors.accent}
          textColor={lightColors.secondaryBackground}
        />
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletePress} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>{t('deleteGoals') as string}</Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={deleteModalVisible}
        title={t('deleteGoal') as string}
        message={t('deleteGoalConfirmShort') as string}
        messageLine2={t('deleteGoalConfirmLine2') as string}
        cancelLabel={t('cancel') as string}
        confirmLabel={t('yesDelete') as string}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        actionLabel={t('undo')}
        onActionPress={handleUndo}
        onHide={handleToastHide}
      />
    </View>
  );
};

export default MyGoalDetailScreen;

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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverSpacer: {
    flex: 1,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 22,
    color: lightColors.text,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: lightColors.skipbg,
  },
  tagAchieved: {
    backgroundColor: lightColors.primary,
  },
  tagText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 14,
    color: lightColors.accent,
  },
  tagTextAchieved: {
    color: lightColors.secondaryBackground,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
    maxWidth: 160,
  },
  section: {
    paddingHorizontal: 20,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: lightColors.habitIndicator,
    marginTop: 8,
  },
  addBtnText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.secondaryBackground,
  },
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
  primaryBtn: {
    
    width: '100%',
    borderRadius: 100,
    marginBottom: 12,
  },
  deleteBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: lightColors.accent,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.accent,
  },
});
