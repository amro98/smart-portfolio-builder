import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { portfolioApi } from '@/lib/api/client';
import { useI18n } from '@/lib/i18n';
import type {
  Portfolio, Project, Experience, Skill, Service, Certification,
  Testimonial, GalleryItem, CreatePortfolioInput,
} from '@/types';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';
import { useCurrentPortfolioId } from '@/app/providers/portfolio-id-provider';

const portfoliosQueryKey = ['portfolios'] as const;

// Resolves the active portfolio id the same way across every portfolio-scoped hook:
// an explicit argument wins, then the route param, then the nearest PortfolioIdProvider.
function useResolvedPortfolioId(portfolioId?: string): string | undefined {
  const { portfolioId: routePortfolioId } = useParams<{ portfolioId: string }>();
  const contextId = useCurrentPortfolioId();
  return portfolioId ?? routePortfolioId ?? contextId;
}

export function usePortfolios() {
  return useQuery({
    queryKey: portfoliosQueryKey,
    queryFn: portfolioApi.list,
  });
}

export function useCreatePortfolio() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePortfolioInput) => portfolioApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfoliosQueryKey }),
  });
}

export function useDeletePortfolio() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId: string) => portfolioApi.remove(portfolioId),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfoliosQueryKey }),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete portfolio');
    },
  });
}

// portfolioId parameter takes precedence; falls back to the route param, then the
// nearest PortfolioIdProvider context value.
export function usePortfolio(portfolioId?: string) {
  const id = useResolvedPortfolioId(portfolioId);

  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => portfolioApi.get(id as string),
    enabled: !!id,
  });
}

export function useUpdatePortfolio(portfolioId?: string) {
  const id = useResolvedPortfolioId(portfolioId);
  const qc = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: async (data: Partial<Portfolio>) => {
      if (!id) throw new Error('No portfolio selected');

      const currentPortfolio =
        qc.getQueryData<Portfolio>(['portfolio', id]) ?? (await portfolioApi.get(id));
      const updatedPortfolio = { ...currentPortfolio, ...data };

      return portfolioApi.update(id, updatedPortfolio);
    },
    onSuccess: async (portfolio) => {
      qc.setQueryData(['portfolio', id], portfolio);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['portfolio', id] }),
        qc.invalidateQueries({ queryKey: portfoliosQueryKey }),
      ]);
      toast.success(t('toast.portfolio.updated'));
    },
    onError: () => toast.error(t('toast.portfolio.updateFailed')),
  });
}

