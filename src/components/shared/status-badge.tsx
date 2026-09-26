import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Published / Draft pill used wherever a portfolio's publish state is shown. */
export function StatusBadge({ published, className }: { published: boolean; className?: string }) {
  const { t } = useI18n();
  return (
    <Badge variant={published ? 'success' : 'draft'} className={cn('shrink-0 gap-1.5 font-medium', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', published ? 'bg-success' : 'bg-draft')} aria-hidden />
      {t(published ? 'overview.stats.value.published' : 'overview.stats.value.draft')}
    </Badge>
  );
}
