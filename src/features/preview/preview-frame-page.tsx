import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { usePortfolio } from '@/lib/query/hooks';
import { applyDesign } from '@/lib/design/design-settings';
import { PortfolioRenderer } from '@/features/public-portfolio/portfolio-renderer';
import type { PublicPortfolioData } from '@/types';
import { useDesignFromParent } from './preview-bridge';

// A route with NO SaaS chrome at all — just the portfolio, on its own real page. The Design &
// Preview workspace embeds it in an <iframe> so the portfolio gets a genuinely independent
// document/viewport: real media queries at the chosen device width, its own
// IntersectionObserver realm for scroll animations, and its own fixed/sticky containing
// block. Content comes from the authenticated, ownership-checked GET /portfolios/:id (a
// draft is never exposed publicly); the design comes live from the parent workspace's
// unsaved draft when there is one.
export default function PreviewFramePage() {
  const { portfolioId } = useParams();
  const { data: portfolio, isLoading, isError } = usePortfolio();
  const liveDesign = useDesignFromParent(portfolioId);

  const data = useMemo<PublicPortfolioData | null>(() => {
    if (!portfolio) return null;
    const effective = liveDesign ? applyDesign(portfolio, liveDesign) : portfolio;
    return {
      portfolio: effective,
      projects: portfolio.projects,
      experiences: portfolio.experiences,
      skills: portfolio.skills,
      services: portfolio.services,
      certifications: portfolio.certifications,
      testimonials: portfolio.testimonials,
      gallery: portfolio.gallery,
    };
  }, [portfolio, liveDesign]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">Portfolio not found.</p>
      </div>
    );
  }

  // No `embedded` — this document IS the portfolio's own page, same as /u/:slug.
  return <PortfolioRenderer data={data} />;
}
