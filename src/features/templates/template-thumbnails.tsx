import { useEffect, useRef, useState } from 'react';
import { PortfolioRenderer } from '@/features/public-portfolio/portfolio-renderer';
import { useI18n } from '@/lib/i18n';
import type { ProfessionCategory, PublicPortfolioData, SectionId, TemplateId } from '@/types';

// Template cards show the REAL template: the same PortfolioRenderer the public page uses,
// rendered with a small fictional sample profile, hero section only, motion off, and scaled
// down into the card. No wireframes, no stock images — what you see is what you get.

const SECTIONS: SectionId[] = ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'certifications', 'testimonials', 'gallery', 'contact'];

const SAMPLES: Record<TemplateId, { fullName: string; title: string; profession: ProfessionCategory; bio: string }> = {
  modern: { fullName: 'Alex Morgan', title: 'Software Engineer', profession: 'developer', bio: 'I build fast, accessible web products end to end.' },
  minimal: { fullName: 'Lena Hart', title: 'Product Designer', profession: 'designer', bio: 'I design calm, useful interfaces for ambitious teams.' },
  corporate: { fullName: 'Omar Haddad', title: 'Creative Developer', profession: 'developer', bio: 'Interfaces that move with purpose.' },
  creative: { fullName: 'Maya Collins', title: 'Brand Designer', profession: 'designer', bio: 'Identity systems and visual stories for bold brands.' },
};

function sampleData(templateId: TemplateId): PublicPortfolioData {
  const s = SAMPLES[templateId];
  const empty = '';
  return {
    portfolio: {
      id: `sample-${templateId}`,
      userId: 'sample',
      ...s,
      slug: 'sample',
      location: 'Lisbon',
      email: 'hello@example.com',
      avatarUrl: empty,
      coverUrl: empty,
      resumeUrl: empty,
      ctaLabel: 'Hire me',
      ctaLink: '#',
      socialLinks: { linkedin: '#', github: '#', twitter: '#', instagram: empty, behance: empty, dribbble: empty, website: empty, youtube: empty },
      templateId,
      colorPaletteId: 'monochrome',
      animationPresetId: 'none',
      fontPresetId: 'professional',
      themeMode: 'dark',
      customAccentColor: empty,
      sectionOrder: SECTIONS,
      sectionVisibility: Object.fromEntries(SECTIONS.map((id) => [id, id === 'hero'])) as Record<SectionId, boolean>,
      isPublished: true,
      publishedAt: null,
      updatedAt: empty,
      projects: [],
      experiences: [],
      skills: [],
      services: [],
      certifications: [],
      testimonials: [],
      gallery: [],
    },
    projects: [],
    experiences: [],
    skills: [],
    services: [],
    certifications: [],
    testimonials: [],
    gallery: [],
  };
}

const DATA = Object.fromEntries((Object.keys(SAMPLES) as TemplateId[]).map((id) => [id, sampleData(id)])) as Record<TemplateId, PublicPortfolioData>;

/**
 * A scaled, non-interactive render of the real template's hero. The virtual viewport keeps
 * the browser's height (heroes are sized in svh) and the card's aspect ratio, so the preview
 * frames the hero exactly as a desktop visitor would see it. Mounts only once scrolled near.
 */
export function TemplateThumbnail({ templateId, className }: { templateId: TemplateId; className?: string }) {
  const { lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const viewportH = typeof window === 'undefined' ? 900 : Math.max(640, Math.min(window.innerHeight, 1000));
  const virtualW = box && box.h > 0 ? viewportH * (box.w / box.h) : 0;
  const scale = box && virtualW > 0 ? box.w / virtualW : 0;

  return (
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'hsl(240 10% 6%)' }}>
      {visible && scale > 0 && (
        <div
          aria-hidden
          // Keeps the preview's links and buttons out of the tab order (React 18 has no `inert` prop).
          ref={(node) => node?.setAttribute('inert', '')}
          className="pointer-events-none absolute left-0 top-0 select-none"
          style={{ width: virtualW, height: viewportH, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}
        >
          <PortfolioRenderer key={lang} data={DATA[templateId]} embedded lang={lang} />
        </div>
      )}
    </div>
  );
}
