import { useMemo } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/lib/query/hooks';
import { cn } from '@/lib/utils';

export default function PortfolioEditorLayout() {
  const { portfolioId } = useParams();
  const { data: portfolio } = usePortfolio();

  const safePortfolioId = portfolioId ?? 'unknown';

  const previewHref = useMemo(() => {
    if (portfolio?.slug) {
      return `/u/${portfolio.slug}`;
    }
    return `/portfolios/${safePortfolioId}/overview`;
  }, [portfolio?.slug, safePortfolioId]);

  const editorNavItems = [
    { label: 'Overview', to: `/portfolios/${safePortfolioId}/overview` },
    { label: 'Profile', to: `/portfolios/${safePortfolioId}/profile` },
    { label: 'Projects', to: `/portfolios/${safePortfolioId}/projects` },
    { label: 'Experience', to: `/portfolios/${safePortfolioId}/experience` },
    { label: 'Skills', to: `/portfolios/${safePortfolioId}/skills` },
    { label: 'Services', to: `/portfolios/${safePortfolioId}/services` },
    { label: 'Certifications', to: `/portfolios/${safePortfolioId}/certifications` },
    { label: 'Testimonials', to: `/portfolios/${safePortfolioId}/testimonials` },
    { label: 'Gallery', to: `/portfolios/${safePortfolioId}/gallery` },
    { label: 'Appearance', to: `/portfolios/${safePortfolioId}/appearance` },
    { label: 'Sections', to: `/portfolios/${safePortfolioId}/sections` },
    { label: 'Publish', to: `/portfolios/${safePortfolioId}/publish` },
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
        <p className="px-3 pb-3 text-sm font-semibold text-foreground">Editing: {safePortfolioId}</p>
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
          <Outlet />
        </div>
      </section>
    </div>
  );
}
