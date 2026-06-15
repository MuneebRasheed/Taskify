import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import SettingsListItem from '../components/SettingsListItem';
import { RootStackParamList } from '../navigations/RootNavigation';
import { API_BASE_URL } from '../lib/api/config';
import { useAuth } from '../lib/auth/AuthProvider';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'AccountSecurityScreen'>;

const AccountSecurityScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const { session, signOut } = useAuth();

  const [biometric, setBiometric] = useState(false);
  const [faceId, setFaceId] = useState(false);
  const [smsAuth, setSmsAuth] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = async () => {
    if (isDeleting) return;
    if (!session?.access_token) {
      Alert.alert(t('deleteAccount'), t('deleteAccountAuthRequired'));
      return;
    }

    setIsDeleting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      };
      if (API_BASE_URL.includes('ngrok')) {
        headers['ngrok-skip-browser-warning'] = '1';
      }

      const response = await fetch(`${API_BASE_URL}/auth/delete-user`, {
        method: 'POST',
        headers,
      });

      const responseText = await response.text();
      let parsed: { success?: boolean; error?: string } | null = null;
      if (responseText) {
        try {
          parsed = JSON.parse(responseText) as { success?: boolean; error?: string };
        } catch {
          parsed = null;
        }
      }

      if (!response.ok || !parsed?.success) {
        Alert.alert(t('deleteAccount'), parsed?.error ?? t('deleteAccountFailed'));
        return;
      }

      await signOut();
      navigation.reset({ index: 0, routes: [{ name: 'WelcomeScreen' }] });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('deleteAccountFailed');
      Alert.alert(t('deleteAccount'), message);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(t('deleteAccountConfirmTitle'), t('deleteAccountConfirmMessage'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => void deleteAccount() },
    ]);
  };

  const toggleRow = (label: string, value: boolean, onValueChange: (v: boolean) => void) => (
    <View style={styles.toggleRow} key={label}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: lightColors.border, true: lightColors.accent }}
        thumbColor={lightColors.secondaryBackground}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('accountSecurity')}
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
          {/* {toggleRow(t('biometricId'), biometric, setBiometric)}
          {toggleRow(t('faceId'), faceId, setFaceId)}
          {toggleRow(t('smsAuthenticator'), smsAuth, setSmsAuth)}
          {toggleRow(t('googleAuthenticator'), googleAuth, setGoogleAuth)} */}
          <SettingsListItem
            label={t('changePassword')}
            onPress={() => navigation.navigate('ChangePasswordScreen')}
            showArrow={true}
          />
          {/* <SettingsListItem
            label={t('deviceManagement')}
            subtitle={t('deviceManagementSubtitle')}
            onPress={() => {}}
            showArrow={true}
          />
          <SettingsListItem
            label={t('deactivateAccount')}
            subtitle={t('deactivateAccountSubtitle')}
            onPress={() => {}}
            showArrow={true}
          /> */}
          <SettingsListItem
            label={t('deleteAccount')}
            subtitle={t('deleteAccountSubtitle')}
            onPress={confirmDeleteAccount}
            accent={true}
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  toggleLabel: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 18,
    color: lightColors.text,
  },
});

export default AccountSecurityScreen;
