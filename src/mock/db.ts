import type {
  Portfolio, Project, Experience, Skill, Service,
  Certification, Testimonial, GalleryItem, User
} from '@/types';
import {
  mockUsers, mockPortfolio, mockProjects, mockExperiences, mockSkills,
  mockServices, mockCertifications, mockTestimonials, mockGallery,
  mockDoctorPortfolio, mockDoctorServices, mockDoctorCertifications,
  mockDoctorTestimonials, mockPhotographerPortfolio, mockPhotographerGallery,
  mockPhotographerServices,
} from './data';

// TODO: Replace this entire mock database with real Express + Prisma API calls

class MockDB {
  private users: User[] = [...mockUsers];
  private portfolios: Portfolio[] = [mockPortfolio, mockDoctorPortfolio, mockPhotographerPortfolio];
  private projects: Project[] = [...mockProjects];
  private experiences: Experience[] = [...mockExperiences];
  private skills: Skill[] = [...mockSkills];
  private services: Service[] = [...mockServices, ...mockDoctorServices, ...mockPhotographerServices];
  private certifications: Certification[] = [...mockCertifications, ...mockDoctorCertifications];
  private testimonials: Testimonial[] = [...mockTestimonials, ...mockDoctorTestimonials];
  private gallery: GalleryItem[] = [...mockGallery, ...mockPhotographerGallery];

  private currentUserId = 'user-1';
  private currentPortfolioId = 'portfolio-1';

  setCurrentUser(userId: string, portfolioId: string) {
    this.currentUserId = userId;
    this.currentPortfolioId = portfolioId;
  }

  getCurrentUserId() { return this.currentUserId; }
  getCurrentPortfolioId() { return this.currentPortfolioId; }

  findUserByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }

  createUser(email: string, _password: string): User {
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };
    this.users.push(user);

    const portfolio: Portfolio = {
      id: `portfolio-${Date.now()}`,
      userId: user.id,
      fullName: '',
      title: '',
      bio: '',
      slug: '',
      profession: 'other',
      location: '',
      email,
      avatarUrl: '',
      coverUrl: '',
      resumeUrl: '',
      ctaLabel: 'Contact Me',
      ctaLink: '#contact',
      socialLinks: { linkedin: '', github: '', twitter: '', instagram: '', behance: '', dribbble: '', website: '', youtube: '' },
      templateId: 'modern',
      colorPaletteId: 'elegant-neutral',
      animationPresetId: 'soft',
      fontPresetId: 'professional',
      themeMode: 'light',
      customAccentColor: '',
      sectionOrder: ['hero', 'about', 'projects', 'experience', 'skills', 'contact'],
      sectionVisibility: {
        hero: true, about: true, projects: true, experience: true, skills: true,
        services: false, certifications: false, testimonials: false, gallery: false, contact: true,
      },
      isPublished: false,
      publishedAt: null,
      updatedAt: new Date().toISOString(),
    };
    this.portfolios.push(portfolio);
    this.currentUserId = user.id;
    this.currentPortfolioId = portfolio.id;

    return user;
  }

  getPortfolio(): Portfolio | undefined {
    return this.portfolios.find((p) => p.id === this.currentPortfolioId);
  }

  updatePortfolio(data: Partial<Portfolio>): Portfolio {
    const idx = this.portfolios.findIndex((p) => p.id === this.currentPortfolioId);
    if (idx === -1) throw new Error('Portfolio not found');
    this.portfolios[idx] = { ...this.portfolios[idx], ...data, updatedAt: new Date().toISOString() };
    return this.portfolios[idx];
  }

  getPublicPortfolio(slug: string) {
    const portfolio = this.portfolios.find((p) => p.slug === slug && p.isPublished);
    if (!portfolio) return null;
    return {
      portfolio,
      projects: this.projects.filter((p) => p.portfolioId === portfolio.id && p.status === 'published').sort((a, b) => a.order - b.order),
      experiences: this.experiences.filter((e) => e.portfolioId === portfolio.id).sort((a, b) => a.order - b.order),
      skills: this.skills.filter((s) => s.portfolioId === portfolio.id).sort((a, b) => a.order - b.order),
      services: this.services.filter((s) => s.portfolioId === portfolio.id).sort((a, b) => a.order - b.order),
      certifications: this.certifications.filter((c) => c.portfolioId === portfolio.id).sort((a, b) => a.order - b.order),
      testimonials: this.testimonials.filter((t) => t.portfolioId === portfolio.id).sort((a, b) => a.order - b.order),
      gallery: this.gallery.filter((g) => g.portfolioId === portfolio.id).sort((a, b) => a.order - b.order),
    };
  }

  // Projects
  getProjects() { return this.projects.filter((p) => p.portfolioId === this.currentPortfolioId).sort((a, b) => a.order - b.order); }
  getProject(id: string) { return this.projects.find((p) => p.id === id); }
  createProject(data: Omit<Project, 'id' | 'portfolioId'>): Project {
    const project: Project = { ...data, id: `proj-${Date.now()}`, portfolioId: this.currentPortfolioId };
    this.projects.push(project);
    return project;
  }
  updateProject(id: string, data: Partial<Project>): Project {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    this.projects[idx] = { ...this.projects[idx], ...data };
    return this.projects[idx];
  }
  deleteProject(id: string) { this.projects = this.projects.filter((p) => p.id !== id); }
  reorderProjects(items: { id: string; order: number }[]) {
    items.forEach(({ id, order }) => {
      const idx = this.projects.findIndex((p) => p.id === id);
      if (idx !== -1) this.projects[idx].order = order;
    });
  }

  // Experiences
  getExperiences() { return this.experiences.filter((e) => e.portfolioId === this.currentPortfolioId).sort((a, b) => a.order - b.order); }
  createExperience(data: Omit<Experience, 'id' | 'portfolioId'>): Experience {
    const exp: Experience = { ...data, id: `exp-${Date.now()}`, portfolioId: this.currentPortfolioId };
    this.experiences.push(exp);
    return exp;
  }
  updateExperience(id: string, data: Partial<Experience>): Experience {
    const idx = this.experiences.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Experience not found');
    this.experiences[idx] = { ...this.experiences[idx], ...data };
    return this.experiences[idx];
  }
  deleteExperience(id: string) { this.experiences = this.experiences.filter((e) => e.id !== id); }
  reorderExperiences(items: { id: string; order: number }[]) {
    items.forEach(({ id, order }) => {
      const idx = this.experiences.findIndex((e) => e.id === id);
      if (idx !== -1) this.experiences[idx].order = order;
    });
  }

  // Skills
  getSkills() { return this.skills.filter((s) => s.portfolioId === this.currentPortfolioId).sort((a, b) => a.order - b.order); }
  createSkill(data: Omit<Skill, 'id' | 'portfolioId'>): Skill {
    const skill: Skill = { ...data, id: `skill-${Date.now()}`, portfolioId: this.currentPortfolioId };
    this.skills.push(skill);
    return skill;
  }
  updateSkill(id: string, data: Partial<Skill>): Skill {
    const idx = this.skills.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Skill not found');
    this.skills[idx] = { ...this.skills[idx], ...data };
    return this.skills[idx];
  }
  deleteSkill(id: string) { this.skills = this.skills.filter((s) => s.id !== id); }
  reorderSkills(items: { id: string; order: number }[]) {
    items.forEach(({ id, order }) => {
      const idx = this.skills.findIndex((s) => s.id === id);
      if (idx !== -1) this.skills[idx].order = order;
    });
  }

  // Services
  getServices() { return this.services.filter((s) => s.portfolioId === this.currentPortfolioId).sort((a, b) => a.order - b.order); }
  createService(data: Omit<Service, 'id' | 'portfolioId'>): Service {
    const svc: Service = { ...data, id: `svc-${Date.now()}`, portfolioId: this.currentPortfolioId };
    this.services.push(svc);
    return svc;
  }
  updateService(id: string, data: Partial<Service>): Service {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Service not found');
    this.services[idx] = { ...this.services[idx], ...data };
    return this.services[idx];
  }
  deleteService(id: string) { this.services = this.services.filter((s) => s.id !== id); }

  // Certifications
  getCertifications() { return this.certifications.filter((c) => c.portfolioId === this.currentPortfolioId).sort((a, b) => a.order - b.order); }
  createCertification(data: Omit<Certification, 'id' | 'portfolioId'>): Certification {
    const cert: Certification = { ...data, id: `cert-${Date.now()}`, portfolioId: this.currentPortfolioId };
    this.certifications.push(cert);
    return cert;
  }
  updateCertification(id: string, data: Partial<Certification>): Certification {
    const idx = this.certifications.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Certification not found');
    this.certifications[idx] = { ...this.certifications[idx], ...data };
    return this.certifications[idx];
  }
  deleteCertification(id: string) { this.certifications = this.certifications.filter((c) => c.id !== id); }

  // Testimonials
  getTestimonials() { return this.testimonials.filter((t) => t.portfolioId === this.currentPortfolioId).sort((a, b) => a.order - b.order); }
  createTestimonial(data: Omit<Testimonial, 'id' | 'portfolioId'>): Testimonial {
    const test: Testimonial = { ...data, id: `test-${Date.now()}`, portfolioId: this.currentPortfolioId };
    this.testimonials.push(test);
    return test;
  }
  updateTestimonial(id: string, data: Partial<Testimonial>): Testimonial {
    const idx = this.testimonials.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Testimonial not found');
    this.testimonials[idx] = { ...this.testimonials[idx], ...data };
    return this.testimonials[idx];
  }
  deleteTestimonial(id: string) { this.testimonials = this.testimonials.filter((t) => t.id !== id); }

  // Gallery
  getGalleryItems() { return this.gallery.filter((g) => g.portfolioId === this.currentPortfolioId).sort((a, b) => a.order - b.order); }
  createGalleryItem(data: Omit<GalleryItem, 'id' | 'portfolioId'>): GalleryItem {
    const item: GalleryItem = { ...data, id: `gal-${Date.now()}`, portfolioId: this.currentPortfolioId };
    this.gallery.push(item);
    return item;
  }
  updateGalleryItem(id: string, data: Partial<GalleryItem>): GalleryItem {
    const idx = this.gallery.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Gallery item not found');
    this.gallery[idx] = { ...this.gallery[idx], ...data };
    return this.gallery[idx];
  }
  deleteGalleryItem(id: string) { this.gallery = this.gallery.filter((g) => g.id !== id); }
}

export const db = new MockDB();
