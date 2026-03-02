import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import SettingsListItem from '../components/SettingsListItem';
import { RootStackParamList } from '../navigations/RootNavigation';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'HelpSupportScreen'>;

const HelpSupportScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();

  const items = [
    { key: 'faq', label: t('helpFaq') },
    { key: 'contactSupport', label: t('helpContactSupport') },
    { key: 'privacyPolicy', label: t('helpPrivacyPolicy') },
    { key: 'termsOfService', label: t('helpTermsOfService') },
    { key: 'partner', label: t('helpPartner') },
    { key: 'jobVacancy', label: t('helpJobVacancy') },
    { key: 'accessibility', label: t('helpAccessibility') },
    { key: 'feedback', label: t('helpFeedback') },
    { key: 'aboutUs', label: t('helpAboutUs') },
    { key: 'rateUs', label: t('helpRateUs') },
    { key: 'visitWebsite', label: t('helpVisitWebsite') },
    { key: 'followSocial', label: t('helpFollowSocial') },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('helpSupport')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {items.map((item) => (
            <SettingsListItem
              key={item.key}
              label={item.label}
              onPress={() => {
                if (item.key === 'faq') {
                  navigation.navigate('FAQScreen');
                } else if (item.key === 'contactSupport') {
                  navigation.navigate('ContactSupportScreen');
                } else if (item.key === 'privacyPolicy') {
                  navigation.navigate('PrivacyPolicyScreen');
                } else if (item.key === 'termsOfService') {
                  navigation.navigate('TermsOfServiceScreen');
                }
              }}
              showArrow
            />
          ))}
        </View>
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
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default HelpSupportScreen;
