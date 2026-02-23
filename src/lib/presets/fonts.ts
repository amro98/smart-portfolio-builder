import type { FontPresetId } from '@/types';

export interface FontPreset {
  id: FontPresetId;
  label: string;
  description: string;
  headingFamily: string;
  bodyFamily: string;
  headingWeight: string;
  bodyWeight: string;
}

export const fontPresets: Record<FontPresetId, FontPreset> = {
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
};

export const fontPresetList = Object.values(fontPresets);
