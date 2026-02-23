import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authApi, portfolioApi, projectsApi, experiencesApi,
  skillsApi, servicesApi, certificationsApi, testimonialsApi, galleryApi,
} from '@/lib/api/client';
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
  return useMutation({
    mutationFn: (data: Partial<Portfolio>) => portfolioApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Portfolio updated');
    },
    onError: () => toast.error('Failed to update portfolio'),
  });
}

export function usePublishPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: portfolioApi.publish,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Portfolio published!');
    },
  });
}

export function useUnpublishPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: portfolioApi.unpublish,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Portfolio unpublished');
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
  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'portfolioId'>) => projectsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project created'); },
    onError: () => toast.error('Failed to create project'),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => projectsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project updated'); },
    onError: () => toast.error('Failed to update project'),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deleted'); },
    onError: () => toast.error('Failed to delete project'),
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
  return useMutation({
    mutationFn: (data: Omit<Experience, 'id' | 'portfolioId'>) => experiencesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); toast.success('Experience added'); },
    onError: () => toast.error('Failed to add experience'),
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Experience> }) => experiencesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); toast.success('Experience updated'); },
    onError: () => toast.error('Failed to update experience'),
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => experiencesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); toast.success('Experience deleted'); },
    onError: () => toast.error('Failed to delete experience'),
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
  return useMutation({
    mutationFn: (data: Omit<Skill, 'id' | 'portfolioId'>) => skillsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skills'] }); toast.success('Skill added'); },
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Skill> }) => skillsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skills'] }); toast.success('Skill updated'); },
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skills'] }); toast.success('Skill deleted'); },
  });
}

// Services
export function useServices() {
  return useQuery({ queryKey: ['services'], queryFn: servicesApi.list });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Service, 'id' | 'portfolioId'>) => servicesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Service added'); },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Service updated'); },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Service deleted'); },
  });
}

// Certifications
export function useCertifications() {
  return useQuery({ queryKey: ['certifications'], queryFn: certificationsApi.list });
}

export function useCreateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Certification, 'id' | 'portfolioId'>) => certificationsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast.success('Certification added'); },
  });
}

export function useUpdateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Certification> }) => certificationsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast.success('Certification updated'); },
  });
}

export function useDeleteCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => certificationsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast.success('Certification deleted'); },
  });
}

// Testimonials
export function useTestimonials() {
  return useQuery({ queryKey: ['testimonials'], queryFn: testimonialsApi.list });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Testimonial, 'id' | 'portfolioId'>) => testimonialsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Testimonial added'); },
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) => testimonialsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Testimonial updated'); },
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testimonialsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Testimonial deleted'); },
  });
}

// Gallery
export function useGallery() {
  return useQuery({ queryKey: ['gallery'], queryFn: galleryApi.list });
}

export function useCreateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<GalleryItem, 'id' | 'portfolioId'>) => galleryApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery'] }); toast.success('Image added'); },
  });
}

export function useUpdateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GalleryItem> }) => galleryApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery'] }); toast.success('Image updated'); },
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => galleryApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery'] }); toast.success('Image deleted'); },
  });
}
