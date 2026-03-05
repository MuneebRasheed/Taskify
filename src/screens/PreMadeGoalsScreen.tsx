import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import SearchIcon from '../assets/svgs/SearchIcon';
import Header from '../components/Header';
import GoalCard from '../components/GoalCard';
import { GOAL_CATEGORIES } from '../components/CategoryModal';
import type { GoalCategory } from '../components/CategoryModal';
import { PREMADE_GOALS, type PreMadeGoalItem } from '../data/preMadeGoals';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigations/RootNavigation';
import Textt from '../components/Textt';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'PreMadeGoals'>;

/** "Popular" shows all goals; other options are from CategoryModal */
const FILTER_OPTIONS: (GoalCategory | 'Popular')[] = ['Popular', ...GOAL_CATEGORIES];

const PreMadeGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'Popular'>('Popular');

  const filteredGoals = useMemo(() => {
    if (selectedCategory === 'Popular') {
      return PREMADE_GOALS;
    }
    return PREMADE_GOALS.filter((g) => g.category === selectedCategory);
  }, [selectedCategory]);

  const handleGoalPress = (goal: PreMadeGoalItem) => {
    navigation.navigate('PreMadeGoalDetail', { goalId: goal.id });
  };

  const handleAddGoal = (goal: PreMadeGoalItem, e: any) => {
    e?.stopPropagation?.();
    navigation.navigate('PreMadeGoalDetail', { goalId: goal.id });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Part 1: Header – back, title, search */}
      <Header
        leftIcon={<BackArrowIcon width={28} height={28} />}
        onLeftPress={() => navigation.goBack()}
        title={<Textt i18nKey="preMadeGoals" style={styles.headerTitle} />}
        rightIcon={<SearchIcon width={28} height={28} />}
        style={styles.header}
      />

      {/* Part 2: Slideable category row – Popular + all categories from CategoryModal */}
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

      {/* Part 3: Pre-made goals list */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            coverSource={goal.coverImage}
            title={goal.title}
            habitsCount={goal.habitsCount}
            tasksCount={goal.tasksCount}
            userCount={goal.userCount}
            onPress={() => handleGoalPress(goal)}
            onAddPress={(e) => handleAddGoal(goal, e)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default PreMadeGoalsScreen;

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
    color: lightColors.text,
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
});
