import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Coins, Clock, DollarSign } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/lib/query/hooks';
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
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priceLabel: z.string(),
  duration: z.string(),
  ctaLabel: z.string(),
  ctaLink: z.string(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function ServicesPage() {
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
        <PageHeader title="Services">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </PageHeader>
        <LoadingGrid count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Services" />
        <ErrorState message="Failed to load services" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="Manage the services you offer">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </PageHeader>

      {services && services.length === 0 ? (
        <EmptyState
          icon={Coins}
          title="No services yet"
          description="Add your first service to showcase what you offer to clients."
          actionLabel="Add Service"
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
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(service)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Update the details for this service.'
                : 'Fill in the details to add a new service.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Web Development" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this service includes..."
                rows={3}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceLabel">Price Label</Label>
                <Input id="priceLabel" placeholder="e.g. From $500" {...form.register('priceLabel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" placeholder="e.g. 2-4 weeks" {...form.register('duration')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaLabel">CTA Label</Label>
                <Input id="ctaLabel" placeholder="e.g. Get Started" {...form.register('ctaLabel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaLink">CTA Link</Label>
                <Input id="ctaLink" placeholder="e.g. https://..." {...form.register('ctaLink')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createService.isPending || updateService.isPending}
              >
                {createService.isPending || updateService.isPending
                  ? 'Saving...'
                  : editingService
                    ? 'Update Service'
                    : 'Add Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
