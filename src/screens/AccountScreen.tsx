import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import TimezoneSetting from '../assets/svgs/TimezoneSetting';
import LogoutModal from '../components/LogoutModal';
import { useAuth } from '../lib/auth/AuthProvider';
import { showOverflowMenu } from '../utils/showOverflowMenu';
import { useGoals } from '../context/GoalsContext';
import { supabase } from '../lib/supabase/client';
import { getTimezoneLabel } from '../data/timezones';
import * as Localization from 'expo-localization';

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
  const { goals, itemCompletions } = useGoals();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [currentTimezone, setCurrentTimezone] = useState<string | null>(null);

  const profileName = displayNameFromUser(user);
  const profileEmail = user?.email ?? '';

  // Fetch and set user's timezone
  const fetchTimezone = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[Timezone] Error fetching timezone:', error);
        // Set device timezone as default
        let deviceTimezone = 'UTC';
        try {
          const locales = Localization.getLocales();
          if (locales && locales[0] && locales[0].timeZone) {
            deviceTimezone = locales[0].timeZone;
          } else {
            const calendars = Localization.getCalendars();
            if (calendars && calendars[0] && calendars[0].timeZone) {
              deviceTimezone = calendars[0].timeZone;
            }
          }
        } catch (e) {
          console.warn('[Timezone] Could not detect device timezone');
        }
        setCurrentTimezone(deviceTimezone);
        return;
      }

      // Use saved timezone or detect device timezone
      let timezone = data?.timezone;
      if (!timezone) {
        try {
          const locales = Localization.getLocales();
          if (locales && locales[0] && locales[0].timeZone) {
            timezone = locales[0].timeZone;
          } else {
            const calendars = Localization.getCalendars();
            if (calendars && calendars[0] && calendars[0].timeZone) {
              timezone = calendars[0].timeZone;
            } else {
              timezone = 'UTC';
            }
          }
        } catch (e) {
          timezone = 'UTC';
        }
      }
      
      console.log('[AccountScreen] Current timezone:', timezone);
      setCurrentTimezone(timezone);
    } catch (error) {
      console.error('[Timezone] Error:', error);
      setCurrentTimezone('UTC');
    }
  }, [user?.id]);

  // Fetch timezone on mount
  useEffect(() => {
    fetchTimezone();
  }, [fetchTimezone]);

  // Refresh timezone when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTimezone();
    }, [fetchTimezone])
  );
  
  // Calculate actual stats from goals
  const profileStats = useMemo(() => {
    const goalsAchieved = goals.filter(goal => goal.achieved).length;
    
    // Count total unique habits across all goals
    const allHabits = goals.flatMap(goal => 
      (goal.items ?? []).filter(item => item.type === 'habit')
    );
    const habitsFormed = allHabits.length;
    
    // Count total completed tasks (tasks that have been checked off at least once)
    const allTasks = goals.flatMap(goal => 
      (goal.items ?? []).filter(item => item.type === 'task')
    );
    const tasksFinished = allTasks.filter(task => {
      const completions = itemCompletions[task.id] ?? [];
      return completions.length > 0;
    }).length;
    
    return {
      goalsAchieved,
      habitsFormed,
      tasksFinished,
    };
  }, [goals, itemCompletions]);

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

  const handleHeaderMenuPress = () => {
    showOverflowMenu({
      title: t('account'),
      items: [
        { label: t('helpSupport'), onPress: () => navigation.navigate('HelpSupportScreen') },
        { label: t('logout'), onPress: () => setLogoutModalVisible(true), destructive: true },
      ],
    });
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
      icon: <TimezoneSetting width={24} height={24} color={lightColors.smallText} />,
      label: t('timeZone'),
      subtitle: currentTimezone ? getTimezoneLabel(currentTimezone) : t('currentTimezone'),
      onPress: () => navigation.navigate('TimeZoneScreen'),
    },
    // {
    //   icon: <EyeSetting width={24} height={24} color={lightColors.smallText} />,
    //   label: t('appAppearance'),
    //   onPress: () => navigation.navigate('AppAppearanceScreen'),
    // },
    // {
    //   icon: <ActivitySetting width={24} height={24} color={lightColors.smallText} />,
    //   label: t('dataAnalytics'),
    //   onPress: () => navigation.navigate('DataAnalyticsScreen'),
    // },
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
      <ScreenHeader title={t('account')} onMenuPress={handleHeaderMenuPress} />

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
