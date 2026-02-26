import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { lightColors, palette } from '../../utils/colors';
import TimeIcon from '../assets/svgs/TimeIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';

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

const TASK_INDICATOR_BLUE = '#4FC3F7';

interface TrackerCardProps {
  item: TrackerCardItem;
  onPress?: () => void;
  /** Left bar color; default orange for habit, blue for task */
  indicatorColor?: string;
  /** Selected day circle background (default: orange for habit) */
  selectedDayColor?: string;
  /** Unselected day circle border and text */
  unselectedDayBorderColor?: string;
  unselectedDayTextColor?: string;
}

const CORAL_ORANGE = '#FF8A65';
const DEFAULT_SELECTED_COLOR = CORAL_ORANGE;
const DEFAULT_UNSELECTED_BORDER = palette.gray400;
const DEFAULT_UNSELECTED_TEXT = palette.gray700;

const TrackerCard: React.FC<TrackerCardProps> = ({
  item,
  onPress,
  indicatorColor,
  selectedDayColor = DEFAULT_SELECTED_COLOR,
  unselectedDayBorderColor = DEFAULT_UNSELECTED_BORDER,
  unselectedDayTextColor = DEFAULT_UNSELECTED_TEXT,
}) => {
  const isTask = item.variant === 'task';
  const barColor = indicatorColor ?? (isTask ? TASK_INDICATOR_BLUE : DEFAULT_SELECTED_COLOR);
  const hasReminder = item.reminderTime != null && item.reminderTime.trim() !== '';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.indicator, { backgroundColor: barColor }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.footer}>
          {isTask ? (
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
                  {hasReminder ? item.reminderTime : 'No reminder'}
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
                              backgroundColor: '#FFF',
                              borderWidth: 1,
                              borderColor: unselectedDayBorderColor,
                            },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected
                            ? styles.selectedDayText
                            : { color: unselectedDayTextColor },
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
                  {hasReminder ? (item.reminderTime ?? '') : 'No reminder'}
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
    backgroundColor: lightColors.background,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 90,
    borderWidth: 1,
    borderColor: lightColors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  indicator: {
    width: 5,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 12,
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
  },
  dayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: lightColors.background,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderTime: {
    fontSize: 12,
    color: lightColors.subText,
    fontWeight: '500',
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
    fontSize: 12,
    color: lightColors.subText,
    fontWeight: '500',
  },
});

export default TrackerCard;
