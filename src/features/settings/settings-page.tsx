import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Sun, Moon, Monitor, LogOut, Languages, CalendarDays } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useI18n } from '@/lib/i18n';
import { authApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { value: ThemeMode; labelKey: string; icon: React.ElementType }[] = [
  { value: 'light', labelKey: 'common.light', icon: Sun },
  { value: 'dark', labelKey: 'common.dark', icon: Moon },
  { value: 'auto', labelKey: 'common.auto', icon: Monitor },
];

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(dateStr));
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
    <div className="space-y-8">
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.account.title')}</CardTitle>
          <CardDescription>{t('settings.account.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('settings.account.email')}</p>
              <p className="text-sm truncate">{user?.email ?? '—'}</p>
            </div>
          </div>

          {user?.createdAt && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t('settings.account.memberSince')}</p>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.appearance.title')}</CardTitle>
          <CardDescription>{t('settings.appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {THEME_OPTIONS.map((option) => {
              const isSelected = themeMode === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setThemeMode(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                    isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-foreground/20'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('text-sm font-medium', isSelected && 'text-primary')}>{t(option.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.language.title')}</CardTitle>
          <CardDescription>{t('settings.language.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background p-1">
            <Languages className="ml-2 h-4 w-4 text-muted-foreground" />
            <Button
              type="button"
              size="sm"
              variant={lang === 'en' ? 'default' : 'ghost'}
              className="h-8 px-3"
              onClick={() => setLang('en')}
            >
              {t('common.english')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={lang === 'ar' ? 'default' : 'ghost'}
              className="h-8 px-3"
              onClick={() => setLang('ar')}
            >
              {t('common.arabic')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.session.title')}</CardTitle>
          <CardDescription>{t('settings.session.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => void handleSignOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('common.signOut')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
