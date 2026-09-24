import { generateId } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { ALL_SECTIONS, DEFAULT_SECTION_VISIBILITY } from '@/lib/constants';
import type {
  Portfolio, Project, Experience, Skill, Service,
  Certification, Testimonial, GalleryItem, AuthResponse, PublicPortfolioData,
  BackendPortfolio, CreatePortfolioInput, ProfessionCategory, TemplateId,
  ColorPaletteId, AnimationPresetId, FontPresetId, ThemeMode, SectionId,
} from '@/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
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

// Every portfolio's sectionOrder must always contain exactly the canonical ALL_SECTIONS
// set. Sections a user has already ordered keep their position; any section missing from
// stored data (an older portfolio, or one created before a section existed) is appended
// in canonical order instead of silently disappearing from Sections/Appearance/wizard/renderer.
function normalizeSectionOrder(value: unknown): SectionId[] {
  const stored = Array.isArray(value)
    ? value.filter(
        (section, index, all): section is SectionId =>
          typeof section === 'string' &&
          (ALL_SECTIONS as string[]).includes(section) &&
          all.indexOf(section) === index
      )
    : [];

  const missing = ALL_SECTIONS.filter((section) => !stored.includes(section));

  return [...stored, ...missing];
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
    sectionOrder: [...ALL_SECTIONS],
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

  // isPublished/publishedAt are derived from the backend's authoritative `status` column
  // (see backendToFrontendPortfolio) on every read. Never write them back into the `data`
  // blob — a stale copy from before a publish/unpublish would otherwise sit in storage
  // and could shadow the real state if normalization logic ever changes.
  const dataWithoutPublishState: Partial<Portfolio> = { ...portfolio };
  delete dataWithoutPublishState.isPublished;
  delete dataWithoutPublishState.publishedAt;

  return {
    name,
    slug: stringValue(portfolio.slug),
    data: dataWithoutPublishState,
  };
}

// Resolves a possibly-relative, backend-hosted media URL (e.g. "/uploads/x.jpg") against
// the API origin, so it never accidentally resolves against the frontend's own origin
// (which happens whenever the frontend and backend are on different domains). Already-
// absolute URLs (http/https/data) and empty values pass through unchanged. Use this for
// every image sourced from Portfolio data instead of rendering the raw stored value.
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        // FormData bodies (file uploads) must NOT get an explicit Content-Type — the
        // browser needs to set its own multipart boundary.
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
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
    // A 401 anywhere means the session cookie is missing/expired. Flip auth state so
    // AuthGuard redirects to /login instead of the page quietly failing every request.
    if (response.status === 401 && useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().logout();
    }

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

  async unpublish(portfolioId: string): Promise<Portfolio> {
    const response = await request<{ portfolio: BackendPortfolio }>(
      `/portfolios/${encodeURIComponent(portfolioId)}/unpublish`,
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

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const uploadsApi = {
  // Uploads a durable, publicly-resolvable image and returns its absolute URL.
  // Used instead of blob:/object URLs, which only live in the current browser tab.
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return request<{ url: string }>('/uploads/image', {
      method: 'POST',
      body: formData,
    });
  },
};
