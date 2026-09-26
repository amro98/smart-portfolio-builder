import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { AppLocale } from '@/lib/i18n/translations';

// Keeps the accent variant exactly as templates have always rendered it (flat, 90% hover),
// independent of the builder's primary-button styling.
const TEMPLATE_ACTIVE = 'shadow-none hover:bg-primary/90';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
  // Overrides the SaaS app's own language (from useI18n) with an independent language +
  // setter — used when this switcher controls a portfolio's own viewer language instead of
  // the dashboard's, so the two never get wired together by accident.
  lang?: AppLocale;
  onLanguageChange?: (lang: AppLocale) => void;
  // 'accent' (default) fills the active language with the primary color — portfolio
  // templates rely on it picking up their own accent. 'segmented' is the builder UI's
  // quieter control: a raised surface on a neutral track.
  variant?: 'accent' | 'segmented';
}

export function LanguageSwitcher({ compact = false, className, lang: langOverride, onLanguageChange, variant = 'accent' }: LanguageSwitcherProps) {
  const appLocale = useI18n();
  const lang = langOverride ?? appLocale.lang;
  const setLang = onLanguageChange ?? appLocale.setLang;
  const { t } = appLocale;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!compact && (
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Languages className="h-4 w-4" />
          {t('common.language')}
        </span>
      )}
      {variant === 'segmented' ? (
        <div className="inline-flex h-9 items-center gap-0.5 rounded-lg border border-border bg-surface-secondary p-0.5">
          {(['en', 'ar'] as const).map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
              className={cn(
                'h-7 min-w-[34px] rounded-md px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                lang === code ? 'bg-primary-soft text-primary-soft-foreground shadow-sm ring-1 ring-primary/30' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      ) : (
        <div className="inline-flex items-center rounded-md border border-border bg-background p-1">
          <Button
            type="button"
            size="sm"
            variant={lang === 'en' ? 'default' : 'ghost'}
            className={cn('h-8 px-3', lang === 'en' && TEMPLATE_ACTIVE)}
            onClick={() => setLang('en')}
          >
            EN
          </Button>
          <Button
            type="button"
            size="sm"
            variant={lang === 'ar' ? 'default' : 'ghost'}
            className={cn('h-8 px-3', lang === 'ar' && TEMPLATE_ACTIVE)}
            onClick={() => setLang('ar')}
          >
            AR
          </Button>
        </div>
      )}
    </div>
  );
}
