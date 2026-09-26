import { ALL_SECTIONS } from '@/lib/constants';
import { professionPresets } from './professions';
import { templateList, templates, type TemplateDefinition } from './templates';
import type {
  AnimationPresetId, ColorPaletteId, FontPresetId, ProfessionCategory, SectionId, TemplateId,
} from '@/types';

// Profession → template recommendations, derived purely from each template's `fit` scores
// in the registry. Recommendations are suggestions only: nothing here is applied unless the
// user explicitly asks for it (see getRecommendedStyle / "Apply recommended style").

/** Minimum fit for a template to be offered as "recommended for you". */
const RECOMMEND_THRESHOLD = 50;

export interface RankedTemplate {
  template: TemplateDefinition;
  score: number;
  /** 1-based rank among recommended templates. */
  rank: number;
}

/** Templates ranked for a profession, best first (catalog order breaks ties). */
export function rankTemplatesForProfession(profession: ProfessionCategory, limit = 4): RankedTemplate[] {
  return templateList
    .map((template, index) => ({ template, score: template.fit[profession] ?? 0, index }))
    .filter((entry) => entry.score >= RECOMMEND_THRESHOLD)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry, i) => ({ template: entry.template, score: entry.score, rank: i + 1 }));
}

export function topTemplateForProfession(profession: ProfessionCategory): TemplateId {
  return rankTemplatesForProfession(profession, 1)[0]?.template.id ?? 'modern';
}

export function isRecommendedFor(templateId: TemplateId, profession: ProfessionCategory) {
  return (templates[templateId]?.fit[profession] ?? 0) >= RECOMMEND_THRESHOLD;
}

/** Professions a template is best for, strongest first (for "Best for" labels). */
export function bestProfessionsFor(template: TemplateDefinition, limit = 3): ProfessionCategory[] {
  return (Object.entries(template.fit) as [ProfessionCategory, number][])
    .filter(([id, score]) => score >= 70 && id !== 'other')
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

export interface RecommendedStyle {
  templateId: TemplateId;
  colorPaletteId: ColorPaletteId;
  fontPresetId: FontPresetId;
  animationPresetId: AnimationPresetId;
  sectionOrder: SectionId[];
  sectionVisibility: Record<SectionId, boolean>;
}

/**
 * The full recommended look for a profession: its top-ranked template, the profession's
 * palette/animation, the template's recommended typography, and the profession's sections
 * (recommended ones visible and first, in recommended order; the rest kept but hidden).
 */
export function getRecommendedStyle(profession: ProfessionCategory, templateId?: TemplateId): RecommendedStyle {
  const preset = professionPresets[profession] ?? professionPresets.other;
  const template = templates[templateId ?? topTemplateForProfession(profession)] ?? templates.modern;
  const recommended = preset.sections.filter((s) => ALL_SECTIONS.includes(s));
  return {
    templateId: template.id,
    colorPaletteId: preset.colorPalette,
    fontPresetId: template.recommended.font,
    animationPresetId: preset.animationPreset,
    sectionOrder: [...recommended, ...ALL_SECTIONS.filter((s) => !recommended.includes(s))],
    sectionVisibility: Object.fromEntries(ALL_SECTIONS.map((s) => [s, recommended.includes(s)])) as Record<SectionId, boolean>,
  };
}
