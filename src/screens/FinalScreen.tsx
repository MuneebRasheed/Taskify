import React from 'react';
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
import { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import Button from '../components/Button';
import TrackerCard, { type TrackerCardItem } from '../components/TrackerCard';
// import Textt from '../components/Textt';
// import { t } from '../i18n';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import TimeIcon from '../assets/svgs/TimeIcon';
import InfoIcon from '../assets/svgs/InfoIcon';
import { useGoals } from '../context/GoalsContext';
import type { GoalItem } from '../context/GoalsContext';

type FinalScreenRouteProp = RouteProp<RootStackParamList, 'FinalScreen'>;
type FinalScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'FinalScreen'>;

function formatDateFromStamp(ts: number): string {
  const d = new Date(ts);
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

function daysUntilDue(ts: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(ts);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

const FinalScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FinalScreenNavProp>();
  const route = useRoute<FinalScreenRouteProp>();
  const { addGoal } = useGoals();

  const {
    goalTitle,
    coverIndex,
    category,
    dueDate,
    reminderDate,
    reminderTime,
    habits,
    tasks,
    note,
    fromSelfMade,
  } = route.params;

  const coverSource: ImageSourcePropType | null =
    COVER_IMAGE_SOURCES.length > 0 && coverIndex < COVER_IMAGE_SOURCES.length
      ? COVER_IMAGE_SOURCES[coverIndex]
      : null;

  // const dueDateDaysLabel =
  //   dueDate != null
  //     ? daysUntilDue(dueDate) >= 0
  //       ? `0 - ${daysUntilDue(dueDate)} days`
  //       : 'Overdue'
  //     : null;
  const reminderDisplay =
    reminderDate != null && reminderTime != null
      ? `${formatDateFromStamp(reminderDate)} - ${formatTime(reminderTime.hours, reminderTime.minutes, reminderTime.am)}`
      : '';

  const habitItems: TrackerCardItem[] = habits.map((h) => ({
    ...h,
    variant: 'habit' as const,
  }));
  const taskItems: TrackerCardItem[] = tasks.map((t) => ({
    ...t,
    variant: 'task' as const,
  }));

  const handleSaveGoals = () => {
    const items: GoalItem[] = [
      ...habits.map((h, i) => ({
        id: `final-h-${i}`,
        type: 'habit' as const,
        title: h.title,
        reminderTime: h.reminderTime ?? undefined,
      })),
      ...tasks.map((task, i) => ({
        id: `final-t-${i}`,
        type: 'task' as const,
        title: task.title,
        reminderTime: task.reminderTime ?? undefined,
      })),
    ];
    addGoal({
      title: goalTitle.trim() || 'Goals Title',
      coverIndex,
      source: fromSelfMade ? 'selfMade' : 'aiMade',
      habitsTotal: habits.length,
      habitsDone: 0,
      tasksTotal: tasks.length,
      tasksDone: 0,
      dueDate: dueDate != null ? new Date(dueDate) : null,
      achieved: false,
      items,
    });
    navigation.navigate('MainTabs', { screen: 'My Goals' });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover image with back button and title overlay */}
        <View style={styles.coverWrap}>
          {coverSource ? (
            <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>Cover Image</Text>
              <Text style={styles.coverPlaceholderHint}>Tap Camera to Select</Text>
            </View>
          )}
          <View style={[styles.coverOverlay, { paddingTop: insets.top + 15 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.coverBackBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <View style={styles.coverBackBtnCircle}>
                <BackArrowIcon width={24} height={24} fill={lightColors.text} />
              </View>
            </TouchableOpacity>
            <View style={styles.coverHeaderSpacer} />
          </View>
        </View>

        {/* Goal overview card: title + category + due date + reminder */}
        <View style={styles.addGoalsSection}>
          <View style={styles.goalTitleDisplayRow}>
            <Text style={styles.goalTitleDisplayText} numberOfLines={2}>
              {goalTitle || 'Add Goals Title'}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metadataRowPills}
            style={styles.metadataRowPillsScroll}
          >
            <View style={styles.metadataPillCategory}>
              <Text style={styles.metadataPillCategoryText} numberOfLines={1}>
                {category ?? 'Category'}
              </Text>
            </View>
            <View style={styles.metadataPillWithIcon}>
              <CalendarIcon width={18} height={18} />
              {dueDate != null ? (
                <View style={styles.dueDateTextWrap}>
                  <Text style={styles.metadataPillTextDark} numberOfLines={1}>
                    {/* {dueDateDaysLabel} */}
                  </Text>
                  <Text style={styles.metadataPillTextDark} numberOfLines={1}>
                    {formatDateFromStamp(dueDate)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.metadataPillTextDark} numberOfLines={1}>
                  No Due Date
                </Text>
              )}
            </View>
            <View style={styles.metadataPillWithIcon}>
              <TimeIcon width={18} height={18} />
              <Text style={styles.metadataPillTextDark} numberOfLines={1}>
                {reminderDisplay || 'Set Reminder'}
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Habit section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{`Habit (${habitItems.length})`}</Text>
            <InfoIcon width={20} height={20} />
          </View>
          {habitItems.map((item, index) => (
            <TrackerCard key={`habit-${index}`} item={{ ...item, variant: 'habit' }} />
          ))}
        </View>

        {/* Task section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{`Task (${taskItems.length})`}</Text>
            <InfoIcon width={20} height={20} />
          </View>
          {taskItems.map((item, index) => (
            <TrackerCard key={`task-${index}`} item={{ ...item, variant: 'task' }} />
          ))}
        </View>

        {/* Note section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note</Text>
          <Text style={styles.noteText}>{note || '—'}</Text>
        </View>
      </ScrollView>

      {/* Save Goals button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Save Goals"
          variant="primary"
          onPress={handleSaveGoals}
          style={styles.saveGoalsBtn}
          backgroundColor={lightColors.accent}
          textColor={lightColors.secondaryBackground}
        />
      </View>
    </View>
  );
};

export default FinalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: lightColors.secondaryBackground,
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
  coverPlaceholder: {
    flex: 1,
    height: '100%',
    width: '100%',
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
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 3,
  },
  coverBackBtn: {
    padding: 4,
  },
  coverBackBtnCircle: {
    width: 48,
    height: 48,
    borderRadius: 1000,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTitleText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  coverHeaderSpacer: {
    width: 48,
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
    fontSize: 24,
    color: lightColors.text,
    paddingVertical: 4,
  },
  metadataRowPillsScroll: {
    flexGrow: 0,
    // marginHorizontal: -24,
  },
  metadataRowPills: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 2,
    // paddingHorizontal: 24,
    paddingVertical:4,
  },
  metadataPillCategory: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.inputBackground,
    borderRadius: 10,
  },
  metadataPillCategoryText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
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
  metadataPillTextDark: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.text,
  },
  dueDateTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
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
    color: lightColors.text,
  },
  noteText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.subText,
    lineHeight: 24,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: lightColors.secondaryBackground,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
  },
  saveGoalsBtn: {
    width: '100%',
    borderRadius: 100,
  },
});
