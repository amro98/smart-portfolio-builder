import { Fragment } from 'react';
import { resolveMediaUrl } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import type { SectionId } from '@/types';

// Tiny shared components for the second-generation templates (see kit.ts for the hooks).

/** Renders the visible sections in the portfolio's order. */
export function Sections({ order, render }: { order: SectionId[]; render: Partial<Record<SectionId, () => React.ReactNode>> }) {
  return (
    <>
      {order.map((id) => (
        <Fragment key={id}>{render[id]?.()}</Fragment>
      ))}
    </>
  );
}

export function Media({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return <img src={resolveMediaUrl(src)} alt={alt} loading={eager ? 'eager' : 'lazy'} className={cn('h-full w-full object-cover', className)} />;
}

