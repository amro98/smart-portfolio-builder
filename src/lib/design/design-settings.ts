import { ALL_SECTIONS, DEFAULT_SECTION_VISIBILITY } from '@/lib/constants';
import type { Portfolio } from '@/types';

// The presentation-only slice of a portfolio. Everything the Design & Preview workspace can
// change lives here; content (profile, projects, images, slug…) is never part of it, so
// switching templates or resetting the design can't touch content by construction.

export const DESIGN_KEYS = [
  'templateId',
  'profession',
  'colorPaletteId',
  'customAccentColor',
  'fontPresetId',
  'animationPresetId',
  'themeMode',
  'sectionOrder',
  'sectionVisibility',
] as const;

export type DesignKey = (typeof DESIGN_KEYS)[number];
export type DesignSettings = Pick<Portfolio, DesignKey>;

/** Current schema version for design settings (see Portfolio.designVersion). */
export const DESIGN_VERSION = 2;

export function pickDesign(portfolio: Portfolio): DesignSettings {
  return {
    templateId: portfolio.templateId,
    profession: portfolio.profession,
    colorPaletteId: portfolio.colorPaletteId,
    customAccentColor: portfolio.customAccentColor ?? '',
    fontPresetId: portfolio.fontPresetId,
    animationPresetId: portfolio.animationPresetId,
    themeMode: portfolio.themeMode,
    sectionOrder: [...portfolio.sectionOrder],
    sectionVisibility: { ...portfolio.sectionVisibility },
  };
}

export function designEquals(a: DesignSettings, b: DesignSettings): boolean {
  return DESIGN_KEYS.every((key) => {
    if (key === 'sectionOrder') return a.sectionOrder.join('|') === b.sectionOrder.join('|');
    if (key === 'sectionVisibility') return ALL_SECTIONS.every((s) => !!a.sectionVisibility[s] === !!b.sectionVisibility[s]);
    return a[key] === b[key];
  });
}

/** Neutral defaults for "Reset design to defaults" (profession is content-ish and kept). */
export function defaultDesign(profession: Portfolio['profession']): DesignSettings {
  return {
    templateId: 'modern',
    profession,
    colorPaletteId: 'elegant-neutral',
    customAccentColor: '',
    fontPresetId: 'signature',
    animationPresetId: 'soft',
    themeMode: 'auto',
    sectionOrder: [...ALL_SECTIONS],
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
  };
}

/** A portfolio with the design overlaid; every content field is left untouched. */
export function applyDesign<T extends Portfolio>(portfolio: T, design: DesignSettings): T {
  return { ...portfolio, ...design, designVersion: DESIGN_VERSION };
}

/** The design fields to persist in one update. */
export function designPatch(design: DesignSettings): Partial<Portfolio> {
  return { ...design, designVersion: DESIGN_VERSION };
}