export function usePublishPortfolio() {
  const id = useResolvedPortfolioId();
  const qc = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No portfolio selected');
      return portfolioApi.publish(id);
    },
    onSuccess: (portfolio) => {
      qc.setQueryData(['portfolio', id], portfolio);
      qc.invalidateQueries({ queryKey: ['portfolio', id] });
      qc.invalidateQueries({ queryKey: portfoliosQueryKey });
      toast.success(t('toast.portfolio.published'));
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

// Projects/experience/skills/etc. all live inside the active Portfolio's `data` blob
// (see Portfolio.projects/.experiences/...), not behind their own endpoints. Every list
// below shares the ['portfolio', id] query (via `select`) and every mutation reads-modifies-
// writes that same portfolio through portfolioApi.update, so cache and persistence stay in
// lockstep with usePortfolio/useUpdatePortfolio and edits never leak across portfolios.
interface ListResourceMessages {
  created: string;
  createFailed: string;
  updated: string;
  updateFailed: string;
  deleted: string;
  deleteFailed: string;
}

type PortfolioListField =
  | 'projects'
  | 'experiences'
  | 'skills'
  | 'services'
  | 'certifications'
  | 'testimonials'
  | 'gallery';

function createPortfolioListHooks<TItem extends { id: string; portfolioId: string; order: number }>(
  field: PortfolioListField,
  messages: ListResourceMessages
) {
  function getList(portfolio: Portfolio | undefined): TItem[] {
    return ((portfolio?.[field] as unknown as TItem[] | undefined) ?? []);
  }

  function useList(portfolioId?: string) {
    const id = useResolvedPortfolioId(portfolioId);
    return useQuery({
      queryKey: ['portfolio', id],
      queryFn: () => portfolioApi.get(id as string),
      enabled: !!id,
      select: getList,
    });
  }

  function useCreate() {
    const id = useResolvedPortfolioId();
    const qc = useQueryClient();
    const { t } = useI18n();
    return useMutation({
      mutationFn: async (data: Omit<TItem, 'id' | 'portfolioId'>) => {
        if (!id) throw new Error('No portfolio selected');
        const current = qc.getQueryData<Portfolio>(['portfolio', id]) ?? (await portfolioApi.get(id));
        const item = { ...data, id: generateId(), portfolioId: id } as TItem;
        const list = [...getList(current), item];
        return portfolioApi.update(id, { ...current, [field]: list } as Portfolio);
      },
      onSuccess: (portfolio) => {
        qc.setQueryData(['portfolio', id], portfolio);
        qc.invalidateQueries({ queryKey: portfoliosQueryKey });
        toast.success(t(messages.created));
      },
      onError: () => toast.error(t(messages.createFailed)),
    });
  }

  function useUpdate() {
    const id = useResolvedPortfolioId();
    const qc = useQueryClient();
    const { t } = useI18n();
    return useMutation({
      mutationFn: async ({ id: itemId, data }: { id: string; data: Partial<TItem> }) => {
        if (!id) throw new Error('No portfolio selected');
        const current = qc.getQueryData<Portfolio>(['portfolio', id]) ?? (await portfolioApi.get(id));
        const list = getList(current).map((item) => (item.id === itemId ? { ...item, ...data } : item));
        return portfolioApi.update(id, { ...current, [field]: list } as Portfolio);
      },
      onSuccess: (portfolio) => {
        qc.setQueryData(['portfolio', id], portfolio);
        qc.invalidateQueries({ queryKey: portfoliosQueryKey });
        toast.success(t(messages.updated));
      },
      onError: () => toast.error(t(messages.updateFailed)),
    });
  }

  function useDelete() {
    const id = useResolvedPortfolioId();
    const qc = useQueryClient();
    const { t } = useI18n();
    return useMutation({
      mutationFn: async (itemId: string) => {
        if (!id) throw new Error('No portfolio selected');
        const current = qc.getQueryData<Portfolio>(['portfolio', id]) ?? (await portfolioApi.get(id));
        const list = getList(current).filter((item) => item.id !== itemId);
        return portfolioApi.update(id, { ...current, [field]: list } as Portfolio);
      },
      onSuccess: (portfolio) => {
        qc.setQueryData(['portfolio', id], portfolio);
        qc.invalidateQueries({ queryKey: portfoliosQueryKey });
        toast.success(t(messages.deleted));
      },
      onError: () => toast.error(t(messages.deleteFailed)),
    });
  }

  function useReorder() {
    const id = useResolvedPortfolioId();
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (items: { id: string; order: number }[]) => {
        if (!id) throw new Error('No portfolio selected');
        const current = qc.getQueryData<Portfolio>(['portfolio', id]) ?? (await portfolioApi.get(id));
        const orderById = new Map(items.map((item) => [item.id, item.order]));
        const list = getList(current).map((item) =>
          orderById.has(item.id) ? { ...item, order: orderById.get(item.id) as number } : item
        );
        return portfolioApi.update(id, { ...current, [field]: list } as Portfolio);
      },
      onSuccess: (portfolio) => qc.setQueryData(['portfolio', id], portfolio),
    });
  }

  return { useList, useCreate, useUpdate, useDelete, useReorder };
}

const projectHooks = createPortfolioListHooks<Project>('projects', {
  created: 'toast.project.created',
  createFailed: 'toast.project.createFailed',
  updated: 'toast.project.updated',
  updateFailed: 'toast.project.updateFailed',
  deleted: 'toast.project.deleted',
  deleteFailed: 'toast.project.deleteFailed',
});
export const useProjects = projectHooks.useList;
export const useCreateProject = projectHooks.useCreate;
export const useUpdateProject = projectHooks.useUpdate;
export const useDeleteProject = projectHooks.useDelete;
export const useReorderProjects = projectHooks.useReorder;

