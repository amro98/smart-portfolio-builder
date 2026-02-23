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
  title: z.string().min(1, 'Title is required'),
  institution: z.string().min(1, 'Institution is required'),
  type: z.enum(['education', 'certification']),
  issueDate: z.string(),
  expiryDate: z.string(),
  credentialId: z.string(),
  verificationUrl: z.string(),
});

type CertificationFormValues = z.infer<typeof certificationSchema>;

export default function CertificationsPage() {
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
          title={activeTab === 'education' ? 'No education entries' : 'No certifications'}
          description={
            activeTab === 'education'
              ? 'Add your educational background to showcase your qualifications.'
              : 'Add your certifications to highlight your professional credentials.'
          }
          actionLabel="Add Entry"
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
                  {item.type === 'education' ? 'Education' : 'Certification'}
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
                  <span>ID: {item.credentialId}</span>
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
                  Verify Credential
                </a>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
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
        <PageHeader title="Certifications & Education">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </PageHeader>
        <LoadingGrid count={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Certifications & Education" />
        <ErrorState message="Failed to load certifications" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Certifications & Education" description="Manage your qualifications and credentials">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="education">
            Education ({educationItems.length})
          </TabsTrigger>
          <TabsTrigger value="certification">
            Certifications ({certificationItems.length})
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
            <DialogTitle>{editingItem ? 'Edit Entry' : 'Add Entry'}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Update the details for this entry.'
                : 'Fill in the details for your new entry.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Bachelor of Science" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" placeholder="e.g. MIT" {...form.register('institution')} />
              {form.formState.errors.institution && (
                <p className="text-sm text-destructive">{form.formState.errors.institution.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input id="issueDate" type="date" {...form.register('issueDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" type="date" {...form.register('expiryDate')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credentialId">Credential ID</Label>
              <Input id="credentialId" placeholder="e.g. ABC-12345" {...form.register('credentialId')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationUrl">Verification URL</Label>
              <Input id="verificationUrl" placeholder="https://..." {...form.register('verificationUrl')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCertification.isPending || updateCertification.isPending}
              >
                {createCertification.isPending || updateCertification.isPending
                  ? 'Saving...'
                  : editingItem
                    ? 'Update Entry'
                    : 'Add Entry'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Entry"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
