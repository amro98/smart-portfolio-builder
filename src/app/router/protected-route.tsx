import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Loader2 } from 'lucide-react';

function SplashLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authChecked = useAuthStore((s) => s.authChecked);

  if (!authChecked) {
    return <SplashLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authChecked = useAuthStore((s) => s.authChecked);

  if (!authChecked) {
    return <SplashLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/portfolios" replace />;
  }

  return <>{children}</>;
}

export function AuthAwareRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authChecked = useAuthStore((s) => s.authChecked);

  if (!authChecked) {
    return <SplashLoader />;
  }

  return <Navigate to={isAuthenticated ? '/portfolios' : '/login'} replace />;
}

export { AuthGuard as ProtectedRoute };
