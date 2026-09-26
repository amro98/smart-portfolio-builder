import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Soft organic background shapes — reserved for large, page-level empty states. */
  decorated?: boolean;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, decorated, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-card px-4 py-16 text-center',
        className
      )}
    >
      {decorated && (
        <svg
          aria-hidden
          className="decor-float pointer-events-none absolute inset-0 h-full w-full dark:opacity-60"
          style={{ '--decor-duration': '20s', '--decor-x': '6px', '--decor-y': '-8px', '--decor-scale': '1.02' } as React.CSSProperties}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 800 400"
        >
          <path d="M-40 330C80 250 170 380 300 320S520 180 640 250 860 300 860 300V440H-40Z" fill="hsl(var(--brand-soft))" opacity="0.45" />
          <path d="M620 -30C700 20 760 10 840 60V-40Z" fill="hsl(var(--brand-soft))" opacity="0.5" />
          <circle cx="120" cy="70" r="46" fill="hsl(var(--workspace))" />
        </svg>
      )}
      <div className="relative mb-4 rounded-full bg-brand-soft p-4 ring-8 ring-brand-soft/40">
        <Icon className="h-8 w-8 text-brand-soft-foreground" />
      </div>
      <h3 className="relative mb-1 text-lg font-semibold text-foreground">{title}</h3>
      <p className="relative mb-6 max-w-sm text-sm text-foreground-secondary">{description}</p>
      {actionLabel && onAction && (
        <Button className="relative" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
