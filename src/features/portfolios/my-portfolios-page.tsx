import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Copy, Eye, FolderPlus, Globe, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingGrid } from '@/components/shared/loading-card';
import { useDeletePortfolio, usePortfolios } from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';
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

function formatDate(iso: string, lang: string) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-US', { dateStyle: 'medium' }).format(new Date(iso));
}

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '·';
}

export default function MyPortfoliosPage() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    data: backendPortfolios = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePortfolios();
  const deletePortfolio = useDeletePortfolio();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const query = searchParams.get('q') ?? '';

  const allPortfolios = useMemo(
    () => backendPortfolios.map(toPortfolioCard),
    [backendPortfolios]
  );

  const portfolios = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allPortfolios;
    return allPortfolios.filter(
      (p) => p.name.toLowerCase().includes(trimmed) || p.slug.toLowerCase().includes(trimmed)
    );
  }, [allPortfolios, query]);

  function clearSearch() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      return next;
    });
  }

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
      <PageHeader title={t('myPortfolios.title')} description={t('myPortfolios.description')}>
        <Button asChild>
          <Link to="/portfolios/new">
            <Plus className="me-2 h-4 w-4" />
            {t('myPortfolios.createButton')}
          </Link>
        </Button>
      </PageHeader>

      {query && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary-soft px-3 py-2 text-sm">
          <Search className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 truncate text-foreground-secondary">
            {t('myPortfolios.searchResults', { query })}
          </span>
          <Button variant="ghost" size="sm" className="ms-auto h-7 px-2" onClick={clearSearch}>
            <X className="me-1 h-3.5 w-3.5" />
            {t('myPortfolios.clearSearch')}
          </Button>
        </div>
      )}

      {isLoading ? (
        <LoadingGrid count={3} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Unable to load portfolios'}
          onRetry={() => void refetch()}
        />
      ) : portfolios.length === 0 && query ? (
        <EmptyState
          icon={Search}
          title={t('myPortfolios.noSearchResults', { query })}
          description={t('myPortfolios.empty.description')}
          actionLabel={t('myPortfolios.clearSearch')}
          onAction={clearSearch}
        />
      ) : portfolios.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title={t('myPortfolios.empty.title')}
          description={t('myPortfolios.empty.description')}
          actionLabel={t('myPortfolios.createButton')}
          onAction={() => navigate('/portfolios/new')}
          decorated
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className="group flex flex-col overflow-hidden transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-input hover:shadow-card-hover"
            >
              <div className="flex items-start gap-3 p-5 pb-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand-soft-foreground">
                  {initialsOf(portfolio.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-base font-semibold leading-snug text-foreground">{portfolio.name}</h3>
                    <StatusBadge published={portfolio.status === 'published'} />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-foreground-secondary">{portfolio.profession}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    <span dir="ltr">/u/{portfolio.slug}</span>
                  </p>
                </div>
              </div>

              <p className="mx-5 flex items-center gap-1.5 border-t border-divider py-3 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {t('myPortfolios.updated', { date: formatDate(portfolio.updatedAt, lang) })}
              </p>

              <div className="mt-auto flex items-start gap-2 border-t border-border bg-surface-secondary px-5 py-3">
                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => navigate(`/portfolios/${portfolio.id}/overview`)}>
                    <Pencil className="me-1.5 h-3.5 w-3.5" />
                    {t('myPortfolios.card.edit')}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => navigate(`/portfolios/${portfolio.id}/design`)}>
                    <Eye className="me-1.5 h-3.5 w-3.5" />
                    {t('myPortfolios.card.preview')}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => navigate(`/portfolios/${portfolio.id}/publish`)}>
                    <Globe className="me-1.5 h-3.5 w-3.5" />
                    {t('myPortfolios.card.publish')}
                  </Button>
                </div>

                {/* Secondary and destructive actions live in the overflow menu, away from the
                    everyday actions. */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground" aria-label={t('myPortfolios.card.more')}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem disabled className="gap-2" title={t('myPortfolios.card.duplicateTooltip')}>
                      <Copy className="h-4 w-4" />
                      {t('myPortfolios.card.duplicate')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 text-destructive focus:bg-destructive-soft focus:text-destructive-soft-foreground"
                      onClick={() => setDeleteTargetId(portfolio.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('myPortfolios.card.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
        title={t('myPortfolios.deleteDialog.title')}
        description={t('myPortfolios.deleteDialog.description', { name: deleteTarget?.name ?? '' })}
        onConfirm={handleDeleteConfirm}
        destructive
      />
    </div>
  );
}
