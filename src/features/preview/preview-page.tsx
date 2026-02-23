import { useState, useMemo } from 'react';
import { Monitor, Smartphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingPage } from '@/components/shared/loading-card';
import { useUIStore } from '@/store';
import {
  usePortfolio,
  useProjects,
  useExperiences,
  useSkills,
  useServices,
  useCertifications,
  useTestimonials,
  useGallery,
} from '@/lib/query/hooks';
import { PortfolioRenderer } from '@/features/public-portfolio/portfolio-renderer';
import type { PublicPortfolioData } from '@/types';
import { cn } from '@/lib/utils';

export default function PreviewPage() {
  const { previewDevice, setPreviewDevice } = useUIStore();

  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: experiences, isLoading: experiencesLoading } = useExperiences();
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: certifications, isLoading: certificationsLoading } = useCertifications();
  const { data: testimonials, isLoading: testimonialsLoading } = useTestimonials();
  const { data: gallery, isLoading: galleryLoading } = useGallery();

  const isLoading =
    portfolioLoading ||
    projectsLoading ||
    experiencesLoading ||
    skillsLoading ||
    servicesLoading ||
    certificationsLoading ||
    testimonialsLoading ||
    galleryLoading;

  const previewData = useMemo<PublicPortfolioData | null>(() => {
    if (!portfolio) return null;
    return {
      portfolio,
      projects: projects || [],
      experiences: experiences || [],
      skills: skills || [],
      services: services || [],
      certifications: certifications || [],
      testimonials: testimonials || [],
      gallery: gallery || [],
    };
  }, [portfolio, projects, experiences, skills, services, certifications, testimonials, gallery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Preview" description="Loading your portfolio preview..." />
        <LoadingPage />
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Preview" description="No portfolio data found." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Preview" description="See how your portfolio looks to visitors.">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/50">
          <Button
            variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('desktop')}
            className="gap-2"
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </Button>
          <Button
            variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('mobile')}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </Button>
        </div>
        <a
          href={`/u/${previewData.portfolio.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Open Full Preview
          </Button>
        </a>
      </PageHeader>

      <div className="flex justify-center">
        <div
          className={cn(
            'border border-border rounded-xl bg-background shadow-sm overflow-hidden transition-all duration-300',
            previewDevice === 'desktop'
              ? 'w-full'
              : 'w-[375px] rounded-[2rem] border-[6px] border-foreground/20'
          )}
        >
          {previewDevice === 'mobile' && (
            <div className="h-6 bg-foreground/10 flex items-center justify-center">
              <div className="w-20 h-1.5 rounded-full bg-foreground/20" />
            </div>
          )}
          <div
            className={cn(
              'overflow-y-auto',
              previewDevice === 'desktop' ? 'max-h-[calc(100vh-200px)]' : 'max-h-[700px]'
            )}
          >
            <PortfolioRenderer data={previewData} />
          </div>
          {previewDevice === 'mobile' && (
            <div className="h-5 bg-foreground/10 flex items-center justify-center">
              <div className="w-24 h-1 rounded-full bg-foreground/20" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
