import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
    import BotttomArrowIcon from '../assets/svgs/BotttomArrowIcon';
import ArrowUpward from '../assets/svgs/ArrowUpward';
import LeftArrowIcon from '../assets/svgs/LeftArrowIcon';
import RightArrowIcon from '../assets/svgs/RightArrowIcon';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import ArrowDown from '../assets/svgs/ArrowDown';
interface TaskData {
  total: number;
  completed: number;
}

interface CalendarProps {
  tasks?: Record<string, TaskData>;
  onDateSelect?: (date: string) => void;
  /** When provided, calendar uses this as the selected date (controlled). */
  selectedDate?: string | null;
  /** When provided, used to get completion for each date so circles fill by progress. */
  getCompletionForDate?: (dateStr: string) => { total: number; completed: number };
}

interface DayItem {
  date: Date;
  isCurrentMonth: boolean;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TaskCalendar: React.FC<CalendarProps> = ({
  tasks = {},
  onDateSelect,
  selectedDate: controlledSelectedDate,
  getCompletionForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isControlled = controlledSelectedDate !== undefined;
  const selectedDate = isControlled ? (controlledSelectedDate ?? null) : internalSelectedDate;
  const setSelectedDate = (dateKey: string) => {
    onDateSelect?.(dateKey);
    if (!isControlled) setInternalSelectedDate(dateKey);
  };

  const formatDate = (date: Date) =>
    date.toISOString().split('T')[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /* ---------------- MONTH NAVIGATION ---------------- */

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const monthYearLabel = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  /* ---------------- FULL MONTH DATA ---------------- */

  const fullMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const days: DayItem[] = [];

    const prevLastDate = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevLastDate - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    while (days.length % 7 !== 0) {
      const nextDay = days.length - (startDay + totalDays) + 1;
      days.push({
        date: new Date(year, month + 1, nextDay),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  /* ---------------- WEEK VIEW DATA (week containing selected date, or current week) ---------------- */

  const displayWeek = useMemo(() => {
    const refDate = selectedDate
      ? (() => {
          const [y, m, d] = selectedDate.split('-').map(Number);
          return new Date(y, m - 1, d);
        })()
      : new Date();
    const start = new Date(refDate);
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);

    return Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i
      ),
      isCurrentMonth: true,
    }));
  }, [selectedDate]);

  /* ---------------- RENDER DAY ---------------- */

  const renderDay = ({ item, index }: { item: DayItem; index: number }) => {
    const dateKey = formatDate(item.date);
    const taskInfo = getCompletionForDate
      ? getCompletionForDate(dateKey)
      : tasks[dateKey] ?? { total: 0, completed: 0 };

    let progress = 0;
    if (taskInfo.total > 0) {
      progress = taskInfo.completed / taskInfo.total;
    }

    const isSelected = selectedDate === dateKey;
    const isWeekView = !isExpanded;
    const dayLabel = weekDays[index];

    const size = 44;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Reversed logic: when user has goals, circle is full (background); as they complete, fill reduces
    const hasGoals = (taskInfo.total ?? 0) > 0;
    const fillDashArray = hasGoals
      ? `${(1 - progress) * circumference} ${progress * circumference}`
      : '0 0';

    const dateContent = (
      <>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            <Circle
              stroke={lightColors.border}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {hasGoals && (
              <Circle
                stroke={lightColors.background}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={fillDashArray}
                strokeLinecap="round"
              />
            )}
          </Svg>

          <View style={styles.dayTextContainer}>
            <Text
              style={[
                styles.dayText,
                !item.isCurrentMonth && { color: lightColors.placeholderText },
                isSelected && styles.selectedText,
              ]}
            >
              {item.date.getDate()}
            </Text>
          </View>
        </View>
      </>
    );

    return (
      
      <View style={{paddingBottom: 10,flex: 1,
        alignItems: 'center',
        justifyContent: 'center',}}>
      <View style={styles.dayWrapper}>
        <TouchableOpacity
          style={[
            isWeekView && styles.weekViewTouchable,
            isSelected && styles.selectedWrapper,
          ]}
          onPress={() => setSelectedDate(dateKey)}
          activeOpacity={0.8}
        >
          {isWeekView && dayLabel != null && (
            <Text
              style={[
                styles.weekText,
                styles.weekLabelInColumn,
                isSelected && styles.selectedDayLabel,
              ]}
            >
              {dayLabel}
            </Text>
          )}
          {dateContent}
        </TouchableOpacity>

       
{/* <View style={styles.dotContainer} >
         {isSelected && <View style={styles.selectedDot} />}
      </View> */}
        
      </View>
      {isSelected &&isWeekView?<View style={{backgroundColor: lightColors.background, height: 8,width: 8,borderRadius: 5,
      marginTop: 5,
       }}></View>:<View style={{backgroundColor: 'transpraent', height: 10,width: 10,borderRadius: 5,
        marginTop: 5,
         }}></View>}
      </View>

      
      
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      {/* Month Header */}
      {isExpanded && (
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <LeftArrowIcon width={20} height={20} />
          </TouchableOpacity>

          <Text style={styles.monthText}>{monthYearLabel}</Text>

          <TouchableOpacity onPress={goToNextMonth}>
            <RightArrowIcon width={20} height={20} />
          </TouchableOpacity>
        </View>
      )}

      {/* Week Labels (only in month view; in week view day is inside each column) */}
      {isExpanded && (
        <View style={styles.weekRow}>
          {weekDays.map((d) => (
            <Text key={d} style={styles.weekText}>
              {d}
            </Text>
          ))}
        </View>
      )}

      {/* Calendar Grid */}
      <FlatList
        data={isExpanded ? fullMonth : displayWeek}
        renderItem={renderDay}
        keyExtractor={(item) => formatDate(item.date)}
        numColumns={7}
        scrollEnabled={false}
      />

      {/* Expand / Collapse Toggle — upward when open, downward when collapsed */}
      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ArrowUpward width={24} height={24} color={lightColors.text} />
        ) : (
          <ArrowDown width={24} height={24}  color={lightColors.text} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TaskCalendar;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    backgroundColor: lightColors.secondaryBackground,
  },

  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    
  },

  monthText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    fontWeight: '700',
  },

  arrow: {
    fontSize: 24,
    paddingHorizontal: 10,
    color: lightColors.text,
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 22,
    marginBottom: 4,
  },

  weekText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    width: 50,
    textAlign: 'center',
    color: lightColors.subText,
  },

  weekLabelInColumn: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    paddingBottom: 4,
    marginBottom: 4,
    
  },

  selectedDayLabel: {
    // color: lightColors.background,
    // fontWeight: '600',
    // marginVertical: 4,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.text,
  },

  dayWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 5,
   
  },

  weekViewTouchable: {
    // paddingVertical: 6,
    // paddingHorizontal: 4,
    alignItems: 'center',
    alignSelf: 'center',
  },

  selectedWrapper: {
    backgroundColor: lightColors.skipbg,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: lightColors.background,
    paddingVertical: 5,
  },

  dayTextContainer: {
    position: 'absolute',
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dayText: {
    fontSize: 16,
    fontFamily: fontFamilies.urbanistMedium,
  },

  selectedText: {
    color: lightColors.background,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    fontWeight: '500',
  },

  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: lightColors.background,
    marginTop: 6,
  },

  toggleContainer: {
    alignItems: 'center',
    marginBottom: 10,
    // marginTop: 20,
  },

  dotContainer: {
   
  },
});