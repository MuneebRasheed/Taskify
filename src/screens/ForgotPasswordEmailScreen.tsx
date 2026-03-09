import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Header from '../components/Header';
import Button from '../components/Button';
import InputField from '../components/Login';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import EmailIcon from '../assets/svgs/EmailIcon';
import { useTranslation } from "../i18n";
const ForgotPasswordEmailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const { t } = useTranslation();
  const handleSendOTP = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      return;
    }
    navigation.navigate('ForgotPasswordOTP', { email: trimmed });
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
              placeholder={t('email')}
              leftIcon={<EmailIcon width={20} height={20} />}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title={t('sendOTP')}
              variant="primary"
              onPress={handleSendOTP}
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
});
