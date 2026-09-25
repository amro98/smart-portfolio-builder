import type { AnimationPresetId } from '@/types';

// ============================================================================
// ANIMATION INTENSITY — the single knob that makes the "None / Subtle / Soft /
// Modern / Dynamic" animation presets produce genuinely different amounts of
// motion, not just a different hover easing. Every template reads its intensity
// from here and scales reveals, ambient loops and canvas density from it —
// sections never hardcode motion amounts directly.
// ============================================================================

export interface AmbientIntensity {
  /** 0 (None) .. 4 (Dynamic) */
  level: 0 | 1 | 2 | 3 | 4;
  /** Whether any continuous/looping ambient motion should render at all. */
  ambientMotion: boolean;
  /** Multiplier applied to floating-element counts (0 = render none). */
  density: number;
  /** Multiplier applied to float travel distance/speed. */
  motionScale: number;
  /** Whether scroll-linked parallax is allowed. */
  parallax: boolean;
  /** Multiplier applied to hover lift/scale magnitude. */
  hoverScale: number;
}

const INTENSITY_BY_PRESET: Record<AnimationPresetId, AmbientIntensity> = {
  none: { level: 0, ambientMotion: false, density: 0, motionScale: 0, parallax: false, hoverScale: 0.5 },
  subtle: { level: 1, ambientMotion: false, density: 0.4, motionScale: 0.5, parallax: false, hoverScale: 0.7 },
  soft: { level: 2, ambientMotion: true, density: 0.7, motionScale: 0.8, parallax: false, hoverScale: 0.85 },
  modern: { level: 3, ambientMotion: true, density: 1, motionScale: 1, parallax: true, hoverScale: 1 },
  dynamic: { level: 4, ambientMotion: true, density: 1.4, motionScale: 1.3, parallax: true, hoverScale: 1.2 },
};

export function getAmbientIntensity(presetId: AnimationPresetId): AmbientIntensity {
  return INTENSITY_BY_PRESET[presetId] ?? INTENSITY_BY_PRESET.soft;
}
