import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

// Motion template interaction layer: a desktop-only custom cursor and floating outline shapes.

/** Dot + trailing ring cursor. Only on fine pointers, never under reduced motion or embedded. */
export function MotionCursor({ enabled }: { enabled: boolean }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (!enabled || reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    setActive(true);
    document.documentElement.classList.add('motion-cursor');
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      setHovering(!!el?.closest('a, button, [role="button"], [data-cursor="hover"]'));
    };
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      document.documentElement.classList.remove('motion-cursor');
    };
  }, [enabled, reduceMotion, x, y]);

  if (!active) return null;
  return (
    <>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--primary))]" style={{ x, y }} />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[hsl(var(--primary)/0.7)]"
        style={{ x: rx, y: ry }}
        animate={{ width: hovering ? 64 : 34, height: hovering ? 64 : 34, backgroundColor: hovering ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--primary) / 0)' }}
        transition={{ duration: 0.25 }}
      />
    </>
  );
}

type ShapeKind = 'ring' | 'square' | 'triangle' | 'plus';

function ShapePath({ kind }: { kind: ShapeKind }) {
  const s = { fill: 'none', strokeWidth: 2.5, style: { stroke: 'hsl(var(--primary) / 0.7)' } };
  if (kind === 'ring') return <circle cx="30" cy="30" r="22" {...s} />;
  if (kind === 'square') return <rect x="10" y="10" width="40" height="40" rx="10" {...s} />;
  if (kind === 'triangle') return <path d="M30 8 L52 50 H8 Z" strokeLinejoin="round" {...s} />;
  return <path d="M30 10 V50 M10 30 H50" strokeLinecap="round" {...s} />;
}

/** A floating, slowly rotating outline shape — the template's "animated shapes" motif. */
export function FloatingShape({ kind, className, animate, delay = 0, size = 56 }: { kind: ShapeKind; className?: string; animate: boolean; delay?: number; size?: number }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 60 60"
      width={size}
      height={size}
      className={cn('pointer-events-none absolute', className)}
      animate={animate ? { y: [0, -18, 0], rotate: [0, 90, 180] } : undefined}
      transition={animate ? { duration: 14, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay } : undefined}
    >
      <ShapePath kind={kind} />
    </motion.svg>
  );
}
