import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import BackHeader from '../components/BackHeader';
import ArrowDown from '../assets/svgs/ArrowDown';
import ArrowUpward from '../assets/svgs/ArrowUpward';
import { RootStackParamList } from '../navigations/RootNavigation';
import { useTranslation } from '../i18n';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'FAQScreen'>;

export type FaqItem = {
  id: string;
  questionKey: string;
  answerKey: string;
  category: 'general' | 'account' | 'services' | 'goals';
};

const FAQScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'general' | 'account' | 'services' | 'goals'>('general');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories: { key: 'general' | 'account' | 'services' | 'goals'; labelKey: string }[] = [
    { key: 'general', labelKey: 'faqCategoryGeneral' },
    { key: 'account', labelKey: 'faqCategoryAccount' },
    { key: 'services', labelKey: 'faqCategoryServices' },
    { key: 'goals', labelKey: 'faqCategoryGoals' },
  ];

  const faqItems: FaqItem[] = useMemo(
    () => [
      { id: 'faq1', questionKey: 'faqWhatIsTaskify', answerKey: 'faqWhatIsTaskifyAnswer', category: 'general' },
      { id: 'faq2', questionKey: 'faqHowDoesTaskifyWork', answerKey: 'faqHowDoesTaskifyWorkAnswer', category: 'general' },
      { id: 'faq3', questionKey: 'faqIsTaskifyFree', answerKey: 'faqIsTaskifyFreeAnswer', category: 'general' },
      { id: 'faq4', questionKey: 'faqMultipleGoals', answerKey: 'faqMultipleGoalsAnswer', category: 'goals' },
      { id: 'faq5', questionKey: 'faqDataSecure', answerKey: 'faqDataSecureAnswer', category: 'account' },
      { id: 'faq6', questionKey: 'faqExportData', answerKey: 'faqExportDataAnswer', category: 'account' },
    ],
    [],
  );

  const filteredItems = useMemo(() => {
    const byCategory = faqItems.filter((item) => item.category === activeCategory);
    if (!search.trim()) return byCategory;
    const q = search.toLowerCase().trim();
    return byCategory.filter(
      (item) =>
        t(item.questionKey).toLowerCase().includes(q) ||
        t(item.answerKey).toLowerCase().includes(q),
    );
  }, [faqItems, activeCategory, search, t]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('helpFaq')}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchWrapper}>
        <Feather name="search" size={20} color={lightColors.placeholderText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('faqSearchPlaceholder')}
          placeholderTextColor={lightColors.placeholderText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

     <View>
     <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContent}
        style={styles.categoriesContainer}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {t(cat.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
     </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.faqCard}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
              activeOpacity={0.9}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion} numberOfLines={isExpanded ? 10 : 2}>
                  {t(item.questionKey)}
                </Text>
                {isExpanded ? (
                  <ArrowUpward width={24} height={24} color={lightColors.smallText} />
                ) : (
                  <ArrowDown width={24} height={24} color={lightColors.smallText} />
                )}
              </View>
              {isExpanded && (
                <Text style={styles.faqAnswer}>{t(item.answerKey)}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.BtnBackground,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.secondaryBackground  ,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.smallText,
    paddingVertical: 12,
  },
  categoriesContainer: {

  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height:50
  },
  categoryPill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: lightColors.secondaryBackground,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPillActive: {
    backgroundColor: lightColors.accent,
  },
  categoryLabel: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 14,
    color: lightColors.smallText,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  faqCard: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.smallText,
    marginRight: 8,
  },
  faqAnswer: {
    marginTop: 12,
    fontFamily: fontFamilies.urbanist,
    fontSize: 15,
    color: lightColors.subText,
    lineHeight: 22,
  },
});

export default FAQScreen;
