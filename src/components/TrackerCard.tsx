import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { lightColors, palette } from '../../utils/colors';
import TimeIcon from '../assets/svgs/TimeIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import CheckIcon from '../assets/svgs/CheckIcon';
import { t, useTranslation } from '../i18n';
import { fontFamilies } from '../theme/typography';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import GreenCheckIcon from '../assets/svgs/GreenCheckIcon';

/** Mon=0 … Sun=6 */
export const TRACKER_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export type TrackerCardVariant = 'habit' | 'task';

export interface TrackerCardItem {
  /** Card heading / title text */
  title: string;
  /** For habit: indices of selected days (0=Mon … 6=Sun). Ignored for task. */
  selectedDays: number[];
  /** Optional reminder time, e.g. "09:00 AM". Use "No reminder" to show label. */
  reminderTime?: string | null;
  /** For task: due date string, e.g. "Today, Dec 22, 2024" or "20 Jan, 2025". */
  dueDate?: string | null;
  /** habit = orange bar + days row; task = blue bar + date + reminder */
  variant?: TrackerCardVariant;
}

const TASK_INDICATOR_BLUE = lightColors.taskIndicator;

interface TrackerCardProps {
  item: TrackerCardItem;
  onPress?: () => void;
  /** When true, show green check and "formed/finished" layout (title + "Formed on date", no days/time) */
  completed?: boolean;
  /** When completed, show "Formed on {formedOnDate}" in the footer. Optional. */
  formedOnDate?: string | null;
  /** Left bar color; default orange for habit, blue for task */
  indicatorColor?: string;
  /** Selected day circle background (default: orange for habit) */
  selectedDayColor?: string;
  /** Unselected day circle border and text */
  unselectedDayBorderColor?: string;
  unselectedDayTextColor?: string;
}

const CORAL_ORANGE = lightColors.background;
const DEFAULT_SELECTED_COLOR = lightColors.habitIndicator;

const DEFAULT_UNSELECTED_BORDER = lightColors.placeholderText;
const DEFAULT_UNSELECTED_TEXT = lightColors.subText;

const TrackerCard: React.FC<TrackerCardProps> = ({
  item,
  onPress,
  completed = false,
  formedOnDate,
  indicatorColor,
  selectedDayColor = lightColors.background,
  unselectedDayBorderColor = DEFAULT_UNSELECTED_BORDER,
}) => {
  const isTask = item.variant === 'task';
  const barColor = indicatorColor ?? (isTask ? TASK_INDICATOR_BLUE : DEFAULT_SELECTED_COLOR);
  const hasReminder = item.reminderTime != null && item.reminderTime.trim() !== '';

  /** When completed/formed/finished: show Image 2 layout — title + "Formed on date" + green check, no days/time */
  const showFormedLayout = completed;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.indicator, { backgroundColor: barColor }]} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, completed && styles.titleChecked]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {completed && (
            <View style={styles.completedBadge}>
              <GreenCheckIcon width={24} height={24} />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {showFormedLayout ? (
            formedOnDate != null && formedOnDate.trim() !== '' ? (
              <Text
                style={[styles.formedOnText, completed && styles.subtextChecked]}
                numberOfLines={1}
              >
                {t('formedOn')} {formedOnDate}
              </Text>
            ) : null
          ) : isTask ? (
            <View style={styles.taskMetaRow}>
              {item.dueDate != null && item.dueDate.trim() !== '' && (
                <View style={styles.metaItem}>
                  <CalendarIcon width={16} height={16} />
                  <Text style={styles.metaText} numberOfLines={1}>{item.dueDate}</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <TimeIcon width={16} height={16} />
                <Text style={styles.metaText}>
                  {hasReminder ? item.reminderTime : t('noReminder')}
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.daysRow}>
                {TRACKER_DAYS.map((day, index) => {
                  const isSelected = item.selectedDays.includes(index);
                  return (
                    <View
                      key={`${day}-${index}`}
                      style={[
                        styles.dayCircle,
                        isSelected
                          ? { backgroundColor: selectedDayColor }
                          : {
                            backgroundColor: lightColors.secondaryBackground,
                            borderWidth: 1,
                            borderColor: lightColors.border,
                          },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected
                            ? styles.selectedDayText
                            : { color: lightColors.subText },
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.reminderRow}>
                <TimeIcon width={16} height={16} />
                <Text style={styles.reminderTime}>
                  {hasReminder ? (item.reminderTime ?? '') : t('noReminder')}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 6,
    flexDirection: 'row',
    marginBottom: 16,
    minHeight: 90,
    borderWidth: 1,
    borderColor: lightColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  indicator: {
    width: 3,
    height: 90,
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text,
  },
  titleChecked: {
    color: lightColors.placeholderText,
  },
  completedBadge: {
    //  marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // backgroundColor: 'blue',
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  dayText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 12,
    color: lightColors.subText,
  },
  selectedDayText: {
    color: lightColors.secondaryBackground,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // marginRight: 45,
    // backgroundColor: 'red',
  },
  reminderTime: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
    fontWeight: '400',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarIcon: {
    fontSize: 12,
  },
  metaText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
    fontWeight: '400',
  },
  formedOnText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
    fontWeight: '400',
  },
  subtextChecked: {
    color: lightColors.placeholderText,
  },
});

export default TrackerCard;
