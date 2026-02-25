import { useParams, Link } from 'react-router-dom';
import { usePortfolio, usePublicPortfolio } from '@/lib/query/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { PortfolioRenderer } from './portfolio-renderer';
import type { PublicPortfolioData } from '@/types';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50 flex items-center px-6">
        <Skeleton className="h-5 w-32" />
        <div className="ml-auto flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <Skeleton className="w-32 h-32 rounded-full mb-8" />
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-4 w-96 max-w-full mb-2" />
        <Skeleton className="h-4 w-80 max-w-full mb-8" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-36 rounded-md" />
          <Skeleton className="h-12 w-36 rounded-md" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-7xl font-bold text-muted-foreground/20 mb-4">404</div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{t('public.notFound.title')}</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t('public.notFound.description')}
        </p>
        <Link to="/">
          <Button variant="outline" size="lg">
            {t('public.notFound.goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PublicPortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = usePublicPortfolio(slug || '');
  const { data: portfolio } = usePortfolio();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return <NotFoundState />;
  }

  const isMyPortfolioSlug =
  !!portfolio &&
  ((portfolio as any)?.slug === slug || (portfolio as any)?.profile?.slug === slug);

  // data is now guaranteed to be non-null/undefined; build final object
  const dataObj: PublicPortfolioData = {
    ...data,
  portfolio:  isMyPortfolioSlug ? (portfolio as any) : data.portfolio,
  };

  return <PortfolioRenderer data={dataObj} />;
}
