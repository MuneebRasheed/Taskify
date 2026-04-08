import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from '../components/Button';
import CrossIcon from '../assets/svgs/CrossIcon';
import CheckIcon from '../assets/svgs/CheckIcon';
import SearchIcon from '../assets/svgs/SearchIcon';
import Textt from '../components/Textt';
import Header from '../components/Header';
import { useTranslation } from '../i18n';
import { useGoalStore } from '../../store/goalStore';

type SelectCoverRouteProp = RouteProp<RootStackParamList, 'SelectCoverImage'>;
type SelectCoverNavProp = NativeStackNavigationProp<RootStackParamList, 'SelectCoverImage'>;

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const COVER_BUCKET = 'covers';
const DEFAULT_COVER_FILE_NAMES = [
  'cover1.png',
  'cover2.png',
  'cover3.png',
  'cover4.png',
  'cover5.png',
  'cover6.png',
  'cover7.png',
];

// Shared sources used by SelectCoverImage + GoalPlanner + Final + MyGoalDetail
// to keep cover indexes consistent across all screens.
export const COVER_IMAGE_SOURCES: ImageSourcePropType[] = SUPABASE_URL
  ? DEFAULT_COVER_FILE_NAMES.map((fileName) => ({
      uri: `${SUPABASE_URL}/storage/v1/object/public/${COVER_BUCKET}/${encodeURIComponent(fileName)}`,
    }))
  : [];

const SelectCoverImageScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SelectCoverNavProp>();
  const route = useRoute<SelectCoverRouteProp>();
  const storeCoverIndex = useGoalStore((s) => s.selectedCoverIndex);
  const setSelectedCoverIndex = useGoalStore((s) => s.setSelectedCoverIndex);
  const initialIndex = route.params?.selectedIndex ?? storeCoverIndex;
  const { t } = useTranslation();

  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  const [coverSources] = useState<ImageSourcePropType[]>(COVER_IMAGE_SOURCES);

  useEffect(() => {
    setSelectedIndex(route.params?.selectedIndex ?? storeCoverIndex);
  }, [route.params?.selectedIndex, storeCoverIndex]);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleOK = () => {
    setSelectedCoverIndex(selectedIndex);
    route.params?.onCoverSelected?.(selectedIndex);
    navigation.goBack();
  };

  const list = Array.isArray(coverSources) ? coverSources : [];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: lightColors.secondaryBackground },
      ]}
    >
      <Header
        leftIcon={<CrossIcon width={28} height={28} />}
        onLeftPress={handleCancel}
        title={<Textt i18nKey="selectCoverImage" style={styles.headerTitle} />}
        rightIcon={<SearchIcon width={28} height={28} />}
        style={styles.header}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.gridWrap}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <View style={styles.placeholderWrap}>
            <Text style={styles.placeholderText}>
              No cover images found. Check EXPO_PUBLIC_SUPABASE_URL and files in Storage bucket "covers".
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {list.map((source, index) => {
              const isSelected = selectedIndex === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => setSelectedIndex(index)}
                  activeOpacity={0.8}
                >
                  <Image source={source} style={styles.cardImage} resizeMode="cover" />
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <CheckIcon width={14} height={10} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t("cancel")}
          variant="outline"
          onPress={handleCancel}
          style={styles.cancelBtn}
          borderWidth={0}
          backgroundColor={lightColors.skipbg}
          textColor={lightColors.accent}
        />
        <Button
          title={t("ok")}
          variant="primary"
          onPress={handleOK}
          style={styles.okBtn}
          backgroundColor={lightColors.accent}
          textColor={lightColors.secondaryBackground}
        />
      </View>
    </View>
  );
};

export default SelectCoverImageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
  },
  searchIcon: {
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  gridWrap: {
    padding: 16,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: lightColors.inputBackground,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    borderColor: lightColors.accent,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: lightColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderWrap: {
    padding: 24,
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: lightColors.subText,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 100,
  },
  okBtn: {
    flex: 1,
    borderRadius: 100,
  },
});
