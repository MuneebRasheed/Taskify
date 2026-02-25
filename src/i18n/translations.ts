import type { LocaleCode } from '../../store/languageStore';

export const translations: Record<LocaleCode, Record<string, any>> = {
  en: {
    // Language test screen
    languageTestTitle: 'Language Test',
    languageTestSubtitle: 'Switch between English (LTR) and Arabic (RTL).',
    currentLanguage: 'Current language',
    selectLanguage: 'Select language',
    restartNote: 'Changing to/from RTL may require restarting the app.',
    hello: 'Hello',
    welcome: 'Welcome to Taskify',
    // Sign up (sample)
    joinTaskify: 'Join Taskify Today ✨',
    createAccount: 'Create your account and unlock a world of productivity.',
    splashScreen: {
      title: 'Taskify',
    },
  },
  ar: {
    languageTestTitle: 'اختبار اللغة',
    languageTestSubtitle: 'التبديل بين الإنجليزية (LTR) والعربية (RTL).',
    currentLanguage: 'اللغة الحالية',
    selectLanguage: 'اختر اللغة',
    restartNote: 'قد يتطلب التبديل من/إلى RTL إعادة تشغيل التطبيق.',
    hello: 'مرحباً',
    welcome: 'مرحباً بك في Taskify',
    joinTaskify: 'انضم إلى Taskify اليوم ✨',
    createAccount: 'أنشئ حسابك واستكشف عالم الإنتاجية.',
    splashScreen: {
      title: 'Taskify',
    },
  },
};
