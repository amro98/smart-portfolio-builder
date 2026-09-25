import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProfessionCategory } from '@/types';

// Original illustration system for the Art Director template: a bold accent disc carrying a
// profession-specific line emblem, surrounded by paint-splatter dots; liquid "metaball" blob
// clusters; contour waves. Everything is palette-driven SVG — no raster assets.

const SPLATTER = Array.from({ length: 46 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180;
  const r = 118 + ((i * 53) % 70);
  return { x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r * 0.9, s: 1.2 + ((i * 7) % 5) * 0.7 };
});

function EmblemLines({ profession }: { profession: ProfessionCategory }) {
  const stroke = { stroke: 'hsl(var(--art-ink))', strokeWidth: 9, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (profession) {
    case 'developer':
      return (
        <g>
          <rect x="112" y="128" width="176" height="140" rx="16" {...stroke} />
          <line x1="112" y1="160" x2="288" y2="160" {...stroke} />
          <circle cx="134" cy="144" r="4" style={{ fill: 'hsl(var(--art-ink))' }} />
          <circle cx="150" cy="144" r="4" style={{ fill: 'hsl(var(--art-ink))' }} />
          <path d="M170 196 L148 216 L170 236" {...stroke} />
          <path d="M230 196 L252 216 L230 236" {...stroke} />
          <line x1="212" y1="190" x2="190" y2="242" {...stroke} />
        </g>
      );
    case 'designer':
    case 'freelancer':
      return (
        <g>
          <path d="M110 260 C 150 120, 250 300, 290 150" {...stroke} />
          <line x1="110" y1="260" x2="160" y2="170" {...stroke} strokeWidth={4} />
          <line x1="290" y1="150" x2="240" y2="236" {...stroke} strokeWidth={4} />
          <rect x="100" y="250" width="20" height="20" {...stroke} strokeWidth={5} />
          <rect x="280" y="140" width="20" height="20" {...stroke} strokeWidth={5} />
          <circle cx="160" cy="170" r="8" style={{ fill: 'hsl(var(--art-ink))' }} />
          <circle cx="240" cy="236" r="8" style={{ fill: 'hsl(var(--art-ink))' }} />
        </g>
      );
    case 'photographer':
      return (
        <g>
          <circle cx="200" cy="200" r="62" {...stroke} />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * Math.PI) / 3;
            return <line key={i} x1={200 + Math.cos(a) * 22} y1={200 + Math.sin(a) * 22} x2={200 + Math.cos(a + 1.1) * 62} y2={200 + Math.sin(a + 1.1) * 62} {...stroke} strokeWidth={6} />;
          })}
          <path d="M110 150 V120 H140 M290 150 V120 H260 M110 250 V280 H140 M290 250 V280 H260" {...stroke} strokeWidth={7} />
        </g>
      );
    case 'doctor':
      return (
        <g>
          <path d="M104 206 H158 L174 164 L196 250 L218 180 L232 206 H296" {...stroke} />
          <path d="M200 112 V148 M182 130 H218" {...stroke} />
          <circle cx="200" cy="200" r="98" {...stroke} strokeWidth={5} strokeDasharray="8 14" />
        </g>
      );
    case 'lawyer':
    case 'business-owner':
    case 'coach':
      return (
        <g>
          <line x1="120" y1="280" x2="290" y2="280" {...stroke} />
          <rect x="136" y="220" width="30" height="60" {...stroke} strokeWidth={7} />
          <rect x="186" y="180" width="30" height="100" {...stroke} strokeWidth={7} />
          <rect x="236" y="140" width="30" height="140" {...stroke} strokeWidth={7} />
          <path d="M126 196 L186 146 L226 164 L292 108 M266 106 H294 V134" {...stroke} />
        </g>
      );
    default:
      return (
        <g>
          <circle cx="200" cy="200" r="70" {...stroke} />
          <ellipse cx="200" cy="200" rx="32" ry="70" {...stroke} strokeWidth={6} />
          <line x1="130" y1="200" x2="270" y2="200" {...stroke} strokeWidth={6} />
          <path d="M140 164 H260 M140 236 H260" {...stroke} strokeWidth={5} />
        </g>
      );
  }
}

