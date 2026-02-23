import { useState, useMemo } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LoadingPage } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import { cn } from '@/lib/utils';

export default function PublishPage() {
  const { data: portfolio, isLoading, isError, refetch } = usePortfolio();
  const publishPortfolio = usePublishPortfolio();
  const unpublishPortfolio = useUnpublishPortfolio();
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);

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
      { label: 'Profile complete (name, title, bio)', passed: hasProfile },
      { label: 'Portfolio slug set', passed: hasSlug },
      { label: 'At least one visible section', passed: hasVisibleSection },
      { label: 'Public contact method set (email or social link)', passed: hasContactMethod },
    ];
  }, [portfolio]);

  const allChecksPassed = checklist.every((item) => item.passed);

  function handleCopyUrl() {
    navigator.clipboard.writeText(publicUrl);
    toast.success('URL copied to clipboard');
  }

  function handlePublish() {
    publishPortfolio.mutate();
  }

  function handleUnpublish() {
    unpublishPortfolio.mutate(undefined, {
      onSuccess: () => setShowUnpublishDialog(false),
    });
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError || !portfolio) {
    return (
      <div className="space-y-6">
        <PageHeader title="Publish" />
        <ErrorState message="Failed to load portfolio" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Publish"
        description="Manage your portfolio visibility and share it with the world"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Publish Status</CardTitle>
              <CardDescription>
                Control whether your portfolio is publicly accessible
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {portfolio.isPublished ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-400">
                  Your portfolio is live!
                </span>
              </div>
              {portfolio.publishedAt && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                  Published on{' '}
                  {new Date(portfolio.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-700 dark:text-blue-400">
                  Your portfolio is not published
                </span>
              </div>
              <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">
                Publishing makes your portfolio accessible via a public URL. You can
                unpublish at any time.
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Public URL</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm">
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
          <CardTitle className="text-lg">Pre-Publish Checklist</CardTitle>
          <CardDescription>
            Make sure your portfolio is ready before publishing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {item.passed ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    item.passed ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
                variant="default"
                className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
              >
                Published
              </Badge>
              <p className="text-sm text-muted-foreground">
                Your portfolio is currently live and accessible to anyone with the link.
              </p>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setShowUnpublishDialog(true)}
              >
                Unpublish Portfolio
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              {!allChecksPassed && (
                <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Some checklist items are incomplete. You can still publish, but your portfolio may appear incomplete.</span>
                </div>
              )}
              <Button
                size="lg"
                onClick={handlePublish}
                disabled={publishPortfolio.isPending}
              >
                <Globe className="mr-2 h-4 w-4" />
                {publishPortfolio.isPending ? 'Publishing...' : 'Publish Portfolio'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Share Your Portfolio</CardTitle>
              <CardDescription>
                Share your portfolio on social media and beyond
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleCopyUrl}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
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
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
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
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        title="Unpublish Portfolio"
        description="Are you sure you want to unpublish your portfolio? It will no longer be accessible via the public URL."
        confirmLabel="Unpublish"
        onConfirm={handleUnpublish}
        destructive
      />
    </div>
  );
}
