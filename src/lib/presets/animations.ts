import type { AnimationPresetId } from '@/types';
import type { Variants } from 'framer-motion';

export interface AnimationPreset {
  id: AnimationPresetId;
  label: string;
  description: string;
  hero: Variants;
  sectionReveal: Variants;
  cardHover: { scale: number; y: number; transition: { duration: number } };
  staggerChildren: number;
}

export const animationPresets: Record<AnimationPresetId, AnimationPreset> = {
  none: {
    id: 'none',
    label: 'None',
    description: 'No animations',
    hero: {
      hidden: {},
      visible: {},
    },
    sectionReveal: {
      hidden: {},
      visible: {},
    },
    cardHover: { scale: 1, y: 0, transition: { duration: 0 } },
    staggerChildren: 0,
  },
  subtle: {
    id: 'subtle',
    label: 'Subtle',
    description: 'Minimal, professional transitions',
    hero: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
    },
    sectionReveal: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    },
    cardHover: { scale: 1.01, y: -2, transition: { duration: 0.2 } },
    staggerChildren: 0.05,
  },
  soft: {
    id: 'soft',
    label: 'Soft',
    description: 'Gentle, flowing animations',
    hero: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
    },
    sectionReveal: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
    },
    cardHover: { scale: 1.02, y: -4, transition: { duration: 0.3 } },
    staggerChildren: 0.08,
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    description: 'Crisp, contemporary motion',
    hero: {
      hidden: { opacity: 0, y: 30, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
    },
    sectionReveal: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    },
    cardHover: { scale: 1.03, y: -6, transition: { duration: 0.25 } },
    staggerChildren: 0.1,
  },
  dynamic: {
    id: 'dynamic',
    label: 'Dynamic',
    description: 'Bold, expressive transitions',
    hero: {
      hidden: { opacity: 0, y: 50, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
    },
    sectionReveal: {
      hidden: { opacity: 0, y: 60, scale: 0.97 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
    },
    cardHover: { scale: 1.05, y: -8, transition: { duration: 0.3 } },
    staggerChildren: 0.12,
  },
};

export const animationPresetList = Object.values(animationPresets);
