export type ProfessionCategory =
  | 'developer'
  | 'doctor'
  | 'lawyer'
  | 'designer'
  | 'photographer'
  | 'coach'
  | 'freelancer'
  | 'student'
  | 'business-owner'
  | 'other';

export type TemplateId = 'modern' | 'minimal' | 'corporate' | 'creative';
export type ColorPaletteId = 'monochrome' | 'corporate-blue' | 'medical-calm' | 'creative-gradient' | 'warm-coach' | 'elegant-neutral';
export type AnimationPresetId = 'none' | 'subtle' | 'soft' | 'modern' | 'dynamic';
export type FontPresetId = 'professional' | 'modern' | 'creative';
export type ThemeMode = 'light' | 'dark' | 'auto';

export type SectionId =
  | 'hero'
  | 'about'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'services'
  | 'certifications'
  | 'testimonials'
  | 'gallery'
  | 'contact';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  fullName: string;
  title: string;
  bio: string;
  slug: string;
  profession: ProfessionCategory;
  location: string;
  email: string;
  avatarUrl: string;
  coverUrl: string;
  resumeUrl: string;
  ctaLabel: string;
  ctaLink: string;
  socialLinks: SocialLinks;
  templateId: TemplateId;
  colorPaletteId: ColorPaletteId;
  animationPresetId: AnimationPresetId;
  fontPresetId: FontPresetId;
  themeMode: ThemeMode;
  customAccentColor: string;
  sectionOrder: SectionId[];
  sectionVisibility: Record<SectionId, boolean>;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
  instagram: string;
  behance: string;
  dribbble: string;
  website: string;
  youtube: string;
}

export interface Project {
  id: string;
  portfolioId: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  coverImage: string;
  galleryImages: string[];
  liveUrl: string;
  repositoryUrl: string;
  externalUrl: string;
  featured: boolean;
  status: 'draft' | 'published';
  order: number;
  date: string;
  clientName: string;
  roleInProject: string;
}

export interface Experience {
  id: string;
  portfolioId: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string[];
  industryTag: string;
  order: number;
}

export interface Skill {
  id: string;
  portfolioId: string;
  name: string;
  category: string;
  proficiency: number;
  order: number;
}

export interface Service {
  id: string;
  portfolioId: string;
  title: string;
  description: string;
  priceLabel: string;
  duration: string;
  ctaLabel: string;
  ctaLink: string;
  order: number;
}

export interface Certification {
  id: string;
  portfolioId: string;
  title: string;
  institution: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  verificationUrl: string;
  type: 'education' | 'certification';
  order: number;
}

export interface Testimonial {
  id: string;
  portfolioId: string;
  clientName: string;
  role: string;
  quote: string;
  avatarUrl: string;
  rating: number;
  featured: boolean;
  order: number;
}

export interface GalleryItem {
  id: string;
  portfolioId: string;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  order: number;
}

export interface PublicPortfolioData {
  portfolio: Portfolio;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  services: Service[];
  certifications: Certification[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ReorderPayload {
  items: { id: string; order: number }[];
}
