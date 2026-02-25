import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LocaleCode = any; // 'en' | 'ar';

export const LOCALES: { code: LocaleCode; label: string; isRTL: boolean }[] = [
  { code: 'en', label: 'English', isRTL: false },
  { code: 'ar', label: 'العربية', isRTL: true },
];

interface LanguageState {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  isRTL: boolean;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      isRTL: false,
      setLocale: (locale) => {
        const config = LOCALES.find((l) => l.code === locale);
        set({
          locale,
          isRTL: config?.isRTL ?? false,
        });
      },
    }),
    {
      name: 'taskify-language',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
