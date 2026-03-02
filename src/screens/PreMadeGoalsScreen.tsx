import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import SearchIcon from '../assets/svgs/SearchIcon';
import AddIcon from '../assets/svgs/AddIcon';
import Header from '../components/Header';
import { GOAL_CATEGORIES } from '../components/CategoryModal';
import type { GoalCategory } from '../components/CategoryModal';
import { PREMADE_GOALS, type PreMadeGoalItem } from '../data/preMadeGoals';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigations/RootNavigation';
import Textt from '../components/Textt';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'PreMadeGoals'>;

/** "Popular" shows all goals; other options are from CategoryModal */
const FILTER_OPTIONS: (GoalCategory | 'Popular')[] = ['Popular', ...GOAL_CATEGORIES];

const CARD_IMAGE_SIZE = 96;

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
        leftIcon={<BackArrowIcon width={24} height={24} />}
        onLeftPress={() => navigation.navigate('HomeScreen')}
        title={<Textt i18nKey="preMadeGoals" style={styles.headerTitle} />}
        rightIcon={<SearchIcon width={24} height={24} />}
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
          <TouchableOpacity
            key={goal.id}
            style={styles.goalCard}
            onPress={() => handleGoalPress(goal)}
            activeOpacity={0.7}
          >
            <Image source={goal.coverImage} style={styles.goalCardImage} resizeMode="cover" />
            <View style={styles.goalCardBody}>
              <Text style={styles.goalCardTitle} numberOfLines={2}>
                {goal.title}
              </Text>
              <View style={styles.tagsRow}>
                <View style={[styles.tag, styles.habitTag]}>
                  <Text style={styles.tagText1}>Habits {goal.habitsCount}</Text>
                </View>
                <View style={[styles.tag, styles.taskTag]}>
                  <Text style={styles.tagText2}>Tasks {goal.tasksCount}</Text>
                </View>
              </View>
              <View style={styles.userCountRow}>
                <Ionicons name="people-outline" size={14} color={lightColors.subText} />
                <Text style={styles.userCount}>{goal.userCount}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={(e) => handleAddGoal(goal, e)}
              activeOpacity={0.8}
            >
              <AddIcon width={20} height={20} />
            </TouchableOpacity>
          </TouchableOpacity>
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
    paddingHorizontal: 4,
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
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  habitTag: {
    borderWidth: 1,
    borderColor: lightColors.habitIndicator,
    
  },
  taskTag: {
    borderWidth: 1,
    borderBlockColor: lightColors.taskIndicator,
    
  },
  tagText1: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 10,
    color: lightColors.habitIndicator,
  },
  tagText2: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 10,
    color: lightColors.taskIndicator,
  },
  userCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userCount: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.skipbg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
