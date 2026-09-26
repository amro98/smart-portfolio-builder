import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'error' | 'success' | 'info';

const STYLES: Record<Variant, { box: string; icon: typeof AlertCircle; iconClass: string }> = {
  error: { box: 'border-destructive/30 bg-destructive/5', icon: AlertCircle, iconClass: 'text-destructive' },
  success: { box: 'border-teal-600/30 bg-teal-600/5', icon: CheckCircle2, iconClass: 'text-teal-600' },
  info: { box: 'border-border bg-muted/50', icon: Info, iconClass: 'text-muted-foreground' },
};

/** Inline, announced message panel for auth screens, with optional follow-up actions. */
export function AuthNotice({
  variant,
  title,
  children,
  actions,
  className,
}: {
  variant: Variant;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const { box, icon: Icon, iconClass } = STYLES[variant];
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={cn('rounded-lg border p-4 text-sm', box, className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} aria-hidden />
        <div className="min-w-0 flex-1 space-y-1">
          {title && <p className="font-medium text-foreground">{title}</p>}
          {children && <div className="text-muted-foreground">{children}</div>}
          {actions && <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
