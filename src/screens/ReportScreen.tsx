import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Header from '../components/Header';
import SplashLogo from '../assets/svgs/SpashLogo';
import { useGoals } from '../context/GoalsContext';
import { useTranslation } from '../i18n';
import { showOverflowMenu } from '../utils/showOverflowMenu';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 80;

type ChartKey = 'completion' | 'habits' | 'tasks';
type ChartType = 'bar' | 'line';
type TimePeriod = 'weekly' | 'monthly' | 'yearly';

interface DateRange {
  start: Date;
  end: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const atMidday = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return atMidday(next);
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return atMidday(next);
};

const addYears = (date: Date, years: number) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return atMidday(next);
};

const startOfWeekMonday = (date: Date) => {
  const d = atMidday(date);
  const day = d.getDay(); // 0..6, Sun..Sat
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
};

const getRangeForPeriod = (period: TimePeriod, anchorDate: Date): DateRange => {
  if (period === 'weekly') {
    const start = startOfWeekMonday(anchorDate);
    const end = addDays(start, 6);
    return { start, end };
  }
  if (period === 'monthly') {
    const start = atMidday(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1));
    const end = atMidday(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0));
    return { start, end };
  }
  const start = atMidday(new Date(anchorDate.getFullYear(), 0, 1));
  const end = atMidday(new Date(anchorDate.getFullYear(), 11, 31));
  return { start, end };
};

const formatRangeLabel = (period: TimePeriod, range: DateRange) => {
  if (period === 'weekly') {
    return `${MONTH_LABELS[range.start.getMonth()]} ${range.start.getDate()} - ${MONTH_LABELS[range.end.getMonth()]} ${range.end.getDate()}, ${range.end.getFullYear()}`;
  }
  if (period === 'monthly') {
    return `${MONTH_LABELS[range.start.getMonth()]} ${range.start.getFullYear()}`;
  }
  return `${range.start.getFullYear()}`;
};

