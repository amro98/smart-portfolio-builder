import type { ProfessionCategory, TemplateId, ColorPaletteId, AnimationPresetId, SectionId } from '@/types';

export interface ProfessionPreset {
  id: ProfessionCategory;
  label: string;
  description: string;
  icon: string;
  template: TemplateId;
  colorPalette: ColorPaletteId;
  animationPreset: AnimationPresetId;
  sections: SectionId[];
  ctaLabel: string;
  visualTone: string;
}

export const professionPresets: Record<ProfessionCategory, ProfessionPreset> = {
  developer: {
    id: 'developer',
    label: 'Developer',
    description: 'Software engineers, web developers, and tech professionals',
    icon: 'Code2',
    template: 'modern',
    colorPalette: 'monochrome',
    animationPreset: 'modern',
    sections: ['hero', 'about', 'projects', 'experience', 'skills', 'contact'],
    ctaLabel: 'Hire Me',
    visualTone: 'modern',
  },
  doctor: {
    id: 'doctor',
    label: 'Doctor / Medical',
    description: 'Physicians, surgeons, and healthcare professionals',
    icon: 'Stethoscope',
    template: 'minimal',
    colorPalette: 'medical-calm',
    animationPreset: 'subtle',
    sections: ['hero', 'about', 'services', 'certifications', 'experience', 'testimonials', 'contact'],
    ctaLabel: 'Book Appointment',
    visualTone: 'clean',
  },
  lawyer: {
    id: 'lawyer',
    label: 'Lawyer / Legal',
    description: 'Attorneys, legal consultants, and law professionals',
    icon: 'Scale',
    template: 'corporate',
    colorPalette: 'corporate-blue',
    animationPreset: 'subtle',
    sections: ['hero', 'about', 'services', 'experience', 'certifications', 'testimonials', 'contact'],
    ctaLabel: 'Schedule Consultation',
    visualTone: 'corporate',
  },
  designer: {
    id: 'designer',
    label: 'Designer',
    description: 'UI/UX, graphic, and product designers',
    icon: 'Palette',
    template: 'creative',
    colorPalette: 'creative-gradient',
    animationPreset: 'dynamic',
    sections: ['hero', 'about', 'projects', 'gallery', 'skills', 'testimonials', 'contact'],
    ctaLabel: 'Work With Me',
    visualTone: 'creative',
  },
  photographer: {
    id: 'photographer',
    label: 'Photographer',
    description: 'Professional photographers and visual artists',
    icon: 'Camera',
    template: 'creative',
    colorPalette: 'monochrome',
    animationPreset: 'soft',
    sections: ['hero', 'gallery', 'about', 'services', 'testimonials', 'contact'],
    ctaLabel: 'Book a Session',
    visualTone: 'visual',
  },
  coach: {
    id: 'coach',
    label: 'Coach / Consultant',
    description: 'Life coaches, business consultants, and mentors',
    icon: 'HeartHandshake',
    template: 'modern',
    colorPalette: 'warm-coach',
    animationPreset: 'soft',
    sections: ['hero', 'about', 'services', 'testimonials', 'certifications', 'contact'],
    ctaLabel: 'Book a Call',
    visualTone: 'warm',
  },
  freelancer: {
    id: 'freelancer',
    label: 'Freelancer',
    description: 'Independent professionals and contractors',
    icon: 'Briefcase',
    template: 'modern',
    colorPalette: 'elegant-neutral',
    animationPreset: 'modern',
    sections: ['hero', 'about', 'projects', 'services', 'skills', 'testimonials', 'contact'],
    ctaLabel: 'Get a Quote',
    visualTone: 'modern',
  },
  student: {
    id: 'student',
    label: 'Student',
    description: 'Students and recent graduates',
    icon: 'GraduationCap',
    template: 'minimal',
    colorPalette: 'corporate-blue',
    animationPreset: 'modern',
    sections: ['hero', 'about', 'projects', 'certifications', 'skills', 'contact'],
    ctaLabel: 'Contact Me',
    visualTone: 'clean',
  },
  'business-owner': {
    id: 'business-owner',
    label: 'Business Owner',
    description: 'Entrepreneurs and small business owners',
    icon: 'Building2',
    template: 'corporate',
    colorPalette: 'elegant-neutral',
    animationPreset: 'subtle',
    sections: ['hero', 'about', 'services', 'testimonials', 'projects', 'contact'],
    ctaLabel: 'Get in Touch',
    visualTone: 'corporate',
  },
  other: {
    id: 'other',
    label: 'Other',
    description: 'Any other profession or creative field',
    icon: 'User',
    template: 'modern',
    colorPalette: 'elegant-neutral',
    animationPreset: 'soft',
    sections: ['hero', 'about', 'projects', 'experience', 'skills', 'contact'],
    ctaLabel: 'Contact Me',
    visualTone: 'modern',
  },
};

export const professionList = Object.values(professionPresets);
