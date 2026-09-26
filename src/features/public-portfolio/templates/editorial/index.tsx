import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Menu, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { DISPLAY_FONT, yearOf } from '../theme';
import {
  experienceRange, groupSkills, initials, projectLink, publishedProjects, useTemplateKit, useTemplateNav,
  type Kit, type TemplateLook,
} from '../kit';
import { Media, Sections } from '../kit-ui';
import type { Certification, Experience, GalleryItem, Portfolio, Project, SectionId, Service, Skill, Testimonial } from '@/types';

// EDITORIAL — a printed-magazine silhouette: masthead, a giant serif name set across the
// page, drop-cap lead paragraphs, numbered "§" section heads, an index of projects as
// expanding rows with a cursor-following image plate, and a colophon footer.

const LOOK: TemplateLook = {
  skins: {
    light: { signatureAccent: '6 70% 42%', background: '40 33% 95%', surface: '40 24% 90%', foreground: '30 10% 8%', muted: '30 6% 36%', border: '30 12% 78%' },
    dark: { signatureAccent: '10 78% 62%', background: '30 8% 7%', surface: '30 6% 11%', foreground: '40 28% 91%', muted: '35 8% 62%', border: '30 6% 22%' },
  },
  fonts: { display: "'Fraunces', Georgia, serif", body: "'Source Serif 4', Georgia, serif" },
};
const LABEL = { fontFamily: "'Inter', system-ui, sans-serif" } as const;
const labelCls = 'text-[11px] font-semibold uppercase tracking-[0.22em]';
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function Head({ n, title, kit, aside }: { n: string; title: string; kit: Kit; aside?: React.ReactNode }) {
  return (
    <motion.div {...kit.reveal({ y: 24 })} className="mb-12 grid gap-4 border-t border-[hsl(var(--foreground))] pt-4 md:grid-cols-12 md:gap-8">
      <p style={LABEL} className={cn(labelCls, 'md:col-span-3 text-[hsl(var(--muted-foreground))]')}>
        § {n}
      </p>
      <div className="flex items-end justify-between gap-6 md:col-span-9">
        <h2 style={DISPLAY_FONT} className="text-[clamp(2.4rem,6vw,5.2rem)] font-light leading-[0.95] tracking-tight">
          {title}
        </h2>
        {aside}
      </div>
    </motion.div>
  );
}