export function ProfessionEmblem({
  profession,
  animate,
  className,
}: {
  profession: ProfessionCategory;
  animate: boolean;
  className?: string;
}) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      aria-hidden
      className={cn('pointer-events-none', className)}
      animate={animate ? { rotate: [-3, 3, -3], y: [0, -8, 0] } : undefined}
      transition={animate ? { duration: 9, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {SPLATTER.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} style={{ fill: 'hsl(var(--primary))', opacity: 0.85 }} />
      ))}
      <circle cx="200" cy="200" r="122" style={{ fill: 'hsl(var(--primary))' }} />
      <circle cx="160" cy="150" r="10" style={{ fill: 'hsl(var(--art-ink) / .35)' }} />
      <circle cx="252" cy="262" r="6" style={{ fill: 'hsl(var(--art-ink) / .35)' }} />
      <EmblemLines profession={profession} />
    </motion.svg>
  );
}

/** A liquid metaball cluster: blurred circles thresholded by an SVG "goo" filter. */
export function BlobCluster({
  animate,
  className,
  seed = 0,
}: {
  animate: boolean;
  className?: string;
  seed?: number;
}) {
  const id = useId().replace(/:/g, '');
  const balls = [
    { cx: 130, cy: 150, r: 92 }, { cx: 230, cy: 110, r: 54 }, { cx: 210, cy: 250, r: 70 },
    { cx: 90, cy: 290, r: 42 }, { cx: 300, cy: 200, r: 34 }, { cx: 60, cy: 90, r: 30 },
  ].map((b, i) => ({ ...b, dx: ((i + seed) % 3) * 12 - 12, dy: ((i * 2 + seed) % 3) * 12 - 12 }));

  return (
    <svg viewBox="0 0 360 360" aria-hidden className={cn('pointer-events-none', className)}>
      <defs>
        <filter id={`goo-${id}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11" />
        </filter>
        <radialGradient id={`blob-${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="1" style={{ stopColor: 'hsl(var(--art-blob))' }} />
        </radialGradient>
      </defs>
      <g filter={`url(#goo-${id})`} fill={`url(#blob-${id})`}>
        {balls.map((b, i) => (
          <motion.circle
            key={i}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            animate={animate ? { x: [0, b.dx, 0], y: [0, b.dy, 0] } : undefined}
            transition={animate ? { duration: 7 + i * 1.3, repeat: Infinity, ease: 'easeInOut' } : undefined}
          />
        ))}
      </g>
    </svg>
  );
}

/** Contour lines that drift sideways — a slow, continuous ribbon of accent strokes. */
export function ContourWaves({ animate, className, lines = 7 }: { animate: boolean; className?: string; lines?: number }) {
  const paths = Array.from({ length: lines }, (_, i) => {
    const y = 40 + i * 16;
    return `M0 ${y} C 150 ${y - 70}, 300 ${y + 70}, 450 ${y} S 750 ${y - 70}, 900 ${y} S 1200 ${y + 70}, 1350 ${y} S 1650 ${y - 70}, 1800 ${y}`;
  });
  return (
    <div aria-hidden className={cn('pointer-events-none overflow-hidden', className)}>
      <motion.svg
        viewBox="0 0 1800 180"
        preserveAspectRatio="none"
        className="h-full w-[200%]"
        animate={animate ? { x: ['0%', '-50%'] } : undefined}
        transition={animate ? { duration: 30, repeat: Infinity, ease: 'linear' } : undefined}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" strokeWidth="1.2" style={{ stroke: `hsl(var(--primary) / ${0.35 + i * 0.07})` }} />
        ))}
      </motion.svg>
    </div>
  );
}

/** The accent "stage" blob that project mockups sit on. */
export function StageBlob({ variant, className, preserve = 'xMidYMid meet' }: { variant: number; className?: string; preserve?: string }) {
  const shapes = [
    'M421 88c62 58 92 152 64 232-29 81-116 148-210 150-95 2-196-61-232-146C7 239 36 131 101 71 167 12 270-1 335 17c30 8 58 44 86 71Z',
    'M398 60c70 44 108 136 92 222-17 86-88 166-176 186S122 454 70 386C18 318-9 207 29 128 67 50 170 4 254 6c55 1 99 22 144 54Z',
  ];
  return (
    <svg viewBox="0 0 510 480" preserveAspectRatio={preserve} aria-hidden className={cn('pointer-events-none', className)}>
      <path d={shapes[variant % shapes.length]} style={{ fill: 'hsl(var(--primary))' }} />
    </svg>
  );
}
