import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingGrid } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import { templateList } from '@/lib/presets/templates';
import { TemplateThumbnail } from './template-thumbnails';
import { usePortfolios, useUpdatePortfolio } from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';
import type { TemplateId } from '@/types';

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
      await applyTemplate.mutateAsync({ templateId });
      toast.success(t('templates.applySuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('templates.applyError'));
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row">
      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="h-9 flex-1">
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
      <Button
        size="sm"
        variant="outline"
        onClick={() => void handleApply()}
        disabled={!selectedId || applyTemplate.isPending}
      >
        {applyTemplate.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {t('templates.applyButton')}
      </Button>
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isLoading, isError, error, refetch } = usePortfolios();

  function handleUseForNewPortfolio(templateId: TemplateId) {
    navigate('/portfolios/new', { state: { templateId } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('templates.title')}
        description={t('templates.description')}
      />

      {isLoading ? (
        <LoadingGrid count={4} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Unable to load your portfolios.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {templateList.map((template) => (
            <Card key={template.id} className="flex flex-col overflow-hidden">
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <TemplateThumbnail templateId={template.id} className="h-full w-full" />
                {!template.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Badge variant="secondary">{t('templates.comingSoon')}</Badge>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{template.label}</CardTitle>
                  {template.available && (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Check className="h-3 w-3" /> {t('templates.available')}
                    </Badge>
                  )}
                </div>
                <CardDescription>{t(`templates.desc.${template.id}`)}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter className="flex-col items-stretch gap-3">
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!template.available}
                  onClick={() => handleUseForNewPortfolio(template.id)}
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {t('templates.startNew')}
                </Button>
                {template.available && <ApplyToPortfolio templateId={template.id} />}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
