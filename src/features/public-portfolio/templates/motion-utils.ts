import { useCallback } from 'react';
import { useReducedMotion, type MotionProps } from 'framer-motion';
import type { AmbientIntensity } from './scene-config';

const EASE = [0.16, 1, 0.3, 1] as const;

interface RevealOptions {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  delay?: number;
  duration?: number;
  clip?: 'up' | 'start' | 'end';
}

/**
 * Returns a factory for scroll-reveal motion props that honors both the portfolio's animation
 * preset (None ⇒ content is simply present, no entrance motion) and the visitor's
 * prefers-reduced-motion (entrances collapse to a short opacity fade — never hidden content).
 */
export function useReveal(intensity: AmbientIntensity) {
  const reduceMotion = useReducedMotion();

  return useCallback(
    (opts: RevealOptions = {}): MotionProps => {
      if (intensity.level === 0) return {};
      const duration = (opts.duration ?? 0.8) * (intensity.level === 1 ? 0.7 : 1);
      if (reduceMotion) {
        return {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true, margin: '0px 0px -60px 0px' },
          transition: { duration: 0.4, delay: opts.delay ?? 0 },
        };
      }
      const scale = intensity.level === 1 ? 1 : 1 + Math.min(intensity.motionScale - 1, 0.3) * 0.2;
      // Never start fully clipped: an element whose own clip-path has zero area is never
      // reported as intersecting, so whileInView would never fire. The 3% sliver left at the
      // leading edge is invisible (opacity also starts at 0) and sits where the element first
      // enters the viewport, so the reveal starts on time. 'up' unveils top → bottom.
      const clipFrom =
        opts.clip === 'up' ? 'inset(0 0 97% 0)' : opts.clip === 'start' ? 'inset(0 97% 0 0)' : opts.clip === 'end' ? 'inset(0 0 0 97%)' : undefined;
      return {
        initial: {
          opacity: 0,
          x: (opts.x ?? 0) * scale,
          y: (opts.y ?? 0) * scale,
          scale: opts.scale ?? 1,
          rotate: opts.rotate ?? 0,
          ...(clipFrom ? { clipPath: clipFrom } : {}),
        },
        whileInView: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, ...(clipFrom ? { clipPath: 'inset(0 0 0 0)' } : {}) },
        // Bottom-only margin: an element a nav jump lands exactly at the top still reveals.
        viewport: { once: true, margin: '0px 0px -80px 0px' },
        transition: { duration, delay: opts.delay ?? 0, ease: EASE },
      };
    },
    [intensity.level, intensity.motionScale, reduceMotion]
  );
}

/** True when continuous/looping ambient motion is allowed for this preset + visitor. */
export function useAmbientMotion(intensity: AmbientIntensity) {
  const reduceMotion = useReducedMotion();
  return intensity.ambientMotion && !reduceMotion;
}
