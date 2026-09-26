// Ambient background layers for the builder UI (never inside portfolio templates).
// Living waves: each layer is a two-period sine band that slides continuously
// (`.decor-wave`, seamless loop) inside a wrapper that gently bobs (`.decor-float`), with
// staggered speeds so the layers read as moving water. Bands are tilted so they descend
// from top-left to bottom-right. Transform-only; everything stops under
// prefers-reduced-motion. Every layer is aria-hidden, pointer-events:none and painted
// behind positioned content.

type Layer = {
  /** Band height, % of the wave area. */
  height: string;
  /** Crest amplitude and baseline in the 0–200 viewBox. */
  amp: number;
  base: number;
  color: string;
  opacity: number;
  /** Seconds for one full slide (lower = faster). */
  flow: number;
  bob: number;
  delay: number;
  stroke?: string;
};

/** Two seamless sine periods across a 1200-wide viewBox, filled down to the bottom. */
function wavePath(amp: number, base: number) {
  const hi = base - amp;
  const lo = base + amp;
  return `M0 ${base}C150 ${hi} 150 ${hi} 300 ${base}S450 ${lo} 600 ${base}S750 ${hi} 900 ${base}S1050 ${lo} 1200 ${base}V200H0Z`;
}

function crestPath(amp: number, base: number) {
  return wavePath(amp, base).replace(/V200H0Z$/, '');
}

function WaveLayer({ layer }: { layer: Layer }) {
  const { height, amp, base, color, opacity, flow, bob, delay, stroke } = layer;
  return (
    <div
      className="decor-float absolute inset-x-0 bottom-0"
      style={{ height, '--decor-duration': `${bob}s`, '--decor-x': '0px', '--decor-y': '-8px', '--decor-scale': '1', '--decor-delay': `-${delay}s` } as React.CSSProperties}
    >
      <svg
        className="decor-wave absolute bottom-0 left-0 h-full w-[200%]"
        style={{ '--decor-duration': `${flow}s`, '--decor-delay': `-${delay}s` } as React.CSSProperties}
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path d={wavePath(amp, base)} fill={color} fillOpacity={opacity} />
        {stroke && <path d={crestPath(amp, base)} fill="none" stroke={stroke} strokeOpacity="0.45" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
      </svg>
    </div>
  );
}

const SIDEBAR_LAYERS: Layer[] = [
  { height: '100%', amp: 22, base: 40, color: '#164E63', opacity: 0.6, flow: 14, bob: 7, delay: 0 },
  { height: '78%', amp: 18, base: 44, color: '#115E59', opacity: 0.55, flow: 10, bob: 6, delay: 3 },
  { height: '54%', amp: 16, base: 46, color: '#0F766E', opacity: 0.5, flow: 7, bob: 5, delay: 5, stroke: '#2DD4BF' },
];

const CORNER_LAYERS: Layer[] = [
  { height: '100%', amp: 20, base: 60, color: '#0F766E', opacity: 0.1, flow: 16, bob: 8, delay: 0, stroke: '#0F766E' },
  { height: '72%', amp: 18, base: 60, color: '#115E59', opacity: 0.12, flow: 11, bob: 7, delay: 4 },
  { height: '46%', amp: 14, base: 60, color: '#14B8A6', opacity: 0.12, flow: 8, bob: 6, delay: 2 },
];

// Full-width bands (workspace, auth) are much wider than the sidebar, so their loops are
// longer to keep the same on-screen speed.
const WIDE_LAYERS: Layer[] = CORNER_LAYERS.map((l) => ({ ...l, flow: l.flow * 1.8 }));

/** Sidebar: three flowing waves over roughly the lower 40%, tilted ~18° to descend left → right. */
export function SidebarDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] min-h-64 overflow-hidden">
      <div className="absolute -inset-x-24 -bottom-28 top-0 origin-bottom rotate-[18deg] rtl:-rotate-[18deg]">
        {SIDEBAR_LAYERS.map((l, i) => (
          <WaveLayer key={i} layer={l} />
        ))}
      </div>
    </div>
  );
}

/**
 * Workspace: a barely-there warm wash and a full-width band of flowing teal waves along
 * the bottom, tilted ~7° so it rises on the right and descends to the bottom-left.
 */
export function AppBackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(170deg, hsl(var(--haze-warm) / 0.14) 0%, transparent 40%)' }}
      />
      {/* Full-width band, highest on the right and sloping down to the bottom-left, where it
          meets the low end of the sidebar waves. The mask fades it towards the sidebar so it
          arrives there softly; the box is tall so the tilted crest is never clipped, and the
          band reaches far below the edge so the tilt never exposes a gap at the bottom-right. */}
      <div className="absolute inset-x-0 bottom-0 hidden h-[72vh] md:block dark:opacity-50 [mask-image:linear-gradient(to_right,rgba(0,0,0,0.18)_0%,#000_50%)] rtl:[mask-image:linear-gradient(to_left,rgba(0,0,0,0.18)_0%,#000_50%)]">
        <div className="absolute -inset-x-16 -bottom-72 top-[66%] origin-bottom-left -rotate-[7deg] rtl:origin-bottom-right rtl:rotate-[7deg]">
          {WIDE_LAYERS.map((l, i) => (
            <WaveLayer key={i} layer={l} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Auth canvas (visible around the centred card on forgot/reset/social pages): a faint teal
 * haze and a band of flowing teal waves along the bottom, behind the card.
 */
export function AuthBackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse 70% 55% at 15% 0%, rgba(20, 184, 166, 0.07), transparent 70%)' }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[30vh]">
        <div className="absolute -inset-x-10 -bottom-8 top-0 origin-bottom rotate-[3deg] rtl:-rotate-[3deg]">
          {WIDE_LAYERS.map((l, i) => (
            <WaveLayer key={i} layer={l} />
          ))}
        </div>
      </div>
    </div>
  );
}
