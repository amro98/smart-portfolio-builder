import { db } from '@/mock/db';
import { delay } from '@/lib/utils';
import type {
  Portfolio, Project, Experience, Skill, Service,
  Certification, Testimonial, GalleryItem, AuthResponse, PublicPortfolioData,
  BackendPortfolio, CreatePortfolioInput, ProfessionCategory, TemplateId,
  ColorPaletteId, AnimationPresetId, FontPresetId, ThemeMode, SectionId,
} from '@/types';

const MOCK_DELAY = 300;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
const DEFAULT_SECTION_ORDER: SectionId[] = [
  'hero',
  'about',
  'projects',
  'experience',
  'skills',
  'contact',
];
const DEFAULT_SECTION_VISIBILITY: Record<SectionId, boolean> = {
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
const DEFAULT_SOCIAL_LINKS: Portfolio['socialLinks'] = {
  linkedin: '',
  github: '',
  twitter: '',
  instagram: '',
  behance: '',
  dribbble: '',
  website: '',
  youtube: '',
};
const PROFESSION_VALUES: ProfessionCategory[] = [
  'developer',
  'doctor',
  'lawyer',
  'designer',
  'photographer',
  'coach',
  'freelancer',
  'student',
  'business-owner',
  'other',
];
const TEMPLATE_VALUES: TemplateId[] = ['modern', 'minimal', 'corporate', 'creative'];
const COLOR_PALETTE_VALUES: ColorPaletteId[] = [
  'monochrome',
  'corporate-blue',
  'medical-calm',
  'creative-gradient',
  'warm-coach',
  'elegant-neutral',
];
const ANIMATION_VALUES: AnimationPresetId[] = ['none', 'subtle', 'soft', 'modern', 'dynamic'];
const FONT_VALUES: FontPresetId[] = ['professional', 'modern', 'creative'];
const THEME_VALUES: ThemeMode[] = ['light', 'dark', 'auto'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function enumValue<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === 'string' && values.includes(value as T) ? (value as T) : fallback;
}

function normalizeSocialLinks(value: unknown): Portfolio['socialLinks'] {
  const links = isRecord(value) ? value : {};

  return {
    linkedin: stringValue(links.linkedin),
    github: stringValue(links.github),
    twitter: stringValue(links.twitter),
    instagram: stringValue(links.instagram),
    behance: stringValue(links.behance),
    dribbble: stringValue(links.dribbble),
    website: stringValue(links.website),
    youtube: stringValue(links.youtube),
  };
}

function normalizeSectionOrder(value: unknown): SectionId[] {
  if (!Array.isArray(value)) return [...DEFAULT_SECTION_ORDER];

  const sections = value.filter(
    (section): section is SectionId =>
      typeof section === 'string' && section in DEFAULT_SECTION_VISIBILITY
  );

  return sections.length > 0 ? sections : [...DEFAULT_SECTION_ORDER];
}

function normalizeSectionVisibility(value: unknown): Record<SectionId, boolean> {
  const visibility = isRecord(value) ? value : {};

  return Object.keys(DEFAULT_SECTION_VISIBILITY).reduce(
    (result, section) => {
      const sectionId = section as SectionId;
      result[sectionId] =
        typeof visibility[sectionId] === 'boolean'
          ? visibility[sectionId]
          : DEFAULT_SECTION_VISIBILITY[sectionId];
      return result;
    },
    {} as Record<SectionId, boolean>
  );
}

type BackendPortfolioLike = Pick<
  BackendPortfolio,
  'id' | 'name' | 'slug' | 'status' | 'data' | 'publishedAt' | 'updatedAt'
> &
  Partial<Pick<BackendPortfolio, 'userId'>>;

export function backendToFrontendPortfolio(record: BackendPortfolioLike): Portfolio {
  const data = isRecord(record.data) ? record.data : {};

  const defaults: Portfolio = {
    id: record.id,
    userId: record.userId ?? '',
    fullName: record.name,
    title: record.name,
    bio: '',
    slug: record.slug,
    profession: 'other',
    location: '',
    email: '',
    avatarUrl: '',
    coverUrl: '',
    resumeUrl: '',
    ctaLabel: 'Contact Me',
    ctaLink: '#contact',
    socialLinks: { ...DEFAULT_SOCIAL_LINKS },
    templateId: 'modern',
    colorPaletteId: 'elegant-neutral',
    animationPresetId: 'soft',
    fontPresetId: 'professional',
    themeMode: 'light',
    customAccentColor: '',
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
    isPublished: record.status === 'PUBLISHED',
    publishedAt: record.publishedAt,
    updatedAt: record.updatedAt,
  };

  return {
    ...defaults,
    ...data,
    id: record.id,
    userId: record.userId ?? '',
    fullName: stringValue(data.fullName, record.name) || record.name,
    title: stringValue(data.title, record.name) || record.name,
    slug: record.slug,
    profession: enumValue(data.profession, PROFESSION_VALUES, 'other'),
    socialLinks: normalizeSocialLinks(data.socialLinks),
    templateId: enumValue(data.templateId, TEMPLATE_VALUES, 'modern'),
    colorPaletteId: enumValue(data.colorPaletteId, COLOR_PALETTE_VALUES, 'elegant-neutral'),
    animationPresetId: enumValue(data.animationPresetId, ANIMATION_VALUES, 'soft'),
    fontPresetId: enumValue(data.fontPresetId, FONT_VALUES, 'professional'),
    themeMode: enumValue(data.themeMode, THEME_VALUES, 'light'),
    sectionOrder: normalizeSectionOrder(data.sectionOrder),
    sectionVisibility: normalizeSectionVisibility(data.sectionVisibility),
    isPublished: record.status === 'PUBLISHED',
    publishedAt: record.publishedAt,
    updatedAt: record.updatedAt,
  } as Portfolio;
}

export function frontendToBackendUpdate(portfolio: Portfolio) {
  const name =
    stringValue(portfolio.fullName).trim() ||
    stringValue(portfolio.title).trim() ||
    'Untitled Portfolio';

  return {
    name,
    slug: stringValue(portfolio.slug),
    data: { ...portfolio },
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Unable to reach the server. Please try again.');
  }

  const responseText = await response.text();
  let responseBody: unknown;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    const errorMessage =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'error' in responseBody &&
      typeof responseBody.error === 'string'
        ? responseBody.error
        : typeof responseBody === 'object' &&
            responseBody !== null &&
            'message' in responseBody &&
            typeof responseBody.message === 'string'
          ? responseBody.message
          : typeof responseBody === 'string' && responseBody.trim()
            ? responseBody
            : `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return responseBody as T;
}

export const authApi = {
  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<void> {
    await request<{ ok: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },

  me(): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/me');
  },
};

export const portfolioApi = {
  async list(): Promise<BackendPortfolio[]> {
    const response = await request<{ portfolios: BackendPortfolio[] }>('/portfolios');
    return response.portfolios;
  },

  async create(input: CreatePortfolioInput): Promise<BackendPortfolio> {
    const response = await request<{ portfolio: BackendPortfolio }>('/portfolios', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.portfolio;
  },

  async remove(portfolioId: string): Promise<void> {
    await request<{ ok: boolean }>(`/portfolios/${encodeURIComponent(portfolioId)}`, {
      method: 'DELETE',
    });
  },

  async get(portfolioId: string): Promise<Portfolio> {
    const response = await request<{ portfolio: BackendPortfolio }>(
      `/portfolios/${encodeURIComponent(portfolioId)}`
    );
    return backendToFrontendPortfolio(response.portfolio);
  },

  async update(portfolioId: string, portfolio: Portfolio): Promise<Portfolio> {
    const response = await request<{ portfolio: BackendPortfolio }>(
      `/portfolios/${encodeURIComponent(portfolioId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(frontendToBackendUpdate(portfolio)),
      }
    );
    return backendToFrontendPortfolio(response.portfolio);
  },

  async getMock(portfolioId?: string): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    const p = portfolioId ? db.getPortfolioById(portfolioId) : db.getPortfolio();
    if (!p) throw new Error('Portfolio not found');
    return p;
  },

  async updateMock(data: Partial<Portfolio>, portfolioId?: string): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    if (portfolioId) return db.updatePortfolioById(portfolioId, data);
    return db.updatePortfolio(data);
  },

  async publish(portfolioId: string): Promise<Portfolio> {
    const response = await request<{ portfolio: BackendPortfolio }>(
      `/portfolios/${encodeURIComponent(portfolioId)}/publish`,
      { method: 'POST' }
    );
    return backendToFrontendPortfolio(response.portfolio);
  },

  async publishMock(portfolioId?: string): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    const patch = { isPublished: true, publishedAt: new Date().toISOString() };
    if (portfolioId) return db.updatePortfolioById(portfolioId, patch);
    return db.updatePortfolio(patch);
  },

  // NOTE: the backend has no unpublish endpoint yet. This stays mock-only —
  // see useUnpublishPortfolio / isBackendPortfolioId guard in publish-page.tsx.
  async unpublish(portfolioId?: string): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    const patch = { isPublished: false };
    if (portfolioId) return db.updatePortfolioById(portfolioId, patch);
    return db.updatePortfolio(patch);
  },

  async getPublic(slug: string): Promise<PublicPortfolioData | null> {
    const response = await request<{ portfolio: BackendPortfolioLike }>(
      `/public/${encodeURIComponent(slug)}`
    );
    return {
      portfolio: backendToFrontendPortfolio(response.portfolio),
      projects: [],
      experiences: [],
      skills: [],
      services: [],
      certifications: [],
      testimonials: [],
      gallery: [],
    };
  },
};

