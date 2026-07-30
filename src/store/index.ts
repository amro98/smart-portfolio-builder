import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode, User } from '@/types';

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

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  authChecked: false,
  setAuthChecked: (checked) => set({ authChecked: checked }),
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  completeOnboarding: () =>
    set((state) => ({
      user: state.user ? { ...state.user, onboardingCompleted: true } : null,
    })),
}));
