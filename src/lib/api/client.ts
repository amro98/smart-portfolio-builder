import { db } from '@/mock/db';
import { delay } from '@/lib/utils';
import type {
  Portfolio, Project, Experience, Skill, Service,
  Certification, Testimonial, GalleryItem, AuthResponse, PublicPortfolioData
} from '@/types';

// TODO: Replace all mock API calls with real HTTP requests to Express backend
// Example: const response = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', body: JSON.stringify(data) });

const MOCK_DELAY = 300;

export const authApi = {
  async login(email: string, _password: string): Promise<AuthResponse> {
    await delay(MOCK_DELAY);
    let user = db.findUserByEmail(email);
    if (!user) {
      user = db.createUser(email, _password);
    }
    const portfolio = db.getPortfolio();
    if (portfolio) {
      db.setCurrentUser(user.id, portfolio.id);
    }
    return { user, token: `mock-token-${user.id}` };
  },

  async register(email: string, password: string): Promise<AuthResponse> {
    await delay(MOCK_DELAY);
    const existing = db.findUserByEmail(email);
    if (existing) throw new Error('User already exists');
    const user = db.createUser(email, password);
    return { user, token: `mock-token-${user.id}` };
  },

  async logout(): Promise<void> {
    await delay(100);
  },

  async me(): Promise<AuthResponse> {
    await delay(100);
    return {
      user: { id: db.getCurrentUserId(), email: 'alex@example.com', createdAt: '', onboardingCompleted: true },
      token: 'mock-token',
    };
  },
};

export const portfolioApi = {
  async get(): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    const p = db.getPortfolio();
    if (!p) throw new Error('Portfolio not found');
    return p;
  },

  async update(data: Partial<Portfolio>): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    return db.updatePortfolio(data);
  },

  async publish(): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    return db.updatePortfolio({ isPublished: true, publishedAt: new Date().toISOString() });
  },

  async unpublish(): Promise<Portfolio> {
    await delay(MOCK_DELAY);
    return db.updatePortfolio({ isPublished: false });
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