export const projectsApi = {
  async list(): Promise<Project[]> { await delay(MOCK_DELAY); return db.getProjects(); },
  async create(data: Omit<Project, 'id' | 'portfolioId'>): Promise<Project> { await delay(MOCK_DELAY); return db.createProject(data); },
  async update(id: string, data: Partial<Project>): Promise<Project> { await delay(MOCK_DELAY); return db.updateProject(id, data); },
  async remove(id: string): Promise<void> { await delay(MOCK_DELAY); db.deleteProject(id); },
  async reorder(items: { id: string; order: number }[]): Promise<void> { await delay(100); db.reorderProjects(items); },
};

export const experiencesApi = {
  async list(): Promise<Experience[]> { await delay(MOCK_DELAY); return db.getExperiences(); },
  async create(data: Omit<Experience, 'id' | 'portfolioId'>): Promise<Experience> { await delay(MOCK_DELAY); return db.createExperience(data); },
  async update(id: string, data: Partial<Experience>): Promise<Experience> { await delay(MOCK_DELAY); return db.updateExperience(id, data); },
  async remove(id: string): Promise<void> { await delay(MOCK_DELAY); db.deleteExperience(id); },
  async reorder(items: { id: string; order: number }[]): Promise<void> { await delay(100); db.reorderExperiences(items); },
};

