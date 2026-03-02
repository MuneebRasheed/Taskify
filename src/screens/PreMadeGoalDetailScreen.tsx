import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
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
import { PREMADE_GOALS } from '../data/preMadeGoals';
import type { RootStackParamList } from '../navigations/RootNavigation';
import ShareIcon from '../assets/svgs/ShareIcon';
import { useGoals } from '../context/GoalsContext';
import type { GoalItem } from '../context/GoalsContext';
import Textt from '../components/Textt';
import { t } from '../i18n';

type PreMadeGoalDetailRouteProp = RouteProp<RootStackParamList, 'PreMadeGoalDetail'>;
type PreMadeGoalDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'PreMadeGoalDetail'>;

const COVER_HEIGHT = 280;

const PreMadeGoalDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PreMadeGoalDetailNavProp>();
  const route = useRoute<PreMadeGoalDetailRouteProp>();
  const { addGoal } = useGoals();
  const goalId = route.params?.goalId;

  const goal = useMemo(
    () => PREMADE_GOALS.find((g) => g.id === goalId),
    [goalId]
  );

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Goal not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const habitItems: TrackerCardItem[] = goal.habits.map((h) => ({
    title: h.title,
    selectedDays: h.selectedDays,
    reminderTime: h.reminderTime ?? undefined,
    variant: 'habit',
  }));

  const taskItems: TrackerCardItem[] = goal.tasks.map((t) => ({
    title: t.title,
    selectedDays: [],
    dueDate: t.dueDate ?? undefined,
    reminderTime: t.reminderTime ?? undefined,
    variant: 'task',
  }));

  const handleAddGoal = () => {
    const coverIndex = Math.max(0, parseInt(goal.id, 10) - 1) % 3;
    const items: GoalItem[] = [
      ...goal.habits.map((h, i) => ({
        id: `pre-${goal.id}-habit-${i}`,
        type: 'habit' as const,
        title: h.title,
        reminderTime: h.reminderTime,
      })),
      ...goal.tasks.map((t, i) => ({
        id: `pre-${goal.id}-task-${i}`,
        type: 'task' as const,
        title: t.title,
        reminderTime: t.reminderTime,
      })),
    ];
    addGoal({
      title: goal.title,
      coverIndex,
      source: 'preMade',
      habitsTotal: goal.habitsCount,
      habitsDone: 0,
      tasksTotal: goal.tasksCount,
      tasksDone: 0,
      dueDate: null,
      achieved: false,
      items,
    });
    navigation.navigate('MyGoalsScreen');
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Part 1: Cover image with back and share buttons */}
        <View style={styles.coverWrap}>
          <Image source={goal.coverImage} style={styles.coverImage} resizeMode="cover" />
          <View style={[styles.coverOverlay, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.coverBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <View style={styles.coverBtnCircle}>
                <BackArrowIcon width={24} height={24} />
              </View>
            </TouchableOpacity>
            <View style={styles.coverSpacer} />
            <TouchableOpacity style={styles.coverBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <View style={styles.coverBtnCircle}>
                <ShareIcon width={24} height={24} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Part 2: Title, category tag, user count */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{goal.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{goal.category}</Text>
            </View>
            <View style={styles.userCountRow}>
            <Ionicons name="people-outline" size={16} color={lightColors.subText} />
            <Text style={styles.userCount}>{goal.userCount}</Text>
          </View>
          </View>
        </View>

        {/* Part 3: Habits, Tasks, Note */}
        <View style={styles.contentSection}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Habit ({goal.habitsCount})</Text>
              <View style={styles.checkbox} />
            </View>
            {habitItems.map((item, index) => (
              <TrackerCard
                key={`habit-${index}`}
                item={{ ...item, variant: 'habit' }}
              />
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Task ({goal.tasksCount})</Text>
              <View style={styles.checkbox} />
            </View>
            {taskItems.map((item, index) => (
              <TrackerCard
                key={`task-${index}`}
                item={{ ...item, variant: 'task' }}
              />
            ))}
          </View>

          <View style={styles.section}>
            <Textt i18nKey="note" style={styles.sectionTitle} />
            <Text style={styles.noteText}>{goal.note}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Part 4: Add Goal button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button
          title={t('addGoals') as string}
          variant="primary"
          onPress={handleAddGoal}
          style={styles.addGoalBtn}
          backgroundColor={lightColors.accent}
          textColor={lightColors.secondaryBackground}
        />
      </View>
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
    paddingHorizontal: 20,
    zIndex: 2,
  },
  coverBtn: {
    padding: 4,
  },
  coverBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverSpacer: {
    flex: 1,
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: lightColors.border,
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
  addGoalBtn: {
    width: '100%',
    borderRadius: 100,
  },
});