const ReportScreen = () => {
  const insets = useSafeAreaInsets();
  const { goals, itemCompletions, getCompletionForDate } = useGoals();
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TimePeriod>('weekly');
  const [anchorDate, setAnchorDate] = useState<Date>(atMidday(new Date()));
  const range = useMemo(() => getRangeForPeriod(period, anchorDate), [period, anchorDate]);
  const rangeLabel = useMemo(() => formatRangeLabel(period, range), [period, range]);

  // Which bar is "active" (shows tooltip) per chart
  const [activeIndex, setActiveIndex] = useState<Record<ChartKey, number>>({
    completion: 0,
    habits: 0,
    tasks: 0,
  });

  // Bar vs Line toggle per chart
  const [chartType, setChartType] = useState<Record<ChartKey, ChartType>>({
    completion: 'bar',
    habits: 'bar',
    tasks: 'bar',
  });

  const itemTypeById = useMemo(() => {
    const map: Record<string, 'habit' | 'task'> = {};
    goals.forEach(goal => {
      (goal.items ?? []).forEach(item => {
        map[item.id] = item.type;
      });
    });
    return map;
  }, [goals]);

  const buckets = useMemo(() => {
    if (period === 'weekly') {
      const start = startOfWeekMonday(anchorDate);
      return Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(start, i);
        return {
          label: String(date.getDate()),
          start: date,
          end: date,
          dateKeys: [toDateKey(date)],
        };
      });
    }

    if (period === 'monthly') {
      const start = atMidday(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1));
      const end = atMidday(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0));
      const totalDays = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
      const bucketCount = 6;
      const step = Math.ceil(totalDays / bucketCount);

      return Array.from({ length: bucketCount }).map((_, i) => {
        const bucketStart = addDays(start, i * step);
        const bucketEndCandidate = addDays(bucketStart, step - 1);
        const bucketEnd =
          bucketEndCandidate.getTime() > end.getTime() ? end : bucketEndCandidate;
        const dateKeys: string[] = [];
        for (let d = new Date(bucketStart); d.getTime() <= bucketEnd.getTime(); d = addDays(d, 1)) {
          dateKeys.push(toDateKey(d));
        }
        return {
          label: String(bucketStart.getDate()),
          start: bucketStart,
          end: bucketEnd,
          dateKeys,
        };
      });
    }

    return Array.from({ length: 12 }).map((_, month) => {
      const start = atMidday(new Date(anchorDate.getFullYear(), month, 1));
      const end = atMidday(new Date(anchorDate.getFullYear(), month + 1, 0));
      const dateKeys: string[] = [];
      for (let d = new Date(start); d.getTime() <= end.getTime(); d = addDays(d, 1)) {
        dateKeys.push(toDateKey(d));
      }
      return {
        label: String(month + 1),
        start,
        end,
        dateKeys,
      };
    });
  }, [anchorDate, period]);

  const { completionData, habitsData, tasksData } = useMemo(() => {
    const completion: number[] = [];
    const habits: number[] = [];
    const tasks: number[] = [];

    buckets.forEach(bucket => {
      let total = 0;
      let completed = 0;
      let habitDoneCount = 0;
      let taskDoneCount = 0;

      bucket.dateKeys.forEach(dateKey => {
        const dayCompletion = getCompletionForDate(dateKey);
        total += dayCompletion.total;
        completed += dayCompletion.completed;
      });

      Object.entries(itemCompletions).forEach(([itemId, dates]) => {
        const type = itemTypeById[itemId];
        if (!type) return;
        dates.forEach(dateKey => {
          if (!bucket.dateKeys.includes(dateKey)) return;
          if (type === 'habit') habitDoneCount += 1;
          if (type === 'task') taskDoneCount += 1;
        });
      });

      completion.push(total > 0 ? Math.round((completed / total) * 100) : 0);
      habits.push(habitDoneCount);
      tasks.push(taskDoneCount);
    });

    return {
      completionData: completion,
      habitsData: habits,
      tasksData: tasks,
    };
  }, [buckets, getCompletionForDate, itemCompletions, itemTypeById]);

  const labels = buckets.map(bucket => bucket.label);
  const chartCount = labels.length;

  const habitsMax = Math.max(7, ...habitsData, 1);
  const tasksMax = Math.max(7, ...tasksData, 1);
  const goalsAchievedCount = goals.filter(goal => goal.achieved).length;
  const formedHabitsCount = habitsData.reduce((sum, value) => sum + value, 0);
  const finishedTasksCount = tasksData.reduce((sum, value) => sum + value, 0);

  const goPrevRange = () => {
    setAnchorDate(prev => {
      if (period === 'weekly') return addDays(prev, -7);
      if (period === 'monthly') return addMonths(prev, -1);
      return addYears(prev, -1);
    });
  };

  const goNextRange = () => {
    setAnchorDate(prev => {
      if (period === 'weekly') return addDays(prev, 7);
      if (period === 'monthly') return addMonths(prev, 1);
      return addYears(prev, 1);
    });
  };

  const setPeriodAndReset = (nextPeriod: TimePeriod) => {
    setPeriod(nextPeriod);
    setActiveIndex({
      completion: 0,
      habits: 0,
      tasks: 0,
    });
  };

  const handleHeaderMenuPress = () => {
    showOverflowMenu({
      title: 'Report options',
      items: [
        { label: 'Weekly', onPress: () => setPeriodAndReset('weekly') },
        { label: 'Monthly', onPress: () => setPeriodAndReset('monthly') },
        { label: 'Yearly', onPress: () => setPeriodAndReset('yearly') },
        { label: 'Jump to current date', onPress: () => setAnchorDate(atMidday(new Date())) },
      ],
    });
  };

  //////////////////////////////////////////////////////
  // 🔥 BAR CHART DATA BUILDER
  //////////////////////////////////////////////////////
  const buildBarData = (
    data: number[],
    key: ChartKey,
    color: string,
  ) =>
    data.map((value, index) => {
      const isActive = index === activeIndex[key];
      return {
        value,
        label: labels[index],
        frontColor: isActive ? color : `${color}55`,
        barBorderRadius: 10,
        topLabelComponent: isActive
          ? () => (
              <View style={styles.tooltipWrapper}>
                <View style={[styles.tooltip, { borderColor: color }]}>
                  <Text style={styles.tooltipText}>
                    {value}
                    {key === 'completion' ? '%' : ''}
                  </Text>
                </View>
                <View style={[styles.tooltipArrow, { borderTopColor: lightColors.secondaryBackground }]} />
              </View>
            )
          : undefined,
      };
    });

  //////////////////////////////////////////////////////
  // 🔥 LINE CHART DATA BUILDER
  //////////////////////////////////////////////////////
  const buildLineData = (
    data: number[],
    key: ChartKey,
    color: string,
  ) =>
    data.map((value, index) => {
      const isActive = index === activeIndex[key];
      return {
        value,
        label: labels[index],
        // Active point: filled circle with tooltip label
        dataPointColor: isActive ? color : '#fff',
        dataPointRadius: isActive ? 8 : 6,
        dataPointBorderColor: color,
        dataPointBorderWidth: 2,
        // Show tooltip only on the active point
        topLabelComponent: isActive
          ? () => (
              <View style={styles.lineTooltipWrapper}>
                <View style={[styles.lineTooltip, { borderColor: color }]}>
                  <Text style={[styles.tooltipText, { color }]}>
                    {value}
                    {key === 'completion' ? '%' : ''}
                  </Text>
                </View>
                {/* Pin stem */}
                <View style={[styles.lineTooltipStem, { backgroundColor: color }]} />
                {/* Filled dot at bottom of stem */}
                <View style={[styles.lineTooltipDot, { backgroundColor: color }]} />
              </View>
            )
          : undefined,
      };
    });

  //////////////////////////////////////////////////////
  // 🔥 CHART CARD COMPONENT
  //////////////////////////////////////////////////////
  const ChartCard = ({
    chartKey,
    title,
    data,
    color,
    maxValue,
    noOfSections,
    dataCount,
  }: {
    chartKey: ChartKey;
    title: string;
    data: number[];
    color: string;
    maxValue: number;
    noOfSections: number;
    dataCount: number;
  }) => {
    const isLine = chartType[chartKey] === 'line';
    const basePointWidth = period === 'yearly' ? 46 : 38;
    const chartContentWidth = Math.max(CHART_WIDTH, dataCount * basePointWidth);
    const barWidth = Math.max(10, Math.floor((chartContentWidth - 16) / Math.max(dataCount, 1) - 8));
    const spacing = Math.max(
      4,
      Math.floor((chartContentWidth - barWidth * dataCount) / Math.max(dataCount - 1, 1)),
    );

    return (
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.toggleRow}>
            {/* Bar toggle */}
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                !isLine && { backgroundColor: color },
              ]}
              onPress={() =>
                setChartType(prev => ({ ...prev, [chartKey]: 'bar' }))
              }
            >
              <Ionicons
                name="bar-chart"
                color={!isLine ? lightColors.secondaryBackground : lightColors.placeholderText}
                size={16}
              />
            </TouchableOpacity>

            {/* Line toggle */}
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                isLine && { backgroundColor: color },
              ]}
              onPress={() =>
                setChartType(prev => ({ ...prev, [chartKey]: 'line' }))
              }
            >
              <Ionicons
                name="trending-up"
                color={isLine ? lightColors.secondaryBackground : lightColors.placeholderText}
                size={16}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chartViewport}>
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            {isLine ? (
              <LineChart
                data={buildLineData(data, chartKey, color)}
                width={chartContentWidth}
                height={200}
                maxValue={maxValue}
                noOfSections={noOfSections}
                hideRules
                isAnimated
                // Line styling
                color={color}
                thickness={2}
                // Filled area under the line
                areaChart
                startFillColor={`${color}40`}
                endFillColor={`${color}05`}
                startOpacity={0.4}
                endOpacity={0.05}
                // Y-axis
                yAxisLabelSuffix={chartKey === 'completion' ? '%' : ''}
                // Data points: hollow by default, overridden per-point above
                dataPointsColor={color}
                dataPointsRadius={6}
                // Press handler
                onPress={(_item: any, index: number) =>
                  setActiveIndex(prev => ({ ...prev, [chartKey]: index }))
                }
                // Give enough top padding so tooltips don't clip
                initialSpacing={20}
                spacing={Math.max(12, chartContentWidth / Math.max(dataCount, 1) - 8)}
              />
            ) : (
              <BarChart
                data={buildBarData(data, chartKey, color)}
                barWidth={barWidth}
                spacing={spacing}
                height={200}
                width={chartContentWidth}
                maxValue={maxValue}
                noOfSections={noOfSections}
                yAxisLabelSuffix={chartKey === 'completion' ? '%' : ''}
                hideRules
                roundedTop
                isAnimated
                onPress={(_item: any, index: number) =>
                  setActiveIndex(prev => ({ ...prev, [chartKey]: index }))
                }
              />
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  //////////////////////////////////////////////////////
  // 🔥 RENDER
  //////////////////////////////////////////////////////
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        leftIcon={<SplashLogo fill={lightColors.background} width={28} height={28} />}
        title="Report"
        titleStyle={styles.headerTitle}
        rightIcon={
          <Ionicons name="ellipsis-vertical" size={24} color={lightColors.smallText} />
        }
        onRightPress={handleHeaderMenuPress}
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.periodTabs}>
          <TouchableOpacity
            style={[styles.periodTab, period === 'weekly' && styles.periodTabActive]}
            onPress={() => setPeriodAndReset('weekly')}
          >
            <Text style={[styles.periodTabText, period === 'weekly' && styles.periodTabTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, period === 'monthly' && styles.periodTabActive]}
            onPress={() => setPeriodAndReset('monthly')}
          >
            <Text style={[styles.periodTabText, period === 'monthly' && styles.periodTabTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, period === 'yearly' && styles.periodTabActive]}
            onPress={() => setPeriodAndReset('yearly')}
          >
            <Text style={[styles.periodTabText, period === 'yearly' && styles.periodTabTextActive]}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateRangeRow}>
          <TouchableOpacity onPress={goPrevRange} style={styles.navIconBtn}>
            <Ionicons name="chevron-back" size={20} color={lightColors.smallText} />
          </TouchableOpacity>
          <Text style={styles.dateRangeText}>{rangeLabel}</Text>
          <TouchableOpacity onPress={goNextRange} style={styles.navIconBtn}>
            <Ionicons name="chevron-forward" size={20} color={lightColors.smallText} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{goalsAchievedCount}</Text>
            <Text style={styles.statLabel}>Goals achieved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formedHabitsCount}</Text>
            <Text style={styles.statLabel}>Formed habits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{finishedTasksCount}</Text>
            <Text style={styles.statLabel}>Finished tasks</Text>
          </View>
        </View>

        <ChartCard
          chartKey="completion"
          title="Completion Rate"
          data={completionData}
          color={lightColors.background}
          maxValue={100}
          noOfSections={5}
          dataCount={chartCount}
        />

        <ChartCard
          chartKey="habits"
          title="Habits Completed"
          data={habitsData}
          color={lightColors.habitIndicator}
          maxValue={habitsMax}
          noOfSections={7}
          dataCount={chartCount}
        />

        <ChartCard
          chartKey="tasks"
          title="Tasks Completed"
          data={tasksData}
          color={lightColors.taskIndicator}
          maxValue={tasksMax}
          noOfSections={7}
          dataCount={chartCount}
        />
      </ScrollView>
    </View>
  );
};

