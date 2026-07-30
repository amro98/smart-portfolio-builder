import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingGrid } from '@/components/shared/loading-card';
import { useDeletePortfolio, usePortfolios } from '@/lib/query/hooks';
import type { BackendPortfolio } from '@/types';

type PortfolioStatus = 'draft' | 'published';

interface PortfolioCard {
  id: string;
  name: string;
  slug: string;
  profession: string;
  status: PortfolioStatus;
  updatedAt: string; // ISO date string
}

function getProfessionLabel(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Portfolio';

  const portfolioData = data as Record<string, unknown>;
  const value =
    typeof portfolioData.title === 'string'
      ? portfolioData.title
      : typeof portfolioData.profession === 'string'
        ? portfolioData.profession
        : null;

  return value?.trim() || 'Portfolio';
}

function toPortfolioCard(portfolio: BackendPortfolio): PortfolioCard {
  return {
    id: portfolio.id,
    name: portfolio.name,
    slug: portfolio.slug,
    profession: getProfessionLabel(portfolio.data),
    status: portfolio.status === 'PUBLISHED' ? 'published' : 'draft',
    updatedAt: portfolio.updatedAt,
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso));
}

export default function MyPortfoliosPage() {
  const navigate = useNavigate();
  const {
    data: backendPortfolios = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePortfolios();
  const deletePortfolio = useDeletePortfolio();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const portfolios = useMemo(
    () => backendPortfolios.map(toPortfolioCard),
    [backendPortfolios]
  );

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return;

    try {
      await deletePortfolio.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // The mutation displays the backend error and leaves the list unchanged.
    }
  }

  const deleteTarget = portfolios.find((p) => p.id === deleteTargetId);

  return (
    <div className="space-y-6">
      <PageHeader title="My Portfolios" description="Manage and edit all your portfolio sites.">
        <Button asChild>
          <Link to="/portfolios/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Portfolio
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <LoadingGrid count={3} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Unable to load portfolios'}
          onRetry={() => void refetch()}
        />
      ) : portfolios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">No portfolios yet.</p>
          <p className="mt-1 text-sm">Click "Create New Portfolio" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{portfolio.name}</CardTitle>
                  <Badge
                    variant={portfolio.status === 'published' ? 'success' : 'secondary'}
                    className="shrink-0 capitalize"
                  >
                    {portfolio.status}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  {portfolio.profession} · /u/{portfolio.slug}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pb-2">
                <p className="text-xs text-muted-foreground">Updated {formatDate(portfolio.updatedAt)}</p>
              </CardContent>

              <CardFooter className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/portfolios/${portfolio.id}/overview`)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/u/${portfolio.slug}`, '_blank')}
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/portfolios/${portfolio.id}/publish`)}
                >
                  <Globe className="mr-1.5 h-3.5 w-3.5" />
                  Publish
                </Button>

                <Button size="sm" variant="ghost" disabled>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Duplicate
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTargetId(portfolio.id)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
        title="Delete Portfolio"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ''}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        destructive
      />
    </div>
  );
}
