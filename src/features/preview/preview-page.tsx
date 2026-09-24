import { useParams } from 'react-router-dom';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingPage } from '@/components/shared/loading-card';
import { useUIStore } from '@/store';
import { usePortfolio } from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';

export default function PreviewPage() {
  const { portfolioId } = useParams();
  const { t } = useI18n();
  const { previewDevice, setPreviewDevice } = useUIStore();

  // Only used here to know whether there's a real, accessible portfolio to preview at all —
  // the actual rendering happens in the iframe below, on its own real page/document, so
  // normal responsive CSS and IntersectionObserver-based animations behave exactly as they
  // would for a real visitor instead of being faked from inside this page's DOM.
  const { data: portfolio, isLoading, isError } = usePortfolio(portfolioId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('preview.title')} description={t('preview.loading')} />
        <LoadingPage />
      </div>
    );
  }

  if (isError || !portfolio) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('preview.title')} description={t('preview.noData')} />
      </div>
    );
  }

  const frameSrc = `/portfolios/${portfolioId}/preview-frame`;

  return (
    <div className="space-y-6">
      <PageHeader title={t('preview.title')} description={t('preview.description')}>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/50">
          <Button
            variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('desktop')}
            className="gap-2"
          >
            <Monitor className="w-4 h-4" />
            {t('preview.desktop')}
          </Button>
          <Button
            variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('mobile')}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            {t('preview.mobile')}
          </Button>
        </div>
      </PageHeader>

      <div className="flex justify-center">
        {previewDevice === 'desktop' ? (
          <div className="w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <iframe
              src={frameSrc}
              title="Desktop preview"
              className="h-[calc(100vh-200px)] w-full border-0"
            />
          </div>
        ) : (
          <div className="w-[390px] max-w-full overflow-hidden rounded-[2rem] border-[6px] border-foreground/20 bg-background shadow-sm">
            <div className="h-6 bg-foreground/10 flex items-center justify-center">
              <div className="w-20 h-1.5 rounded-full bg-foreground/20" />
            </div>
            {/* Real navigation into its own page (not a portal) — a ~390px-wide iframe
                gives the portfolio a genuine independent viewport, so its sm:/md:/lg:
                classes, IntersectionObserver-based reveal animations, and any
                fixed/sticky elements all behave exactly as they would on a real phone. */}
            <iframe
              src={frameSrc}
              title="Mobile preview"
              className="h-[700px] w-full border-0"
            />
            <div className="h-5 bg-foreground/10 flex items-center justify-center">
              <div className="w-24 h-1 rounded-full bg-foreground/20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
