import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** A collapsible settings group in the Design panel. */
export function ControlGroup({
  icon: Icon,
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  /** Short current-value hint shown while collapsed. */
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-accent/60"
      >
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors', open ? 'bg-primary-soft text-primary-soft-foreground' : 'bg-secondary text-muted-foreground')}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          {summary && !open && <span className="block truncate text-xs text-muted-foreground">{summary}</span>}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** A small label for a sub-block inside a group. */
export function ControlLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)}>{children}</p>;
}
