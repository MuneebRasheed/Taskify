import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { useTranslation } from '../i18n';
import { RootStackParamList } from '../navigations/RootNavigation';
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
import LogoutModal from '../components/LogoutModal';

const AccountScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleUpgrade = () => {
    navigation.navigate('UpgradePlanScreen');
  };

  const handleProfile = () => {
    // Navigate to profile edit
  };

  const settingsItems = [
    {
      icon: <StarSetting width={24} height={24} color={lightColors.smallText} />,
      label: t('billingSubscriptions'),
      onPress: handleUpgrade,
    },
    {
      icon: <ShieldSetting width={24} height={24} color={lightColors.smallText} />,
      label: t('accountSecurity'),
      onPress: () => navigation.navigate('AccountSecurityScreen'),
    },
    {
      icon: <EyeSetting width={24} height={24} color={lightColors.smallText} />,
      label: t('appAppearance'),
      onPress: () => navigation.navigate('AppAppearanceScreen'),
    },
    {
      icon: <ActivitySetting width={24} height={24} color={lightColors.smallText} />,
      label: t('dataAnalytics'),
      onPress: () => navigation.navigate('DataAnalyticsScreen'),
    },
    {
      icon: <PaperSetting width={24} height={24} color={lightColors.smallText} />,
      label: t('helpSupport'),
      onPress: () => navigation.navigate('HelpSupportScreen'),
    },
    {
      icon: <LogoutIcon width={24} height={24} />,
      label: t('logout'),
      onPress: () => setLogoutModalVisible(true),
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

      <LogoutModal
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={() => {
          setLogoutModalVisible(false);
          // TODO: perform logout (e.g. clear auth, navigate to SignIn)
        }}
      />
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
