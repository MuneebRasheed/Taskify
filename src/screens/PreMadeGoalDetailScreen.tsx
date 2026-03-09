import React, { useMemo, useState } from 'react';
import {
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
import { PREMADE_GOALS } from '../data/preMadeGoals';
import type { RootStackParamList } from '../navigations/RootNavigation';
import ShareIcon from '../assets/svgs/ShareIcon';
import { useGoals } from '../context/GoalsContext';
import type { GoalItem } from '../context/GoalsContext';
import Textt from '../components/Textt';
import { t } from '../i18n';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
import ConfirmModal from '../components/ConfirmModal';
import InfoIcon from '../assets/svgs/InfoIcon';

type PreMadeGoalDetailRouteProp = RouteProp<RootStackParamList, 'PreMadeGoalDetail'>;
type PreMadeGoalDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'PreMadeGoalDetail'>;

const COVER_HEIGHT = 430;

type Mode = 'preMade' | 'myGoal' | 'selfMade';

const PreMadeGoalDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PreMadeGoalDetailNavProp>();
  const route = useRoute<PreMadeGoalDetailRouteProp>();
  const { goals, addGoal, markAchieved, removeGoal, itemCompletions } = useGoals();
  const todayStr = new Date().toISOString().slice(0, 10);

  const { goalId, myGoalId, selfMadePayload } = route.params ?? {};

  const mode: Mode = myGoalId ? 'myGoal' : selfMadePayload ? 'selfMade' : 'preMade';

  const preMadeGoal = useMemo(
    () => (goalId ? PREMADE_GOALS.find((g) => g.id === goalId) : null),
    [goalId]
  );
  const myGoal = useMemo(
    () => (myGoalId ? goals.find((g) => g.id === myGoalId) : null),
    [goals, myGoalId]
  );

  const coverSource: ImageSourcePropType | null = useMemo(() => {
    if (mode === 'preMade' && preMadeGoal) return preMadeGoal.coverImage;
    if (mode === 'myGoal' && myGoal && COVER_IMAGE_SOURCES.length) {
      const idx = myGoal.coverIndex % COVER_IMAGE_SOURCES.length;
      return COVER_IMAGE_SOURCES[idx];
    }
    if (mode === 'selfMade' && selfMadePayload && COVER_IMAGE_SOURCES.length) {
      const idx = selfMadePayload.coverIndex % COVER_IMAGE_SOURCES.length;
      return COVER_IMAGE_SOURCES[idx];
    }
    return null;
  }, [mode, preMadeGoal, myGoal, selfMadePayload]);

  const title = mode === 'preMade' && preMadeGoal
    ? preMadeGoal.title
    : mode === 'myGoal' && myGoal
      ? myGoal.title
      : selfMadePayload?.title ?? '';

  const habitItems: TrackerCardItem[] = useMemo(() => {
    if (mode === 'preMade' && preMadeGoal) {
      return preMadeGoal.habits.map((h) => ({
        title: h.title,
        selectedDays: h.selectedDays,
        reminderTime: h.reminderTime ?? undefined,
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
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: h.reminderTime ?? null,
        variant: 'habit' as const,
      }));
    }
    return [];
  }, [mode, preMadeGoal, myGoal, selfMadePayload]);

  const taskItems: TrackerCardItem[] = useMemo(() => {
    if (mode === 'preMade' && preMadeGoal) {
      return preMadeGoal.tasks.map((t) => ({
        title: t.title,
        selectedDays: [],
        dueDate: t.dueDate ?? undefined,
        reminderTime: t.reminderTime ?? undefined,
        variant: 'task' as const,
      }));
    }
    if (mode === 'myGoal' && myGoal?.items) {
      const dueStr = myGoal.dueDate
        ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][myGoal.dueDate.getMonth()]} ${myGoal.dueDate.getDate()}, ${myGoal.dueDate.getFullYear()}`
        : null;
      return myGoal.items
        .filter((i): i is GoalItem & { type: 'task' } => i.type === 'task')
        .map((t) => ({
          title: t.title,
          selectedDays: [],
          dueDate: dueStr,
          reminderTime: t.reminderTime ?? null,
          variant: 'task' as const,
        }));
    }
    if (mode === 'selfMade' && selfMadePayload) {
      const dueStr = selfMadePayload.dueDate
        ? (() => {
            const d = new Date(selfMadePayload.dueDate!);
            return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
          })()
        : null;
      return selfMadePayload.tasks.map((t) => ({
        title: t.title,
        selectedDays: [],
        dueDate: dueStr,
        reminderTime: t.reminderTime ?? null,
        variant: 'task' as const,
      }));
    }
    return [];
  }, [mode, preMadeGoal, myGoal, selfMadePayload]);

  const noteText = mode === 'preMade' && preMadeGoal
    ? preMadeGoal.note
    : mode === 'selfMade' && selfMadePayload
      ? selfMadePayload.note || ''
      : "To achieve this goal, it's essential to follow key steps in the journey. Begin by researching and identifying areas that align with your interests and strengths.";

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
    const coverIndex = Math.max(0, parseInt(preMadeGoal.id, 10) - 1) % 3;
    const items: GoalItem[] = [
      ...preMadeGoal.habits.map((h, i) => ({
        id: `pre-${preMadeGoal.id}-habit-${i}`,
        type: 'habit' as const,
        title: h.title,
        reminderTime: h.reminderTime,
      })),
      ...preMadeGoal.tasks.map((t, i) => ({
        id: `pre-${preMadeGoal.id}-task-${i}`,
        type: 'task' as const,
        title: t.title,
        reminderTime: t.reminderTime,
      })),
    ];
    addGoal({
      title: preMadeGoal.title,
      coverIndex,
      source: 'preMade',
      habitsTotal: preMadeGoal.habitsCount,
      habitsDone: 0,
      tasksTotal: preMadeGoal.tasksCount,
      tasksDone: 0,
      dueDate: null,
      achieved: false,
      items,
    });
    navigation.navigate('MainTabs', { screen: 'My Goals' });
  };

  const handleCreateGoal = () => {
    if (mode !== 'selfMade' || !selfMadePayload) return;
    const items: GoalItem[] = [
      ...selfMadePayload.habits.map((h, i) => ({
        id: `self-habit-${Date.now()}-${i}`,
        type: 'habit' as const,
        title: h.title,
        reminderTime: h.reminderTime,
      })),
      ...selfMadePayload.tasks.map((t, i) => ({
        id: `self-task-${Date.now()}-${i}`,
        type: 'task' as const,
        title: t.title,
        reminderTime: t.reminderTime,
      })),
    ];
    addGoal({
      title: selfMadePayload.title,
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
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {mode === 'preMade' && preMadeGoal && (
            <View style={styles.metaRow}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{preMadeGoal.category}</Text>
              </View>
              <View style={styles.userCountRow}>
                <Ionicons name="people-outline" size={16} color={lightColors.subText} />
                <Text style={styles.userCount}>{preMadeGoal.userCount}</Text>
              </View>
            </View>
          )}
        </View>

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
                    ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][myGoal.dueDate.getMonth()]} ${myGoal.dueDate.getDate()}, ${myGoal.dueDate.getFullYear()}`
                    : null;
                  return myGoal.items
                    .filter((i): i is GoalItem & { type: 'task' } => i.type === 'task')
                    .map((goalItem) => {
                      const item: TrackerCardItem = {
                        title: goalItem.title,
                        selectedDays: [],
                        dueDate: goalItem.dueDate ?? dueStr,
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
        {mode === 'preMade' && (
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
        {mode === 'myGoal' && (
          <>
            {/* <Button
              title={t('saveGoals') as string}
              variant="primary"
              onPress={handleGoToMyGoals}
              style={styles.saveGoalsBtn}
              backgroundColor={lightColors.accent}
              textColor={lightColors.secondaryBackground}
            /> */}
            <Button
              title={(myGoal?.achieved ? t('unachieveGoal') : t('achieveGoals')) as string}
              variant="primary"
              onPress={handleAchieve}
              style={styles.achieveBtnFull}
              backgroundColor={lightColors.background}
              textColor={lightColors.secondaryBackground}
            />
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletePress} activeOpacity={0.8}>
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
