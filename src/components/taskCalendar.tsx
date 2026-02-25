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

interface TaskData {
  total: number;
  completed: number;
}

interface CalendarProps {
  tasks?: Record<string, TaskData>;
  onDateSelect?: (date: string) => void;
}

interface DayItem {
  date: Date;
  isCurrentMonth: boolean;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TaskCalendar: React.FC<CalendarProps> = ({
  tasks = {},
  onDateSelect,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

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

  /* ---------------- CURRENT WEEK DATA ---------------- */

  const currentWeek = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
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
  }, []);

  /* ---------------- RENDER DAY ---------------- */

  const renderDay = ({ item }: { item: DayItem }) => {
    const dateKey = formatDate(item.date);
    const taskInfo = tasks[dateKey];

    let progress = 0;
    if (taskInfo && taskInfo.total > 0) {
      progress = taskInfo.completed / taskInfo.total;
    }

    const isSelected = selectedDate === dateKey;

    const size = 44;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - progress * circumference;

    return (
      <View style={styles.dayWrapper}>
        <TouchableOpacity
          style={isSelected ? styles.selectedWrapper : null}
          onPress={() => {
            setSelectedDate(dateKey);
            onDateSelect?.(dateKey);
          }}
          activeOpacity={0.8}
        >
          <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
              <Circle
                stroke="#eee"
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              {progress > 0 && (
                <Circle
                  stroke="#FF7A00"
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              )}
            </Svg>

            <View style={styles.dayTextContainer}>
              <Text
                style={[
                  styles.dayText,
                  !item.isCurrentMonth && { color: '#ccc' },
                  isSelected && styles.selectedText,
                ]}
              >
                {item.date.getDate()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 6x6 Orange Dot (OUTSIDE the container) */}
        {isSelected && <View style={styles.selectedDot} />}
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
            <Text style={styles.arrow}>{'<'}</Text>
          </TouchableOpacity>

          <Text style={styles.monthText}>{monthYearLabel}</Text>

          <TouchableOpacity onPress={goToNextMonth}>
            <Text style={styles.arrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Week Labels */}
      <View style={styles.weekRow}>
        {weekDays.map((d) => (
          <Text key={d} style={styles.weekText}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <FlatList
        data={isExpanded ? fullMonth : currentWeek}
        renderItem={renderDay}
        keyExtractor={(item) => formatDate(item.date)}
        numColumns={7}
        scrollEnabled={false}
      />

      {/* Expand / Collapse Toggle */}
      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <BotttomArrowIcon width={15} height={8} />
      </TouchableOpacity>
    </View>
  );
};

export default TaskCalendar;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },

  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },

  arrow: {
    fontSize: 20,
    paddingHorizontal: 10,
    color: '#444',
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  weekText: {
    width: 44,
    textAlign: 'center',
    color: '#777',
  },

  dayWrapper: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 8,
  },

  selectedWrapper: {
    backgroundColor: 'rgba(255,122,0,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF7A00',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },

  dayTextContainer: {
    position: 'absolute',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dayText: {
    fontSize: 14,
  },

  selectedText: {
    color: '#FF7A00',
    fontWeight: '600',
  },

  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF7A00',
    marginTop: 6,
  },

  toggleContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
});