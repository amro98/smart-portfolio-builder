import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from './dnd-modifiers';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { SectionId } from '@/types';

function Row({
  id, index, count, visible, onToggle, onMove,
}: {
  id: SectionId;
  index: number;
  count: number;
  visible: boolean;
  onToggle: () => void;
  onMove: (to: number) => void;
}) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5', isDragging && 'z-10 border-primary/40 shadow-lg', !visible && 'bg-secondary opacity-70')}
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label={t('design.sections.drag', { section: t(`sections.${id}`) })}>
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{t(`sections.${id}`)}</span>
      <button type="button" disabled={index === 0} onClick={() => onMove(index - 1)} className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30" aria-label={t('design.sections.moveUp')}>
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" disabled={index === count - 1} onClick={() => onMove(index + 1)} className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30" aria-label={t('design.sections.moveDown')}>
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <Switch checked={visible} onCheckedChange={onToggle} aria-label={t(visible ? 'design.sections.hide' : 'design.sections.show', { section: t(`sections.${id}`) })} />
    </li>
  );
}

/** Show/hide and reorder the portfolio's sections (canonical list, all always present). */
export function SectionsControl({
  order,
  visibility,
  onChange,
}: {
  order: SectionId[];
  visibility: Record<SectionId, boolean>;
  onChange: (patch: { sectionOrder?: SectionId[]; sectionVisibility?: Record<SectionId, boolean> }) => void;
}) {
  const { t } = useI18n();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const move = (from: number, to: number) => onChange({ sectionOrder: arrayMove(order, from, to) });
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    move(order.indexOf(active.id as SectionId), order.indexOf(over.id as SectionId));
  };
  const visibleCount = order.filter((s) => visibility[s]).length;
  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">{t('design.sections.help', { visible: visibleCount, total: order.length })}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1.5">
            {order.map((id, i) => (
              <Row
                key={id}
                id={id}
                index={i}
                count={order.length}
                visible={!!visibility[id]}
                onToggle={() => onChange({ sectionVisibility: { ...visibility, [id]: !visibility[id] } })}
                onMove={(to) => move(i, to)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
