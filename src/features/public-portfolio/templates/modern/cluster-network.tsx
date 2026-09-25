import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { AmbientIntensity } from '../scene-config';

interface Cluster {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}
interface NetNode {
  cluster: number;
  angle: number;
  dist: number;
  spin: number;
  wobble: number;
  x: number;
  y: number;
}
interface Speck {
  x: number;
  y: number;
  r: number;
  hot: boolean;
  phase: number;
}

/**
 * An original clustered-network scene: nodes orbit a handful of slowly drifting cluster
 * centers, so the network reads as crystalline clumps joined by longer filaments rather than
 * an even particle mesh. Colored "star" specks twinkle across the whole page. The pointer
 * pulls nearby nodes and throws thin accent "lightning" links to them.
 *
 * `mode="page"` renders one fixed, viewport-sized canvas behind the entire template whose
 * network layer fades out as the hero scrolls away and returns softly near the bottom of the
 * page (the contact scene); `mode="hero"` is a contained canvas for embedded previews.
 */
export function ClusterNetwork({
  intensity,
  animate,
  networkColor,
  accentColor,
  mode,
  className,
}: {
  intensity: AmbientIntensity;
  animate: boolean;
  networkColor: string;
  accentColor: string;
  mode: 'page' | 'hero';
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Stroke/dot boost for CSS-scaled previews, so lines keep their on-screen weight.
    let boost = 1;
    let w = 0;
    let h = 0;
    let clusters: Cluster[] = [];
    let nodes: NetNode[] = [];
    let specks: Speck[] = [];
    let raf = 0;
    let visible = true;
    let t = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    // The network is the template's signature, so even "None" keeps a (static) network.
    const density = Math.max(0.6, intensity.density);
    const speed = Math.max(0.25, intensity.motionScale);

    const netAlpha = () => {
      if (mode === 'hero') return 1;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const doc = document.documentElement.scrollHeight;
      const top = Math.max(0, Math.min(1, 1 - y / (vh * 0.85)));
      const bottom = Math.max(0, Math.min(1, (y + vh - (doc - vh * 1.3)) / (vh * 1.3))) * 0.5;
      return Math.max(top, bottom);
    };

    function build() {
      const mobile = w < 640;
      const clusterCount = mobile ? 4 : 7;
      const perCluster = Math.round((mobile ? 13 : 22) * density);
      clusters = Array.from({ length: clusterCount }, (_, i) => ({
        x: w * (0.15 + ((i * 0.37) % 0.7)),
        y: h * (0.18 + ((i * 0.53) % 0.64)),
        vx: (Math.random() - 0.5) * 0.12 * speed,
        vy: (Math.random() - 0.5) * 0.12 * speed,
        r: (mobile ? 55 : 95) + Math.random() * (mobile ? 40 : 70),
      }));
      nodes = [];
      clusters.forEach((c, ci) => {
        for (let i = 0; i < perCluster; i++) {
          nodes.push({
            cluster: ci,
            angle: Math.random() * Math.PI * 2,
            dist: Math.pow(Math.random(), 0.7) * c.r,
            spin: (Math.random() - 0.5) * 0.004 * speed,
            wobble: Math.random() * Math.PI * 2,
            x: 0,
            y: 0,
          });
        }
      });
      const speckCount = Math.round((w * h) / (mobile ? 9000 : 6500));
      specks = Array.from({ length: speckCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.85 ? 0.8 : 1.4,
        hot: Math.random() < 0.28,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      // Layout size, not getBoundingClientRect(): embedded previews are CSS-scaled, and the
      // canvas must fill its untransformed box.
      const host = canvas!.parentElement ?? canvas!;
      w = mode === 'page' ? window.innerWidth : host.offsetWidth;
      h = mode === 'page' ? window.innerHeight : host.offsetHeight;
      const shown = mode === 'page' || !w ? 1 : Math.min(1, host.getBoundingClientRect().width / w);
      boost = 1 / Math.max(0.3, shown);
      dpr = Math.max(0.5, Math.min(window.devicePixelRatio || 1, 2) * shown);
      canvas!.width = Math.max(1, Math.round(w * dpr));
      canvas!.height = Math.max(1, Math.round(h * dpr));
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      draw();
    }

    function positionNodes() {
      for (const c of clusters) {
        c.x += c.vx;
        c.y += c.vy;
        if (c.x < c.r * 0.5 || c.x > w - c.r * 0.5) c.vx *= -1;
        if (c.y < c.r * 0.5 || c.y > h - c.r * 0.5) c.vy *= -1;
      }
      for (const n of nodes) {
        const c = clusters[n.cluster];
        n.angle += n.spin;
        const wob = Math.sin(t * 0.01 + n.wobble) * 6;
        let x = c.x + Math.cos(n.angle) * (n.dist + wob);
        let y = c.y + Math.sin(n.angle) * (n.dist + wob);
        if (pointer.active) {
          const dx = pointer.x - x;
          const dy = pointer.y - y;
          const d = Math.hypot(dx, dy);
          if (d < 170) {
            const pull = (1 - d / 170) * 22;
            x += (dx / (d || 1)) * pull;
            y += (dy / (d || 1)) * pull;
          }
        }
        n.x = x;
        n.y = y;
      }
    }

    function draw() {
      const a = netAlpha();
      ctx!.clearRect(0, 0, w, h);

      for (const s of specks) {
        const tw = animate ? 0.45 + 0.55 * Math.abs(Math.sin(t * 0.012 + s.phase)) : 0.8;
        ctx!.fillStyle = `hsl(${s.hot ? accentColor : networkColor} / ${0.55 * tw})`;
        ctx!.fillRect(s.x, s.y, s.r * boost, s.r * boost);
      }
      if (a <= 0.01) return;

      positionNodes();
      const maxD = w < 640 ? 52 : 68;
      ctx!.lineWidth = 0.7 * boost;
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const q = nodes[j];
          const dx = p.x - q.x;
          if (dx > maxD || dx < -maxD) continue;
          const dy = p.y - q.y;
          if (dy > maxD || dy < -maxD) continue;
          const d = Math.hypot(dx, dy);
          if (d < maxD) {
            ctx!.strokeStyle = `hsl(${networkColor} / ${(1 - d / maxD) * 0.55 * a})`;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.stroke();
          }
        }
      }
      if (pointer.active) {
        ctx!.lineWidth = 0.9 * boost;
        for (const n of nodes) {
          const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
          if (d < 140) {
            ctx!.strokeStyle = `hsl(${accentColor} / ${(1 - d / 140) * 0.5 * a})`;
            ctx!.beginPath();
            ctx!.moveTo(pointer.x, pointer.y);
            ctx!.lineTo(n.x, n.y);
            ctx!.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx!.fillStyle = `hsl(${networkColor} / ${0.9 * a})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.3 * boost, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop() {
      t += 1;
      draw();
      raf = visible && animate ? requestAnimationFrame(loop) : 0;
    }

    const target: HTMLElement | Window = mode === 'page' ? window : canvas.parentElement ?? window;
    const onMove = (e: Event) => {
      const me = e as MouseEvent;
      if (mode === 'page') {
        pointer.x = me.clientX;
        pointer.y = me.clientY;
      } else {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((me.clientX - rect.left) * w) / (rect.width || 1);
        pointer.y = ((me.clientY - rect.top) * h) / (rect.height || 1);
      }
      pointer.active = true;
      if (!animate) draw();
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible && animate && !raf) raf = requestAnimationFrame(loop);
    };
    const onScroll = () => {
      if (!animate) draw();
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    if (mode === 'hero' && canvas.parentElement) ro.observe(canvas.parentElement);
    else window.addEventListener('resize', resize);
    if (animate) raf = requestAnimationFrame(loop);
    if (intensity.level >= 2) {
      target.addEventListener('mousemove', onMove);
      target.addEventListener('mouseleave', onLeave);
      document.addEventListener('mouseleave', onLeave);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      target.removeEventListener('mousemove', onMove);
      target.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [animate, intensity.density, intensity.motionScale, intensity.level, networkColor, accentColor, mode]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn('pointer-events-none', mode === 'page' ? 'fixed inset-0 z-0' : 'absolute inset-0', className)}
    />
  );
}
