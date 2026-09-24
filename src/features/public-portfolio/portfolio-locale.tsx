import { createContext, useContext, useMemo, useState } from 'react';
import { createTranslator, type AppLocale, type TranslateVars } from '@/lib/i18n/translations';

// The language a portfolio is VIEWED in (by an editor previewing it, or a public visitor)
// is a completely separate concern from the SaaS app's own UI language. This context is
// deliberately isolated from LocaleProvider/useI18n: it owns its own state, never reads or
// writes the SaaS locale's localStorage key, and never touches document.documentElement.
// Switching a portfolio's language must never change what language the dashboard is in.
interface PortfolioLocaleContextValue {
  lang: AppLocale;
  dir: 'ltr' | 'rtl';
  setLang: (lang: AppLocale) => void;
  t: (key: string, vars?: TranslateVars) => string;
}

const PortfolioLocaleContext = createContext<PortfolioLocaleContextValue | null>(null);

function resolveDefaultPortfolioLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en';
  return window.navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function PortfolioLocaleProvider({
  children,
  defaultLang,
}: {
  children: React.ReactNode;
  // A portfolio owner's own preferred language, if the portfolio data carries one — falls
  // back to the visitor's browser language when it doesn't.
  defaultLang?: AppLocale;
}) {
  const [lang, setLang] = useState<AppLocale>(() => defaultLang ?? resolveDefaultPortfolioLocale());

  const value = useMemo<PortfolioLocaleContextValue>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      setLang,
      t: createTranslator(lang),
    }),
    [lang]
  );

  return <PortfolioLocaleContext.Provider value={value}>{children}</PortfolioLocaleContext.Provider>;
}

export function usePortfolioLocale(): PortfolioLocaleContextValue {
  const ctx = useContext(PortfolioLocaleContext);
  if (!ctx) throw new Error('usePortfolioLocale must be used within PortfolioLocaleProvider');
  return ctx;
}
