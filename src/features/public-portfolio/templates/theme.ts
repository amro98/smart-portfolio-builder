import { colorPalettes } from '@/lib/presets/colors';
import type { Portfolio } from '@/types';

// Each template is a complete art-directed dark "world" (its own surfaces, typography and
// graphic language). The user's palette/custom accent still drives the one color that
// carries identity — the accent — with a signature fallback for the two neutral palettes,
// whose dark "primary" is plain off-white and would erase the template's character.
const NEUTRAL_PALETTES = new Set(['monochrome', 'elegant-neutral']);

export interface TemplateSkin {
  /** HSL triplet ("H S% L%") used when the user hasn't chosen a colorful accent. */
  signatureAccent: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
}

function hexToHslTriplet(hex: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hue = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
  }
  return `${Math.round(hue)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function resolveAccent(
  portfolio: Portfolio,
  signature: string,
  mode: 'light' | 'dark' = 'dark'
): { accent: string; isSignature: boolean } {
  const custom = portfolio.customAccentColor ? hexToHslTriplet(portfolio.customAccentColor) : null;
  if (custom) return { accent: custom, isSignature: false };
  if (NEUTRAL_PALETTES.has(portfolio.colorPaletteId)) return { accent: signature, isSignature: true };
  const palette = colorPalettes[portfolio.colorPaletteId];
  return palette ? { accent: palette[mode].primary, isSignature: false } : { accent: signature, isSignature: true };
}

/**
 * Typography CSS variables for a template root. Templates style text with --tpl-display /
 * --tpl-body; a non-"signature" font preset (set by the renderer as --font-*-override)
 * replaces the template's own families, otherwise its signature fonts apply unchanged.
 */
export function fontVars(signature: { display: string; body: string }): React.CSSProperties {
  return {
    '--tpl-display': `var(--font-display-override, ${signature.display})`,
    '--tpl-body': `var(--font-body-override, ${signature.body})`,
    fontFamily: 'var(--tpl-body)',
  } as React.CSSProperties;
}

/** Inline style for display-font text. */
export const DISPLAY_FONT = { fontFamily: 'var(--tpl-display)' } as const;

function lightnessOf(triplet: string): number {
  const parts = triplet.split(/\s+/);
  return parseFloat(parts[2] ?? '50');
}

/** Near-white text on dark/saturated accents, near-black on light ones (cyan, lime…). */
export function accentForeground(triplet: string): string {
  return lightnessOf(triplet) > 58 ? '0 0% 7%' : '0 0% 100%';
}

/**
 * Overrides the shadcn token set for everything inside the template root, so shared UI
 * primitives (Button, Input, Badge…) automatically adopt the template's own world.
 */
export function skinStyle(skin: TemplateSkin, accent: string): React.CSSProperties {
  return {
    '--primary': accent,
    '--primary-foreground': accentForeground(accent),
    // Builder-UI tokens used by shared primitives (Button hover, selected states) — pinned to
    // the template's accent so the SaaS indigo never leaks into a portfolio.
    '--primary-hover': accent,
    '--primary-soft': skin.surface,
    '--primary-soft-foreground': accent,
    '--ring': accent,
    // Templates were art-directed against the 0.5rem shadcn radius; the builder UI's larger
    // radius must not reshape them.
    '--radius': '0.5rem',
    '--background': skin.background,
    '--foreground': skin.foreground,
    '--card': skin.surface,
    '--card-foreground': skin.foreground,
    '--popover': skin.surface,
    '--popover-foreground': skin.foreground,
    '--secondary': skin.surface,
    '--secondary-foreground': skin.foreground,
    '--muted': skin.surface,
    '--muted-foreground': skin.muted,
    '--accent': skin.surface,
    '--accent-foreground': skin.foreground,
    '--border': skin.border,
    '--input': skin.border,
    backgroundColor: `hsl(${skin.background})`,
    color: `hsl(${skin.foreground})`,
  } as React.CSSProperties;
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/** Splits text so the last word can be styled separately ("View My <accent>Work</accent>"). */
export function splitLastWord(text: string): [string, string] {
  const trimmed = text.trim();
  const idx = trimmed.lastIndexOf(' ');
  if (idx === -1) return ['', trimmed];
  return [trimmed.slice(0, idx), trimmed.slice(idx + 1)];
}

/** Years since the earliest experience start, or 0 — only ever derived from real data. */
export function yearsOfExperience(starts: string[]): number {
  const times = starts.map((s) => new Date(s).getTime()).filter((t) => !Number.isNaN(t));
  if (times.length === 0) return 0;
  return Math.max(1, Math.round((Date.now() - Math.min(...times)) / (1000 * 60 * 60 * 24 * 365.25)));
}

export function yearOf(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : String(d.getFullYear());
}
