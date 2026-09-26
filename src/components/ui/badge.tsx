import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        // Neutral chip (tags, categories).
        secondary: 'border-border bg-secondary text-foreground-secondary',
        destructive: 'border-transparent bg-destructive-soft text-destructive-soft-foreground',
        outline: 'border-input text-foreground',
        // Semantic statuses use soft fills so the text keeps ≥4.5:1 contrast.
        success: 'border-transparent bg-success-soft text-success-soft-foreground',
        warning: 'border-transparent bg-warning-soft text-warning-soft-foreground',
        // Unpublished / inactive status.
        draft: 'border-transparent bg-draft-soft text-draft-soft-foreground',
        // Accent highlight (Recommended, Suggested).
        soft: 'border-transparent bg-brand-soft text-brand-soft-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
