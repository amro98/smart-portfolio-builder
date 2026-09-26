import { useMemo, useState } from 'react';
import {
  Globe,
  Copy,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Share2,
  Twitter,
  Linkedin,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolio, usePublishPortfolio, useUnpublishPortfolio } from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingPage } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { cn } from '@/lib/utils';

export default function PublishPage() {
  const { data: portfolio, isLoading, isError, refetch } = usePortfolio();
  const publishPortfolio = usePublishPortfolio();
  const unpublishPortfolio = useUnpublishPortfolio();
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const { t } = useI18n();

  const publicUrl = portfolio
    ? `${window.location.origin}/u/${portfolio.slug}`
    : '';

  const checklist = useMemo(() => {
    if (!portfolio) return [];

    const hasProfile = !!(portfolio.fullName && portfolio.title && portfolio.bio);
    const hasSlug = !!portfolio.slug;
    const hasVisibleSection = Object.values(portfolio.sectionVisibility).some(
      (v) => v === true
    );
    const hasContactMethod =
      !!portfolio.email ||
      !!portfolio.socialLinks.linkedin ||
      !!portfolio.socialLinks.github ||
      !!portfolio.socialLinks.twitter ||
      !!portfolio.socialLinks.instagram ||
      !!portfolio.socialLinks.website;

    return [
      { label: t('publish.checklist.profile'), passed: hasProfile },
      { label: t('publish.checklist.slug'), passed: hasSlug },
      { label: t('publish.checklist.section'), passed: hasVisibleSection },
      { label: t('publish.checklist.contact'), passed: hasContactMethod },
    ];
  }, [portfolio, t]);

  const allChecksPassed = checklist.every((item) => item.passed);

  function handleCopyUrl() {
    navigator.clipboard.writeText(publicUrl);
    toast.success(t('publish.copySuccess'));
  }

  function handlePublish() {
    publishPortfolio.mutate();
  }

  function handleUnpublish() {
    unpublishPortfolio.mutate(undefined, {
      onSuccess: () => setShowUnpublishConfirm(false),
    });
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError || !portfolio) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('publish.title')} />
        <ErrorState message={t('publish.errorLoading')} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('publish.title')}
        description={t('publish.description')}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground"><Globe className="h-5 w-5" /></span>
            <div>
              <CardTitle className="text-lg">{t('publish.status.title')}</CardTitle>
              <CardDescription>
                {t('publish.status.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {portfolio.isPublished ? (
            <div className="rounded-lg border border-success/25 bg-success-soft p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-soft-foreground" />
                <span className="font-medium text-success-soft-foreground">
                  {t('publish.status.live')}
                </span>
              </div>
              {portfolio.publishedAt && (
                <p className="mt-1 text-sm text-success-soft-foreground/90">
                  {t('publish.status.publishedOn', {
                    date: new Date(portfolio.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                  })}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-draft-soft p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-draft-soft-foreground" />
                <span className="font-medium text-draft-soft-foreground">
                  {t('publish.status.notLive')}
                </span>
              </div>
              <p className="mt-1 text-sm text-draft-soft-foreground/90">
                {t('publish.status.unpublishedInfo')}
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">{t('publish.publicUrlLabel')}</p>
            <div className="flex items-center gap-2">
              <div dir="ltr" className="min-w-0 flex-1 truncate rounded-md border border-input bg-surface-secondary px-3 py-2 font-mono text-sm text-foreground-secondary">
                {publicUrl}
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                disabled={!portfolio.isPublished}
              >
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(!portfolio.isPublished && 'pointer-events-none opacity-50')}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('publish.preChecklist.title')}</CardTitle>
          <CardDescription>
            {t('publish.preChecklist.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border border-divider bg-surface-secondary px-3 py-2.5">
                {item.passed ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-soft"><Check className="h-3.5 w-3.5 text-success-soft-foreground" /></span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive-soft"><X className="h-3.5 w-3.5 text-destructive-soft-foreground" /></span>
                )}
                <span
                  className={cn(
                    'text-sm',
                    item.passed ? 'text-foreground' : 'text-destructive-soft-foreground'
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {portfolio.isPublished ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Badge
                variant="success"
                className="gap-1.5"
              >
                {t('publish.badge.published')}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {t('publish.status.live')}
              </p>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setShowUnpublishConfirm(true)}
                disabled={unpublishPortfolio.isPending}
              >
                {unpublishPortfolio.isPending ? t('publish.button.unpublishing') : t('publish.button.unpublish')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              {!allChecksPassed && (
                <div className="flex items-center gap-2 rounded-md border border-warning/25 bg-warning-soft px-4 py-2 text-sm text-warning-soft-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t('publish.notice.incomplete')}</span>
                </div>
              )}
              <Button
                size="lg"
                onClick={handlePublish}
                disabled={publishPortfolio.isPending}
              >
                <Globe className="me-2 h-4 w-4" />
                {publishPortfolio.isPending ? t('publish.button.publishing') : t('publish.button.publish')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground"><Share2 className="h-5 w-5" /></span>
            <div>
            <CardTitle className="text-lg">{t('publish.share.title')}</CardTitle>
            <CardDescription>
              {t('publish.share.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleCopyUrl}>
              <Copy className="me-2 h-4 w-4" />
              {t('publish.share.copy')}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}`,
                  '_blank'
                )
              }
              disabled={!portfolio.isPublished}
            >
              <Twitter className="me-2 h-4 w-4" />
              {t('publish.share.twitter')}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`,
                  '_blank'
                )
              }
              disabled={!portfolio.isPublished}
            >
              <Linkedin className="me-2 h-4 w-4" />
              {t('publish.share.linkedin')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showUnpublishConfirm}
        onOpenChange={setShowUnpublishConfirm}
        title={t('publish.unpublishDialog.title')}
        description={t('publish.unpublishDialog.description')}
        confirmLabel={t('publish.unpublishDialog.confirmButton')}
        onConfirm={handleUnpublish}
        destructive
      />
    </div>
  );
}
