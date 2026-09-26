import { useId } from 'react';

const float = (duration: string, x: string, y: string, delay = '0s') =>
  ({ '--decor-duration': duration, '--decor-x': x, '--decor-y': y, '--decor-scale': '1', '--decor-delay': delay }) as React.CSSProperties;

/**
 * A soft glass cube: three gradient faces with heavily rounded edges and corners, soft
 * inner ridges and a specular streak — reads as a glowing, rounded glass block.
 */
function GlassCube({ className, style }: { className: string; style?: React.CSSProperties }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id={`${id}-t`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F0FDFA" />
          <stop offset="100%" stopColor="#5EEAD4" />
        </linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="1" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#134E4A" />
        </linearGradient>
      </defs>
      {/* Faces are inset (scale 0.8 about the centre) and stroked thick with round joins, so
          every corner and edge is soft while the cube keeps its overall size. */}
      <g transform="translate(50 50) scale(0.8) translate(-50 -50)">
        <g strokeLinejoin="round" strokeWidth="18" fillOpacity="0.85" strokeOpacity="0.85">
          <polygon points="14,32 50,51 50,88 14,69" fill={`url(#${id}-l)`} stroke={`url(#${id}-l)`} />
          <polygon points="86,32 50,51 50,88 86,69" fill={`url(#${id}-r)`} stroke={`url(#${id}-r)`} />
          <polygon points="50,12 86,32 50,51 14,32" fill={`url(#${id}-t)`} stroke={`url(#${id}-t)`} />
        </g>
        <path d="M18 34 50 51 82 34 M50 51 50 82" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 24 46 13" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * Brand panel treatment for Login/Register: a deep slate gradient with soft teal light,
 * and — in the lower area, clear of the text — a stacked cluster of glowing glass cubes on
 * a light pool, a rounded glowing diamond and a small floating cube. The cluster, diamond
 * and small cube each float on their own timing (7s / 6s / 5s); motion stops under
 * prefers-reduced-motion.
 */
export function AuthBrandDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Panel surface + lighting */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 45% at 88% 4%, rgba(20, 184, 166, 0.2), transparent 70%), radial-gradient(ellipse 80% 40% at 50% 100%, rgba(15, 118, 110, 0.5), transparent 70%), linear-gradient(165deg, #0F172A 0%, #111F2F 55%, #0F3B45 100%)',
        }}
      />

      {/* Objects: lower area, above the footer line */}
      <div className="absolute inset-x-10 bottom-[5.5rem] mx-auto h-60 max-w-md">
        {/* Light pool under the cluster */}
        <div
          className="absolute bottom-0 end-4 h-24 w-80 rounded-[50%]"
          style={{ backgroundImage: 'radial-gradient(ellipse, rgba(45, 212, 191, 0.45), transparent 70%)' }}
        />

        {/* Rounded glowing diamond, left */}
        <div className="decor-float absolute bottom-16 start-0" style={float('6s', '6px', '-12px')}>
          <div
            className="h-20 w-20 rotate-45 rounded-[34%] shadow-[inset_0_4px_12px_rgba(255,255,255,0.5),inset_0_-16px_26px_rgba(4,47,46,0.6),0_0_40px_6px_rgba(45,212,191,0.35)]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 24%, rgba(255,255,255,0.65), transparent 36%), linear-gradient(140deg, #99F6E4 0%, #2DD4BF 40%, #0D9488 72%, #115E59 100%)',
            }}
          />
        </div>

        {/* Small floating cube, above the diamond */}
        <GlassCube
          className="decor-float absolute bottom-[10.5rem] start-[5.5rem] h-11 w-11 [filter:drop-shadow(0_0_14px_rgba(45,212,191,0.55))]"
          style={float('5s', '-5px', '-12px', '-2s')}
        />

        {/* Stacked cluster, centre-right: two cubes side by side with one resting on top */}
        <div
          className="decor-float absolute bottom-3 end-2 h-52 w-60 [filter:drop-shadow(0_0_24px_rgba(45,212,191,0.4))]"
          style={float('7s', '0px', '-10px', '-1s')}
        >
          <GlassCube className="absolute bottom-0 start-0 h-32 w-32" />
          <GlassCube className="absolute bottom-3 end-0 h-28 w-28" />
          <GlassCube className="absolute bottom-[6.25rem] start-12 h-28 w-28" />
        </div>
      </div>
    </div>
  );
}
