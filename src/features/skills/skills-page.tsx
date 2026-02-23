"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import {
  useSkills,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
} from "@/lib/query/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import type { Skill } from "@/types";

const CATEGORY_SUGGESTIONS = [
  "Frontend",
  "Backend",
  "DevOps",
  "Design",
  "Soft Skills",
  "Tools",
  "Medical Skills",
  "Legal Areas",
  "Business",
  "Other",
];

const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string(),
  proficiency: z.number().min(0).max(100),
});

type SkillFormValues = z.infer<typeof skillSchema>;

export default function SkillsPage() {
  const { data: skills, isLoading, isError, error } = useSkills();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      category: "",
      proficiency: 50,
    },
  });

  const categoryValue = form.watch("category");
  const proficiencyValue = form.watch("proficiency");

  const filteredSuggestions = useMemo(() => {
    if (!categoryValue) return CATEGORY_SUGGESTIONS;
    return CATEGORY_SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(categoryValue.toLowerCase())
    );
  }, [categoryValue]);

  const groupedSkills = useMemo(() => {
    if (!skills || skills.length === 0) return {};
    const groups: Record<string, Skill[]> = {};
    skills.forEach((skill: Skill) => {
      const cat = skill.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    const sorted: Record<string, Skill[]> = {};
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sorted[key] = groups[key];
      });
    return sorted;
  }, [skills]);

  const openCreateDialog = useCallback(() => {
    setEditingSkill(null);
    form.reset({
      name: "",
      category: "",
      proficiency: 50,
    });
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback(
    (skill: Skill) => {
      setEditingSkill(skill);
      form.reset({
        name: skill.name || "",
        category: skill.category || "",
        proficiency: skill.proficiency ?? 50,
      });
      setDialogOpen(true);
    },
    [form]
  );

  const onSubmit = useCallback(
    async (values: SkillFormValues) => {
      try {
        if (editingSkill) {
          await updateSkill.mutateAsync({
            id: editingSkill.id,
            data: values,
          });
          toast.success("Skill updated successfully");
        } else {
          await createSkill.mutateAsync({
            ...values,
            order: (skills?.length ?? 0) + 1,
          });
          toast.success("Skill created successfully");
        }
        setDialogOpen(false);
        form.reset();
      } catch {
        toast.error(
          editingSkill ? "Failed to update skill" : "Failed to create skill"
        );
      }
    },
    [editingSkill, createSkill, updateSkill, form]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteSkill.mutateAsync(deleteTarget.id);
      toast.success("Skill deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete skill");
    }
  }, [deleteTarget, deleteSkill]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Skills">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </PageHeader>
        <LoadingGrid />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Skills">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </PageHeader>
        <ErrorState message={error?.message || "Failed to load skills"} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Skills">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </PageHeader>

      {!skills || skills.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No skills added"
          description="Add your skills to showcase your expertise and proficiency levels."
          actionLabel="Add Skill"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedSkills).map(
              ([category, categorySkills]) => (
                <motion.div
                  key={category}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      {category}
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      {categorySkills.length}
                    </Badge>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categorySkills.map((skill: Skill) => (
                      <motion.div
                        key={skill.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground truncate">
                                {skill.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs font-normal"
                              >
                                {skill.category || "Uncategorized"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditDialog(skill)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(skill)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Proficiency
                            </span>
                            <span className="font-medium text-foreground">
                              {skill.proficiency ?? 0}%
                            </span>
                          </div>
                          <Progress
                            value={skill.proficiency ?? 0}
                            className="h-2"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSkill ? "Edit Skill" : "Add Skill"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. React, Python, Project Management"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="relative space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Frontend, Backend, DevOps"
                autoComplete="off"
                {...form.register("category")}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-md">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full rounded-md px-3 py-1.5 text-left text-sm text-popover-foreground transition-colors hover:bg-accent"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        form.setValue("category", suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="proficiency">Proficiency</Label>
                <span className="text-sm font-medium text-foreground">
                  {proficiencyValue ?? 50}%
                </span>
              </div>
              <Controller
                control={form.control}
                name="proficiency"
                render={({ field }) => (
                  <input
                    id="proficiency"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={field.value ?? 50}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-foreground
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-sm
                      [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:shadow-sm
                      [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-foreground
                      [&::-webkit-slider-runnable-track]:rounded-full"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSkill.isPending || updateSkill.isPending}
              >
                {createSkill.isPending || updateSkill.isPending
                  ? "Saving..."
                  : editingSkill
                    ? "Update Skill"
                    : "Create Skill"}
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
        title="Delete Skill"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
