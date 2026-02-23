import type { SectionId } from '@/types';

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: 'Hero',
  about: 'About',
  projects: 'Projects',
  experience: 'Experience',
  skills: 'Skills',
  services: 'Services',
  certifications: 'Certifications & Education',
  testimonials: 'Testimonials',
  gallery: 'Gallery',
  contact: 'Contact',
};

export const ALL_SECTIONS: SectionId[] = [
  'hero',
  'about',
  'projects',
  'experience',
  'skills',
  'services',
  'certifications',
  'testimonials',
  'gallery',
  'contact',
];

export const DEFAULT_SECTION_VISIBILITY: Record<SectionId, boolean> = {
  hero: true,
  about: true,
  projects: true,
  experience: true,
  skills: true,
  services: false,
  certifications: false,
  testimonials: false,
  gallery: false,
  contact: true,
};
