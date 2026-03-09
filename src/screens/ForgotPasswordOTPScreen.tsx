import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Header from '../components/Header';
import Button from '../components/Button';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import { useTranslation } from "../i18n";
const OTP_LENGTH = 4;
const OTP_EXPIRY_SECONDS = 30;

type Route = RouteProp<RootStackParamList, 'ForgotPasswordOTP'>;

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ForgotPasswordOTPScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<Route>();
  const email = route.params?.email ?? '';
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
  const inputRef = useRef<TextInput>(null);
  const { t } = useTranslation();
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => (s <= 0 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
  };

  const handleVerify = () => {
    if (otp.length !== OTP_LENGTH) return;
    navigation.navigate('ForgotPasswordNewPassword', { email });
  };

  const focusInput = () => inputRef.current?.focus();

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
        title={t('verification')}
        rightIcon={<View />}
        style={styles.header}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.message}>
            {t('weHaveSentAVerificationCodeTo')} {' '}
            <Text style={styles.messageBold}>{email}</Text>
            . {t('enterTheCodeBelowToContinue')}
          </Text>
          <Text style={styles.label}>{t('enter4DigitCode')}</Text>

          <Pressable style={styles.otpRow} onPress={focusInput}>
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              style={styles.hiddenInput}
              caretHidden
            />
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  otp.length === i && otp.length < OTP_LENGTH && styles.otpBoxFocused,
                ]}
              >
                <Text style={[styles.otpDigit, !otp[i] && styles.otpDigitPlaceholder]}>
                  {otp[i] || '•'}
                </Text>
              </View>
            ))}
          </Pressable>

          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={18} color={lightColors.text} />
            <Text style={styles.timerLabel}>{t('codeExpiresIn')}: </Text>
            <Text style={styles.timerValue}>{formatTimer(secondsLeft)}</Text>
          </View>
        </View>

        <View style={[styles.footer]}>
          <Button
            title={t('verify')}
            variant="primary"
            onPress={handleVerify}
            disabled={otp.length !== OTP_LENGTH}
            style={styles.verifyButton}
            backgroundColor={lightColors.accent}
            textColor={lightColors.secondaryBackground}
            borderRadius={24}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPasswordOTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 0,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  message: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    lineHeight: 24,
    color: lightColors.text,
    marginBottom: 8,
  },
  messageBold: {
    fontFamily: fontFamilies.urbanistSemiBold,
    color: lightColors.text,
  },
  label: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 14,
    color: lightColors.subText,
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0,
    fontSize: 1,
  },
  otpBox: {
    width: 64,
    height: 56,
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: lightColors.accent,
  },
  otpDigit: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 24,
    color: lightColors.text,
    textAlign: 'center',
  },
  otpDigitPlaceholder: {
    color: lightColors.placeholderText,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  timerLabel: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.text,
  },
  timerValue: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.accent,
  },
  footer: {
    // paddingHorizontal: 24,
    paddingBottom: 370,
  },
  verifyButton: {
    marginTop: 16,
    borderRadius: 1000,
  },
});
