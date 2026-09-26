import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { AuthBackgroundDecor } from '@/components/decor/background-decor';

export default function AuthLayout() {
  // Login and Register are full-page splits; the other auth screens keep a centred card.
  const fullBleed = ['/login', '/register'].includes(useLocation().pathname);
  return (
    <div className={cn('relative flex min-h-screen items-center justify-center bg-workspace', !fullBleed && 'px-4 pt-12 sm:pt-0')}>
      <AuthBackgroundDecor />
      <div className="absolute top-4 end-4 z-20">
        <LanguageSwitcher compact variant="segmented" />
      </div>
      <div className={cn('relative z-10 w-full', !fullBleed && 'max-w-4xl')}>
        <Outlet />
      </div>
    </div>
  );
}
