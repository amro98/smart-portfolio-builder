import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { TemplateThumbnail } from '@/features/templates/template-thumbnails';
import { bestProfessionsFor } from '@/lib/presets/recommendations';
import type { TemplateDefinition } from '@/lib/presets/templates';

/**
 * Selectable template card used by the Design panel and the Create Portfolio wizard: real
 * mini preview, name, personality tags, "best for" professions and selected state. A div
 * with role="button" because the preview contains the real template's own buttons/links.
 */
export function TemplateCard({
  template,
  selected,
  onSelect,
  rank,
  compact,
  showDescription,
}: {
  template: TemplateDefinition;
  selected: boolean;
  onSelect: () => void;
  /** 1-based recommendation rank, when this template is recommended. */
  rank?: number;
  compact?: boolean;
  showDescription?: boolean;
}) {
  const { t, lang } = useI18n();
  const best = bestProfessionsFor(template, compact ? 2 : 3);
  const sep = lang === 'ar' ? '، ' : ', ';
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={template.name}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onSelect();
      }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border-2 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
          ? 'border-primary bg-primary-soft shadow-card ring-4 ring-primary/10'
          : 'border-border bg-card hover:border-input hover:shadow-card-hover'
      )}
    >
      <div className={cn('relative w-full overflow-hidden border-b border-border bg-canvas', compact ? 'aspect-[16/10]' : 'aspect-video')}>
        <TemplateThumbnail templateId={template.id} className="h-full w-full" />
        {rank !== undefined && (
          <span className="absolute start-2 top-2 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground shadow-sm ring-1 ring-brand/30">
            {t('design.template.rank', { rank })}
          </span>
        )}
        {selected && (
          <span className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className={compact ? 'p-2.5' : 'p-3'}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate text-sm font-semibold', selected && 'text-primary-soft-foreground')}>{template.name}</p>
          {template.colorModes.length > 1 && <span className="shrink-0 text-[10px] text-muted-foreground">{t('design.template.lightDark')}</span>}
        </div>
        {showDescription && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`templates.${template.id}.description`)}</p>}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {template.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <span key={tag} className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{t(`templates.tag.${tag}`)}</span>
          ))}
        </div>
        {best.length > 0 && (
          <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
            {t('design.template.bestFor')}: {best.map((p) => t(`profession.${p}`)).join(sep)}
          </p>
        )}
      </div>
    </div>
  );
}
