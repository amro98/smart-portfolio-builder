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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, Pencil, Trash2, Briefcase } from "lucide-react";
import { toast } from "sonner";

import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useReorderExperiences,
} from "@/lib/query/hooks";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import type { Experience } from "@/types";
import { useI18n } from "@/lib/i18n";

const experienceSchema = z.object({
  company: z.string().min(1, "experience.companyRequired"),
  role: z.string().min(1, "experience.roleRequired"),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  location: z.string(),
  description: z.string(),
  industryTag: z.string(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

function SortableExperienceCard({
  experience,
  onEdit,
  onDelete,
}: {
  experience: Experience;
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const descriptionBullets: string[] = experience.description ?? [];

  const dateRange = [
    experience.startDate ? formatDate(experience.startDate) : null,
    experience.current
      ? "Present"
      : experience.endDate
        ? formatDate(experience.endDate)
        : null,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "z-50 shadow-lg opacity-90" : ""
      }`}
    >
      <div className="flex gap-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 shrink-0 cursor-grab rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-foreground">
                {experience.role}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                {experience.company}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {experience.industryTag && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {experience.industryTag}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(experience)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(experience)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {dateRange && <span>{dateRange}</span>}
            {experience.location && (
              <>
                <span className="hidden sm:inline">|</span>
                <span>{experience.location}</span>
              </>
            )}
          </div>

          {descriptionBullets.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {descriptionBullets.map((bullet: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperiencePage() {
  const { t } = useI18n();
  const { data: experiences, isLoading, isError, error } = useExperiences();
  const createExperience = useCreateExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();
  const reorderExperiences = useReorderExperiences();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<Experience | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      location: "",
      description: "",
      industryTag: "",
    },
  });

  const currentValue = form.watch("current");

  const openCreateDialog = useCallback(() => {
    setEditingExperience(null);
    form.reset({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      location: "",
      description: "",
      industryTag: "",
    });
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback(
    (experience: Experience) => {
      setEditingExperience(experience);
      const descriptionText = experience.description
        ? Array.isArray(experience.description)
          ? experience.description.join("\n")
          : experience.description
        : "";
      form.reset({
        company: experience.company || "",
        role: experience.role || "",
        startDate: experience.startDate || "",
        endDate: experience.endDate || "",
        current: experience.current || false,
        location: experience.location || "",
        description: descriptionText,
        industryTag: experience.industryTag || "",
      });
      setDialogOpen(true);
    },
    [form]
  );

  const onSubmit = useCallback(
    async (values: ExperienceFormValues) => {
      const payload = {
        ...values,
        description: values.description
          ? values.description
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          : [],
        endDate: values.current ? '' : values.endDate,
      };
      try {
        if (editingExperience) {
          await updateExperience.mutateAsync({
            id: editingExperience.id,
            data: payload,
          });
          toast.success("Experience updated successfully");
        } else {
          await createExperience.mutateAsync({
            ...payload,
            order: (experiences?.length ?? 0) + 1,
          });
          toast.success("Experience created successfully");
        }
        setDialogOpen(false);
        form.reset();
      } catch {
        toast.error(
          editingExperience
            ? "Failed to update experience"
            : "Failed to create experience"
        );
      }
    },
    [editingExperience, createExperience, updateExperience, form]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteExperience.mutateAsync(deleteTarget.id);
      toast.success("Experience deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete experience");
    }
  }, [deleteTarget, deleteExperience]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !experiences) return;
      const oldIndex = experiences.findIndex(
        (e: Experience) => e.id === active.id
      );
      const newIndex = experiences.findIndex(
        (e: Experience) => e.id === over.id
      );
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(experiences, oldIndex, newIndex);
      const items = reordered.map((e: Experience, index: number) => ({ id: e.id, order: index + 1 }));
      reorderExperiences.mutate(items);
    },
    [experiences, reorderExperiences]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Experience">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            {t('experience.addButton')}
          </Button>
        </PageHeader>
        <LoadingGrid />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Experience">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t('experience.addButton')}
          </Button>
        </PageHeader>
        <ErrorState
          message={error?.message || "Failed to load experiences"}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('experience.title')}>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('experience.addButton')}
        </Button>
      </PageHeader>

      {!experiences || experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t('experience.emptyState.title')}
          description={t('experience.emptyState.description')}
          actionLabel={t('experience.emptyState.actionLabel')}
          onAction={openCreateDialog}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={experiences.map((e: Experience) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {experiences.map((experience: Experience) => (
                  <SortableExperienceCard
                    key={experience.id}
                    experience={experience}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingExperience ? t('experience.editButton') : t('experience.addButton')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">
                  {t('experience.companyLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder={t('experience.companyPlaceholder')}
                  {...form.register("company")}
                />
                {form.formState.errors.company && (
                  <p className="text-sm text-destructive">
                    {t(`${form.formState.errors.company.message}`)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">
                  {t('experience.roleLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="role"
                  placeholder={t('experience.rolePlaceholder')}
                  {...form.register("role")}
                />
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive">
                    {t(`${form.formState.errors.role.message}`)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('experience.startDateLabel')}</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('experience.endDateLabel')}</Label>
                <Input
                  id="endDate"
                  type="date"
                  disabled={currentValue}
                  placeholder={currentValue ? "Present" : ""}
                  {...form.register("endDate")}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="current"
                render={({ field }) => (
                  <Checkbox
                    id="current"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        form.setValue("endDate", "");
                      }
                    }}
                  />
                )}
              />
              <Label htmlFor="current" className="cursor-pointer text-sm">
                {t('experience.currentLabel')}
              </Label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">{t('experience.locationLabel')}</Label>
                <Input
                  id="location"
                  placeholder={t('experience.locationPlaceholder')}
                  {...form.register("location")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industryTag">{t('experience.industryTagLabel')}</Label>
                <Input
                  id="industryTag"
                  placeholder={t('experience.industryTagPlaceholder')}
                  {...form.register("industryTag")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('experience.descriptionLabel')}
              </Label>
              <Textarea
                id="description"
                placeholder={t('experience.descriptionPlaceholder')}
                rows={5}
                {...form.register("description")}
              />
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t('experience.cancelButton')}
              </Button>
              <Button
                type="submit"
                disabled={
                  createExperience.isPending || updateExperience.isPending
                }
              >
                {createExperience.isPending || updateExperience.isPending
                  ? t('experience.saving')
                  : editingExperience
                    ? t('experience.updateExperience')
                    : t('experience.createExperience')}
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
        title={t('experience.deleteConfirmTitle')}
        description={t('experience.deleteConfirmDescription', { role: deleteTarget?.role || '', company: deleteTarget?.company || '' })}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
