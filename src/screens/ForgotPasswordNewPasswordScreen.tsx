import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Header from '../components/Header';
import Button from '../components/Button';
import InputField from '../components/Login';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import PasswordIcon from '../assets/svgs/PasswordIcon';
import { useTranslation } from "../i18n";

type Route = RouteProp<RootStackParamList, 'ForgotPasswordNewPassword'>;

const ForgotPasswordNewPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<Route>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { t } = useTranslation();
  const handleResetPassword = () => {
    const pwd = password.trim();
    const confirm = confirmPassword.trim();
    if (!pwd) {
      Alert.alert('Error', t('pleaseEnterAPassword'));
      return;
    }
    if (pwd.length < 6) {
      Alert.alert('Error', t('passwordMustBeAtLeast6Characters'));
      return;
    }
    if (pwd !== confirm) {
      Alert.alert('Error', t('passwordsDoNotMatch'));
      return;
    }
    navigation.navigate('SignInScreen');
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
        title={t('newPassword')}
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
            <Text style={styles.title}>{t('createNewPassword')}</Text>
            <Text style={styles.subtitle}>
              {t('enterYourNewPasswordAndConfirmItBelow')}
            </Text>
          </View>
          <View style={styles.form}>
            <InputField
              label={t('newPassword')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('password')}
              secureTextEntry
              showPasswordToggle
              leftIcon={<PasswordIcon width={20} height={20} />}
            />
            <InputField
              label={t('confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('password')}
              secureTextEntry
              showPasswordToggle
              leftIcon={<PasswordIcon width={20} height={20} />}
            />
            <Button
              title={t('resetPassword')}
              variant="primary"
              onPress={handleResetPassword}
              style={styles.primaryButton}
              backgroundColor={lightColors.accent}
              textColor={lightColors.secondaryBackground}
              borderRadius={24}
            />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default ForgotPasswordNewPasswordScreen;

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
