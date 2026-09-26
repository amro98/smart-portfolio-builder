import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers, Search, Sun, Moon, Briefcase, LayoutTemplate, Settings, LogOut, FileText, Menu } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useI18n } from '@/lib/i18n';
import { authApi } from '@/lib/api/client';
import { usePortfolios } from '@/lib/query/hooks';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { AppBackgroundDecor, SidebarDecor } from '@/components/decor/background-decor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const globalNavItems = [
  { labelKey: 'nav.myPortfolios', to: '/portfolios', icon: Briefcase },
  { labelKey: 'nav.templates', to: '/templates', icon: LayoutTemplate },
  { labelKey: 'nav.settings', to: '/settings', icon: Settings },
];

function HeaderSearch({ dir }: { dir: 'ltr' | 'rtl' }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data: portfolios = [] } = usePortfolios();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return portfolios
      .filter((p) => p.name.toLowerCase().includes(trimmed) || p.slug.toLowerCase().includes(trimmed))
      .slice(0, 6);
  }, [portfolios, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToPortfolio(id: string) {
    navigate(`/portfolios/${id}/overview`);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (matches.length > 0) {
        goToPortfolio(matches[0].id);
      } else if (query.trim()) {
        navigate(`/portfolios?q=${encodeURIComponent(query.trim())}`);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-md">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
      <Input
        type="text"
        dir={dir}
        placeholder={t('common.searchPlaceholder')}
        aria-label={t('common.searchPlaceholder')}
        className="h-10 rounded-lg border-border bg-surface-secondary ps-9 shadow-none hover:border-input focus-visible:bg-field"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && query.trim() && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {matches.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto p-1">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => goToPortfolio(p.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="ms-auto shrink-0 text-xs text-muted-foreground" dir="ltr">/u/{p.slug}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">{t('shell.searchNoResults', { query })}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { t, dir } = useI18n();
  const { user, logout } = useAuthStore();
  const { themeMode, setThemeMode } = useUIStore();

  const userInitials = useMemo(() => {
    if (!user?.email) return 'U';
    return user.email.slice(0, 2).toUpperCase();
  }, [user?.email]);

  const { pathname } = useLocation();
  const isNavActive = (to: string) => (to === '/portfolios' ? pathname === to : pathname.startsWith(to));

  const navLinkClass = useCallback(
    ({ isActive }: { isActive: boolean }) =>
      cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator',
        // Active: teal-tinted slate fill, white text, teal icon and a slim indicator on the
        // sidebar's leading edge — part of the shell rather than a bright block on top of it.
        isActive
          ? 'bg-sidebar-active/60 text-sidebar-foreground-strong shadow-[inset_0_0_0_1px_hsl(var(--brand)/0.14),inset_0_0_22px_-6px_hsl(var(--brand)/0.28)] before:absolute before:-start-3 before:inset-y-1.5 before:w-1 before:rounded-e-full before:bg-sidebar-indicator before:shadow-[0_0_10px_1px_hsl(var(--brand)/0.45)] [&>svg]:text-sidebar-indicator'
          : 'text-sidebar-foreground hover:bg-sidebar-hover/70 hover:text-sidebar-foreground-strong [&>svg]:text-sidebar-muted hover:[&>svg]:text-sidebar-foreground'
      ),
    []
  );

  const handleToggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

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

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const brandMark = (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-sidebar-active-strong text-white shadow-[0_6px_16px_-6px_hsl(var(--brand)/0.55)] ring-1 ring-white/10">
      <Layers className="h-[18px] w-[18px]" />
    </span>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden bg-sidebar md:flex dark:border-e dark:border-sidebar-border">
        <SidebarDecor />
        <div className="relative flex h-16 shrink-0 items-center border-b border-sidebar-border bg-sidebar-elevated/80 px-5">
          <Link to="/portfolios" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator">
            {brandMark}
            <span className="min-w-0 leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-sidebar-foreground-strong">SPB</span>
              <span className="block truncate text-[11px] text-sidebar-muted">{t('auth.login.brand')}</span>
            </span>
          </Link>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 py-5" aria-label={t('shell.workspace')}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted">{t('shell.workspace')}</p>
          <div className="space-y-1">
            {globalNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === '/portfolios'}>
                <item.icon className="h-[18px] w-[18px] shrink-0 transition-colors" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {user?.email && (
          <div className="relative flex shrink-0 items-center gap-3 border-t border-sidebar-border bg-sidebar-elevated/50 px-5 py-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-active text-xs font-semibold text-sidebar-foreground-strong">
              {userInitials}
            </span>
            <span className="min-w-0 truncate text-xs text-sidebar-muted" dir="ltr">{user.email}</span>
          </div>
        )}
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <AppBackgroundDecor />
        <header className="relative z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-3 sm:gap-3 sm:px-4 md:px-6">
          {/* Small screens: the global navigation lives in this menu (the sidebar is hidden). */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 md:hidden" aria-label={t('shell.menu')}>
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {globalNavItems.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  {/* Plain Link + explicit active check: Radix asChild cannot merge NavLink's function className. */}
                  <Link
                    to={item.to}
                    aria-current={isNavActive(item.to) ? 'page' : undefined}
                    className={cn('cursor-pointer gap-2.5', isNavActive(item.to) && 'bg-primary-soft text-primary-soft-foreground focus:bg-primary-soft focus:text-primary-soft-foreground')}
                  >
                    <item.icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/portfolios" className="hidden shrink-0 sm:block md:hidden" aria-label="SPB">
            {brandMark}
          </Link>

          <HeaderSearch dir={dir} />

          <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher compact variant="segmented" />

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg text-foreground-secondary"
              onClick={handleToggleTheme}
              aria-label={t('shell.toggleTheme')}
            >
              {themeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('shell.account')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-soft-foreground ring-2 ring-card transition-shadow hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-primary"
                >
                  {userInitials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground">{t('settings.account.email')}</p>
                  <p className="truncate text-sm font-medium" dir="ltr">{user?.email ?? 'User'}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer gap-2">
                    <Settings className="h-4 w-4" />
                    {t('common.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-destructive focus:bg-destructive-soft focus:text-destructive-soft-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  {t('common.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="relative min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
