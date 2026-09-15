import { generateId } from '@/lib/utils';
import type {
  Portfolio, Project, Experience, Skill, Service,
  Certification, Testimonial, GalleryItem, AuthResponse, PublicPortfolioData,
  BackendPortfolio, CreatePortfolioInput, ProfessionCategory, TemplateId,
  ColorPaletteId, AnimationPresetId, FontPresetId, ThemeMode, SectionId,
} from '@/types';

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

// Normalizes an embedded Portfolio.data sub-collection (projects, experiences, etc.)
// so items always have a valid id/portfolioId/order even if the stored JSON is stale or hand-edited.
function normalizeCollection<T extends { id: string; portfolioId: string; order: number }>(
  value: unknown,
  portfolioId: string
): T[] {
  if (!Array.isArray(value)) return [];

  return value.map((raw, index) => {
    const item = isRecord(raw) ? raw : {};
    return {
      ...item,
      id: stringValue(item.id) || generateId(),
      portfolioId,
      order: typeof item.order === 'number' ? item.order : index,
    } as T;
  });
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
    projects: [],
    experiences: [],
    skills: [],
    services: [],
    certifications: [],
    testimonials: [],
    gallery: [],
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
    projects: normalizeCollection<Project>(data.projects, record.id),
    experiences: normalizeCollection<Experience>(data.experiences, record.id),
    skills: normalizeCollection<Skill>(data.skills, record.id),
    services: normalizeCollection<Service>(data.services, record.id),
    certifications: normalizeCollection<Certification>(data.certifications, record.id),
    testimonials: normalizeCollection<Testimonial>(data.testimonials, record.id),
    gallery: normalizeCollection<GalleryItem>(data.gallery, record.id),
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

  async publish(portfolioId: string): Promise<Portfolio> {
    const response = await request<{ portfolio: BackendPortfolio }>(
      `/portfolios/${encodeURIComponent(portfolioId)}/publish`,
      { method: 'POST' }
    );
    return backendToFrontendPortfolio(response.portfolio);
  },

  async getPublic(slug: string): Promise<PublicPortfolioData | null> {
    const response = await request<{ portfolio: BackendPortfolioLike }>(
      `/public/${encodeURIComponent(slug)}`
    );
    const portfolio = backendToFrontendPortfolio(response.portfolio);

    return {
      portfolio,
      projects: portfolio.projects,
      experiences: portfolio.experiences,
      skills: portfolio.skills,
      services: portfolio.services,
      certifications: portfolio.certifications,
      testimonials: portfolio.testimonials,
      gallery: portfolio.gallery,
    };
  },
};
