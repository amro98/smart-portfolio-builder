import { Loader2 } from 'lucide-react';
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

// A route with NO SaaS chrome at all (no AppLayout, no PortfolioEditorLayout) — just the
// portfolio itself, on its own real page. This is what /portfolios/:id/preview embeds via
// a real <iframe src>, so the portfolio gets a genuinely independent document/viewport:
// its own window, its own IntersectionObserver realm (framer-motion's whileInView/useInView
// animations need this — they silently never fire when their target elements are portaled
// into a different document than the one their observer was constructed in), and its own
// position:fixed/sticky containing block, so nothing it does can ever reach outside the
// iframe into the parent SaaS page. Still authenticated + ownership-checked via the same
// GET /portfolios/:id the rest of the editor uses, so a draft is never exposed publicly.
export default function PreviewFramePage() {
  const { data: portfolio, isLoading: portfolioLoading, isError: portfolioError } = usePortfolio();
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (portfolioError || !portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">Portfolio not found.</p>
      </div>
    );
  }

  const data: PublicPortfolioData = {
    portfolio,
    projects: projects || [],
    experiences: experiences || [],
    skills: skills || [],
    services: services || [],
    certifications: certifications || [],
    testimonials: testimonials || [],
    gallery: gallery || [],
  };

  // No `embedded` — this document IS the portfolio's own page, same as /u/:slug, so its
  // normal fixed navbar/scroll behavior is correct as-is inside the iframe's own viewport.
  return <PortfolioRenderer data={data} />;
}
