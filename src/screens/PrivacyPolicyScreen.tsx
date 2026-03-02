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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'PrivacyPolicyScreen'>;

const PrivacyPolicyScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('helpPrivacyPolicy')}
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
          {t('privacyPolicyEffectiveDate')}
        </Text>

        <Text style={styles.paragraph}>
          {t('privacyPolicyIntro')}
        </Text>

        <Text style={styles.sectionTitle}>
          {t('privacyPolicySection1Title')}
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicyRegInfo')}</Text>
              {' '}{t('privacyPolicyRegInfoDetail')}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicyUsageInfo')}</Text>
              {' '}{t('privacyPolicyUsageInfoDetail')}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicyDeviceInfo')}</Text>
              {' '}{t('privacyPolicyDeviceInfoDetail')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {t('privacyPolicySection2Title')}
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicyProvideImprove')}</Text>
              {' '}{t('privacyPolicyProvideImproveDetail')}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicyPersonalization')}</Text>
              {' '}{t('privacyPolicyPersonalizationDetail')}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicyCommunications')}</Text>
              {' '}{t('privacyPolicyCommunicationsDetail')}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicySecurity')}</Text>
              {' '}{t('privacyPolicySecurityDetail')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {t('privacyPolicySection3Title')}
        </Text>
        <Text style={styles.paragraph}>
          {t('privacyPolicyDisclosureIntro')}
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicyServiceProviders')}</Text>
              {' '}{t('privacyPolicyServiceProvidersDetail')}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletItem}>
              <Text style={styles.bulletLabel}>{t('privacyPolicyLegal')}</Text>
              {' '}{t('privacyPolicyLegalDetail')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {t('privacyPolicySection4Title')}
        </Text>
        <Text style={styles.paragraph}>
          {t('privacyPolicyDataSecurity')}
        </Text>

        <Text style={styles.sectionTitle}>
          {t('privacyPolicySection5Title')}
        </Text>
        <Text style={styles.paragraph}>
          {t('privacyPolicyContactUs')}
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
  bulletLabel: {
    fontFamily: fontFamilies.urbanistBold,
  },
});

export default PrivacyPolicyScreen;
