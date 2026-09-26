import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingGrid } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import { FilterChip } from '@/components/shared/filter-chip';
import {
  TEMPLATE_CATEGORIES, TEMPLATE_STYLE_FILTERS, templateList, type TemplateCategory, type TemplateDefinition, type TemplateTag,
} from '@/lib/presets/templates';
import { bestProfessionsFor, rankTemplatesForProfession } from '@/lib/presets/recommendations';
import { backendToFrontendPortfolio } from '@/lib/api/client';
import { TemplateThumbnail } from './template-thumbnails';
import { usePortfolios, useUpdatePortfolio } from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';
import type { ProfessionCategory, TemplateId } from '@/types';

type CategoryFilter = 'all' | 'recommended' | TemplateCategory;

function ApplyToPortfolio({ templateId }: { templateId: TemplateId }) {
  const { t } = useI18n();
  const { data: portfolios = [] } = usePortfolios();
  const [selectedId, setSelectedId] = useState<string>('');
  const applyTemplate = useUpdatePortfolio(selectedId || undefined);

  if (portfolios.length === 0) return null;

  async function handleApply() {
    if (!selectedId) {
      toast.error(t('templates.chooseFirst'));
      return;
    }
    try {
      // Presentation only: every piece of content, order and visibility is kept.
      await applyTemplate.mutateAsync({ templateId });
      toast.success(t('templates.applySuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('templates.applyError'));
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row">
      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="h-9 min-w-0 flex-1">
          <SelectValue placeholder={t('templates.applyPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {portfolios.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" variant="outline" className="shrink-0" onClick={() => void handleApply()} disabled={!selectedId || applyTemplate.isPending}>
        {applyTemplate.isPending && <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" />}
        {t('templates.applyButton')}
      </Button>
    </div>
  );
}

function CatalogCard({ template, rank, onStart }: { template: TemplateDefinition; rank?: number; onStart: () => void }) {
  const { t } = useI18n();
  const best = bestProfessionsFor(template, 3);
  return (
    <Card className="group flex flex-col overflow-hidden transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-input hover:shadow-card-hover">
      <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-canvas">
        <TemplateThumbnail templateId={template.id} className="h-full w-full" />
        {rank !== undefined && (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-soft-foreground shadow-sm ring-1 ring-brand/30">
            <Sparkles className="h-3.5 w-3.5" /> {t('design.template.rank', { rank })}
          </span>
        )}
      </div>
      <CardContent className="flex-1 space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
          <span className="shrink-0 rounded-full border border-border bg-surface-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{template.colorModes.length > 1 ? t('design.template.lightDark') : t(template.defaultMode === 'dark' ? 'common.dark' : 'common.light')}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground-secondary">{t(`templates.${template.id}.description`)}</p>
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span key={tag} className="rounded-md border border-border bg-surface-secondary px-2 py-0.5 text-xs font-medium text-foreground-secondary">{t(`templates.tag.${tag}`)}</span>
          ))}
        </div>
        {best.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('design.template.bestFor')}:</span> {best.map((p) => t(`profession.${p}`)).join(' · ')}
          </p>
        )}
      </CardContent>
      <CardFooter className="mt-auto flex-col items-stretch gap-2.5 border-t border-border bg-surface-secondary p-5">
        <Button size="sm" className="w-full" onClick={onStart}>
          <Sparkles className="me-2 h-3.5 w-3.5" />
          {t('templates.startNew')}
        </Button>
        <ApplyToPortfolio templateId={template.id} />
      </CardFooter>
    </Card>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data: portfolios = [], isLoading, isError, error, refetch } = usePortfolios();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [style, setStyle] = useState<TemplateTag | null>(null);

  // "Recommended for me" follows the profession of the portfolio edited most recently.
  const myProfession = useMemo<ProfessionCategory | null>(() => {
    const latest = [...portfolios].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
    return latest ? backendToFrontendPortfolio(latest).profession : null;
  }, [portfolios]);
  const ranked = useMemo(() => (myProfession ? rankTemplatesForProfession(myProfession, 6) : []), [myProfession]);
  const rankOf = (id: TemplateId) => ranked.find((r) => r.template.id === id)?.rank;

  const visible = useMemo(() => {
    let list: TemplateDefinition[] =
      category === 'recommended'
        ? ranked.map((r) => r.template)
        : category === 'all'
          ? [...templateList]
          : templateList.filter((tpl) => tpl.categories.includes(category));
    if (style) list = list.filter((tpl) => tpl.tags.includes(style));
    return list;
  }, [category, style, ranked]);

  return (
    <div className="space-y-6">
      <PageHeader title={t('templates.title')} description={t('templates.description')} />

      {/* Filter toolbar */}
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>{t('templates.filter.all')}</FilterChip>
          {myProfession && ranked.length > 0 && (
            <FilterChip active={category === 'recommended'} onClick={() => setCategory('recommended')}>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />{t('templates.filter.recommended')}</span>
            </FilterChip>
          )}
          {TEMPLATE_CATEGORIES.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>{t(`templates.category.${c}`)}</FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-divider pt-3">
          <span className="me-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('templates.filter.style')}</span>
          {TEMPLATE_STYLE_FILTERS.map((tag) => (
            <FilterChip key={tag} active={style === tag} onClick={() => setStyle(style === tag ? null : tag)}>{t(`templates.tag.${tag}`)}</FilterChip>
          ))}
        </div>
        {category === 'recommended' && myProfession && (
          <p className="flex items-center gap-1.5 text-sm text-primary-soft-foreground"><Sparkles className="h-3.5 w-3.5" />{t('templates.filter.recommendedHint', { profession: t(`profession.${myProfession}`) })}</p>
        )}
      </div>

      {isLoading ? (
        <LoadingGrid count={6} />
      ) : isError ? (
        <ErrorState message={error instanceof Error ? error.message : 'Unable to load your portfolios.'} onRetry={() => void refetch()} />
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-input bg-card p-10 text-center text-sm text-foreground-secondary">{t('templates.filter.empty')}</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((template) => (
            <CatalogCard
              key={template.id}
              template={template}
              rank={category === 'recommended' ? rankOf(template.id) : undefined}
              onStart={() => navigate('/portfolios/new', { state: { templateId: template.id } })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
