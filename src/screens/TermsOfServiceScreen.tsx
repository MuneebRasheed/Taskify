import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import { RootStackParamList } from '../navigations/RootNavigation';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'TermsOfServiceScreen'>;

const TermsOfServiceScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('helpTermsOfService')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.effectiveDate}>
          {t('termsOfServiceEffectiveDate')}
        </Text>

        <Text style={styles.paragraph}>
          {t('termsOfServiceIntro')}
        </Text>

        <Text style={styles.sectionTitle}>
          {t('termsOfServiceSection1Title')}
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>{t('termsOfServiceSection1Item1')}</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>{t('termsOfServiceSection1Item2')}</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>{t('termsOfServiceSection1Item3')}</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>{t('termsOfServiceSection1Item4')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {t('termsOfServiceSection2Title')}
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>{t('termsOfServiceSection2Item1')}</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>{t('termsOfServiceSection2Item2')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {t('termsOfServiceSection3Title')}
        </Text>
        <Text style={styles.paragraph}>
          {t('termsOfServiceSection3Content')}
        </Text>

        <Text style={styles.sectionTitle}>
          {t('termsOfServiceSection4Title')}
        </Text>
        <Text style={styles.paragraph}>
          {t('termsOfServiceSection4Content')}
        </Text>

        <Text style={styles.sectionTitle}>
          {t('termsOfServiceSection5Title')}
        </Text>
        <Text style={styles.paragraph}>
          {t('termsOfServiceSection5Content')}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.BtnBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  effectiveDate: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 14,
    color: lightColors.smallText,
    marginBottom: 16,
  },
  paragraph: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 15,
    color: lightColors.smallText,
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 16,
    color: lightColors.smallText,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletDot: {
    width: 5,
    height: 5,
    backgroundColor: lightColors.smallText,
    borderRadius: 100,
    marginTop: 8,
    marginRight: 8,
  },
  bulletItem: {
    flex: 1,
    fontFamily: fontFamilies.urbanist,
    fontSize: 15,
    color: lightColors.smallText,
    lineHeight: 22,
  },
});

export default TermsOfServiceScreen;
