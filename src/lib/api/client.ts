import { db } from '@/mock/db';
import { delay } from '@/lib/utils';
import type {
  Portfolio, Project, Experience, Skill, Service,
  Certification, Testimonial, GalleryItem, AuthResponse, PublicPortfolioData,
  BackendPortfolio,
} from '@/types';

const MOCK_DELAY = 300;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');

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

  async remove(portfolioId: string): Promise<void> {
    await request<{ ok: boolean }>(`/portfolios/${encodeURIComponent(portfolioId)}`, {
      method: 'DELETE',
    });
  },

  async get(portfolioId?: string): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    const p = portfolioId ? db.getPortfolioById(portfolioId) : db.getPortfolio();
    if (!p) throw new Error('Portfolio not found');
    return p;
  },

  async update(data: Partial<Portfolio>, portfolioId?: string): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    if (portfolioId) return db.updatePortfolioById(portfolioId, data);
    return db.updatePortfolio(data);
  },

  async publish(portfolioId?: string): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    const patch = { isPublished: true, publishedAt: new Date().toISOString() };
    if (portfolioId) return db.updatePortfolioById(portfolioId, patch);
    return db.updatePortfolio(patch);
  },

  async unpublish(portfolioId?: string): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    const patch = { isPublished: false };
    if (portfolioId) return db.updatePortfolioById(portfolioId, patch);
    return db.updatePortfolio(patch);
  },

  async getPublic(slug: string): Promise<PublicPortfolioData | null> {
    await delay(MOCK_DELAY);
    return db.getPublicPortfolio(slug);
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
