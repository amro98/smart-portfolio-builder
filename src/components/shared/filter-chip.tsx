import { cn } from '@/lib/utils';

/** Toggleable filter pill: soft teal when selected, warm white with a neutral border otherwise. */
export function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'border-primary/50 bg-primary-soft text-primary-soft-foreground'
          : 'border-border bg-card text-foreground-secondary hover:border-input hover:bg-accent hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}
