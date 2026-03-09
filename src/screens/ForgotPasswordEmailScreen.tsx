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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Header from '../components/Header';
import Button from '../components/Button';
import InputField from '../components/Login';
import LoadingModal from '../components/LoadingModal';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import EmailIcon from '../assets/svgs/EmailIcon';
import { useTranslation } from "../i18n";
import { checkEmailExists, INVALID_RESPONSE_MSG, requestForgotPasswordOtp } from '../lib/api/forgotPasswordApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value: string): boolean {
  return value.length > 0 && value.length <= 254 && EMAIL_REGEX.test(value);
}

const ForgotPasswordEmailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const trimmedEmail = email.trim();
  const showEmailError = touched && (!trimmedEmail || !isValidEmail(trimmedEmail));
  const canSubmit = trimmedEmail.length > 0 && isValidEmail(trimmedEmail) && !loading;

  const handleSendOTP = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setTouched(true);
      return;
    }
    if (!isValidEmail(trimmed)) {
      setTouched(true);
      return;
    }
    setLoading(true);
    // Check that the email is registered before sending the OTP
    const checkResult = await checkEmailExists(trimmed);
    if (!checkResult.exists) {
      setLoading(false);
      const err = 'error' in checkResult ? checkResult.error : undefined;
      const message = getErrorMessage(err, t);
      Alert.alert(t('forgotPassword'), message);
      return;
    }
    const result = await requestForgotPasswordOtp(trimmed);
    setLoading(false);
    if (result.success) {
      navigation.navigate('ForgotPasswordOTP', { email: trimmed });
    } else {
      const err = 'error' in result ? result.error : t('somethingWentWrong');
      Alert.alert(t('forgotPassword'), getErrorMessage(err, t));
    }
  };

  function getErrorMessage(err: string | undefined, tr: (key: string) => string): string {
    if (!err) return tr('somethingWentWrong');
    if (err === INVALID_RESPONSE_MSG) return tr('invalidServerResponse');
    if (err.toLowerCase().includes('no account') || err.toLowerCase().includes('account found')) return tr('noAccountWithThisEmail');
    if (err.toLowerCase().includes('too many') || err.toLowerCase().includes('try again later')) return tr('tooManyRequests');
    if (err.toLowerCase().includes('failed to send email')) return tr('failedToSendEmail');
    if (err.toLowerCase().includes('valid email') || err.toLowerCase().includes('valid email address')) return tr('invalidEmailFormat');
    return err;
  }

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
        title={t('forgotPassword')}
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
            <Text style={styles.title}>{t('enterYourEmail')}</Text>
            <Text style={styles.subtitle}>
              {t('weWillSendYouAOneTimeCodeToResetYourPassword')}
            </Text>
          </View>
          <View style={styles.form}>
            <InputField
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched(true)}
              placeholder={t('email')}
              leftIcon={<EmailIcon width={20} height={20} />}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {showEmailError && (
              <Text style={styles.errorText}>
                {!trimmedEmail ? t('emailRequired') : t('invalidEmailFormat')}
              </Text>
            )}
            <Button
              title={t('sendOTP')}
              variant="primary"
              onPress={handleSendOTP}
              disabled={!canSubmit}
              style={styles.primaryButton}
              backgroundColor={lightColors.accent}
              textColor={lightColors.secondaryBackground}
              borderRadius={24}
            />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      <LoadingModal visible={loading} text={t('sendingCode')} variant="modal" />
    </View>
  );
};

export default ForgotPasswordEmailScreen;

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
    borderRadius: 1000,
  },
  errorText: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 14,
    color: '#dc3545',
    marginTop: -8,
    marginBottom: 4,
  },
});
