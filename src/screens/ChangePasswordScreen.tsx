import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import PasswordIcon from '../assets/svgs/PasswordIcon';
import InputField from '../components/Login';
import Button from '../components/Button';
import LoadingModal from '../components/LoadingModal';
import type { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { useTranslation } from '../i18n';
import { changePassword } from '../lib/auth/authService';

const PASSWORD_LOADING_DELAY_MS = 2500;

const ChangePasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    const oldPwd = oldPassword.trim();
    const newPwd = newPassword.trim();
    const confirmPwd = confirmNewPassword.trim();

    if (!oldPwd || !newPwd || !confirmPwd) {
      Alert.alert(t('changePassword'), t('fillAllPasswordFields'));
      return;
    }
    if (newPwd.length < 6) {
      Alert.alert(t('changePassword'), t('passwordMustBeAtLeast6Characters'));
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert(t('changePassword'), t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    const startedAt = Date.now();
    const { error } = await changePassword(oldPwd, newPwd);
    const elapsed = Date.now() - startedAt;
    if (elapsed < PASSWORD_LOADING_DELAY_MS) {
      await new Promise((resolve) => setTimeout(resolve, PASSWORD_LOADING_DELAY_MS - elapsed));
    }
    setLoading(false);

    if (error) {
      const lowerMessage = error.message.toLowerCase();
      const message = lowerMessage.includes('invalid login credentials')
        ? t('oldPasswordIncorrect')
        : error.message;
      console.log('password change failed:', error.message);
      Alert.alert(t('changePassword'), message);
      return;
    }

    console.log('passowrd changed');
    console.log('password change success');
    Alert.alert(t('changePassword'), t('passwordUpdatedSuccess'), [
      {
        text: t('ok'),
        onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }),
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: lightColors.secondaryBackground },
      ]}
    >
      <Header
        leftIcon={<BackArrowIcon width={24} height={24} />}
        onLeftPress={() => navigation.goBack()}
        title={t('changePassword')}
        rightIcon={<View />}
        style={styles.header}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{t('changePassword')}</Text>
            <Text style={styles.subtitle}>{t('changePasswordSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label={t('oldPassword')}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder={t('password')}
              secureTextEntry
              showPasswordToggle
              leftIcon={<PasswordIcon width={20} height={20} />}
            />
            <InputField
              label={t('newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('password')}
              secureTextEntry
              showPasswordToggle
              leftIcon={<PasswordIcon width={20} height={20} />}
            />
            <InputField
              label={t('confirmNewPassword')}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder={t('password')}
              secureTextEntry
              showPasswordToggle
              leftIcon={<PasswordIcon width={20} height={20} />}
            />
            <Button
              title={t('changePassword')}
              variant="primary"
              onPress={handleChangePassword}
              disabled={loading}
              style={styles.primaryButton}
              backgroundColor={lightColors.accent}
              textColor={lightColors.secondaryBackground}
              borderRadius={24}
            />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      <LoadingModal visible={loading} text={t('updatingPassword')} variant="modal" />
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  keyboardView: {
    paddingHorizontal: 24,
  },
  titleBlock: {
    marginTop: 24,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 28,
    lineHeight: 38,
    color: lightColors.text,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    lineHeight: 24,
    color: lightColors.subText,
  },
  form: {
    marginTop: 28,
    gap: 20,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 24,
  },
});
