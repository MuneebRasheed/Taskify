import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import SettingsListItem from '../components/SettingsListItem';
import { RootStackParamList } from '../navigations/RootNavigation';
import HeadPhone from '../assets/svgs/HeadPhone';
import WorldIcon from '../assets/svgs/WorldIcon';
import Xtwitter from '../assets/svgs/Xtwitter';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ContactSupportScreen'>;

const ContactSupportScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const iconColor = lightColors.accent;

  const openUrl = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
    });
  };

  const items = [
    {
      key: 'customerSupport',
      label: t('contactCustomerSupport'),
      icon: <HeadPhone width={22} height={22} color={iconColor} />,
      onPress: () => {
        // Replace with your support URL or mailto
        openUrl('mailto:support@taskify.app');
      },
    },
    {
      key: 'website',
      label: t('contactWebsite'),
      icon: <WorldIcon width={22} height={22} color={iconColor} />,
      onPress: () => openUrl('https://taskify.app'),
    },
    {
      key: 'xtwitter',
      label: t('contactXTwitter'),
      icon: <Xtwitter width={22} height={22} color={iconColor} />,
      onPress: () => openUrl('https://x.com/taskify'),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('helpContactSupport')}
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
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
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

export default ContactSupportScreen;
