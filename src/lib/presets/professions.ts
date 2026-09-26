import type { ProfessionCategory, ColorPaletteId, AnimationPresetId, SectionId } from '@/types';

// Profession-level style defaults. Which TEMPLATE suits a profession is deliberately NOT
// stored here: it's derived from each template's `fit` scores in the template registry
// (see lib/presets/recommendations.ts), so there is exactly one source of truth for it.
export interface ProfessionPreset {
  id: ProfessionCategory;
  label: string;
  description: string;
  icon: string;
  colorPalette: ColorPaletteId;
  animationPreset: AnimationPresetId;
  /** Recommended visible sections, in recommended order. */
  sections: SectionId[];
  ctaLabel: string;
}

export const professionPresets: Record<ProfessionCategory, ProfessionPreset> = {
  developer: {
    id: 'developer',
    label: 'Developer',
    description: 'Software engineers, DevOps, security and tech professionals',
    icon: 'Code2',
    colorPalette: 'monochrome',
    animationPreset: 'dynamic',
    sections: ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'contact'],
    ctaLabel: 'Hire Me',
  },
  designer: {
    id: 'designer',
    label: 'Designer',
    description: 'UI/UX, product, brand and graphic designers',
    icon: 'Palette',
    colorPalette: 'creative-gradient',
    animationPreset: 'dynamic',
    sections: ['hero', 'about', 'projects', 'gallery', 'skills', 'testimonials', 'contact'],
    ctaLabel: 'Work With Me',
  },
  photographer: {
    id: 'photographer',
    label: 'Photographer',
    description: 'Photographers, videographers and visual artists',
    icon: 'Camera',
    colorPalette: 'monochrome',
    animationPreset: 'modern',
    sections: ['hero', 'gallery', 'projects', 'about', 'services', 'testimonials', 'contact'],
    ctaLabel: 'Book a Session',
  },
  doctor: {
    id: 'doctor',
    label: 'Doctor / Medical',
    description: 'Physicians, surgeons, therapists and healthcare professionals',
    icon: 'Stethoscope',
    colorPalette: 'medical-calm',
    animationPreset: 'soft',
    sections: ['hero', 'about', 'services', 'experience', 'certifications', 'testimonials', 'contact'],
    ctaLabel: 'Book Appointment',
  },
  lawyer: {
    id: 'lawyer',
    label: 'Lawyer / Legal',
    description: 'Attorneys, legal consultants and law professionals',
    icon: 'Scale',
    colorPalette: 'corporate-blue',
    animationPreset: 'subtle',
    sections: ['hero', 'about', 'services', 'experience', 'certifications', 'testimonials', 'contact'],
    ctaLabel: 'Schedule Consultation',
  },
  consultant: {
    id: 'consultant',
    label: 'Consultant',
    description: 'Management, finance, strategy and business consultants',
    icon: 'Briefcase',
    colorPalette: 'corporate-blue',
    animationPreset: 'subtle',
    sections: ['hero', 'about', 'services', 'projects', 'experience', 'testimonials', 'contact'],
    ctaLabel: 'Book a Consultation',
  },
  coach: {
    id: 'coach',
    label: 'Coach / Trainer',
    description: 'Life, career and fitness coaches, trainers and mentors',
    icon: 'HeartHandshake',
    colorPalette: 'warm-coach',
    animationPreset: 'soft',
    sections: ['hero', 'about', 'services', 'testimonials', 'certifications', 'contact'],
    ctaLabel: 'Book a Call',
  },
  researcher: {
    id: 'researcher',
    label: 'Researcher / Academic',
    description: 'Researchers, professors, scientists and PhD candidates',
    icon: 'FlaskConical',
    colorPalette: 'elegant-neutral',
    animationPreset: 'subtle',
    sections: ['hero', 'about', 'projects', 'experience', 'certifications', 'skills', 'contact'],
    ctaLabel: 'Get in Touch',
  },
  writer: {
    id: 'writer',
    label: 'Writer / Personal brand',
    description: 'Writers, journalists, speakers and creators',
    icon: 'PenLine',
    colorPalette: 'elegant-neutral',
    animationPreset: 'soft',
    sections: ['hero', 'about', 'projects', 'testimonials', 'services', 'contact'],
    ctaLabel: 'Get in Touch',
  },
  architect: {
    id: 'architect',
    label: 'Architect',
    description: 'Architects, interior and spatial designers',
    icon: 'Ruler',
    colorPalette: 'elegant-neutral',
    animationPreset: 'soft',
    sections: ['hero', 'about', 'projects', 'gallery', 'services', 'experience', 'contact'],
    ctaLabel: 'Start a Project',
  },
  freelancer: {
    id: 'freelancer',
    label: 'Freelancer',
    description: 'Independent professionals, studios and agencies',
    icon: 'Sparkles',
    colorPalette: 'elegant-neutral',
    animationPreset: 'modern',
    sections: ['hero', 'about', 'projects', 'services', 'skills', 'testimonials', 'contact'],
    ctaLabel: 'Get a Quote',
  },
  student: {
    id: 'student',
    label: 'Student',
    description: 'Students and recent graduates',
    icon: 'GraduationCap',
    colorPalette: 'corporate-blue',
    animationPreset: 'modern',
    sections: ['hero', 'about', 'projects', 'certifications', 'skills', 'contact'],
    ctaLabel: 'Contact Me',
  },
  'business-owner': {
    id: 'business-owner',
    label: 'Business Owner',
    description: 'Founders, entrepreneurs and small business owners',
    icon: 'Building2',
    colorPalette: 'elegant-neutral',
    animationPreset: 'subtle',
    sections: ['hero', 'about', 'services', 'projects', 'testimonials', 'contact'],
    ctaLabel: 'Get in Touch',
  },
  other: {
    id: 'other',
    label: 'Other',
    description: 'Any other profession or creative field',
    icon: 'User',
    colorPalette: 'elegant-neutral',
    animationPreset: 'soft',
    sections: ['hero', 'about', 'projects', 'experience', 'skills', 'contact'],
    ctaLabel: 'Contact Me',
  },
};

export const professionList = Object.values(professionPresets);
export const PROFESSION_IDS = Object.keys(professionPresets) as ProfessionCategory[];
