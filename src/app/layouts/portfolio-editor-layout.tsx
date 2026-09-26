import { Link, Navigate, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/lib/query/hooks';
import { PortfolioIdProvider } from '@/app/providers/portfolio-id-provider';
import { LoadingPage } from '@/components/shared/loading-card';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { designHref, editorNavItems } from './editor-nav';

export default function PortfolioEditorLayout() {
  const { portfolioId } = useParams();
  const location = useLocation();
  const { t } = useI18n();
  const { data: portfolio, isLoading, isError } = usePortfolio(portfolioId);

  if (!portfolioId) {
    return <Navigate to="/portfolios" replace />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError || !portfolio) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">{t('editor.notFound.title')}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('editor.notFound.description')}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/portfolios">{t('editor.notFound.backButton')}</Link>
        </Button>
      </div>
    );
  }

  // Design & Preview is a full-bleed workspace (its preview needs the room); it carries its
  // own header, including a compact menu of these same editor sections.
  if (location.pathname === designHref(portfolioId)) {
    return (
      <PortfolioIdProvider portfolioId={portfolioId}>
        <Outlet />
      </PortfolioIdProvider>
    );
  }

  const editorName = portfolio.fullName?.trim() || portfolio.title?.trim() || portfolio.slug || t('editor.untitled');

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      isActive
        ? 'bg-primary-soft text-primary-soft-foreground ring-1 ring-primary/20 [&>svg]:text-primary'
        : 'text-foreground-secondary hover:bg-card hover:text-foreground [&>svg]:text-muted-foreground'
    );

  const initials = editorName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    // h-full (bounded by AppLayout's already-scrolling <main>) + min-h-0 so this grid never
    // grows taller than the viewport itself; only the content pane below scrolls.
    // Layers: dark global sidebar → warm light editor nav → soft work area → ivory cards.
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 md:grid-cols-[248px_minmax(0,1fr)] md:grid-rows-1 md:gap-5">
      <aside className="min-w-0 rounded-lg border border-border bg-workspace p-2.5 md:overflow-y-auto md:p-3">
        <div className="mb-2 hidden items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card md:flex" title={t('editor.editing', { name: editorName })}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand-soft-foreground">
            {initials || '·'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{editorName}</p>
            <StatusBadge published={portfolio.isPublished} className="mt-1 px-2 py-0 text-[11px]" />
          </div>
        </div>
        {/* Horizontal, scrollable strip on small screens; vertical list from md up. */}
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide md:block md:space-y-0.5 md:overflow-visible">
          {editorNavItems(portfolioId).map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <item.icon className="h-4 w-4 shrink-0" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <h2 className="truncate text-sm font-semibold text-foreground-secondary">{t('editor.portfolioEditor')}</h2>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link to={designHref(portfolioId)}>
              <Eye className="me-2 h-4 w-4" />
              {t('dashboard.nav.design')}
            </Link>
          </Button>
        </div>
        {/* Soft work area so the ivory cards and white fields inside it read as separate layers. */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <PortfolioIdProvider portfolioId={portfolioId}>
            <Outlet />
          </PortfolioIdProvider>
        </div>
      </section>
    </div>
  );
}