function Masthead({ portfolio, visibleSections, embedded, kit }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean; kit: Kit }) {
  const nav = useTemplateNav(visibleSections, embedded);
  return (
    <header className={cn(embedded ? 'absolute' : 'fixed', 'inset-x-0 top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.92)] backdrop-blur')}>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-5 sm:px-8">
        <button onClick={() => nav.go('hero')} style={DISPLAY_FONT} className="me-auto truncate text-lg italic">
          {portfolio.fullName}
        </button>
        <nav style={LABEL} className="hidden items-center gap-5 lg:flex">
          {nav.sections.slice(0, 6).map((s) => (
            <button key={s} onClick={() => nav.go(s)} className={cn(labelCls, 'transition-colors', nav.active === s ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]')}>
              {kit.t(`sections.${s}`)}
            </button>
          ))}
        </nav>
        <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
        <button onClick={() => nav.setOpen(true)} style={LABEL} className={cn(labelCls, 'flex items-center gap-2 lg:hidden')} aria-label={kit.t('public.nav.openMenu')}>
          <Menu className="h-4 w-4" /> {kit.t('public.tpl.index')}
        </button>
      </div>
      <AnimatePresence>
        {nav.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(embedded ? 'absolute' : 'fixed', 'inset-0 z-50 h-[100dvh] overflow-y-auto bg-[hsl(var(--background))] px-6 py-5')}
          >
            <div className="flex items-center justify-between">
              <span style={LABEL} className={labelCls}>{kit.t('public.tpl.index')}</span>
              <button onClick={() => nav.setOpen(false)} aria-label={kit.t('public.nav.closeMenu')}><X className="h-6 w-6" /></button>
            </div>
            <ol className="mt-10 space-y-3">
              {nav.sections.map((s, i) => (
                <li key={s}>
                  <button onClick={() => nav.go(s)} className="flex w-full items-baseline gap-4 border-b border-[hsl(var(--border))] pb-3 text-start">
                    <span style={LABEL} className={cn(labelCls, 'w-8 text-[hsl(var(--muted-foreground))]')}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={DISPLAY_FONT} className="text-4xl font-light">{kit.t(`sections.${s}`)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ portfolio, kit, firstTarget }: { portfolio: Portfolio; kit: Kit; firstTarget?: string }) {
  const words = portfolio.fullName.trim().split(/\s+/);
  const year = new Date().getFullYear();
  const [lead, ...rest] = (portfolio.bio || '').trim().split(/(?<=[.!?؟])\s+/);
  return (
    <section id="hero" className="mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8 lg:pt-28">
      <motion.div {...kit.reveal({ clip: 'start', duration: 1 })} style={LABEL} className={cn(labelCls, 'flex flex-wrap items-center justify-between gap-3 border-y border-[hsl(var(--foreground))] py-2')}>
        <span>{kit.t('public.tpl.portfolio')} — {year}</span>
        <span className="text-[hsl(var(--primary))]">{portfolio.title}</span>
        {portfolio.location && <span>{portfolio.location}</span>}
      </motion.div>

      {/* The heading (always on screen) drives the per-line rise; each line's own element is
          fully clipped by its mask at the start, so it can't observe its own visibility. */}
      <motion.h1
        style={DISPLAY_FONT}
        className="mt-8 text-[clamp(3.4rem,12vw,11.5rem)] font-light leading-[0.86] tracking-[-0.035em]"
        initial={kit.intensity.level ? 'hidden' : false}
        animate="shown"
        transition={{ staggerChildren: 0.08 }}
      >
        {words.map((w, i) => (
          <span key={i} className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className={cn('block', i === words.length - 1 && words.length > 1 && 'italic')}
              variants={{ hidden: { y: '105%' }, shown: { y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } } }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </motion.h1>

      <div className="mt-12 grid gap-10 md:grid-cols-12">
        <motion.div {...kit.reveal({ y: 30, delay: 0.3 })} className="md:col-span-7 lg:col-span-6">
          {lead && (
            <p className="text-[1.35rem] leading-relaxed first-letter:float-start first-letter:me-3 first-letter:text-[4.6rem] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-[hsl(var(--primary))]" style={{ ...DISPLAY_FONT }}>
              {lead}
            </p>
          )}
          {rest.length > 0 && <p className="mt-5 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">{rest.join(' ')}</p>}
          <div style={LABEL} className="mt-8 flex flex-wrap gap-6">
            {firstTarget && (
              <a href={`#${firstTarget}`} className={cn(labelCls, 'inline-flex items-center gap-2 border-b border-current pb-1 hover:text-[hsl(var(--primary))]')}>
                {kit.t('public.hero.viewWork')} <ArrowDown className="h-3.5 w-3.5" />
              </a>
            )}
            {portfolio.ctaLabel && portfolio.ctaLink && (
              <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer" className={cn(labelCls, 'inline-flex items-center gap-2 border-b border-current pb-1 hover:text-[hsl(var(--primary))]')}>
                {portfolio.ctaLabel} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </motion.div>
        <motion.figure {...kit.reveal({ y: 40, delay: 0.4 })} className="md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
          <div className="group aspect-[4/5] overflow-hidden bg-[hsl(var(--card))]">
            {portfolio.avatarUrl ? (
              <Media src={portfolio.avatarUrl} alt={portfolio.fullName} eager className="grayscale transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span style={DISPLAY_FONT} className="text-[7rem] font-light italic text-[hsl(var(--muted-foreground)/0.5)]">{initials(portfolio.fullName)}</span>
              </div>
            )}
          </div>
          <figcaption style={LABEL} className={cn(labelCls, 'mt-3 text-[hsl(var(--muted-foreground))]')}>
            {kit.t('public.tpl.fig')} 1 — {portfolio.fullName}{portfolio.location ? `, ${portfolio.location}` : ''}
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

function About({ portfolio, n, kit }: { portfolio: Portfolio; n: string; kit: Kit }) {
  const sentences = (portfolio.bio || '').trim().split(/(?<=[.!?؟])\s+/).filter(Boolean);
  const quote = sentences[0];
  const body = sentences.slice(1).join(' ');
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Head n={n} title={kit.t('public.about.heading')} kit={kit} />
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-9 md:col-start-4">
          {quote && (
            <motion.blockquote {...kit.reveal({ y: 30 })} style={DISPLAY_FONT} className="text-[clamp(1.7rem,3.4vw,2.8rem)] font-light italic leading-snug">
              “{quote}”
            </motion.blockquote>
          )}
          {body && <motion.p {...kit.reveal({ y: 20, delay: 0.1 })} className="mt-8 text-lg leading-relaxed text-[hsl(var(--muted-foreground))] md:columns-2 md:gap-10">{body}</motion.p>}
          <dl style={LABEL} className="mt-10 grid gap-4 border-t border-[hsl(var(--border))] pt-6 sm:grid-cols-3">
            {portfolio.location && (
              <div><dt className={cn(labelCls, 'text-[hsl(var(--muted-foreground))]')}>{kit.t('public.contact.location')}</dt><dd className="mt-1 text-sm">{portfolio.location}</dd></div>
            )}
            {portfolio.email && (
              <div><dt className={cn(labelCls, 'text-[hsl(var(--muted-foreground))]')}>{kit.t('public.contact.email')}</dt><dd className="mt-1 break-all text-sm" dir="ltr">{portfolio.email}</dd></div>
            )}
            <div><dt className={cn(labelCls, 'text-[hsl(var(--muted-foreground))]')}>{kit.t('public.tpl.discipline')}</dt><dd className="mt-1 text-sm">{portfolio.title}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ project, index, kit, onHover }: { project: Project; index: number; kit: Kit; onHover: (p: Project | null) => void }) {
  const [open, setOpen] = useState(false);
  const link = projectLink(project);
  return (
    <motion.li {...kit.reveal({ y: 20, delay: Math.min(index, 6) * 0.04 })} className="border-b border-[hsl(var(--border))]">
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => onHover(project)}
        onMouseLeave={() => onHover(null)}
        aria-expanded={open}
        className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-6 text-start md:grid-cols-[4rem_1fr_14rem_2rem]"
      >
        <span style={LABEL} className={cn(labelCls, 'text-[hsl(var(--muted-foreground))]')}>{String(index + 1).padStart(2, '0')}</span>
        <span style={DISPLAY_FONT} className="text-[clamp(1.6rem,3.6vw,3.2rem)] font-light leading-tight transition-all duration-300 group-hover:italic group-hover:text-[hsl(var(--primary))]">
          {project.title}
        </span>
        <span style={LABEL} className={cn(labelCls, 'hidden text-[hsl(var(--muted-foreground))] md:block')}>
          {[project.category, yearOf(project.date)].filter(Boolean).join(' · ')}
        </span>
        <span className="text-[hsl(var(--muted-foreground))]">{open ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="grid gap-8 pb-10 md:grid-cols-[4rem_1fr_1fr]">
              <span className="hidden md:block" />
              <div className="aspect-[16/10] overflow-hidden bg-[hsl(var(--card))]">
                {project.coverImage ? (
                  <Media src={project.coverImage} alt={project.title} />
                ) : (
                  <div className="flex h-full items-center justify-center"><span style={DISPLAY_FONT} className="text-6xl italic text-[hsl(var(--muted-foreground)/0.4)]">{initials(project.title)}</span></div>
                )}
              </div>
              <div>
                <p className="text-lg leading-relaxed">{project.fullDescription || project.shortDescription}</p>
                {project.tags.length > 0 && <p style={LABEL} className={cn(labelCls, 'mt-5 text-[hsl(var(--muted-foreground))]')}>{project.tags.join(' / ')}</p>}
                <div style={LABEL} className="mt-6 flex flex-wrap gap-5">
                  {link && <a href={link} target="_blank" rel="noopener noreferrer" className={cn(labelCls, 'inline-flex items-center gap-1 border-b border-current pb-0.5 hover:text-[hsl(var(--primary))]')}>{kit.t('public.projects.viewWork')} <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                  {project.repositoryUrl && project.repositoryUrl !== link && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className={cn(labelCls, 'border-b border-current pb-0.5 hover:text-[hsl(var(--primary))]')}>{kit.t('public.projects.code')}</a>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function Projects({ projects, n, kit }: { projects: Project[]; n: string; kit: Kit }) {
  const items = publishedProjects(projects);
  const [hovered, setHovered] = useState<Project | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 24 });
  const sy = useSpring(y, { stiffness: 200, damping: 24 });
  if (items.length === 0) return null;
  return (
    <section id="projects" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8" onMouseMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}>
      <Head n={n} title={kit.t('public.projects.selected')} kit={kit} aside={<span style={LABEL} className={cn(labelCls, 'hidden text-[hsl(var(--muted-foreground))] sm:block')}>{items.length} {kit.t('public.tpl.entries')}</span>} />
      <ol className="border-t border-[hsl(var(--border))]">
        {items.map((p, i) => <ProjectRow key={p.id} project={p} index={i} kit={kit} onHover={setHovered} />)}
      </ol>
      {/* Floating plate that follows the cursor on hover-capable devices. */}
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-40 hidden h-56 w-80 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-2xl [@media(hover:hover)]:block" style={{ x: sx, y: sy }} animate={{ opacity: hovered?.coverImage ? 1 : 0, scale: hovered?.coverImage ? 1 : 0.85 }} transition={{ duration: 0.25 }}>
        {hovered?.coverImage && <Media src={hovered.coverImage} alt="" />}
      </motion.div>
    </section>
  );
}

function ExperienceSection({ experiences, n, kit }: { experiences: Experience[]; n: string; kit: Kit }) {
  const items = sortByOrder(experiences);
  if (items.length === 0) return null;
  return (
    <section id="experience" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Head n={n} title={kit.t('public.tpl.curriculum')} kit={kit} />
      <div className="divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
        {items.map((e, i) => (
          <motion.div key={e.id} {...kit.reveal({ y: 20, delay: i * 0.05 })} className="grid gap-3 py-8 md:grid-cols-12 md:gap-8">
            <p style={LABEL} className={cn(labelCls, 'md:col-span-3 text-[hsl(var(--muted-foreground))]')} dir="ltr">{experienceRange(e, kit.t('public.experience.present'))}</p>
            <div className="md:col-span-9">
              <h3 style={DISPLAY_FONT} className="text-3xl font-light">{e.role}</h3>
              <p className="mt-1 italic text-[hsl(var(--muted-foreground))]">{[e.company, e.location].filter(Boolean).join(', ')}</p>
              {e.description.length > 0 && (
                <ul className="mt-4 space-y-2 text-[1.05rem] leading-relaxed">
                  {e.description.map((d, j) => <li key={j} className="relative ps-5 before:absolute before:start-0 before:top-[0.8em] before:h-px before:w-3 before:bg-[hsl(var(--primary))]">{d}</li>)}
                </ul>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SkillsSection({ skills, n, kit }: { skills: Skill[]; n: string; kit: Kit }) {
  const groups = groupSkills(sortByOrder(skills), kit.t('public.skills.general'));
  if (groups.length === 0) return null;
  return (
    <section id="skills" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Head n={n} title={kit.t('public.tpl.competencies')} kit={kit} />
      <div className="grid gap-10 md:grid-cols-12">
        <div className="space-y-8 md:col-span-9 md:col-start-4">
          {groups.map(([cat, list], i) => (
            <motion.div key={cat} {...kit.reveal({ y: 20, delay: i * 0.05 })}>
              <p style={LABEL} className={cn(labelCls, 'text-[hsl(var(--primary))]')}>{cat}</p>
              <p style={DISPLAY_FONT} className="mt-2 text-[clamp(1.5rem,3vw,2.4rem)] font-light leading-snug">
                {list.map((s, j) => (
                  <span key={s.id}>
                    {s.name}
                    {j < list.length - 1 && <span className="mx-3 text-[hsl(var(--muted-foreground)/0.6)]">/</span>}
                  </span>
                ))}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ services, n, kit }: { services: Service[]; n: string; kit: Kit }) {
  const items = sortByOrder(services);
  if (items.length === 0) return null;
  return (
    <section id="services" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Head n={n} title={kit.t('public.services.heading')} kit={kit} />
      <div className="grid gap-x-12 gap-y-12 md:grid-cols-2">
        {items.map((s, i) => (
          <motion.article key={s.id} {...kit.reveal({ y: 24, delay: (i % 2) * 0.08 })} className="border-t border-[hsl(var(--foreground))] pt-5">
            <p style={DISPLAY_FONT} className="text-2xl italic text-[hsl(var(--primary))]">{ROMAN[i] ?? i + 1}.</p>
            <h3 style={DISPLAY_FONT} className="mt-2 text-3xl font-light">{s.title}</h3>
            <p className="mt-3 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">{s.description}</p>
            <div style={LABEL} className={cn(labelCls, 'mt-5 flex flex-wrap items-center gap-4')}>
              {s.priceLabel && <span>{s.priceLabel}</span>}
              {s.duration && <span className="text-[hsl(var(--muted-foreground))]">{s.duration}</span>}
              {s.ctaLink && <a href={s.ctaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 border-b border-current hover:text-[hsl(var(--primary))]">{s.ctaLabel || kit.t('public.hero.contactButton')} <ArrowUpRight className="h-3 w-3" /></a>}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function CertificationsSection({ certifications, n, kit }: { certifications: Certification[]; n: string; kit: Kit }) {
  const items = sortByOrder(certifications);
  if (items.length === 0) return null;
  const cols = [
    { title: kit.t('public.tpl.education'), list: items.filter((c) => c.type === 'education') },
    { title: kit.t('public.tpl.honours'), list: items.filter((c) => c.type !== 'education') },
  ].filter((c) => c.list.length > 0);
  return (
    <section id="certifications" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Head n={n} title={kit.t('sections.certifications')} kit={kit} />
      <div className="grid gap-12 md:grid-cols-2">
        {cols.map((col) => (
          <div key={col.title}>
            <p style={LABEL} className={cn(labelCls, 'mb-4 text-[hsl(var(--muted-foreground))]')}>{col.title}</p>
            <ul className="divide-y divide-[hsl(var(--border))] border-t border-[hsl(var(--border))]">
              {col.list.map((c) => (
                <motion.li key={c.id} {...kit.reveal({ y: 12 })} className="flex items-baseline justify-between gap-4 py-4">
                  <div>
                    <p style={DISPLAY_FONT} className="text-xl">{c.title}</p>
                    <p className="text-sm italic text-[hsl(var(--muted-foreground))]">
                      {c.institution}
                      {c.verificationUrl && (
                        <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="ms-2 not-italic underline underline-offset-4 hover:text-[hsl(var(--primary))]">{kit.t('public.certifications.viewCredential')}</a>
                      )}
                    </p>
                  </div>
                  <span style={LABEL} className={cn(labelCls, 'shrink-0 text-[hsl(var(--muted-foreground))]')}>{yearOf(c.issueDate)}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials, n, kit }: { testimonials: Testimonial[]; n: string; kit: Kit }) {
  const items = sortByOrder(testimonials);
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const current = items[index % items.length];
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Head
        n={n}
        title={kit.t('public.tpl.inTheirWords')}
        kit={kit}
        aside={
          items.length > 1 ? (
            <div style={LABEL} className={cn(labelCls, 'flex items-center gap-4')}>
              <button onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)} aria-label={kit.t('public.testimonials.prev')} className="hover:text-[hsl(var(--primary))]">←</button>
              <span dir="ltr">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
              <button onClick={() => setIndex((i) => (i + 1) % items.length)} aria-label={kit.t('public.testimonials.next')} className="hover:text-[hsl(var(--primary))]">→</button>
            </div>
          ) : undefined
        }
      />
      <AnimatePresence mode="wait">
        <motion.figure key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45 }} className="grid gap-8 md:grid-cols-12">
          <span style={DISPLAY_FONT} aria-hidden className="text-[8rem] leading-[0.7] text-[hsl(var(--primary))] md:col-span-2">“</span>
          <div className="md:col-span-10">
            <blockquote style={DISPLAY_FONT} className="text-[clamp(1.6rem,3.6vw,3rem)] font-light italic leading-snug">{current.quote}</blockquote>
            <figcaption style={LABEL} className={cn(labelCls, 'mt-8')}>
              {current.clientName}
              {current.role && <span className="ms-3 text-[hsl(var(--muted-foreground))]">{current.role}</span>}
            </figcaption>
          </div>
        </motion.figure>
      </AnimatePresence>
    </section>
  );
}

function GallerySection({ gallery, n, kit }: { gallery: GalleryItem[]; n: string; kit: Kit }) {
  const items = sortByOrder(gallery).filter((g) => g.imageUrl);
  if (items.length === 0) return null;
  return (
    <section id="gallery" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Head n={n} title={kit.t('public.tpl.plates')} kit={kit} />
      <div className="grid gap-x-8 gap-y-14 md:grid-cols-12">
        {items.map((g, i) => {
          const layout = ['md:col-span-7', 'md:col-span-5 md:mt-24', 'md:col-span-5', 'md:col-span-6 md:col-start-7'][i % 4];
          return (
            <motion.figure key={g.id} {...kit.reveal({ y: 40, delay: (i % 2) * 0.1 })} className={layout}>
              <div className="overflow-hidden bg-[hsl(var(--card))]">
                <Media src={g.imageUrl} alt={g.title} className="h-auto transition-transform duration-700 hover:scale-[1.03]" />
              </div>
              <figcaption style={LABEL} className={cn(labelCls, 'mt-3 flex justify-between gap-4 text-[hsl(var(--muted-foreground))]')}>
                <span>{kit.t('public.tpl.plate')} {i + 1} — {g.title}</span>
                {g.category && <span>{g.category}</span>}
              </figcaption>
            </motion.figure>
          );
        })}
      </div>
    </section>
  );
}

function Contact({ portfolio, n, kit }: { portfolio: Portfolio; n: string; kit: Kit }) {
  const { field, onSubmit } = useContactForm(portfolio.email, kit.t);
  const socials = socialEntries(portfolio.socialLinks);
  const input = 'w-full border-0 border-b border-[hsl(var(--border))] bg-transparent px-0 py-3 text-lg outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground)/0.7)] focus:border-[hsl(var(--foreground))]';
  return (
    <section id="contact" className="mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-8">
      <Head n={n} title={kit.t('public.tpl.writeToMe')} kit={kit} />
      <div className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-6">
          {portfolio.email && (
            <a href={`mailto:${portfolio.email}`} style={DISPLAY_FONT} dir="ltr" className="block break-all text-[clamp(1.8rem,4vw,3.4rem)] font-light italic leading-tight underline decoration-1 underline-offset-8 transition-colors hover:text-[hsl(var(--primary))]">
              {portfolio.email}
            </a>
          )}
          {socials.length > 0 && (
            <div className="mt-10 flex gap-5 text-[hsl(var(--muted-foreground))]">
              {socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="transition-colors hover:text-[hsl(var(--primary))]">{getSocialIcon(k)}</a>)}
            </div>
          )}
        </div>
        {portfolio.email && (
          <form onSubmit={onSubmit} className="space-y-4 md:col-span-6">
            <input {...field('name')} placeholder={kit.t('public.contact.namePlaceholder')} className={input} />
            <input {...field('email')} type="email" placeholder={kit.t('public.contact.emailPlaceholder')} className={input} />
            <textarea {...field('message')} rows={4} placeholder={kit.t('public.contact.messagePlaceholder')} className={cn(input, 'resize-none')} />
            <button type="submit" style={LABEL} className={cn(labelCls, 'mt-4 inline-flex items-center gap-2 bg-[hsl(var(--foreground))] px-6 py-3 text-[hsl(var(--background))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]')}>
              {kit.t('public.contact.send')} <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>
      <footer style={LABEL} className={cn(labelCls, 'mt-24 flex flex-wrap justify-between gap-3 border-t border-[hsl(var(--foreground))] pt-4 text-[hsl(var(--muted-foreground))]')}>
        <span>© {new Date().getFullYear()} {portfolio.fullName}</span>
        <span>{kit.t('public.footer.rights')}</span>
      </footer>
    </section>
  );
}

export default function EditorialTemplate(props: TemplateContentProps) {
  const kit = useTemplateKit(props, LOOK);
  const { portfolio, visibleSections, embedded } = props;
  const numbered: SectionId[] = visibleSections.filter((s) => s !== 'hero');
  const n = (id: SectionId) => String(numbered.indexOf(id) + 1).padStart(2, '0');
  const firstTarget = numbered.find((s) => s === 'projects') ?? numbered[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={kit.style}>
        <Masthead portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} kit={kit} />
        <main>
          <Sections
            order={visibleSections}
            render={{
              hero: () => <Hero portfolio={portfolio} kit={kit} firstTarget={firstTarget} />,
              about: () => <About portfolio={portfolio} n={n('about')} kit={kit} />,
              projects: () => <Projects projects={props.projects} n={n('projects')} kit={kit} />,
              experience: () => <ExperienceSection experiences={props.experiences} n={n('experience')} kit={kit} />,
              skills: () => <SkillsSection skills={props.skills} n={n('skills')} kit={kit} />,
              services: () => <ServicesSection services={props.services} n={n('services')} kit={kit} />,
              certifications: () => <CertificationsSection certifications={props.certifications} n={n('certifications')} kit={kit} />,
              testimonials: () => <TestimonialsSection testimonials={props.testimonials} n={n('testimonials')} kit={kit} />,
              gallery: () => <GallerySection gallery={props.gallery} n={n('gallery')} kit={kit} />,
              contact: () => <Contact portfolio={portfolio} n={n('contact')} kit={kit} />,
            }}
          />
        </main>
      </div>
    </MotionConfig>
  );
}
