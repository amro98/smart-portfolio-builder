import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Image } from 'lucide-react';
import {
  useGallery, useCreateGalleryItem,
  useUpdateGalleryItem, useDeleteGalleryItem,
} from '@/lib/query/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LoadingGrid } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import type { GalleryItem } from '@/types';

const gallerySchema = z.object({
  title: z.string(),
  imageUrl: z.string().min(1, 'Image URL is required'),
  category: z.string(),
  description: z.string(),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

export default function GalleryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const { data: gallery, isLoading, isError, refetch } = useGallery();
  const createGalleryItem = useCreateGalleryItem();
  const updateGalleryItem = useUpdateGalleryItem();
  const deleteGalleryItem = useDeleteGalleryItem();

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      title: '',
      imageUrl: '',
      category: '',
      description: '',
    },
  });

  function openCreate() {
    setEditingItem(null);
    form.reset({
      title: '',
      imageUrl: '',
      category: '',
      description: '',
    });
    setDialogOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditingItem(item);
    form.reset({
      title: item.title,
      imageUrl: item.imageUrl,
      category: item.category,
      description: item.description,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: GalleryFormValues) {
    if (editingItem) {
      updateGalleryItem.mutate(
        { id: editingItem.id, data: values },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createGalleryItem.mutate(
        { ...values, order: (gallery?.length ?? 0) + 1 },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteGalleryItem.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Gallery">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </PageHeader>
        <LoadingGrid count={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Gallery" />
        <ErrorState message="Failed to load gallery" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Gallery" description="Manage your portfolio images and media">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </PageHeader>

      {gallery && gallery.length === 0 ? (
        <EmptyState
          icon={Image}
          title="No images yet"
          description="Add images to create a visual showcase of your work."
          actionLabel="Add Image"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {gallery?.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              <div className="aspect-square">
                <img
                  src={item.imageUrl}
                  alt={item.title || 'Gallery image'}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {item.title && (
                  <p className="truncate text-sm font-medium text-white">{item.title}</p>
                )}
                {item.category && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {item.category}
                  </Badge>
                )}
              </div>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Image' : 'Add Image'}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Update the details for this image.'
                : 'Add a new image to your gallery.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" placeholder="https://example.com/image.jpg" {...form.register('imageUrl')} />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
              )}
              {form.watch('imageUrl') && (
                <div className="mt-2 overflow-hidden rounded-md border">
                  <img
                    src={form.watch('imageUrl')}
                    alt="Preview"
                    className="h-40 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Project Screenshot" {...form.register('title')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g. Photography, Design" {...form.register('category')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this image..."
                rows={2}
                {...form.register('description')}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGalleryItem.isPending || updateGalleryItem.isPending}
              >
                {createGalleryItem.isPending || updateGalleryItem.isPending
                  ? 'Saving...'
                  : editingItem
                    ? 'Update Image'
                    : 'Add Image'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Image"
        description={`Are you sure you want to delete "${deleteTarget?.title || 'this image'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
