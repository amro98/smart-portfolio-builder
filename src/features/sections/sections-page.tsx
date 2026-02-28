import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  LayoutDashboard,
  User,
  FolderOpen,
  Briefcase,
  Zap,
  Coins,
  Award,
  MessageSquare,
  Image,
  Mail,
  Info,
} from 'lucide-react';
import { usePortfolio, useUpdatePortfolio } from '@/lib/query/hooks';
import { SECTION_LABELS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingPage } from '@/components/shared/loading-card';
import type { SectionId } from '@/types';
import { cn } from '@/lib/utils';

const SECTION_ICONS: Record<SectionId, React.ElementType> = {
  hero: LayoutDashboard,
  about: User,
  projects: FolderOpen,
  experience: Briefcase,
  skills: Zap,
  services: Coins,
  certifications: Award,
  testimonials: MessageSquare,
  gallery: Image,
  contact: Mail,
};

interface SortableItemProps {
  id: SectionId;
  isVisible: boolean;
  onToggleVisibility: (id: SectionId) => void;
  t: (key: string) => string;
}

function SortableItem({ id, isVisible, onToggleVisibility, t }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = SECTION_ICONS[id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm',
        isDragging && 'z-50 opacity-90 shadow-lg'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <span className="flex-1 text-sm font-medium">{t(`sections.${id}`)}</span>

      <Badge
        variant={isVisible ? 'default' : 'secondary'}
        className={cn(
          isVisible
            ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
        )}
      >
        {isVisible ? t('sections.visible') : t('sections.hidden')}
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggleVisibility(id)}
        className="shrink-0"
      >
        {isVisible ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export default function SectionsPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const updatePortfolio = useUpdatePortfolio();
  const { t } = useI18n();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (isLoading || !portfolio) {
    return <LoadingPage />;
  }

  const sectionOrder = portfolio.sectionOrder;
  const sectionVisibility = portfolio.sectionVisibility;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sectionOrder.indexOf(active.id as SectionId);
    const newIndex = sectionOrder.indexOf(over.id as SectionId);
    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);

    updatePortfolio.mutate({ sectionOrder: newOrder });
  }

  function handleToggleVisibility(id: SectionId) {
    const newVisibility = {
      ...sectionVisibility,
      [id]: !sectionVisibility[id],
    };
    updatePortfolio.mutate({ sectionVisibility: newVisibility });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('sections.pageTitle')}
        description={t('sections.pageDescription')}
      />

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>{t('sections.helpText')}</span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sectionOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sectionOrder.map((sectionId) => (
                <SortableItem
                  key={sectionId}
                  id={sectionId}
                  isVisible={sectionVisibility[sectionId]}
                  onToggleVisibility={handleToggleVisibility}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>
    </div>
  );
}
