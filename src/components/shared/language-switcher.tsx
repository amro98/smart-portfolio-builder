import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const { lang, setLang, t } = useI18n();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!compact && (
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Languages className="h-4 w-4" />
          {t('common.language')}
        </span>
      )}
      <div className="inline-flex items-center rounded-md border border-border bg-background p-1">
        <Button
          type="button"
          size="sm"
          variant={lang === 'en' ? 'default' : 'ghost'}
          className="h-8 px-3"
          onClick={() => setLang('en')}
        >
          EN
        </Button>
        <Button
          type="button"
          size="sm"
          variant={lang === 'ar' ? 'default' : 'ghost'}
          className="h-8 px-3"
          onClick={() => setLang('ar')}
        >
          AR
        </Button>
      </div>
    </div>
  );
}
