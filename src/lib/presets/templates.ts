import type { ComponentType } from 'react';
import type { TemplateContentProps } from '@/features/public-portfolio/templates/shared';
import type {
  AnimationPresetId, ColorPaletteId, FontPresetId, ProfessionCategory, SectionId, TemplateId,
} from '@/types';

// ============================================================================
// THE template registry — the single source of truth for which templates exist and
// everything known about them. It powers PortfolioRenderer (via `load`), the /templates
// catalog, the Design & Preview workspace, the Create Portfolio wizard, template previews
// and profession recommendations (via `fit`). Nothing else keeps its own template list.
//
// Human-readable copy (descriptions, tag labels) lives in i18n under
// `templates.<id>.description` and `templates.tag.<tag>`; product names are brand names
// and stay the same in every language.
// ============================================================================

export type TemplateCategory = 'developer' | 'creative' | 'business' | 'medical' | 'photography' | 'academic';

export type TemplateTag =
  | 'technical'
  | 'dynamic'
  | 'immersive'
  | 'minimal'
  | 'editorial'
  | 'elegant'
  | 'bold'
  | 'playful'
  | 'professional'
  | 'calm'
  | 'warm'
  | 'scholarly'
  | 'image-heavy'
  | 'project-heavy'
  | 'modular';

export type ColorMode = 'light' | 'dark';

export interface TemplateDefinition {
  id: TemplateId;
  /** Product name (a brand name — not translated). */
  name: string;
  /** One of the original four art-directed templates. */
  signature: boolean;
  categories: TemplateCategory[];
  tags: TemplateTag[];
  /** How well the template suits each profession, 0–100. Drives all recommendations. */
  fit: Partial<Record<ProfessionCategory, number>>;
  /** Sections this layout gives the most room/emphasis to. */
  contentStrengths: SectionId[];
  /** Colour modes the template is designed for; `defaultMode` is used for "auto". */
  colorModes: ColorMode[];
  defaultMode: ColorMode;
  recommended: { palette: ColorPaletteId; font: FontPresetId; animation: AnimationPresetId };
  /** Swatch used for loading states and compact pickers. */
  swatch: { background: string; accent: string; foreground: string };
  load: () => Promise<{ default: ComponentType<TemplateContentProps> }>;
}

