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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Header from '../components/Header';
import GoalCard from '../components/GoalCard';
import { GOAL_CATEGORIES } from '../components/CategoryModal';
import type { GoalCategory } from '../components/CategoryModal';
import type { PreMadeGoalItem } from '../lib/api/preMadeGoalsApi';
import type { RootStackParamList } from '../navigations/RootNavigation';
import SplashLogo from '../assets/svgs/SpashLogo';
import SearchIcon from '../assets/svgs/SearchIcon';
import Textt from '../components/Textt';
import { useGoals } from '../context/GoalsContext';
import { usePreMadeGoals } from '../hooks/usePreMadeGoals';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ExploreSearch'>;

const FILTER_OPTIONS: (GoalCategory | 'Popular')[] = ['Popular', ...GOAL_CATEGORIES];

const ExploreScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { goals } = useGoals();
  const { preMadeGoals } = usePreMadeGoals();
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'Popular'>('Popular');

  const addedPreMadeTitles = useMemo(
    () => new Set(goals.filter((g) => g.source === 'preMade' && !g.achieved).map((g) => g.title)),
    [goals]
  );

  const filteredGoals = useMemo(() => {
    if (selectedCategory === 'Popular') {
      return preMadeGoals;
    }
    return preMadeGoals.filter((g) => g.category === selectedCategory);
  }, [preMadeGoals, selectedCategory]);

  const rootNav = navigation.getParent() as { navigate: (name: string, params?: { goalId: string }) => void } | undefined;

  const handleSearchPress = () => {
    rootNav?.navigate('ExploreSearch');
  };

  const handleGoalPress = (goal: PreMadeGoalItem) => {
    rootNav?.navigate('PreMadeGoalDetail', { goalId: goal.id });
  };

  const handleAddGoal = (goal: PreMadeGoalItem, e: any) => {
    e?.stopPropagation?.();
    handleGoalPress(goal);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Part 1: Header – Explore icon, title, search */}
      <Header
        leftIcon={<SplashLogo fill={lightColors.background} width={28} height={28} />}
        title={<Textt i18nKey="explore" style={styles.headerTitle} />}
        titleStyle={styles.headerTitle}
        rightIcon={<SearchIcon width={24} height={24} />}
        onRightPress={handleSearchPress}
        style={styles.header}
      />

      {/* Part 2: Promotional card */}
      {/* <ExplorePromoCard />
       */}
       <Image source={require('../assets/images/ExploreCard.png')} style={styles.bannerImage} />

      {/* Part 3: Category tabs – Popular + categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesWrap}
        style={styles.categoriesScroll}
        bounces={false}
        alwaysBounceHorizontal={false}
      >
        {FILTER_OPTIONS.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Part 4: Pre-made goals list */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGoals.map((goal) => {
          const alreadyAdded = addedPreMadeTitles.has(goal.title);
          return (
            <GoalCard
              key={goal.id}
              coverSource={goal.coverImage}
              title={goal.title}
              habitsCount={goal.habitsCount}
              tasksCount={goal.tasksCount}
              userCount={goal.userCount}
              dimmed={alreadyAdded}
              onPress={() => handleGoalPress(goal)}
              onAddPress={alreadyAdded ? undefined : (e) => handleAddGoal(goal, e)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ExploreScreen;

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
  categoriesScroll: {
    maxHeight: 52,
    flexGrow: 0,
  },
  categoriesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 6,
    paddingRight: 40,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: lightColors.secondaryBackground,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  categoryChipSelected: {
    backgroundColor: lightColors.background,
    borderColor: lightColors.background,
  },
  categoryChipText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.text,
  },
  categoryChipTextSelected: {
    color: lightColors.secondaryBackground,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  bannerImage: {
    width: '90%',
    height: 180,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: lightColors.inputBackground,
  },
});
