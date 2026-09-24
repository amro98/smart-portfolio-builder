import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers, Search, Sun, Moon, Briefcase, LayoutTemplate, Settings, LogOut, FileText } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useI18n } from '@/lib/i18n';
import { authApi } from '@/lib/api/client';
import { usePortfolios } from '@/lib/query/hooks';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
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
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search
        className={cn(
          'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
          dir === 'rtl' ? 'right-2.5' : 'left-2.5'
        )}
      />
      <Input
        type="text"
        placeholder={t('common.searchPlaceholder')}
        className={cn('h-9', dir === 'rtl' ? 'pr-9' : 'pl-9')}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && query.trim() && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {matches.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto py-1">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => goToPortfolio(p.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">/u/{p.slug}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">No portfolios match "{query}".</p>
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

  const navLinkClass = useCallback(
    ({ isActive }: { isActive: boolean }) =>
      cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
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

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/portfolios" className="flex items-center gap-2 font-bold text-foreground">
            <Layers className="h-5 w-5 text-primary" />
            <span>SPB</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {globalNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === '/portfolios'}>
              <item.icon className="h-4 w-4" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          <Link to="/portfolios" className="flex items-center gap-2 font-semibold text-foreground md:hidden">
            <Layers className="h-5 w-5 text-primary" />
            <span>SPB</span>
          </Link>

          <HeaderSearch dir={dir} />

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher compact />

            <Button variant="ghost" size="icon" onClick={handleToggleTheme}>
              {themeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {userInitials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-medium">{user?.email ?? 'User'}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('common.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('common.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
