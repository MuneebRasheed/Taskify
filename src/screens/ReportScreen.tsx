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
import { useGoals, isItemScheduledForDateWithGoal } from '../context/GoalsContext';
import type { GoalItem, SavedGoal } from '../context/GoalsContext';

// const CHART_WIDTH = Dimensions.get('window').width - 48;

type Timeframe = 'Weekly' | 'Monthly' | 'Yearly';

/** Monday as first day; weekOffset 0 = current week */
function getWeekDateStrings(weekOffset: number): { dateStr: string; dayLabel: string }[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + mondayOffset + weekOffset * 7);
  const out: { dateStr: string; dayLabel: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(thisMonday);
    d.setDate(thisMonday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push({ dateStr: `${y}-${m}-${day}`, dayLabel: day });
  }
  return out;
}

function formatShort(d: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

const ReportScreen = () => {
  const insets = useSafeAreaInsets();
  const { goals, itemCompletions, getCompletionForDate } = useGoals();
  const [timeframe, setTimeframe] = useState<Timeframe>('Weekly');
  const [weekOffset, setWeekOffset] = useState(0);
  const [chartMode, setChartMode] = useState<{ completion: 'bar' | 'line'; habits: 'bar' | 'line'; tasks: 'bar' | 'line' }>({
    completion: 'bar',
    habits: 'bar',
    tasks: 'bar',
  });
  const [activeIndex, setActiveIndex] = useState<{ completion: number; habits: number; tasks: number }>({
    completion: 1,
    habits: 1,
    tasks: 1,
  });

  const weekDays = useMemo(() => getWeekDateStrings(weekOffset), [weekOffset]);

  const dateRangeLabel = useMemo(() => {
    if (timeframe === 'Weekly') {
      const start = new Date(weekDays[0].dateStr + 'T12:00:00');
      const end = new Date(weekDays[6].dateStr + 'T12:00:00');
      return `${formatShort(start)} - ${formatShort(end)}, ${end.getFullYear()}`;
    }
    if (timeframe === 'Monthly') {
      const d = new Date();
      return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getFullYear()}`;
    }
    return String(new Date().getFullYear());
  }, [timeframe, weekDays]);

  const completionChartData = useMemo(() => {
    return weekDays.map(({ dateStr, dayLabel }) => {
      const { total, completed } = getCompletionForDate(dateStr);
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { value: pct, label: dayLabel };
    });
  }, [weekDays, getCompletionForDate]);

  const habitsChartData = useMemo(() => {
    return weekDays.map(({ dateStr, dayLabel }) => {
      let count = 0;
      goals.forEach((g: SavedGoal) => {
        (g.items ?? []).forEach((it: GoalItem) => {
          if (it.type === 'habit' && isItemScheduledForDateWithGoal(g, it, dateStr)) {
            if ((itemCompletions[it.id] ?? []).includes(dateStr)) count += 1;
          }
        });
      });
      return { value: count, label: dayLabel };
    });
  }, [weekDays, goals, itemCompletions]);

  const tasksChartData = useMemo(() => {
    return weekDays.map(({ dateStr, dayLabel }) => {
      let count = 0;
      goals.forEach((g: SavedGoal) => {
        (g.items ?? []).forEach((it: GoalItem) => {
          if (it.type === 'task' && isItemScheduledForDateWithGoal(g, it, dateStr)) {
            if ((itemCompletions[it.id] ?? []).includes(dateStr)) count += 1;
          }
        });
      });
      return { value: count, label: dayLabel };
    });
  }, [weekDays, goals, itemCompletions]);

  const stats = useMemo(() => {
    const achieved = goals.filter((g) => g.achieved).length;
    let habitsInWeek = 0;
    let tasksInWeek = 0;
    weekDays.forEach(({ dateStr }) => {
      goals.forEach((g: SavedGoal) => {
        (g.items ?? []).forEach((it: GoalItem) => {
          if (!isItemScheduledForDateWithGoal(g, it, dateStr)) return;
          const done = (itemCompletions[it.id] ?? []).includes(dateStr);
          if (it.type === 'habit' && done) habitsInWeek += 1;
          if (it.type === 'task' && done) tasksInWeek += 1;
        });
      });
    });
    return {
      goalsAchieved: achieved,
      habitsFormed: habitsInWeek,
      tasksFinished: tasksInWeek,
    };
  }, [goals, itemCompletions, weekDays]);

  const setChartType = (key: 'completion' | 'habits' | 'tasks', type: 'bar' | 'line') => {
    setChartMode((prev) => ({ ...prev, [key]: type }));
  };

  const buildBarData = (
    base: { value: number; label: string }[],
    key: 'completion' | 'habits' | 'tasks',
    accentColor: string,
    dimmedColor: string,
    showPercent: boolean,
  ) =>
    base.map((item, index) => {
      const isActive = index === activeIndex[key];

      return {
        ...item,
        frontColor: isActive ? accentColor : dimmedColor,
        topLabelContainerStyle: isActive ? { overflow: 'visible' as const } : undefined,
        topLabelComponent: isActive
          ? function (this: { value: number; label?: string }) {
              const value = this.value;
              const labelText = showPercent ? `${value}%` : String(value);
              return (
                <View style={styles.activeBarBubbleOuter}>
                  <View style={styles.activeBarBubbleInner}>
                    <Text style={styles.activeBarBubbleText}>{labelText}</Text>
                  </View>
                </View>
              );
            }
          : undefined,
      };
    });

  const completionBarData = buildBarData(
    completionChartData,
    'completion',
    lightColors.background,
    '#EBD0EA',
    true,
  );

  const habitsBarData = buildBarData(
    habitsChartData,
    'habits',
    lightColors.habitIndicator,
    '#FFD3E1',
    false,
  );

  const tasksBarData = buildBarData(
    tasksChartData,
    'tasks',
    lightColors.taskIndicator,
    '#CFE7FF',
    false,
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        leftIcon={<SplashLogo fill={lightColors.background} width={28} height={28} />}
        title="Report"
        titleStyle={styles.headerTitle}
        rightIcon={<Ionicons name="ellipsis-vertical" size={24} color={lightColors.smallText} />}
        style={styles.header}
      />

      {/* Timeframe tabs */}
      <View style={styles.tabsRow}>
        {(['Weekly', 'Monthly', 'Yearly'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setTimeframe(tab)}
            style={[styles.tab, timeframe === tab && styles.tabSelected]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, timeframe === tab && styles.tabTextSelected]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date navigator */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => setWeekOffset((o) => o - 1)} style={styles.dateArrow} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={lightColors.text} />
        </TouchableOpacity>
        <Text style={styles.dateText}>{dateRangeLabel}</Text>
        <TouchableOpacity onPress={() => setWeekOffset((o) => o + 1)} style={styles.dateArrow} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-forward" size={24} color={lightColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.goalsAchieved}</Text>
            <Text style={styles.statLabel}>Goals achieved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.habitsFormed}</Text>
            <Text style={styles.statLabel}>Formed habits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.tasksFinished}</Text>
            <Text style={styles.statLabel}>Finished tasks</Text>
          </View>
        </View>

        {/* Completion Rate */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Completion Rate</Text>
            <View style={styles.chartToggles}>
              <TouchableOpacity
                onPress={() => setChartType('completion', 'bar')}
                style={[styles.toggleBtn, chartMode.completion === 'bar' && styles.toggleBtnPurple]}
              >
                <Ionicons name="bar-chart" size={18} color={chartMode.completion === 'bar' ? '#fff' : lightColors.subText} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartType('completion', 'line')}
                style={[styles.toggleBtn, chartMode.completion === 'line' && styles.toggleBtnPurple]}
              >
                <Ionicons name="trending-up" size={18} color={chartMode.completion === 'line' ? '#fff' : lightColors.subText} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chartWrap}>
            {chartMode.completion === 'bar' ? (
              <BarChart
                data={completionBarData}
                barWidth={28}
                barBorderRadius={4}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={5}
                maxValue={100}
                height={200}
                width={350}
                yAxisLabelSuffix="%"
                onPress={(_, index) =>
                  setActiveIndex((prev) => ({ ...prev, completion: index }))
                }
              />
            ) : (
              <LineChart
                color={lightColors.background}
                thickness={2}
                hideDataPoints={false}
                dataPointsColor={lightColors.background}
                areaChart
                startFillColor={lightColors.background}
                endFillColor={lightColors.background}
                startOpacity={0.3}
                endOpacity={0.05}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={5}
                maxValue={100}
                height={220}
                width={350}
                yAxisLabelSuffix="%"
                focusEnabled
                showDataPointOnFocus
                showStripOnFocus
                showDataPointLabelOnFocus
                stripColor="#F3D4F7"
                focusedDataPointRadius={7}
                focusedDataPointColor={lightColors.background}
                data={completionChartData.map((item) => ({
                  ...item,
                  focusedDataPointLabelComponent: () => (
                    <View style={styles.activePointBubbleOuter}>
                      <View style={styles.activePointBubbleInner}>
                        <Text style={styles.activePointBubbleText}>
                          {item.value}%
                        </Text>
                      </View>
                    </View>
                  ),
                }))}
              />
            )}
          </View>
        </View>

        {/* Habits Completed */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Habits Completed</Text>
            <View style={styles.chartToggles}>
              <TouchableOpacity
                onPress={() => setChartType('habits', 'bar')}
                style={[styles.toggleBtn, chartMode.habits === 'bar' && styles.toggleBtnPink]}
              >
                <Ionicons name="bar-chart" size={18} color={chartMode.habits === 'bar' ? '#fff' : lightColors.subText} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartType('habits', 'line')}
                style={[styles.toggleBtn, chartMode.habits === 'line' && styles.toggleBtnPink]}
              >
                <Ionicons name="trending-up" size={18} color={chartMode.habits === 'line' ? '#fff' : lightColors.subText} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chartWrap}>
            {chartMode.habits === 'bar' ? (
              <BarChart
                data={habitsBarData}
                barWidth={28}
                barBorderRadius={4}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={7}
                maxValue={7}
                height={200}
                width={350}
                onPress={(_, index) =>
                  setActiveIndex((prev) => ({ ...prev, habits: index }))
                }
              />
            ) : (
              <LineChart
                data={habitsChartData.map((item) => ({
                  ...item,
                  focusedDataPointLabelComponent: () => (
                    <View style={styles.activePointBubbleOuter}>
                      <View style={styles.activePointBubbleInner}>
                        <Text style={styles.activePointBubbleText}>
                          {item.value}
                        </Text>
                      </View>
                    </View>
                  ),
                }))}
                color={lightColors.habitIndicator}
                thickness={2}
                hideDataPoints={false}
                dataPointsColor={lightColors.habitIndicator}
                areaChart
                startFillColor={lightColors.habitIndicator}
                endFillColor={lightColors.habitIndicator}
                startOpacity={0.3}
                endOpacity={0.05}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={7}
                maxValue={7}
                height={220}
                width={350}
                focusEnabled
                showDataPointOnFocus
                showStripOnFocus
                showDataPointLabelOnFocus
                stripColor="#FFD8E7"
                focusedDataPointRadius={7}
                focusedDataPointColor={lightColors.habitIndicator}
              />
            )}
          </View>
        </View>

        {/* Tasks Completed */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Tasks Completed</Text>
            <View style={styles.chartToggles}>
              <TouchableOpacity
                onPress={() => setChartType('tasks', 'bar')}
                style={[styles.toggleBtn, chartMode.tasks === 'bar' && styles.toggleBtnBlue]}
              >
                <Ionicons name="bar-chart" size={18} color={chartMode.tasks === 'bar' ? '#fff' : lightColors.subText} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartType('tasks', 'line')}
                style={[styles.toggleBtn, chartMode.tasks === 'line' && styles.toggleBtnBlue]}
              >
                <Ionicons name="trending-up" size={18} color={chartMode.tasks === 'line' ? '#fff' : lightColors.subText} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chartWrap}>
            {chartMode.tasks === 'bar' ? (
              <BarChart
                data={tasksBarData}
                barWidth={28}
                barBorderRadius={4}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={7}
                maxValue={7}
                height={200}
                width={350}
                onPress={(_, index) =>
                  setActiveIndex((prev) => ({ ...prev, tasks: index }))
                }
              />
            ) : (
              <LineChart
                data={tasksChartData.map((item) => ({
                  ...item,
                  focusedDataPointLabelComponent: () => (
                    <View style={styles.activePointBubbleOuter}>
                      <View style={styles.activePointBubbleInner}>
                        <Text style={styles.activePointBubbleText}>
                          {item.value}
                        </Text>
                      </View>
                    </View>
                  ),
                }))}
                color={lightColors.taskIndicator}
                thickness={2}
                hideDataPoints={false}
                dataPointsColor={lightColors.taskIndicator}
                areaChart
                startFillColor={lightColors.taskIndicator}
                endFillColor={lightColors.taskIndicator}
                startOpacity={0.3}
                endOpacity={0.05}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={7}
                maxValue={7}
                height={220}
                width={350}
                focusEnabled
                showDataPointOnFocus
                showStripOnFocus
                showDataPointLabelOnFocus
                stripColor="#D4E9FF"
                focusedDataPointRadius={7}
                focusedDataPointColor={lightColors.taskIndicator}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
  },
  header: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.smallText,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: lightColors.BtnBackground,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabSelected: {
    backgroundColor: lightColors.background,
  },
  tabText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 16,
    color: lightColors.text,
  },
  tabTextSelected: {
    color: lightColors.secondaryBackground,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 50,
    // marginBottom: 20,
  },
  dateArrow: {
    padding: 4,
  },
  dateText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
    minWidth: 180,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    backgroundColor: lightColors.BtnBackground,
  },
  statsRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: 28,
    backgroundColor: lightColors.secondaryBackground,
    height: 350,
    borderRadius: 8,
    overflow: 'visible',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.text,
  },
  chartToggles: {
    marginTop: 12,
    marginRight: 12,
    flexDirection: 'row',
   
  },
  toggleBtn: {
    width: 52,
    height: 35,
    borderRadius: 4,
    backgroundColor: lightColors.BtnBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnPurple: {
    backgroundColor: lightColors.background,
  },
  toggleBtnPink: {
    backgroundColor: lightColors.habitIndicator,
  },
  toggleBtnBlue: {
    backgroundColor: lightColors.taskIndicator,
  },
  chartWrap: {
    alignItems: 'flex-start',
    paddingTop: 36,
    // height: 300,
    overflow: 'visible',
  },
  axisLabel: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
    // backgroundColor: 'blue',
  },
  activeBarBubbleOuter: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  activeBarBubbleInner: {
    minWidth: 44,
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: lightColors.secondaryBackground,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeBarBubbleText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 15,
    color: lightColors.text,
  },
  activePointBubbleOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activePointBubbleInner: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: lightColors.secondaryBackground,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePointBubbleText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 12,
    color: lightColors.text,
  },
});
