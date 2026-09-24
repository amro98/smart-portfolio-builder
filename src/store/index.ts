import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/lib/query/client';
import type { ThemeMode, User } from '@/types';

// Drops every cached PRIVATE query on an auth identity transition, so one user's data can
// never render — even briefly — for another. Public queries (the public portfolio page,
// keyed under 'public-portfolio') are deliberately spared: they don't depend on who's
// logged in, and clearing them out from under an already-mounted, unauthenticated visitor
// (e.g. the auth bootstrap's routine 401 on a public page) would otherwise strand that
// query's observer on a removed cache entry that never resolves, leaving the page stuck
// on its loading state forever.
function clearPrivateQueryCache() {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== 'public-portfolio',
  });
}

interface UIStore {
  themeMode: ThemeMode;
  sidebarOpen: boolean;
  previewDevice: 'desktop' | 'mobile';
  onboardingStep: number;
  setThemeMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPreviewDevice: (device: 'desktop' | 'mobile') => void;
  setOnboardingStep: (step: number) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      themeMode: 'light',
      sidebarOpen: true,
      previewDevice: 'desktop',
      onboardingStep: 0,
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setPreviewDevice: (device) => set({ previewDevice: device }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
    }),
    {
      name: 'spb-ui-store',
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
);

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  setAuthChecked: (checked: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  authChecked: false,
  setAuthChecked: (checked) => set({ authChecked: checked }),
  // Every identity transition (initial session bootstrap, explicit login, register,
  // switching from one account to another) must never let one user's cached
  // portfolios/queries render for someone else — even briefly. Clearing private cache
  // here, in the single place every login/logout call site funnels through, guarantees
  // that regardless of which of the several call sites triggered it. Only clear when the
  // identity actually changes — a no-op login/logout (e.g. the auth bootstrap resolving
  // to "still logged out") has nothing stale to clear and, for an anonymous visitor on a
  // public page, must not disturb any already-loading query.
  login: (user) => {
    const previousUserId = get().user?.id;
    if (previousUserId !== user.id) {
      clearPrivateQueryCache();
    }
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    if (get().isAuthenticated) {
      clearPrivateQueryCache();
    }
    set({ user: null, isAuthenticated: false });
  },
  completeOnboarding: () =>
    set((state) => ({
      user: state.user ? { ...state.user, onboardingCompleted: true } : null,
    })),
}));
