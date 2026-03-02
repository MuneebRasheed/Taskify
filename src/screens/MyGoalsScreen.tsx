import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import BottomNavigation from '../navigations/BottomNavigation';
import { useGoals } from '../context/GoalsContext';
import { useTranslation } from '../i18n';
import type { SavedGoal } from '../context/GoalsContext';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
import Textt from '../components/Textt';

const CARD_IMAGE_SIZE = 96;
const BOTTOM_NAV_HEIGHT = 60;
const FAB_SIZE = 56;

function daysUntilDue(d: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

const MyGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { goals } = useGoals();
  const [filter, setFilter] = useState<'ongoing' | 'achieved'>('ongoing');

  const filteredGoals = useMemo(() => {
    if (filter === 'ongoing') {
      return goals.filter((g) => !g.achieved);
    }
    return goals.filter((g) => g.achieved);
  }, [goals, filter]);

  const handleAddGoal = () => {
    navigation.navigate('AiGenetratingScreen' as never);
  };

  const coverSource = (goal: SavedGoal) => {
    const idx = goal.coverIndex % COVER_IMAGE_SOURCES.length;
    return COVER_IMAGE_SOURCES[idx];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom }]}>
      {/* Part 1: Header – back, title "My Goals", more options */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HomeScreen' as never)}
          style={styles.headerBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <BackArrowIcon width={24} height={24} />
        </TouchableOpacity>
        <Textt i18nKey="myGoals" style={styles.headerTitle} />
        <TouchableOpacity style={styles.headerBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="ellipsis-vertical" size={24} color={lightColors.text} />
        </TouchableOpacity>
      </View>

      {/* Part 2: Ongoing / Achieved segment */}
      <View style={styles.segmentWrap}>
        <TouchableOpacity
          style={[styles.segmentBtn, filter === 'ongoing' && styles.segmentBtnActive]}
          onPress={() => setFilter('ongoing')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, filter === 'ongoing' && styles.segmentTextActive]}>
            {t('ongoing')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, filter === 'achieved' && styles.segmentBtnActive]}
          onPress={() => setFilter('achieved')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, filter === 'achieved' && styles.segmentTextActive]}>
            {t('achieved')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Part 3: Goals list */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGoals.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              {filter === 'ongoing' ? t('noOngoingGoals') : t('noAchievedGoals')}
            </Text>
          </View>
        ) : (
          filteredGoals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <Image
                source={coverSource(goal)}
                style={styles.goalCardImage}
                resizeMode="cover"
              />
              <View style={styles.goalCardBody}>
                <Text style={styles.goalCardTitle} numberOfLines={2}>
                  {goal.title}
                </Text>
                <View style={styles.tagsRow}>
                  <View style={styles.habitTag}>
                    <Text style={styles.habitTagText}>
                      Habits {goal.habitsDone}/{goal.habitsTotal}
                    </Text>
                  </View>
                  <View style={styles.taskTag}>
                    <Text style={styles.taskTagText}>
                      Tasks {goal.tasksDone}/{goal.tasksTotal}
                    </Text>
                  </View>
                </View>
                {goal.dueDate && (
                  <View style={styles.daysRow}>
                    <Ionicons name="calendar-outline" size={14} color={lightColors.subText} />
                    <Text style={styles.daysText}>
                      D-{daysUntilDue(goal.dueDate)} days
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: BOTTOM_NAV_HEIGHT + insets.bottom + 16 }]}
        onPress={handleAddGoal}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={lightColors.secondaryBackground} />
      </TouchableOpacity>

      {/* Part 4: Fixed bottom navigation */}
      <View style={styles.bottomNavWrap}>
        <BottomNavigation activeTab="My Goals" />
      </View>
    </View>
  );
};

export default MyGoalsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  headerBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
  },
  segmentWrap: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: lightColors.inputBackground,
    borderRadius: 10,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: lightColors.background,
  },
  segmentText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.text,
  },
  segmentTextActive: {
    color: lightColors.secondaryBackground,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.subText,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  goalCardImage: {
    width: CARD_IMAGE_SIZE,
    height: CARD_IMAGE_SIZE,
    borderRadius: 10,
    backgroundColor: lightColors.inputBackground,
  },
  goalCardBody: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    minWidth: 0,
  },
  goalCardTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 16,
    color: lightColors.text,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  habitTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: lightColors.habitIndicator,
  },
  taskTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: lightColors.taskIndicator,
  },
  habitTagText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 12,
    color: lightColors.habitIndicator,
  },
  taskTagText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 12,
    color: lightColors.taskIndicator,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: lightColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