export default ReportScreen;

//////////////////////////////////////////////////////////
// 🔥 STYLES
//////////////////////////////////////////////////////////
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.BtnBackground,
  },

  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 22,
    color: lightColors.smallText,
    // backgroundColor: lightColors.secondaryBackground,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: lightColors.border,
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  periodTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
  },
  periodTabActive: {
    backgroundColor: lightColors.background,
  },
  periodTabText: {
    color: lightColors.smallText,
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 14,
  },
  periodTabTextActive: {
    color: lightColors.secondaryBackground,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  navIconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRangeText: {
    fontFamily: fontFamilies.urbanistBold,
    color: lightColors.text,
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 16,
    minHeight: 88,
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    lineHeight: 48,
    color: lightColors.text,
  },
  statLabel: {
    marginTop: 8,
    fontFamily: fontFamilies.urbanist,
    fontSize: 12,
    color: lightColors.smallText,
  },

  card: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  chartViewport: {
    width: '100%',
    overflow: 'hidden',
  },
  chartScrollContent: {
    minWidth: '100%',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontFamily: fontFamilies.urbanistBold,
    color: lightColors.text,
  },

  toggleRow: {
    flexDirection: 'row',
  },

  toggleBtn: {
    width: 40,
    height: 32,
    borderRadius: 6,
    backgroundColor: lightColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  // ── Bar chart tooltip ──────────────────────────────
  tooltipWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },

  tooltip: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 2,
  },

  tooltipText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 14,
    color: lightColors.text,
  },

  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },

  lineTooltipWrapper: {
    alignItems: 'center',
    marginBottom: 4,
  },

  lineTooltip: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 2,
    // Drop shadow for depth
    shadowColor: lightColors.smallText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  lineTooltipStem: {
    width: 2,
    height: 10,
  },

  lineTooltipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});