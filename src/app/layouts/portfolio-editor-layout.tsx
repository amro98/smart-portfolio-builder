import { Link, Navigate, NavLink, Outlet, useParams, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/lib/query/hooks';
import { PortfolioIdProvider } from '@/app/providers/portfolio-id-provider';
import { LoadingPage } from '@/components/shared/loading-card';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function PortfolioEditorLayout() {
  const { portfolioId } = useParams();
  const location = useLocation();
  const { t } = useI18n();
  const { data: portfolio, isLoading, isError } = usePortfolio(portfolioId);

  // Always the authenticated draft preview — never /u/:slug. A draft portfolio has no
  // public page yet (or has an outdated one if it was unpublished after a previous
  // publish), so this must show the latest saved data regardless of publish status.
  const previewHref = `/portfolios/${portfolioId}/preview`;
  // The Preview page already IS this view — showing a button that opens the same page
  // again in a new tab there is redundant. Every other editor page still gets it.
  const isOnPreviewPage = location.pathname === previewHref;

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

  const editorName = portfolio.fullName?.trim() || portfolio.title?.trim() || portfolio.slug || t('editor.untitled');

  const editorNavItems = [
    { labelKey: 'dashboard.nav.overview', to: `/portfolios/${portfolioId}/overview` },
    { labelKey: 'dashboard.nav.profile', to: `/portfolios/${portfolioId}/profile` },
    { labelKey: 'dashboard.nav.projects', to: `/portfolios/${portfolioId}/projects` },
    { labelKey: 'dashboard.nav.experience', to: `/portfolios/${portfolioId}/experience` },
    { labelKey: 'dashboard.nav.skills', to: `/portfolios/${portfolioId}/skills` },
    { labelKey: 'dashboard.nav.services', to: `/portfolios/${portfolioId}/services` },
    { labelKey: 'dashboard.nav.certifications', to: `/portfolios/${portfolioId}/certifications` },
    { labelKey: 'dashboard.nav.testimonials', to: `/portfolios/${portfolioId}/testimonials` },
    { labelKey: 'dashboard.nav.gallery', to: `/portfolios/${portfolioId}/gallery` },
    { labelKey: 'dashboard.nav.appearance', to: `/portfolios/${portfolioId}/appearance` },
    { labelKey: 'dashboard.nav.sections', to: `/portfolios/${portfolioId}/sections` },
    { labelKey: 'dashboard.nav.preview', to: `/portfolios/${portfolioId}/preview` },
    { labelKey: 'dashboard.nav.publish', to: `/portfolios/${portfolioId}/publish` },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
    );

  return (
    // h-full (bounded by AppLayout's already-scrolling <main>) + min-h-0 so this grid never
    // grows taller than the viewport itself; only the content pane below scrolls.
    <div className="grid h-full min-h-0 gap-4 md:grid-cols-[240px_1fr]">
      <aside className="overflow-y-auto rounded-lg border border-border bg-card p-3">
        <p className="truncate px-3 pb-3 text-sm font-semibold text-foreground">
          {t('editor.editing', { name: editorName })}
        </p>
        <nav className="space-y-1">
          {editorNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col rounded-lg border border-border bg-card">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-muted-foreground">{t('editor.portfolioEditor')}</h2>
          {!isOnPreviewPage && (
            <Button asChild size="sm" variant="outline">
              <Link to={previewHref} target="_blank" rel="noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                {t('common.preview')}
              </Link>
            </Button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
          <PortfolioIdProvider portfolioId={portfolioId}>
            <Outlet />
          </PortfolioIdProvider>
        </div>
      </section>
    </div>
  );
}
