"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Star,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useReorderProjects,
} from "@/lib/query/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingGrid } from "@/components/shared/loading-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Project } from "@/types";
import { useI18n } from "@/lib/i18n";

const projectSchema = z.object({
  title: z.string().min(1, "projects.titleRequired"),
  category: z.string(),
  shortDescription: z.string().min(1, "projects.shortDescriptionRequired"),
  fullDescription: z.string(),
  tags: z.string(),
  coverImage: z.string(),
  liveUrl: z.string(),
  repositoryUrl: z.string(),
  featured: z.boolean(),
  status: z.enum(["draft", "published"]),
  date: z.string(),
  clientName: z.string(),
  roleInProject: z.string(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

function SortableProjectCard({
  t,
  project,
  onEdit,
  onDelete,
}: {
  t: (key: string) => string;
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
        isDragging ? "z-50 shadow-lg opacity-90" : ""
      }`}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {project.status && (
            <Badge
              variant={project.status === "published" ? "default" : "secondary"}
              className="text-xs"
            >
              {project.status}
            </Badge>
          )}
          {project.category && (
            <Badge variant="outline" className="bg-background/80 text-xs">
              {project.category}
            </Badge>
          )}
        </div>
        {project.featured && (
          <div className="absolute top-2 right-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">
              {project.title}
            </h3>
            {project.shortDescription && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {project.shortDescription}
              </p>
            )}
          </div>
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t('projects.liveLabel')}
              </a>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(project)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(project)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const { t } = useI18n();
  const { data: projects, isLoading, isError, error } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const reorderProjects = useReorderProjects();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      category: "",
      shortDescription: "",
      fullDescription: "",
      tags: "",
      coverImage: "",
      liveUrl: "",
      repositoryUrl: "",
      featured: false,
      status: "draft",
      date: "",
      clientName: "",
      roleInProject: "",
    },
  });

  const openCreateDialog = useCallback(() => {
    setEditingProject(null);
    form.reset({
      title: "",
      category: "",
      shortDescription: "",
      fullDescription: "",
      tags: "",
      coverImage: "",
      liveUrl: "",
      repositoryUrl: "",
      featured: false,
      status: "draft",
      date: "",
      clientName: "",
      roleInProject: "",
    });
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback(
    (project: Project) => {
      setEditingProject(project);
      form.reset({
        title: project.title || "",
        category: project.category || "",
        shortDescription: project.shortDescription || "",
        fullDescription: project.fullDescription || "",
        tags: project.tags ? project.tags.join(", ") : "",
        coverImage: project.coverImage || "",
        liveUrl: project.liveUrl || "",
        repositoryUrl: project.repositoryUrl || "",
        featured: project.featured || false,
        status: project.status || "draft",
        date: project.date || "",
        clientName: project.clientName || "",
        roleInProject: project.roleInProject || "",
      });
      setDialogOpen(true);
    },
    [form]
  );

  const onSubmit = useCallback(
    async (values: ProjectFormValues) => {
      const payload = {
        ...values,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      try {
        if (editingProject) {
          await updateProject.mutateAsync({
            id: editingProject.id,
            data: payload,
          });
          toast.success("Project updated successfully");
        } else {
          await createProject.mutateAsync({
            ...payload,
            order: (projects?.length ?? 0) + 1,
            galleryImages: [],
            externalUrl: '',
          });
          toast.success("Project created successfully");
        }
        setDialogOpen(false);
        form.reset();
      } catch {
        toast.error(
          editingProject
            ? "Failed to update project"
            : "Failed to create project"
        );
      }
    },
    [editingProject, createProject, updateProject, form]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject.mutateAsync(deleteTarget.id);
      toast.success("Project deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete project");
    }
  }, [deleteTarget, deleteProject]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !projects) return;
      const oldIndex = projects.findIndex(
        (p: Project) => p.id === active.id
      );
      const newIndex = projects.findIndex(
        (p: Project) => p.id === over.id
      );
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(projects, oldIndex, newIndex);
      const items = reordered.map((p: Project, index: number) => ({ id: p.id, order: index + 1 }));
      reorderProjects.mutate(items);
    },
    [projects, reorderProjects]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('projects.title')}>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            {t('projects.addProject')}
          </Button>
        </PageHeader>
        <LoadingGrid />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('projects.title')}>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t('projects.addProject')}
          </Button>
        </PageHeader>
        <ErrorState message={error?.message || "Failed to load projects"} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('projects.title')}>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('projects.addProject')}
        </Button>
      </PageHeader>

      {!projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={t('projects.emptyState.title')}
          description={t('projects.emptyState.description')}
          actionLabel={t('projects.emptyState.actionLabel')}
          onAction={openCreateDialog}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((p: Project) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {projects.map((project: Project) => (
                  <SortableProjectCard
                    t={t}
                    key={project.id}
                    project={project}
                    onEdit={openEditDialog}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? t('projects.editProject') : t('projects.addProject')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t('projects.titleLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder={t('projects.titlePlaceholder')}
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {t(`${form.formState.errors.title.message}`)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t('projects.categoryLabel')}</Label>
                <Input
                  id="category"
                  placeholder={t('projects.categoryPlaceholder')}
                  {...form.register("category")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">
                {t('projects.shortDescriptionLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shortDescription"
                placeholder={t('projects.shortDescriptionPlaceholder')}
                {...form.register("shortDescription")}
              />
              {form.formState.errors.shortDescription && (
                <p className="text-sm text-destructive">
                  {t(`${form.formState.errors.shortDescription.message}`)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">{t('projects.fullDescriptionLabel')}</Label>
              <Textarea
                id="fullDescription"
                placeholder={t('projects.fullDescriptionPlaceholder')}
                rows={4}
                {...form.register("fullDescription")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">{t('projects.tagsLabel')}</Label>
              <Input
                id="tags"
                placeholder={t('projects.tagsPlaceholder')}
                {...form.register("tags")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coverImage">{t('projects.coverImageLabel')}</Label>
                <Input
                  id="coverImage"
                  placeholder={t('projects.coverImagePlaceholder')}
                  {...form.register("coverImage")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">{t('projects.dateLabel')}</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register("date")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="liveUrl">{t('projects.liveUrlLabel')}</Label>
                <Input
                  id="liveUrl"
                  placeholder={t('projects.liveUrlPlaceholder')}
                  {...form.register("liveUrl")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repositoryUrl">{t('projects.repositoryUrlLabel')}</Label>
                <Input
                  id="repositoryUrl"
                  placeholder={t('projects.repositoryUrlPlaceholder')}
                  {...form.register("repositoryUrl")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">{t('projects.clientNameLabel')}</Label>
                <Input
                  id="clientName"
                  placeholder={t('projects.clientNamePlaceholder')}
                  {...form.register("clientName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleInProject">{t('projects.roleInProjectLabel')}</Label>
                <Input
                  id="roleInProject"
                  placeholder={t('projects.roleInProjectPlaceholder')}
                  {...form.register("roleInProject")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Controller
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <Switch
                      id="featured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  {t('projects.featuredLabel')}
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t('projects.statusLabel')}</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t('projects.statusDraft')}</SelectItem>
                        <SelectItem value="published">{t('projects.statusPublished')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t('projects.cancelButton')}
              </Button>
              <Button
                type="submit"
                disabled={
                  createProject.isPending || updateProject.isPending
                }
              >
                {createProject.isPending || updateProject.isPending
                  ? t('projects.savingButton')
                  : editingProject
                    ? t('projects.updateButton')
                    : t('projects.createButton')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t('projects.deleteConfirmTitle')}
        description={t('projects.deleteConfirmDescription', { title: deleteTarget?.title ?? '' })}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
