import { useEffect } from 'react';
import { I18n } from 'i18n-js';
import type { LocaleCode } from '../../store/languageStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from './translations';

const i18n = new I18n(translations);
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

export function setI18nLocale(locale: LocaleCode): void {
  i18n.locale = locale;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

/** Hook that returns t and re-renders when locale changes. */
export function useTranslation() {
  const locale = useLanguageStore((state) => state.locale);

  useEffect(() => {
    setI18nLocale(locale);
  }, [locale]);

  return { t };
}

export default i18n;
