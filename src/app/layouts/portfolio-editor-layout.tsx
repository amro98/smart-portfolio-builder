import { useMemo } from 'react';
import { Link, Navigate, NavLink, Outlet, useParams } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/lib/query/hooks';
import { PortfolioIdProvider } from '@/app/providers/portfolio-id-provider';
import { LoadingPage } from '@/components/shared/loading-card';
import { cn } from '@/lib/utils';

export default function PortfolioEditorLayout() {
  const { portfolioId } = useParams();
  const { data: portfolio, isLoading, isError } = usePortfolio(portfolioId);

  const previewHref = useMemo(() => {
    if (portfolio?.slug) {
      return `/u/${portfolio.slug}`;
    }
    return `/portfolios/${portfolioId}/overview`;
  }, [portfolio?.slug, portfolioId]);

  if (!portfolioId) {
    return <Navigate to="/portfolios" replace />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError || !portfolio) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">Portfolio not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been deleted, or you don't have access to it.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/portfolios">Back to My Portfolios</Link>
        </Button>
      </div>
    );
  }

  const editorName = portfolio.fullName?.trim() || portfolio.title?.trim() || portfolio.slug || 'Untitled Portfolio';

  const editorNavItems = [
    { label: 'Overview', to: `/portfolios/${portfolioId}/overview` },
    { label: 'Profile', to: `/portfolios/${portfolioId}/profile` },
    { label: 'Projects', to: `/portfolios/${portfolioId}/projects` },
    { label: 'Experience', to: `/portfolios/${portfolioId}/experience` },
    { label: 'Skills', to: `/portfolios/${portfolioId}/skills` },
    { label: 'Services', to: `/portfolios/${portfolioId}/services` },
    { label: 'Certifications', to: `/portfolios/${portfolioId}/certifications` },
    { label: 'Testimonials', to: `/portfolios/${portfolioId}/testimonials` },
    { label: 'Gallery', to: `/portfolios/${portfolioId}/gallery` },
    { label: 'Appearance', to: `/portfolios/${portfolioId}/appearance` },
    { label: 'Sections', to: `/portfolios/${portfolioId}/sections` },
    { label: 'Preview', to: `/portfolios/${portfolioId}/preview` },
    { label: 'Publish', to: `/portfolios/${portfolioId}/publish` },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
    );

  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <aside className="rounded-lg border border-border bg-card p-3">
        <p className="truncate px-3 pb-3 text-sm font-semibold text-foreground">
          Editing: {editorName}
        </p>
        <nav className="space-y-1">
          {editorNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-muted-foreground">Portfolio Editor</h2>
          <Button asChild size="sm" variant="outline">
            <Link to={previewHref} target="_blank" rel="noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
        </div>
        <div className="p-4 md:p-5">
          <PortfolioIdProvider portfolioId={portfolioId}>
            <Outlet />
          </PortfolioIdProvider>
        </div>
      </section>
    </div>
  );
}