const experienceHooks = createPortfolioListHooks<Experience>('experiences', {
  created: 'toast.experience.created',
  createFailed: 'toast.experience.createFailed',
  updated: 'toast.experience.updated',
  updateFailed: 'toast.experience.updateFailed',
  deleted: 'toast.experience.deleted',
  deleteFailed: 'toast.experience.deleteFailed',
});
export const useExperiences = experienceHooks.useList;
export const useCreateExperience = experienceHooks.useCreate;
export const useUpdateExperience = experienceHooks.useUpdate;
export const useDeleteExperience = experienceHooks.useDelete;
export const useReorderExperiences = experienceHooks.useReorder;

const skillHooks = createPortfolioListHooks<Skill>('skills', {
  created: 'toast.skill.created',
  createFailed: 'toast.skill.createFailed',
  updated: 'toast.skill.updated',
  updateFailed: 'toast.skill.updateFailed',
  deleted: 'toast.skill.deleted',
  deleteFailed: 'toast.skill.deleteFailed',
});
export const useSkills = skillHooks.useList;
export const useCreateSkill = skillHooks.useCreate;
export const useUpdateSkill = skillHooks.useUpdate;
export const useDeleteSkill = skillHooks.useDelete;

const serviceHooks = createPortfolioListHooks<Service>('services', {
  created: 'toast.service.created',
  createFailed: 'toast.service.createFailed',
  updated: 'toast.service.updated',
  updateFailed: 'toast.service.updateFailed',
  deleted: 'toast.service.deleted',
  deleteFailed: 'toast.service.deleteFailed',
});
export const useServices = serviceHooks.useList;
export const useCreateService = serviceHooks.useCreate;
export const useUpdateService = serviceHooks.useUpdate;
export const useDeleteService = serviceHooks.useDelete;

const certificationHooks = createPortfolioListHooks<Certification>('certifications', {
  created: 'toast.certification.created',
  createFailed: 'toast.certification.createFailed',
  updated: 'toast.certification.updated',
  updateFailed: 'toast.certification.updateFailed',
  deleted: 'toast.certification.deleted',
  deleteFailed: 'toast.certification.deleteFailed',
});
export const useCertifications = certificationHooks.useList;
export const useCreateCertification = certificationHooks.useCreate;
export const useUpdateCertification = certificationHooks.useUpdate;
export const useDeleteCertification = certificationHooks.useDelete;

const testimonialHooks = createPortfolioListHooks<Testimonial>('testimonials', {
  created: 'toast.testimonial.created',
  createFailed: 'toast.testimonial.createFailed',
  updated: 'toast.testimonial.updated',
  updateFailed: 'toast.testimonial.updateFailed',
  deleted: 'toast.testimonial.deleted',
  deleteFailed: 'toast.testimonial.deleteFailed',
});
export const useTestimonials = testimonialHooks.useList;
export const useCreateTestimonial = testimonialHooks.useCreate;
export const useUpdateTestimonial = testimonialHooks.useUpdate;
export const useDeleteTestimonial = testimonialHooks.useDelete;

const galleryHooks = createPortfolioListHooks<GalleryItem>('gallery', {
  created: 'toast.gallery.created',
  createFailed: 'toast.gallery.createFailed',
  updated: 'toast.gallery.updated',
  updateFailed: 'toast.gallery.updateFailed',
  deleted: 'toast.gallery.deleted',
  deleteFailed: 'toast.gallery.deleteFailed',
});
export const useGallery = galleryHooks.useList;
export const useCreateGalleryItem = galleryHooks.useCreate;
export const useUpdateGalleryItem = galleryHooks.useUpdate;
export const useDeleteGalleryItem = galleryHooks.useDelete;
