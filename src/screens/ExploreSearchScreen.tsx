import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import GoalCard from '../components/GoalCard';
import { GOAL_CATEGORIES } from '../components/CategoryModal';
import type { GoalCategory } from '../components/CategoryModal';
import type { PreMadeGoalItem } from '../data/preMadeGoals';
import type { RootStackParamList } from '../navigations/RootNavigation';
import { useTranslation } from '../i18n';
import { useGoals } from '../context/GoalsContext';
import { usePreMadeGoals } from '../hooks/usePreMadeGoals';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ExploreSearch'>;
type ExploreSearchRouteProp = RouteProp<RootStackParamList, 'ExploreSearch'>;

const FILTER_OPTIONS: (GoalCategory | 'Popular')[] = ['Popular', ...GOAL_CATEGORIES];

const DEFAULT_RECENT_SEARCHES = [
  'Backpack Across Countries',
  'Complete Online Courses',
  'Volunteer Regularly',
];

const ExploreSearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ExploreSearchRouteProp>();
  const { goals } = useGoals();
  const { preMadeGoals } = usePreMadeGoals();
  const { t } = useTranslation();
  const fromPreMade = route.params?.fromPreMade === true;
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(DEFAULT_RECENT_SEARCHES);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'Popular'>('Popular');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const addedPreMadeTitles = useMemo(
    () => new Set(goals.filter((g) => g.source === 'preMade' && !g.achieved).map((g) => g.title)),
    [goals]
  );

  const popularGoalsPreview = useMemo(() => preMadeGoals.slice(0, 2), [preMadeGoals]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return preMadeGoals;
    const q = query.trim().toLowerCase();
    return preMadeGoals.filter(
      (g) =>
        g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );
  }, [preMadeGoals, query]);

  const filteredResults = useMemo(() => {
    if (selectedCategory === 'Popular') return searchResults;
    return searchResults.filter((g) => g.category === selectedCategory);
  }, [searchResults, selectedCategory]);

  const hasQuery = query.trim().length > 0;
  const showNoResults = hasQuery && filteredResults.length === 0;

  // Add a small scroll buffer when keyboard is open (not full keyboard height).
  // This keeps the keyboard visible while still letting the user scroll content.
  const keyboardScrollBuffer = keyboardHeight ? Math.min(keyboardHeight * 0.35 + 16, 140) : 0;
  const scrollBottomPadding = insets.bottom;

  const handleGoalPress = (goal: PreMadeGoalItem) => {
    navigation.navigate('PreMadeGoalDetail', { goalId: goal.id });
  };

  const handleAddGoal = (goal: PreMadeGoalItem, e: any) => {
    e?.stopPropagation?.();
    navigation.navigate('PreMadeGoalDetail', { goalId: goal.id });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.inner, { paddingTop: insets.top }]}>
        {/* Header: back + search input */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackArrowIcon width={24} height={24} />
          </TouchableOpacity>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={20} color={lightColors.placeholderText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchGoals')}
              placeholderTextColor={lightColors.placeholderText}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={20} color={lightColors.placeholderText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Initial state: banner (hidden when from pre-made goals), recent searches, popular goals */}
        {!hasQuery && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={false}
            contentInsetAdjustmentBehavior="never"
          >
            {!fromPreMade && (
              <Image
                source={require('../assets/images/ExploreCard.png')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{t('recentSearches')}</Text>
                {recentSearches.length > 0 && (
                  <TouchableOpacity onPress={() => setRecentSearches([])} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={20} color={lightColors.text} />
                  </TouchableOpacity>
                )}
              </View>
              {recentSearches.map((item) => (
                <View key={item} style={styles.recentItem}>
                  <Text style={styles.recentText}>{item}</Text>
                  <TouchableOpacity onPress={() => setRecentSearches((p) => p.filter((s) => s !== item))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={18} color={lightColors.subText} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Popular Goals</Text>
                <TouchableOpacity onPress={() => navigation.navigate('PreMadeGoals')} style={styles.viewAllBtn}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="chevron-forward" size={18} color={lightColors.background} />
                </TouchableOpacity>
              </View>
              {popularGoalsPreview.map((goal) => {
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
            </View>
          </ScrollView>
        )}

        {/* No results */}
        {showNoResults && (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIllustration}>
              <Image source={require('../assets/images/Goal.png')} style={styles.emptyIllustration} />
            </View>
            <Text style={styles.emptyTitle}>{t('noGoalsFound')}</Text>
            <Text style={styles.emptyDescription}>
              {t('pleaseTrySearchingUsingAlternativeKeywords')}
            </Text>
          </View>
        )}

        {/* Search results: category chips + list */}
        {hasQuery && !showNoResults && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesWrap}
              style={styles.categoriesScroll}
              bounces={false}
              keyboardShouldPersistTaps="handled"
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
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={[styles.listContent, { paddingBottom: scrollBottomPadding }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={false}
              contentInsetAdjustmentBehavior="never"
            >
              {filteredResults.map((goal) => {
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
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ExploreSearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
  },
  inner: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: lightColors.secondaryBackground,
  },
  backBtn: {
    padding: 4,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.text,
    paddingVertical: 10,
  },
  clearBtn: {
    padding: 4,
  },
  bannerImage: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: lightColors.inputBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 18,
    color: lightColors.text,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  recentText: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.subText,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 14,
    color: lightColors.background,
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
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 160,
    height: 160,
    marginBottom: 32,
    position: 'relative',
  },
  // clipboard: {
  //   position: 'absolute',
  //   width: 70,
  //   height: 90,
  //   backgroundColor: lightColors.secondaryBackground,
  //   borderRadius: 8,
  //   borderWidth: 1,
  //   borderColor: lightColors.border,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.08,
  //   shadowRadius: 4,
  //   elevation: 2,
  // },
  // clipboardSecond: {
  //   left: 28,
  //   top: 8,
  // },
  // clip: {
  //   position: 'absolute',
  //   width: 24,
  //   height: 14,
  //   backgroundColor: lightColors.background,
  //   borderRadius: 4,
  //   top: -4,
  //   left: 23,
  // },
  // clipSecond: {
  //   left: 51,
  //   top: 4,
  // },
  emptyTitle: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 24,
    color: lightColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    color: lightColors.subText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
