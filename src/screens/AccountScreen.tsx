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
import { useAuth } from '../lib/auth/AuthProvider';

function displayNameFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> } | null): string {
  if (!user) return '';
  const meta = user.user_metadata;
  const fromMeta = (meta?.full_name as string) || (meta?.name as string);
  if (fromMeta) return fromMeta;
  if (user.email) return user.email.split('@')[0];
  return 'User';
}

const AccountScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const profileName = displayNameFromUser(user);
  const profileEmail = user?.email ?? '';
  const profileStats = {
    goalsAchieved: 0,
    habitsFormed: 0,
    tasksFinished: 0,
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    const { error } = await signOut();
    if (error) {
      alert(error.message ?? t('logout') + ' failed');
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'WelcomeScreen' }] });
  };

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
          name={profileName}
          email={profileEmail}
          avatarUri={user?.user_metadata?.avatar_url as string | undefined ?? undefined}
          stats={profileStats}
          onPress={handleProfile}
        />

        <AccountSettingsCard items={settingsItems} />
      </ScrollView>

      <LogoutModal
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
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
