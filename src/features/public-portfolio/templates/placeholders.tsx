import { cn } from '@/lib/utils';

// Polished graphic stand-ins for missing media, drawn in each template's own visual language
// so a project/portrait without an upload still reads as designed, never an empty rectangle.

export type PlaceholderVariant = 'network' | 'studio' | 'portrait' | 'motion';

function initials(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function ProjectPlaceholder({
  variant,
  title,
  index,
  className,
}: {
  variant: PlaceholderVariant;
  title: string;
  index: number;
  className?: string;
}) {
  const num = String(index + 1).padStart(2, '0');

  if (variant === 'network') {
    const pts = Array.from({ length: 18 }, (_, i) => ({ x: 40 + ((i * 97) % 520), y: 30 + ((i * 61) % 320) }));
    return (
      <div className={cn('relative h-full w-full overflow-hidden bg-[hsl(0_0%_9%)]', className)}>
        <svg viewBox="0 0 600 380" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          {pts.map((p, i) =>
            pts.slice(i + 1).map((q, j) =>
              Math.hypot(p.x - q.x, p.y - q.y) < 130 ? (
                <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} strokeWidth="1" style={{ stroke: 'hsl(var(--net) / 0.35)' }} />
              ) : null
            )
          )}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" style={{ fill: 'hsl(var(--net))' }} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-6xl font-bold text-white/90">{num}</span>
          <span className="max-w-[80%] truncate text-sm font-semibold uppercase tracking-[0.25em] text-white/60">{title}</span>
        </div>
      </div>
    );
  }

  if (variant === 'studio') {
    return (
      <div className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-[hsl(219_27%_14%)]', className)}>
        <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M-20 ${60 + i * 26} C 90 ${20 + i * 26}, 180 ${120 + i * 26}, 420 ${40 + i * 26}`} fill="none" strokeWidth="1.2" style={{ stroke: `hsl(var(--primary) / ${0.12 + i * 0.05})` }} />
          ))}
        </svg>
        <span className="relative text-[clamp(3rem,9vw,7rem)] font-black leading-none text-[hsl(var(--primary))]">{initials(title) || num}</span>
      </div>
    );
  }

  if (variant === 'portrait') {
    return (
      <div className={cn('relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br from-[hsl(var(--primary)/0.35)] via-[hsl(var(--primary)/0.08)] to-transparent p-5', className)}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--primary)/0.35)] blur-3xl" />
        <span className="relative font-[Syne] text-5xl font-bold text-white/85">{initials(title) || num}</span>
      </div>
    );
  }

  return (
    <div className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.55),transparent_60%)]', className)}>
      <div className="absolute h-[70%] aspect-square rounded-full border border-[hsl(var(--primary)/0.45)]" />
      <div className="absolute h-[45%] aspect-square rotate-45 rounded-3xl border border-[hsl(var(--primary)/0.35)]" />
      <span className="relative font-[Unbounded] text-4xl font-bold text-white">{initials(title) || num}</span>
    </div>
  );
}

export function PortraitPlaceholder({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-gradient-to-b from-[hsl(var(--primary)/0.45)] to-[hsl(var(--primary)/0.05)]', className)}>
      <span className="text-[clamp(3rem,10vw,7rem)] font-bold text-white/90">{initials(name)}</span>
    </div>
  );
}
