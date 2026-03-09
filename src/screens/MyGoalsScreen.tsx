import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Header from '../components/Header';
import { useGoals } from '../context/GoalsContext';
import { useTranslation } from '../i18n';
import type { SavedGoal } from '../context/GoalsContext';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
import Textt from '../components/Textt';
import SpashLogo from '../assets/svgs/SpashLogo';
import GoalCard from '../components/GoalCard';
import FlowButton from '../components/FlowButton';
import type { MainTabsParamList } from '../navigations/MainTabs';


const BOTTOM_NAV_HEIGHT = 0;
const FAB_SIZE = 56;

type MyGoalsRouteProp = RouteProp<MainTabsParamList, 'My Goals'>;

const MyGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<MyGoalsRouteProp>();
  const { t } = useTranslation();
  const { goals } = useGoals();
  const [filter, setFilter] = useState<'ongoing' | 'achieved'>(
    route.params?.initialFilter ?? 'ongoing'
  );

  useEffect(() => {
    const initial = route.params?.initialFilter;
    if (initial === 'achieved' || initial === 'ongoing') {
      setFilter(initial);
    }
  }, [route.params?.initialFilter]);

  const filteredGoals = useMemo(() => {
    if (filter === 'ongoing') {
      return goals.filter((g) => !g.achieved);
    }
    return goals.filter((g) => g.achieved);
  }, [goals, filter]);

  const rootNav = navigation.getParent() as { navigate: (name: string, params?: { myGoalId: string }) => void } | undefined;

  const handleAddGoal = () => {
    navigation.navigate('AiGenetratingScreen' as never);
  };

  const handleGoalPress = (goal: SavedGoal) => {
    rootNav?.navigate('PreMadeGoalDetail', { myGoalId: goal.id });
  };

  const coverSource = (goal: SavedGoal) => {
    const idx = goal.coverIndex % COVER_IMAGE_SOURCES.length;
    return COVER_IMAGE_SOURCES[idx];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom }]}>
      {/* Part 1: Header – back, title "My Goals", more options */}
      <Header
       leftIcon={<SpashLogo fill={lightColors.background} width={28} height={28} />}
        title={<Textt i18nKey="myGoals" style={styles.headerTitle} />}
        rightIcon={
          <Ionicons name="ellipsis-vertical" size={24} color={lightColors.text} />
        }
        style={styles.header}
      />

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
            <GoalCard
              key={goal.id}
              coverSource={coverSource(goal)}
              title={goal.title}
              habitsDone={goal.habitsDone}
              habitsTotal={goal.habitsTotal}
              tasksDone={goal.tasksDone}
              tasksTotal={goal.tasksTotal}
              dueDate={goal.dueDate}
              onPress={() => handleGoalPress(goal)}
            />
          ))
        )}
      </ScrollView>

      
      <FlowButton />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
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
});
