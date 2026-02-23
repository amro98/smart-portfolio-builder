import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types';

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

// TODO: Replace mock auth with real JWT-based auth via Express backend.
// When a real backend is added, the hydration step should validate
// the stored token against the server (e.g. GET /auth/me) and
// clear the session if expired.

interface AuthUser {
  id: string;
  email: string;
  onboardingCompleted: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      completeOnboarding: () =>
        set((state) => ({
          user: state.user ? { ...state.user, onboardingCompleted: true } : null,
        })),
    }),
    {
      name: 'spb-auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
