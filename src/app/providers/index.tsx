import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/store';
import { ThemeProvider } from './theme-provider';
import { LocaleProvider } from './locale-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

let authInitialization: Promise<void> | null = null;

function initializeAuth() {
  if (!authInitialization) {
    authInitialization = authApi
      .me()
      .then(({ user }) => {
        useAuthStore.getState().login(user);
      })
      .catch(() => {
        useAuthStore.getState().logout();
      })
      .finally(() => {
        useAuthStore.getState().setAuthChecked(true);
      });
  }

  return authInitialization;
}

function AuthBootstrap() {
  useEffect(() => {
    void initializeAuth();
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <LocaleProvider>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
