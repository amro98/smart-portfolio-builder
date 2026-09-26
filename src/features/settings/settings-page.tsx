import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Sun, Moon, Monitor, LogOut, Languages, CalendarDays, Palette, ShieldCheck, UserRound } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useI18n } from '@/lib/i18n';
import { authApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { value: ThemeMode; labelKey: string; icon: React.ElementType }[] = [
  { value: 'light', labelKey: 'common.light', icon: Sun },
  { value: 'dark', labelKey: 'common.dark', icon: Moon },
  { value: 'auto', labelKey: 'common.auto', icon: Monitor },
];

function formatDate(dateStr: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-US', { dateStyle: 'medium' }).format(new Date(dateStr));
}

/** A settings group: tinted icon, title and description, then its controls. */
function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start gap-4 space-y-0 p-5 md:p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="border-t border-divider p-5 md:p-6">{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { themeMode, setThemeMode } = useUIStore();
  const { lang, setLang, t } = useI18n();

  const handleSignOut = useCallback(async () => {
    toast.dismiss();
    try {
      await authApi.logout();
      logout();
      toast.success(t('toast.signedOut'));
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign out. Please try again.');
    }
  }, [logout, navigate, t]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      <SettingsSection icon={UserRound} title={t('settings.account.title')} description={t('settings.account.description')}>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{t('settings.account.email')}</dt>
              <dd className="truncate text-sm font-medium text-foreground" dir="ltr">{user?.email ?? '—'}</dd>
            </div>
          </div>
          {user?.createdAt && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{t('settings.account.memberSince')}</dt>
                <dd className="text-sm font-medium text-foreground">{formatDate(user.createdAt, lang)}</dd>
              </div>
            </div>
          )}
        </dl>
      </SettingsSection>

      <SettingsSection icon={Palette} title={t('settings.appearance.title')} description={t('settings.appearance.description')}>
        <div role="radiogroup" aria-label={t('settings.appearance.title')} className="grid max-w-md grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => {
            const isSelected = themeMode === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setThemeMode(option.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary-soft text-primary-soft-foreground ring-1 ring-primary'
                    : 'border-border bg-surface-secondary text-foreground-secondary hover:border-input hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                <span className="text-sm font-medium">{t(option.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection icon={Languages} title={t('settings.language.title')} description={t('settings.language.description')}>
        <div role="radiogroup" aria-label={t('settings.language.title')} className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-secondary p-1">
          {(['en', 'ar'] as const).map((code) => (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={lang === code}
              onClick={() => setLang(code)}
              className={cn(
                'h-9 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                lang === code
                  ? 'bg-primary-soft text-primary-soft-foreground shadow-sm ring-1 ring-primary/40'
                  : 'text-foreground-secondary hover:bg-accent hover:text-foreground'
              )}
            >
              {t(code === 'en' ? 'common.english' : 'common.arabic')}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection icon={ShieldCheck} title={t('settings.session.title')} description={t('settings.session.description')}>
        <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive-soft hover:text-destructive-soft-foreground" onClick={() => void handleSignOut()}>
          <LogOut className="me-2 h-4 w-4" />
          {t('common.signOut')}
        </Button>
      </SettingsSection>
    </div>
  );
}
