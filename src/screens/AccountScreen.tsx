import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '../../utils/colors';
import { useTranslation } from '../i18n';
import ScreenHeader from '../components/ScreenHeader';
import UpgradePlanBanner from '../components/UpgradePlanBanner';
import UserProfileCard from '../components/UserProfileCard';
import AccountSettingsCard from '../components/AccountSettingsCard';
import StarSetting from '../assets/svgs/StarSetting';
import PaperSetting from '../assets/svgs/PaperSetting';
import EyeSetting from '../assets/svgs/EyeSetting';
import LogoutIcon from '../assets/svgs/LogoutIcon';
import ShieldSetting from '../assets/svgs/ShieldSetting';
import ActivitySetting from '../assets/svgs/ActivitySetting';

const AccountScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleUpgrade = () => {
    // Navigate or open upgrade flow
  };

  const handleProfile = () => {
    // Navigate to profile edit
  };

  const settingsItems = [
    {
      icon: <StarSetting width={22} height={22} color={lightColors.smallText} />,
      label: t('billingSubscriptions'),
      onPress: () => {},
    },
    {
      icon: <ShieldSetting width={22} height={22} color={lightColors.smallText} />,
      label: t('accountSecurity'),
      onPress: () => {},
    },
    {
      icon: <EyeSetting width={22} height={22} color={lightColors.smallText} />,
      label: t('appAppearance'),
      onPress: () => {},
    },
    {
      icon: <ActivitySetting width={22} height={22} color={lightColors.smallText} />,
      label: t('dataAnalytics'),
      onPress: () => {},
    },
    {
      icon: <PaperSetting width={22} height={22} color={lightColors.smallText} />,
      label: t('helpSupport'),
      onPress: () => {},
    },
    {
      icon: <LogoutIcon width={22} height={20} />,
      label: t('logout'),
      onPress: () => {},
      accent: true,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('account')} onMenuPress={() => {}} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <UpgradePlanBanner
          title={t('upgradePlanNow')}
          subtitle={t('upgradePlanSubtitle')}
          onPress={handleUpgrade}
        />

        <UserProfileCard
          name="Andrew Ainsley"
          email="andrew.ainsley@yourdomain.com"
          stats={{
            goalsAchieved: 25,
            habitsFormed: 104,
            tasksFinished: 126,
          }}
          onPress={handleProfile}
        />

        <AccountSettingsCard items={settingsItems} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

export default AccountScreen;
