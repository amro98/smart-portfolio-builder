import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Award, ExternalLink } from 'lucide-react';
import {
  useCertifications, useCreateCertification,
  useUpdateCertification, useDeleteCertification,
} from '@/lib/query/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LoadingGrid } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import type { Certification } from '@/types';

const certificationSchema = z.object({
  title: z.string().min(1, 'certifications.titleRequired'),
  institution: z.string().min(1, 'certifications.institutionRequired'),
  type: z.enum(['education', 'certification']),
  issueDate: z.string(),
  expiryDate: z.string(),
  credentialId: z.string(),
  verificationUrl: z.string(),
});

type CertificationFormValues = z.infer<typeof certificationSchema>;

export default function CertificationsPage() {
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Certification | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);
  const [activeTab, setActiveTab] = useState<string>('education');

  const { data: certifications, isLoading, isError, refetch } = useCertifications();
  const createCertification = useCreateCertification();
  const updateCertification = useUpdateCertification();
  const deleteCertification = useDeleteCertification();

  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      title: '',
      institution: '',
      type: 'education',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      verificationUrl: '',
    },
  });

  const educationItems = useMemo(
    () => certifications?.filter((c) => c.type === 'education') ?? [],
    [certifications]
  );

  const certificationItems = useMemo(
    () => certifications?.filter((c) => c.type === 'certification') ?? [],
    [certifications]
  );

  function openCreate() {
    setEditingItem(null);
    form.reset({
      title: '',
      institution: '',
      type: activeTab as 'education' | 'certification',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      verificationUrl: '',
    });
    setDialogOpen(true);
  }

  function openEdit(item: Certification) {
    setEditingItem(item);
    form.reset({
      title: item.title,
      institution: item.institution,
      type: item.type,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate,
      credentialId: item.credentialId,
      verificationUrl: item.verificationUrl,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: CertificationFormValues) {
    if (editingItem) {
      updateCertification.mutate(
        { id: editingItem.id, data: values },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createCertification.mutate(
        { ...values, order: (certifications?.length ?? 0) + 1 },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteCertification.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function renderList(items: Certification[]) {
    if (items.length === 0) {
      return (
        <EmptyState
          icon={Award}
          title={
            activeTab === 'education'
              ? t('certifications.emptyState.title.education')
              : t('certifications.emptyState.title.certification')
          }
          description={
            activeTab === 'education'
              ? t('certifications.emptyState.description.education')
              : t('certifications.emptyState.description.certification')
          }
          actionLabel={t('certifications.emptyState.actionLabel')}
          onAction={openCreate}
        />
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.institution}</p>
                </div>
                <Badge variant={item.type === 'education' ? 'secondary' : 'outline'}>
                  {item.type === 'education' ? t('certifications.badge.education') : t('certifications.badge.certification')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {(item.issueDate || item.expiryDate) && (
                  <span>
                    {formatDate(item.issueDate)}
                    {item.expiryDate && ` - ${formatDate(item.expiryDate)}`}
                  </span>
                )}
                {item.credentialId && (
                  <span>{t('certifications.credentialIdLabel')}: {item.credentialId}</span>
                )}
              </div>
              {item.verificationUrl && (
                <a
                  href={item.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('certifications.verifyLabel')}
                </a>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  {t('certifications.actions.edit')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  {t('certifications.actions.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('certifications.title')}>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            {t('certifications.addButton')}
          </Button>
        </PageHeader>
        <LoadingGrid count={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('certifications.title')} />
        <ErrorState message={t('certifications.errorLoading')} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('certifications.title')} description={t('certifications.headerDescription')}>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('certifications.addButton')}
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="education">
            {t('certifications.tab.education')} ({educationItems.length})
          </TabsTrigger>
          <TabsTrigger value="certification">
            {t('certifications.tab.certification')} ({certificationItems.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="education" className="mt-4">
          {renderList(educationItems)}
        </TabsContent>
        <TabsContent value="certification" className="mt-4">
          {renderList(certificationItems)}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? t('certifications.dialog.editTitle') : t('certifications.dialog.addTitle')}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? t('certifications.dialog.editDescription')
                : t('certifications.dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('certifications.titleLabel')}</Label>
              <Input id="title" placeholder={t('certifications.titlePlaceholder')} {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{t(form.formState.errors.title.message as string)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">{t('certifications.institutionLabel')}</Label>
              <Input id="institution" placeholder={t('certifications.institutionPlaceholder')} {...form.register('institution')} />
              {form.formState.errors.institution && (
                <p className="text-sm text-destructive">{t(form.formState.errors.institution.message as string)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('certifications.typeLabel')}</Label>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('certifications.typeLabel')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">{t('certifications.tab.education')}</SelectItem>
                      <SelectItem value="certification">{t('certifications.tab.certification')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">{t('certifications.issueDateLabel')}</Label>
                <Input id="issueDate" type="date" {...form.register('issueDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">{t('certifications.expiryDateLabel')}</Label>
                <Input id="expiryDate" type="date" {...form.register('expiryDate')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credentialId">{t('certifications.credentialIdLabel')}</Label>
              <Input id="credentialId" placeholder={t('certifications.credentialIdPlaceholder')} {...form.register('credentialId')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationUrl">{t('certifications.verificationUrlLabel')}</Label>
              <Input id="verificationUrl" placeholder={t('certifications.verificationUrlPlaceholder')} {...form.register('verificationUrl')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('certifications.cancelButton')}
              </Button>
              <Button
                type="submit"
                disabled={createCertification.isPending || updateCertification.isPending}
              >
                {createCertification.isPending || updateCertification.isPending
                  ? t('certifications.savingButton')
                  : editingItem
                    ? t('certifications.updateButton')
                    : t('certifications.createButton')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('certifications.deleteConfirmTitle')}
        description={t('certifications.deleteConfirmDescription', { title: deleteTarget?.title || '' })}
        confirmLabel={t('certifications.deleteConfirmButton')}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
