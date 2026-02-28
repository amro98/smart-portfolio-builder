import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, MessageSquare, Star } from 'lucide-react';
import {
  useTestimonials, useCreateTestimonial,
  useUpdateTestimonial, useDeleteTestimonial,
} from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LoadingGrid } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import type { Testimonial } from '@/types';

const testimonialSchema = z.object({
  clientName: z.string().min(1, 'testimonials.errors.clientNameRequired'),
  role: z.string(),
  quote: z.string().min(1, 'testimonials.errors.quoteRequired'),
  avatarUrl: z.string(),
  rating: z.number().min(1).max(5),
  featured: z.boolean(),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => onChange?.(star)}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const { data: testimonials, isLoading, isError, refetch } = useTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: '',
      role: '',
      quote: '',
      avatarUrl: '',
      rating: 5,
      featured: false,
    },
  });

  function openCreate() {
    setEditingItem(null);
    form.reset({
      clientName: '',
      role: '',
      quote: '',
      avatarUrl: '',
      rating: 5,
      featured: false,
    });
    setDialogOpen(true);
  }

  function openEdit(item: Testimonial) {
    setEditingItem(item);
    form.reset({
      clientName: item.clientName,
      role: item.role,
      quote: item.quote,
      avatarUrl: item.avatarUrl,
      rating: item.rating,
      featured: item.featured,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: TestimonialFormValues) {
    if (editingItem) {
      updateTestimonial.mutate(
        { id: editingItem.id, data: values },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createTestimonial.mutate(
        { ...values, order: (testimonials?.length ?? 0) + 1 },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteTestimonial.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('testimonials.title')}>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            {t('testimonials.addButton')}
          </Button>
        </PageHeader>
        <LoadingGrid count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('testimonials.title')} />
        <ErrorState message={t('testimonials.errorLoading')} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('testimonials.title')} description={t('testimonials.headerDescription')}>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('testimonials.addButton')}
        </Button>
      </PageHeader>

      {testimonials && testimonials.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t('testimonials.emptyState.title')}
          description={t('testimonials.emptyState.description')}
          actionLabel={t('testimonials.emptyState.actionLabel')}
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials?.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.clientName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      getInitials(item.clientName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{item.clientName}</p>
                      {item.featured && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {t('testimonials.featuredBadge')}
                        </Badge>
                      )}
                    </div>
                    {item.role && (
                      <p className="truncate text-xs text-muted-foreground">{item.role}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <blockquote className="flex-1 text-sm text-muted-foreground italic line-clamp-4">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <StarRating value={item.rating} readOnly />
                <div className="flex items-center gap-2 border-t pt-3">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    {t('testimonials.actions.edit')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    {t('testimonials.actions.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? t('testimonials.editButton') : t('testimonials.addButton')}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? t('testimonials.form.editDescription')
                : t('testimonials.form.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">{t('testimonials.clientNameLabel')}</Label>
              <Input id="clientName" placeholder={t('testimonials.clientNamePlaceholder')} {...form.register('clientName')} />
              {form.formState.errors.clientName && (
                <p className="text-sm text-destructive">{t(form.formState.errors.clientName.message as string)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('testimonials.roleLabel')}</Label>
              <Input id="role" placeholder={t('testimonials.rolePlaceholder')} {...form.register('role')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote">{t('testimonials.quoteLabel')}</Label>
              <Textarea
                id="quote"
                placeholder={t('testimonials.quotePlaceholder')}
                rows={3}
                {...form.register('quote')}
              />
              {form.formState.errors.quote && (
                <p className="text-sm text-destructive">{t(form.formState.errors.quote.message as string)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('testimonials.ratingLabel')}</Label>
              <Controller
                name="rating"
                control={form.control}
                render={({ field }) => (
                  <StarRating value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="featured" className="cursor-pointer">{t('testimonials.featuredLabel')}</Label>
                <p className="text-xs text-muted-foreground">{t('testimonials.featuredDescription')}</p>
              </div>
              <Controller
                name="featured"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    id="featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('testimonials.cancelButton')}
              </Button>
              <Button
                type="submit"
                disabled={createTestimonial.isPending || updateTestimonial.isPending}
              >
                {createTestimonial.isPending || updateTestimonial.isPending
                  ? t('testimonials.savingButton')
                  : editingItem
                    ? t('testimonials.updateButton')
                    : t('testimonials.createButton')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('testimonials.deleteConfirmTitle')}
        description={t('testimonials.deleteConfirmDescription', { name: deleteTarget?.clientName || '' })}
        confirmLabel={t('testimonials.deleteConfirmButton')}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
