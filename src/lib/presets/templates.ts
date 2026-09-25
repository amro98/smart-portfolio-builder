import type { TemplateId } from '@/types';

export interface TemplateConfig {
  id: TemplateId;
  label: string;
  description: string;
  available: boolean;
}

// The single source of truth for which templates exist — consumed by the Templates catalog,
// the Create Portfolio wizard's Style step, the Appearance page's template selector, and (via
// `templateId`) PortfolioRenderer's template registry. Each id maps to a genuinely distinct
// layout implementation under `src/features/public-portfolio/templates/<id>`, not a color
// variant of the same design.
export const templates: Record<TemplateId, TemplateConfig> = {
  modern: {
    id: 'modern',
    label: 'Network',
    description: 'A dark developer portfolio on a living, interactive network canvas — calm typography, tech-icon skills and large alternating project showcases.',
    available: true,
  },
  minimal: {
    id: 'minimal',
    label: 'Portrait',
    description: 'A portrait-led personal portfolio with a two-tone headline, tilted photo cards, a rotating scroll badge and soft rounded project cards.',
    available: true,
  },
  corporate: {
    id: 'corporate',
    label: 'Motion',
    description: 'A kinetic dark portfolio with a haloed three-column hero, custom cursor, sliding project cards with detail drawers and tabbed experience.',
    available: true,
  },
  creative: {
    id: 'creative',
    label: 'Art Director',
    description: 'A poster-like studio portfolio with oversized type, a profession-aware illustration, liquid blobs and full-width case-study projects.',
    available: true,
  },
};

export const templateList = Object.values(templates);
