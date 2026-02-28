import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authApi, portfolioApi, projectsApi, experiencesApi,
  skillsApi, servicesApi, certificationsApi, testimonialsApi, galleryApi,
} from '@/lib/api/client';
import { useI18n } from '@/lib/i18n';
import type { Portfolio, Project, Experience, Skill, Service, Certification, Testimonial, GalleryItem } from '@/types';
import { toast } from 'sonner';

// TODO: Replace mock API calls with real Express API integration

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.get,
  });
}

export function useUpdatePortfolio() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (data: Partial<Portfolio>) => portfolioApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success(t('toast.portfolio.updated'));
    },
    onError: () => toast.error(t('toast.portfolio.updateFailed')),
  });
}

export function usePublishPortfolio() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: portfolioApi.publish,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success(t('toast.portfolio.published'));
    },
  });
}

export function useUnpublishPortfolio() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: portfolioApi.unpublish,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success(t('toast.portfolio.unpublished'));
    },
  });
}

export function usePublicPortfolio(slug: string) {
  return useQuery({
    queryKey: ['public-portfolio', slug],
    queryFn: () => portfolioApi.getPublic(slug),
    enabled: !!slug,
  });
}

// Projects
export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: projectsApi.list });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'portfolioId'>) => projectsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success(t('toast.project.created')); },
    onError: () => toast.error(t('toast.project.createFailed')),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => projectsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success(t('toast.project.updated')); },
    onError: () => toast.error(t('toast.project.updateFailed')),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success(t('toast.project.deleted')); },
    onError: () => toast.error(t('toast.project.deleteFailed')),
  });
}

export function useReorderProjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) => projectsApi.reorder(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// Experiences
export function useExperiences() {
  return useQuery({ queryKey: ['experiences'], queryFn: experiencesApi.list });
}

export function useCreateExperience() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (data: Omit<Experience, 'id' | 'portfolioId'>) => experiencesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); toast.success(t('toast.experience.created')); },
    onError: () => toast.error(t('toast.experience.createFailed')),
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Experience> }) => experiencesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); toast.success(t('toast.experience.updated')); },
    onError: () => toast.error(t('toast.experience.updateFailed')),
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (id: string) => experiencesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); toast.success(t('toast.experience.deleted')); },
    onError: () => toast.error(t('toast.experience.updateFailed')),
  });
}

export function useReorderExperiences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) => experiencesApi.reorder(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
  });
}

// Skills
export function useSkills() {
  return useQuery({ queryKey: ['skills'], queryFn: skillsApi.list });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (data: Omit<Skill, 'id' | 'portfolioId'>) => skillsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skills'] }); toast.success(t('toast.skill.created')); },
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Skill> }) => skillsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skills'] }); toast.success(t('toast.skill.updated')); },
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (id: string) => skillsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skills'] }); toast.success(t('toast.skill.deleted')); },
  });
}

// Services
export function useServices() {
  return useQuery({ queryKey: ['services'], queryFn: servicesApi.list });
}

export function useCreateService() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (data: Omit<Service, 'id' | 'portfolioId'>) => servicesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success(t('toast.service.created')); },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success(t('toast.service.updated')); },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success(t('toast.service.deleted')); },
  });
}

// Certifications
export function useCertifications() {
  return useQuery({ queryKey: ['certifications'], queryFn: certificationsApi.list });
}

export function useCreateCertification() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (data: Omit<Certification, 'id' | 'portfolioId'>) => certificationsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast.success(t('toast.certification.created')); },
  });
}

export function useUpdateCertification() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Certification> }) => certificationsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast.success(t('toast.certification.updated')); },
  });
}

export function useDeleteCertification() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (id: string) => certificationsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast.success(t('toast.certification.deleted')); },
  });
}

// Testimonials
export function useTestimonials() {
  return useQuery({ queryKey: ['testimonials'], queryFn: testimonialsApi.list });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (data: Omit<Testimonial, 'id' | 'portfolioId'>) => testimonialsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success(t('toast.testimonial.created')); },
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) => testimonialsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success(t('toast.testimonial.updated')); },
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (id: string) => testimonialsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success(t('toast.testimonial.deleted')); },
  });
}

// Gallery
export function useGallery() {
  return useQuery({ queryKey: ['gallery'], queryFn: galleryApi.list });
}

export function useCreateGalleryItem() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (data: Omit<GalleryItem, 'id' | 'portfolioId'>) => galleryApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery'] }); toast.success(t('toast.gallery.created')); },
  });
}

export function useUpdateGalleryItem() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GalleryItem> }) => galleryApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery'] }); toast.success(t('toast.gallery.updated')); },
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (id: string) => galleryApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery'] }); toast.success(t('toast.gallery.deleted')); },
  });
}
