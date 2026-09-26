import { memo, useEffect, useRef, useState } from 'react';
import { PortfolioRenderer } from '@/features/public-portfolio/portfolio-renderer';
import { useI18n } from '@/lib/i18n';
import { ALL_SECTIONS } from '@/lib/constants';
import { getTemplate, templateList } from '@/lib/presets/templates';
import { bestProfessionsFor } from '@/lib/presets/recommendations';
import type { ProfessionCategory, PublicPortfolioData, SectionId, TemplateId } from '@/types';

// Template cards show the REAL template: the same PortfolioRenderer the public page uses,
// rendered with a small fictional sample profile, hero section only, motion off, and scaled
// down into the card. No wireframes, no stock images. Each preview mounts only once it
// scrolls near the viewport, so a catalog of a dozen templates stays cheap.

const NAMES = ['Alex Morgan', 'Lena Hart', 'Omar Haddad', 'Maya Collins', 'Sam Rivera', 'Noor Khalil', 'Jonas Weber', 'Aria Chen', 'Leo Martins', 'Sara Nasser', 'Iris Novak', 'Kai Tanaka'];
const TITLES: Partial<Record<ProfessionCategory, string>> = {
  developer: 'Software Engineer',
  designer: 'Product Designer',
  photographer: 'Documentary Photographer',
  doctor: 'Consultant Cardiologist',
  lawyer: 'Corporate Lawyer',
  consultant: 'Strategy Consultant',
  coach: 'Leadership Coach',
  researcher: 'Research Scientist',
  writer: 'Writer & Editor',
  architect: 'Architect',
  freelancer: 'Independent Designer',
  student: 'Computer Science Student',
  'business-owner': 'Founder & CEO',
};

function sampleData(templateId: TemplateId): PublicPortfolioData {
  const template = getTemplate(templateId);
  const index = templateList.findIndex((t) => t.id === templateId);
  const profession = bestProfessionsFor(template, 1)[0] ?? 'other';
  const fullName = NAMES[index % NAMES.length];
  const pid = `sample-${templateId}`;
  const empty = '';
  const skills = ['TypeScript', 'React', 'Figma', 'Node.js', 'Research', 'Strategy'].map((name, i) => ({
    id: `${pid}-s${i}`, portfolioId: pid, name, category: i < 3 ? 'Core' : 'Tools', proficiency: 90 - i * 6, order: i,
  }));
  return {
    portfolio: {
      id: pid,
      userId: 'sample',
      fullName,
      title: TITLES[profession] ?? 'Creative Professional',
      bio: 'I help people and teams turn ambitious ideas into work that is clear, useful and made to last.',
      profession,
      slug: 'sample',
      location: 'Lisbon',
      email: 'hello@example.com',
      avatarUrl: empty,
      coverUrl: empty,
      resumeUrl: empty,
      ctaLabel: empty,
      ctaLink: empty,
      socialLinks: { linkedin: '#', github: '#', twitter: '#', instagram: empty, behance: empty, dribbble: empty, website: empty, youtube: empty },
      templateId,
      colorPaletteId: 'monochrome',
      animationPresetId: 'none',
      fontPresetId: 'signature',
      themeMode: 'auto',
      customAccentColor: empty,
      sectionOrder: ALL_SECTIONS,
      sectionVisibility: Object.fromEntries(ALL_SECTIONS.map((id) => [id, id === 'hero'])) as Record<SectionId, boolean>,
      isPublished: true,
      publishedAt: null,
      updatedAt: empty,
      projects: [],
      experiences: [],
      skills,
      services: [],
      certifications: [],
      testimonials: [],
      gallery: [],
    },
    projects: [],
    experiences: [
      { id: `${pid}-e1`, portfolioId: pid, company: 'Northwind Studio', role: TITLES[profession] ?? 'Lead', startDate: '2018-03-01', endDate: '', current: true, location: 'Lisbon', description: [], industryTag: '', order: 0 },
    ],
    skills,
    services: [],
    certifications: [],
    testimonials: [],
    gallery: [],
  };
}

const DATA_CACHE = new Map<TemplateId, PublicPortfolioData>();
function getSample(id: TemplateId) {
  if (!DATA_CACHE.has(id)) DATA_CACHE.set(id, sampleData(id));
  return DATA_CACHE.get(id)!;
}

/**
 * A scaled, non-interactive render of the real template's hero. The virtual viewport keeps
 * the browser's height (heroes are sized in svh) and the card's aspect ratio, so the preview
 * frames the hero exactly as a desktop visitor would see it.
 */
export const TemplateThumbnail = memo(function TemplateThumbnail({ templateId, className }: { templateId: TemplateId; className?: string }) {
  const { lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const template = getTemplate(templateId);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
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
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden', backgroundColor: template.swatch.background }}>
      {visible && scale > 0 && (
        <div
          aria-hidden
          // Keeps the preview's links and buttons out of the tab order (React 18 has no `inert` prop).
          ref={(node) => node?.setAttribute('inert', '')}
          className="pointer-events-none absolute left-0 top-0 select-none"
          style={{ width: virtualW, height: viewportH, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}
        >
          <PortfolioRenderer key={lang} data={getSample(templateId)} embedded lang={lang} />
        </div>
      )}
    </div>
  );
});
