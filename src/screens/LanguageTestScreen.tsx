import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  I18nManager,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import {
  useLanguageStore,
  LOCALES,
  type LocaleCode,
} from '../../store/languageStore';
import { setI18nLocale } from '../i18n';
import { t } from '../i18n';
import Button from '../components/Button';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import type { RootStackParamList } from '../navigations/RootNavigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'LanguageTestScreen'>;

async function reloadForRTL(): Promise<void> {
  try {
    // @ts-expect-error - expo-updates is optional
    const { Updates } = await import('expo-updates');
    if (typeof Updates?.reloadAsync === 'function') {
      await Updates.reloadAsync();
    } else {
      throw new Error('reload not available');
    }
  } catch {
    Alert.alert(
      'Restart required',
      'Please close and reopen the app for RTL layout to apply.'
    );
  }
}

export default function LanguageTestScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { locale, setLocale, isRTL } = useLanguageStore();

  useEffect(() => {
    setI18nLocale(locale);
  }, [locale]);

  const handleSelectLocale = (newLocale: LocaleCode) => {
    if (newLocale === locale) return;
    const newConfig = LOCALES.find((l) => l.code === newLocale);
    const wasRTL = isRTL;
    const willBeRTL = newConfig?.isRTL ?? false;
    setLocale(newLocale);
    setI18nLocale(newLocale);
    if (wasRTL !== willBeRTL) {
      const needRTL = willBeRTL;
      if (I18nManager.isRTL !== needRTL) {
        I18nManager.forceRTL(needRTL);
        I18nManager.allowRTL(needRTL);
        reloadForRTL();
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: lightColors.background },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButton, I18nManager.isRTL && styles.backButtonRTL]}
        activeOpacity={0.8}
      >
        <BackArrowIcon width={24} height={24} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { fontFamily: fontFamilies.urbanistBold }]}>
          {t('languageTestTitle')}
        </Text>
        <Text style={styles.subtitle}>{t('languageTestSubtitle')}</Text>

        <View style={styles.currentBox}>
          <Text style={styles.label}>{t('currentLanguage')}</Text>
          <Text style={styles.currentLocale}>
            {LOCALES.find((l) => l.code === locale)?.label ?? locale}
            {isRTL ? ' (RTL)' : ' (LTR)'}
          </Text>
        </View>

        <Text style={[styles.label, styles.sectionLabel]}>
          {t('selectLanguage')}
        </Text>
        {LOCALES.map((loc) => (
          <TouchableOpacity
            key={loc.code}
            style={[
              styles.localeOption,
              locale === loc.code && styles.localeOptionActive,
            ]}
            onPress={() => handleSelectLocale(loc.code)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.localeLabel,
                locale === loc.code && styles.localeLabelActive,
              ]}
            >
              {loc.label} {loc.isRTL ? '(RTL)' : '(LTR)'}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.sampleBox}>
          <Text style={styles.sampleTitle}>{t('hello')}</Text>
          <Text style={styles.sampleText}>{t('welcome')}</Text>
        </View>

        <Text style={styles.note}>{t('restartNote')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  backButtonRTL: {
    left: undefined,
    right: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    color: lightColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: lightColors.subText,
    marginBottom: 24,
  },
  currentBox: {
    backgroundColor: palette.gray100,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: lightColors.subText,
    marginBottom: 4,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  currentLocale: {
    fontSize: 18,
    color: lightColors.text,
    fontFamily: fontFamilies.urbanistSemiBold,
  },
  localeOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.gray300,
    marginBottom: 12,
  },
  localeOptionActive: {
    borderColor: palette.primary,
    backgroundColor: palette.gray100,
  },
  localeLabel: {
    fontSize: 16,
    color: lightColors.text,
    fontFamily: fontFamilies.urbanistMedium,
  },
  localeLabelActive: {
    color: palette.primary,
    fontFamily: fontFamilies.urbanistSemiBold,
  },
  sampleBox: {
    marginTop: 24,
    padding: 20,
    backgroundColor: palette.skipbg,
    borderRadius: 12,
  },
  sampleTitle: {
    fontSize: 20,
    color: lightColors.text,
    fontFamily: fontFamilies.urbanistBold,
    marginBottom: 8,
  },
  sampleText: {
    fontSize: 16,
    color: lightColors.subText,
  },
  note: {
    fontSize: 12,
    color: lightColors.subText,
    marginTop: 24,
    fontStyle: 'italic',
  },
});
