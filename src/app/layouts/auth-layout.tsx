import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.07) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher compact />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <Outlet />
      </div>
    </div>
  );
}
