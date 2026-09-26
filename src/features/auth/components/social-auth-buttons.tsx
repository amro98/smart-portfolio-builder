import { useEffect, useState } from 'react';
import { Github, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { authApi, type SocialProviderId } from '@/lib/api/client';

// Google's standard multicolor "G" mark, as its sign-in branding guidelines ask for.
export function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const PROVIDERS: { id: SocialProviderId; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'google', labelKey: 'auth.social.continueGoogle', icon: <GoogleMark /> },
  { id: 'github', labelKey: 'auth.social.continueGithub', icon: <Github className="h-4 w-4" aria-hidden /> },
];

/**
 * "Continue with …" buttons. They start a full-page redirect through our API to the provider;
 * nothing sensitive is handled in the browser.
 */
export function SocialAuthButtons({ intent, remember = false }: { intent: 'login' | 'register'; remember?: boolean }) {
  const { t } = useI18n();
  const [pending, setPending] = useState<SocialProviderId | null>(null);

  // Coming Back from the provider restores this page from the back/forward cache with the
  // spinner still showing; reset it.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(null);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  return (
    <div className="grid gap-3">
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 font-medium"
          disabled={pending !== null}
          onClick={() => {
            setPending(provider.id);
            window.location.assign(authApi.oauthUrl(provider.id, intent, remember));
          }}
        >
          {pending === provider.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : provider.icon}
          {t(provider.labelKey)}
        </Button>
      ))}
    </div>
  );
}

export function AuthDivider() {
  const { t } = useI18n();
  return (
    <div className="relative my-6 flex items-center" aria-hidden>
      <div className="h-px flex-1 bg-border" />
      <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('auth.social.or')}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
