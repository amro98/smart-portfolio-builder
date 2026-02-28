import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Coins, Clock, DollarSign } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LoadingGrid } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import type { Service } from '@/types';

const serviceSchema = z.object({
  title: z.string().min(1, 'services.titleRequired'),
  description: z.string().min(1, 'services.descriptionRequired'),
  priceLabel: z.string(),
  duration: z.string(),
  ctaLabel: z.string(),
  ctaLink: z.string(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function ServicesPage() {
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const { data: services, isLoading, isError, refetch } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      description: '',
      priceLabel: '',
      duration: '',
      ctaLabel: '',
      ctaLink: '',
    },
  });

  function openCreate() {
    setEditingService(null);
    form.reset({
      title: '',
      description: '',
      priceLabel: '',
      duration: '',
      ctaLabel: '',
      ctaLink: '',
    });
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    form.reset({
      title: service.title,
      description: service.description,
      priceLabel: service.priceLabel,
      duration: service.duration,
      ctaLabel: service.ctaLabel,
      ctaLink: service.ctaLink,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: ServiceFormValues) {
    if (editingService) {
      updateService.mutate(
        { id: editingService.id, data: values },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createService.mutate(
        { ...values, order: (services?.length ?? 0) + 1 },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteService.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('services.title')}>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            {t('services.addButton')}
          </Button>
        </PageHeader>
        <LoadingGrid count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('services.title')} />
        <ErrorState message={t('services.errorLoading')} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('services.title')} description={t('services.headerDescription')}>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('services.addButton')}
        </Button>
      </PageHeader>

      {services && services.length === 0 ? (
        <EmptyState
          icon={Coins}
          title={t('services.emptyState.title')}
          description={t('services.emptyState.description')}
          actionLabel={t('services.emptyState.actionLabel')}
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services?.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{service.title}</CardTitle>
                  {service.priceLabel && (
                    <Badge variant="secondary" className="shrink-0">
                      <DollarSign className="mr-1 h-3 w-3" />
                      {service.priceLabel}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {service.description}
                </p>
                {service.duration && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{service.duration}</span>
                  </div>
                )}
                {service.ctaLabel && (
                  <p className="text-sm font-medium text-primary">
                    {service.ctaLabel}
                  </p>
                )}
              </CardContent>
              <CardFooter className="gap-2 border-t pt-4">
                <Button variant="ghost" size="sm" onClick={() => openEdit(service)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  {t('services.actions.edit')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(service)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  {t('services.actions.delete')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingService ? t('services.editButton') : t('services.addButton')}</DialogTitle>
            <DialogDescription>
              {editingService
                ? t('services.form.editDescription')
                : t('services.form.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('services.titleLabel')}</Label>
              <Input id="title" placeholder={t('services.titlePlaceholder')} {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{t(form.formState.errors.title.message as string)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('services.descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('services.descriptionPlaceholder')}
                rows={3}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{t(form.formState.errors.description.message as string)}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceLabel">{t('services.priceLabelLabel')}</Label>
                <Input id="priceLabel" placeholder={t('services.priceLabelPlaceholder')} {...form.register('priceLabel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">{t('services.durationLabel')}</Label>
                <Input id="duration" placeholder={t('services.durationPlaceholder')} {...form.register('duration')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaLabel">{t('services.ctaLabelLabel')}</Label>
                <Input id="ctaLabel" placeholder={t('services.ctaLabelPlaceholder')} {...form.register('ctaLabel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaLink">{t('services.ctaLinkLabel')}</Label>
                <Input id="ctaLink" placeholder={t('services.ctaLinkPlaceholder')} {...form.register('ctaLink')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('services.cancelButton')}
              </Button>
              <Button
                type="submit"
                disabled={createService.isPending || updateService.isPending}
              >
                {createService.isPending || updateService.isPending
                  ? t('services.savingButton')
                  : editingService
                    ? t('services.updateButton')
                    : t('services.createButton')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('services.deleteConfirmTitle')}
        description={t('services.deleteConfirmDescription', { title: deleteTarget?.title || '' })}
        confirmLabel={t('services.deleteConfirmButton')}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
