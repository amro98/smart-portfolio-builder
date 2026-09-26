import type { FontPresetId } from '@/types';

export interface FontPreset {
  id: FontPresetId;
  label: string;
  description: string;
  /** Empty for "signature": the template supplies its own families. */
  headingFamily: string;
  bodyFamily: string;
  headingWeight: string;
  bodyWeight: string;
}

// "signature" keeps each template's art-directed typography (the default); every other
// preset overrides the template's display + body families via CSS variables.
export const fontPresets: Record<FontPresetId, FontPreset> = {
  signature: {
    id: 'signature',
    label: 'Template signature',
    description: "The template's own designed typography",
    headingFamily: '',
    bodyFamily: '',
    headingWeight: '700',
    bodyWeight: '400',
  },
  professional: {
    id: 'professional',
    label: 'Professional',
    description: 'Clean and corporate',
    headingFamily: "'Inter', system-ui, sans-serif",
    bodyFamily: "'Inter', system-ui, sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    description: 'Contemporary and sleek',
    headingFamily: "'Space Grotesk', system-ui, sans-serif",
    bodyFamily: "'Inter', system-ui, sans-serif",
    headingWeight: '600',
    bodyWeight: '400',
  },
  creative: {
    id: 'creative',
    label: 'Creative',
    description: 'Elegant and expressive',
    headingFamily: "'Playfair Display', serif",
    bodyFamily: "'Inter', system-ui, sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  editorial: {
    id: 'editorial',
    label: 'Editorial',
    description: 'Literary serif headlines',
    headingFamily: "'Fraunces', Georgia, serif",
    bodyFamily: "'Source Serif 4', Georgia, serif",
    headingWeight: '600',
    bodyWeight: '400',
  },
  mono: {
    id: 'mono',
    label: 'Technical',
    description: 'Monospaced, engineered feel',
    headingFamily: "'JetBrains Mono', ui-monospace, monospace",
    bodyFamily: "'Inter', system-ui, sans-serif",
    headingWeight: '600',
    bodyWeight: '400',
  },
};

export const fontPresetList = Object.values(fontPresets);
