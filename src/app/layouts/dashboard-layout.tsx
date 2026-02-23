import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useUIStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Briefcase,
  Zap,
  Coins,
  Award,
  MessageSquare,
  Image,
  Paintbrush,
  List,
  Globe,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  LogOut,
  Eye,
  Settings,
  ChevronLeft,
  Layers,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

const mainNavItems = [
  { labelKey: 'dashboard.nav.overview', icon: LayoutDashboard, to: '/dashboard', end: true },
  { labelKey: 'dashboard.nav.profile', icon: User, to: '/dashboard/profile' },
  { labelKey: 'dashboard.nav.projects', icon: FolderOpen, to: '/dashboard/projects' },
  { labelKey: 'dashboard.nav.experience', icon: Briefcase, to: '/dashboard/experience' },
  { labelKey: 'dashboard.nav.skills', icon: Zap, to: '/dashboard/skills' },
  { labelKey: 'dashboard.nav.services', icon: Coins, to: '/dashboard/services' },
  { labelKey: 'dashboard.nav.certifications', icon: Award, to: '/dashboard/certifications' },
  { labelKey: 'dashboard.nav.testimonials', icon: MessageSquare, to: '/dashboard/testimonials' },
  { labelKey: 'dashboard.nav.gallery', icon: Image, to: '/dashboard/gallery' },
];

const settingsNavItems = [
  { labelKey: 'dashboard.nav.appearance', icon: Paintbrush, to: '/dashboard/appearance' },
  { labelKey: 'dashboard.nav.sections', icon: List, to: '/dashboard/sections' },
  { labelKey: 'dashboard.nav.publish', icon: Globe, to: '/dashboard/publish' },
];

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onMobileClose,
  isMobile,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileClose?: () => void;
  isMobile: boolean;
}) {
  const { t } = useI18n();

  const navLinkClass = useCallback(
    ({ isActive }: { isActive: boolean }) =>
      `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`,
    [collapsed, isMobile]
  );

  const handleNavClick = useCallback(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [isMobile, onMobileClose]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link
          to="/dashboard"
          className={`flex items-center gap-2 font-bold text-foreground ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
          onClick={handleNavClick}
        >
          <Layers className="h-6 w-6 shrink-0 text-primary" />
          {(!collapsed || isMobile) && <span className="text-lg">SPB</span>}
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={navLinkClass}
            onClick={handleNavClick}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {(!collapsed || isMobile) && <span>{t(item.labelKey)}</span>}
          </NavLink>
        ))}

        <Separator className="my-3" />

        {settingsNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={navLinkClass}
            onClick={handleNavClick}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {(!collapsed || isMobile) && <span>{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      {!isMobile && (
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={onToggleCollapse}
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform duration-200 ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar, setSidebarOpen, themeMode, setThemeMode } =
    useUIStore();
  const { user, logout } = useAuthStore();
  const { t, dir } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [themeMode]);

  const handleToggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  const handleSignOut = useCallback(() => {
    toast.dismiss();
    logout();
    toast.success(t('toast.signedOut'));
    navigate('/login');
  }, [logout, navigate, t]);

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside
        className={`hidden flex-shrink-0 border-r border-border bg-background transition-all duration-200 ease-in-out md:flex md:flex-col ${
          sidebarOpen ? 'w-60' : 'w-[52px]'
        }`}
      >
        <SidebarContent
          collapsed={!sidebarOpen}
          onToggleCollapse={toggleSidebar}
          isMobile={false}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-background md:hidden"
            >
              <SidebarContent
                collapsed={false}
                onToggleCollapse={() => {}}
                onMobileClose={() => setMobileOpen(false)}
                isMobile={true}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative flex-1 max-w-md">
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

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher compact />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
            >
              {themeMode === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/preview" target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('common.preview')}</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {userInitials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.email ?? 'User'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/preview" target="_blank" className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    {t('common.previewPortfolio')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('common.settings')}
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
