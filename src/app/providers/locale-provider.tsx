import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { messages, type AppLocale } from '@/lib/i18n/translations';

type TranslateVars = Record<string, string | number>;

interface LocaleContextValue {
  lang: AppLocale;
  dir: 'ltr' | 'rtl';
  setLang: (lang: AppLocale) => void;
  t: (key: string, vars?: TranslateVars) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'spb-locale';

function resolveInitialLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'ar') return saved;
  const browser = window.navigator.language.toLowerCase();
  return browser.startsWith('ar') ? 'ar' : 'en';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLocale>(resolveInitialLocale);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const value = useMemo<LocaleContextValue>(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const t = (key: string, vars?: TranslateVars) => {
      const template = messages[lang][key] ?? messages.en[key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
        template
      );
    };

    return {
      lang,
      dir,
      setLang: setLangState,
      t,
    };
  }, [lang]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useI18n must be used within LocaleProvider');
  return ctx;
}
