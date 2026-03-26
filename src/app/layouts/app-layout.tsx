import { useCallback, useMemo } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers, Search, Sun, Moon, Briefcase, LayoutTemplate, BadgeDollarSign, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useI18n } from '@/lib/i18n';
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
  { label: 'My Portfolios', to: '/portfolios', icon: Briefcase },
  { label: 'Templates', to: '/templates', icon: LayoutTemplate },
  { label: 'Pricing', to: '/pricing', icon: BadgeDollarSign },
  { label: 'Billing', to: '/billing', icon: CreditCard },
  { label: 'Settings', to: '/settings', icon: Settings },
];

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

  const handleSignOut = useCallback(() => {
    toast.dismiss();
    logout();
    toast.success(t('toast.signedOut'));
    navigate('/login');
  }, [logout, navigate, t]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="hidden w-64 border-r border-border bg-background md:flex md:flex-col">
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
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          <Link to="/portfolios" className="flex items-center gap-2 font-semibold text-foreground md:hidden">
            <Layers className="h-5 w-5 text-primary" />
            <span>SPB</span>
          </Link>

          <div className="relative w-full max-w-md">
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
            />
          </div>

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
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/billing" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