const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: 'modern',
    name: 'Network',
    signature: true,
    categories: ['developer'],
    tags: ['technical', 'immersive', 'dynamic', 'project-heavy'],
    fit: { developer: 100, student: 60, freelancer: 60, researcher: 35, other: 55 },
    contentStrengths: ['projects', 'skills', 'experience'],
    colorModes: ['dark'],
    defaultMode: 'dark',
    recommended: { palette: 'monochrome', font: 'signature', animation: 'dynamic' },
    swatch: { background: '#1c1c1c', accent: '#ff4d5a', foreground: '#ffffff' },
    load: () => import('@/features/public-portfolio/templates/modern'),
  },
  {
    id: 'creative',
    name: 'Studio',
    signature: true,
    categories: ['creative'],
    tags: ['bold', 'playful', 'immersive', 'project-heavy'],
    fit: { designer: 100, photographer: 80, freelancer: 70, architect: 60, writer: 40, other: 55 },
    contentStrengths: ['projects', 'about', 'gallery'],
    colorModes: ['dark'],
    defaultMode: 'dark',
    recommended: { palette: 'creative-gradient', font: 'signature', animation: 'dynamic' },
    swatch: { background: '#252d40', accent: '#00e4e6', foreground: '#ffffff' },
    load: () => import('@/features/public-portfolio/templates/creative'),
  },
  {
    id: 'minimal',
    name: 'Portrait',
    signature: true,
    categories: ['creative', 'business'],
    tags: ['elegant', 'dynamic', 'image-heavy'],
    fit: { freelancer: 75, designer: 70, coach: 55, student: 60, writer: 55, other: 70 },
    contentStrengths: ['about', 'projects', 'services'],
    colorModes: ['dark'],
    defaultMode: 'dark',
    recommended: { palette: 'monochrome', font: 'signature', animation: 'modern' },
    swatch: { background: '#0a0c0a', accent: '#5ee245', foreground: '#ffffff' },
    load: () => import('@/features/public-portfolio/templates/minimal'),
  },
  {
    id: 'corporate',
    name: 'Motion',
    signature: true,
    categories: ['creative', 'developer'],
    tags: ['dynamic', 'bold', 'immersive'],
    fit: { designer: 85, developer: 70, freelancer: 55, other: 40 },
    contentStrengths: ['projects', 'experience', 'skills'],
    colorModes: ['dark'],
    defaultMode: 'dark',
    recommended: { palette: 'monochrome', font: 'signature', animation: 'dynamic' },
    swatch: { background: '#07070b', accent: '#8b5cf6', foreground: '#ffffff' },
    load: () => import('@/features/public-portfolio/templates/corporate'),
  },
  {
    id: 'editorial',
    name: 'Editorial',
    signature: false,
    categories: ['creative', 'business'],
    tags: ['editorial', 'minimal', 'elegant'],
    fit: { writer: 100, architect: 95, designer: 82, researcher: 60, lawyer: 60, consultant: 55, doctor: 70, photographer: 55, other: 60 },
    contentStrengths: ['about', 'projects', 'testimonials'],
    colorModes: ['light', 'dark'],
    defaultMode: 'light',
    recommended: { palette: 'monochrome', font: 'signature', animation: 'soft' },
    swatch: { background: '#f6f3ee', accent: '#1b1b1b', foreground: '#141414' },
    load: () => import('@/features/public-portfolio/templates/editorial'),
  },
  {
    id: 'executive',
    name: 'Executive',
    signature: false,
    categories: ['business'],
    tags: ['professional', 'elegant', 'calm'],
    fit: { consultant: 100, 'business-owner': 100, lawyer: 95, doctor: 80, coach: 60, freelancer: 40 },
    contentStrengths: ['experience', 'services', 'certifications', 'testimonials'],
    colorModes: ['light', 'dark'],
    defaultMode: 'light',
    recommended: { palette: 'corporate-blue', font: 'signature', animation: 'subtle' },
    swatch: { background: '#f7f5f0', accent: '#1e3a5f', foreground: '#0f1b2d' },
    load: () => import('@/features/public-portfolio/templates/executive'),
  },
  {
    id: 'clinical',
    name: 'Clinical',
    signature: false,
    categories: ['medical'],
    tags: ['calm', 'professional', 'minimal'],
    fit: { doctor: 100, researcher: 70, coach: 35 },
    contentStrengths: ['services', 'certifications', 'experience', 'testimonials'],
    colorModes: ['light', 'dark'],
    defaultMode: 'light',
    recommended: { palette: 'medical-calm', font: 'signature', animation: 'soft' },
    swatch: { background: '#f3f8f8', accent: '#0d9488', foreground: '#0f2a2e' },
    load: () => import('@/features/public-portfolio/templates/clinical'),
  },
  {
    id: 'lens',
    name: 'Lens',
    signature: false,
    categories: ['photography', 'creative'],
    tags: ['image-heavy', 'immersive', 'elegant'],
    fit: { photographer: 100, architect: 55, designer: 50 },
    contentStrengths: ['gallery', 'projects'],
    colorModes: ['dark', 'light'],
    defaultMode: 'dark',
    recommended: { palette: 'monochrome', font: 'signature', animation: 'modern' },
    swatch: { background: '#0b0b0b', accent: '#e8d9b5', foreground: '#f5f2ea' },
    load: () => import('@/features/public-portfolio/templates/lens'),
  },
  {
    id: 'bento',
    name: 'Bento',
    signature: false,
    categories: ['developer', 'creative', 'business'],
    tags: ['modular', 'playful', 'project-heavy'],
    fit: { developer: 85, designer: 80, freelancer: 70, student: 65, 'business-owner': 60, other: 50 },
    contentStrengths: ['projects', 'skills', 'experience'],
    colorModes: ['light', 'dark'],
    defaultMode: 'light',
    recommended: { palette: 'creative-gradient', font: 'signature', animation: 'modern' },
    swatch: { background: '#f1f1ef', accent: '#f25c3a', foreground: '#18181b' },
    load: () => import('@/features/public-portfolio/templates/bento'),
  },
  {
    id: 'terminal',
    name: 'Terminal',
    signature: false,
    categories: ['developer'],
    tags: ['technical', 'minimal', 'project-heavy'],
    fit: { developer: 95, student: 55, researcher: 45 },
    contentStrengths: ['projects', 'skills', 'experience'],
    colorModes: ['dark', 'light'],
    defaultMode: 'dark',
    recommended: { palette: 'monochrome', font: 'signature', animation: 'modern' },
    swatch: { background: '#0d1117', accent: '#3fb950', foreground: '#e6edf3' },
    load: () => import('@/features/public-portfolio/templates/terminal'),
  },
  {
    id: 'coach',
    name: 'Coach',
    signature: false,
    categories: ['business'],
    tags: ['warm', 'bold', 'professional'],
    fit: { coach: 100, consultant: 80, 'business-owner': 60, freelancer: 50 },
    contentStrengths: ['services', 'testimonials', 'about'],
    colorModes: ['light', 'dark'],
    defaultMode: 'light',
    recommended: { palette: 'warm-coach', font: 'signature', animation: 'soft' },
    swatch: { background: '#fbf6ef', accent: '#e0701f', foreground: '#2a1d14' },
    load: () => import('@/features/public-portfolio/templates/coach'),
  },
  {
    id: 'academic',
    name: 'Academic',
    signature: false,
    categories: ['academic', 'medical'],
    tags: ['scholarly', 'minimal', 'calm'],
    fit: { researcher: 100, student: 85, doctor: 60, lawyer: 40, writer: 35 },
    contentStrengths: ['projects', 'experience', 'certifications'],
    colorModes: ['light', 'dark'],
    defaultMode: 'light',
    recommended: { palette: 'elegant-neutral', font: 'signature', animation: 'subtle' },
    swatch: { background: '#fbfaf7', accent: '#7a1f2b', foreground: '#1d1a17' },
    load: () => import('@/features/public-portfolio/templates/academic'),
  },
];

export const templates = Object.fromEntries(TEMPLATE_DEFINITIONS.map((t) => [t.id, t])) as Record<TemplateId, TemplateDefinition>;

/** Catalog order. */
export const templateList: readonly TemplateDefinition[] = TEMPLATE_DEFINITIONS;

export const TEMPLATE_IDS = TEMPLATE_DEFINITIONS.map((t) => t.id);

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ['developer', 'creative', 'business', 'medical', 'photography', 'academic'];

/** Style filters offered by the catalog (a subset of tags that make sense to browse by). */
export const TEMPLATE_STYLE_FILTERS: TemplateTag[] = ['minimal', 'dynamic', 'image-heavy', 'project-heavy'];

export function getTemplate(id: TemplateId | string | undefined): TemplateDefinition {
  return (id && templates[id as TemplateId]) || templates.modern;
}

/** Which colour mode a template renders in for the portfolio's theme setting. */
export function resolveTemplateMode(template: TemplateDefinition, themeMode: 'light' | 'dark' | 'auto'): ColorMode {
  if (themeMode !== 'auto' && template.colorModes.includes(themeMode)) return themeMode;
  return template.defaultMode;
}
