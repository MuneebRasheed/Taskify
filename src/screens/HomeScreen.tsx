import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import TaskCalendar from '../components/taskCalendar';
import { fontFamilies } from '../theme/typography';
import SpashLogo from '../assets/svgs/SpashLogo';
import Header from '../components/Header';
import FlowButton from '../components/FlowButton';
import { useGoals } from '../context/GoalsContext';
import type { SavedGoal, GoalItem } from '../context/GoalsContext';
import Textt from '../components/Textt';
import { t, useTranslation } from '../i18n';


function formatDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

const HomeScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  const {
    goals,
    itemCompletions,
    toggleItemCompletion,
    getCompletionForDate,
  } = useGoals();

  const { total: dayTotal, completed: dayCompleted } = useMemo(
    () => getCompletionForDate(selectedDate),
    [getCompletionForDate, selectedDate]
  );

  const goalsWithItems = useMemo(
    () => goals.filter((g) => g.items && g.items.length > 0) as SavedGoal[],
    [goals]
  );

  const habitCount = useMemo(() => {
    return goalsWithItems.reduce((sum, g) => {
      return sum + (g.items?.filter((i) => i.type === 'habit').length ?? 0);
    }, 0);
  }, [goalsWithItems]);

  const taskCount = useMemo(() => {
    return goalsWithItems.reduce((sum, g) => {
      return sum + (g.items?.filter((i) => i.type === 'task').length ?? 0);
    }, 0);
  }, [goalsWithItems]);

  const progressFraction = dayTotal > 0 ? dayCompleted / dayTotal : 0;

  const isItemCompleted = (itemId: string) => {
    const list = itemCompletions[itemId] ?? [];
    return list.includes(selectedDate);
  };

  const handleToggleItem = (itemId: string) => {
    toggleItemCompletion(itemId, selectedDate);
  };

  const scrollContentPaddingBottom =  insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          // paddingBottom: insets.bottom,
          backgroundColor: lightColors.secondaryBackground,
        },
      ]}
    >
     
        {/* Header */}
        <Header
          leftIcon={<SpashLogo fill={lightColors.background} width={28} height={28} />}
          title={t('home')}
          rightIcon={
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={lightColors.smallText}
            />
          }
        />

        {/* Task Calendar – controlled selectedDate, circles fill by completion */}
        <TaskCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          getCompletionForDate={getCompletionForDate}
        />


<ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          // { paddingBottom: scrollContentPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >


        {/* Daily summary: "Today you have X habits, Y tasks" – only show when there are goals */}
        {goalsWithItems.length > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                <Textt i18nKey="todayYouHave" style={styles.summaryText} />{' '}
                <Text style={styles.summaryHabit}>{habitCount} habits</Text>,{' '}
                <Text style={styles.summaryTask}>{taskCount} tasks</Text>
              </Text>
            </View>

            {/* Progress bar – fills according to completed tasks/habits */}
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, progressFraction * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {dayCompleted}/{dayTotal}
              </Text>
            </View>
          </View>
        )}
        {/* Goals list with items: checkbox, indicator bar, title, time */}
        <View style={styles.goalsList}>
          {goalsWithItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Image
                source={require('../assets/images/Goal.png')}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Textt i18nKey="youHaveNoGoals" style={styles.emptyTitle} />
              <Textt i18nKey="addAGoalByClickingThePlusButtonBelow" style={styles.emptyDescription} />
            </View>
          ) : (


            
            goalsWithItems.map((goal) => (
              <View key={goal.id} style={styles.goalSection}>
                <Text style={styles.goalSectionTitle}>{goal.title}</Text>
                {(goal.items ?? []).map((item) => (
                  <GoalItemRow
                    key={item.id}
                    item={item}
                    completed={isItemCompleted(item.id)}
                    onToggle={() => handleToggleItem(item.id)}
                  />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

  <FlowButton />
    </View>
  );
};

function GoalItemRow({
  item,
  completed,
  onToggle,
}: {
  item: GoalItem;
  completed: boolean;
  onToggle: () => void;
}) {
  const isHabit = item.type === 'habit';
  const barColor = isHabit ? lightColors.habitIndicator : lightColors.taskIndicator;

  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.itemBar, { backgroundColor: barColor }]} />
      <TouchableOpacity
        onPress={onToggle}
        style={styles.checkboxWrap}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {completed ? (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={lightColors.completedGreen}
          />
          
        ) : (
          <Ionicons
            name="ellipse-outline"
            size={24}
            color={lightColors.placeholderText}
          />
        )}
      </TouchableOpacity>
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.reminderTime ? (
          <View style={styles.itemTimeRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={lightColors.subText}
            />
            <Text style={styles.itemTime}>{item.reminderTime}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom: 24,
  },
  summaryContainer: {
    backgroundColor: lightColors.BtnBackground,
  },
  summaryRow: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: lightColors.BtnBackground,
  },
  summaryText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.text,
  },
  summaryHabit: {
    color: lightColors.habitIndicator,
    fontFamily: fontFamilies.urbanistSemiBold,
  },
  summaryTask: {
    color: lightColors.taskIndicator,
    fontFamily: fontFamilies.urbanistSemiBold,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
    backgroundColor: lightColors.BtnBackground,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: lightColors.inputBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: lightColors.background,
    borderRadius: 4,
  },
  progressLabel: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 12,
    color: lightColors.text,
    minWidth: 36,
    textAlign: 'right',
  },
  goalsList: {
    paddingHorizontal: 20,
    backgroundColor: lightColors.BtnBackground,
  },
  emptyState: {
    height: 550,
    alignItems: 'center',
    paddingVertical: 48,
    paddingTop: 5,
    // marginBottom: 100,
  },
  emptyIllustration: {
    width: 200,
    height: 315,
    marginTop: 60,
    // marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.smallText,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    color: lightColors.subText,
    textAlign: 'center',
  },
  goalSection: {
    marginBottom: 20,
  },
  goalSectionTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 16,
    color: lightColors.subText,
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 6,
    marginBottom: 16,
    // paddingVertical: 12,
    paddingRight: 12,
    minHeight: 70,
  },
  itemBar: {
    width: 3,
    height: 70,
    alignSelf: 'stretch',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 12,
  },
  checkboxWrap: {
    marginRight: 12,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
  },
  itemTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  itemTime: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 12,
    color: lightColors.subText,
  },
});