export const skillsApi = {
  async list(): Promise<Skill[]> { await delay(MOCK_DELAY); return db.getSkills(); },
  async create(data: Omit<Skill, 'id' | 'portfolioId'>): Promise<Skill> { await delay(MOCK_DELAY); return db.createSkill(data); },
  async update(id: string, data: Partial<Skill>): Promise<Skill> { await delay(MOCK_DELAY); return db.updateSkill(id, data); },
  async remove(id: string): Promise<void> { await delay(MOCK_DELAY); db.deleteSkill(id); },
  async reorder(items: { id: string; order: number }[]): Promise<void> { await delay(100); db.reorderSkills(items); },
};

export const servicesApi = {
  async list(): Promise<Service[]> { await delay(MOCK_DELAY); return db.getServices(); },
  async create(data: Omit<Service, 'id' | 'portfolioId'>): Promise<Service> { await delay(MOCK_DELAY); return db.createService(data); },
  async update(id: string, data: Partial<Service>): Promise<Service> { await delay(MOCK_DELAY); return db.updateService(id, data); },
  async remove(id: string): Promise<void> { await delay(MOCK_DELAY); db.deleteService(id); },
};

export const certificationsApi = {
  async list(): Promise<Certification[]> { await delay(MOCK_DELAY); return db.getCertifications(); },
  async create(data: Omit<Certification, 'id' | 'portfolioId'>): Promise<Certification> { await delay(MOCK_DELAY); return db.createCertification(data); },
  async update(id: string, data: Partial<Certification>): Promise<Certification> { await delay(MOCK_DELAY); return db.updateCertification(id, data); },
  async remove(id: string): Promise<void> { await delay(MOCK_DELAY); db.deleteCertification(id); },
};

export const testimonialsApi = {
  async list(): Promise<Testimonial[]> { await delay(MOCK_DELAY); return db.getTestimonials(); },
  async create(data: Omit<Testimonial, 'id' | 'portfolioId'>): Promise<Testimonial> { await delay(MOCK_DELAY); return db.createTestimonial(data); },
  async update(id: string, data: Partial<Testimonial>): Promise<Testimonial> { await delay(MOCK_DELAY); return db.updateTestimonial(id, data); },
  async remove(id: string): Promise<void> { await delay(MOCK_DELAY); db.deleteTestimonial(id); },
};

export const galleryApi = {
  async list(): Promise<GalleryItem[]> { await delay(MOCK_DELAY); return db.getGalleryItems(); },
  async create(data: Omit<GalleryItem, 'id' | 'portfolioId'>): Promise<GalleryItem> { await delay(MOCK_DELAY); return db.createGalleryItem(data); },
  async update(id: string, data: Partial<GalleryItem>): Promise<GalleryItem> { await delay(MOCK_DELAY); return db.updateGalleryItem(id, data); },
  async remove(id: string): Promise<void> { await delay(MOCK_DELAY); db.deleteGalleryItem(id); },
};
