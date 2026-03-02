import React, { useState } from 'react';
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
import { useTranslation } from '../i18n';
type SelectCoverRouteProp = RouteProp<RootStackParamList, 'SelectCoverImage'>;
type SelectCoverNavProp = NativeStackNavigationProp<RootStackParamList, 'SelectCoverImage'>;

export const COVER_IMAGE_SOURCES: ImageSourcePropType[] = [
  require('../assets/images/cover1.png'),
  require('../assets/images/cover2.png'),
  require('../assets/images/cover3.png'),
  require('../assets/images/cover4.png'),
];

const SelectCoverImageScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SelectCoverNavProp>();
  const route = useRoute<SelectCoverRouteProp>();
  const initialIndex = route.params?.selectedIndex ?? 0;
  const { t } = useTranslation();

  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);

  const handleCancel = () => {
    navigation.goBack();
  };

  const returnToAiMade = route.params?.returnToScreen === 'AiMade';
  const prompt = route.params?.prompt ?? '';

  const handleOK = () => {
    if (returnToAiMade) {
      navigation.navigate('AiMade', {
        source: 'selfMade',
        prompt,
        selectedCoverIndex: selectedIndex,
      });
    } else {
      navigation.navigate('GoalPlanner', { selectedCoverIndex: selectedIndex });
    }
  };

  const numColumns = 2;
  const list = COVER_IMAGE_SOURCES.length ? COVER_IMAGE_SOURCES : [];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: lightColors.secondaryBackground },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.iconBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <CrossIcon width={28} height={28} />
        </TouchableOpacity>
        <Textt i18nKey="selectCoverImage" style={styles.title} />
        <TouchableOpacity style={styles.iconBtn}>
          <SearchIcon width={28} height={28} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.gridWrap}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <View style={styles.placeholderWrap}>
            <Text style={styles.placeholderText}>Add images to COVER_IMAGE_SOURCES in SelectCoverImageScreen.tsx (see comments in file).</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
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
