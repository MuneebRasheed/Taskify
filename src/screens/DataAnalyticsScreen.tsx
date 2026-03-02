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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'DataAnalyticsScreen'>;

const DataAnalyticsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('dataAnalytics')}
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
          <SettingsListItem
            label={t('dataUsage')}
            subtitle={t('dataUsageSubtitle')}
            onPress={() => {}}
            showArrow={true}
          />
          <SettingsListItem
            label={t('adPreferences')}
            subtitle={t('adPreferencesSubtitle')}
            onPress={() => {}}
            showArrow={true}
          />
          <SettingsListItem
            label={t('downloadMyData')}
            subtitle={t('downloadMyDataSubtitle')}
            onPress={() => {}}
            showArrow={true}
          />
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default DataAnalyticsScreen;
