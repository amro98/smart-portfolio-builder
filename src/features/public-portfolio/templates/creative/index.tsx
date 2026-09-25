import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Github, Hourglass, Layers, Mail, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/api/client';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { usePortfolioLocale } from '../../portfolio-locale';
import { getAmbientIntensity, type AmbientIntensity } from '../scene-config';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { resolveAccent, skinStyle, splitLastWord, yearOf, yearsOfExperience, type TemplateSkin } from '../theme';
import { scrollToSection, useActiveSection, useLockScroll, useNavSections } from '../nav-utils';
import { useAmbientMotion, useReveal } from '../motion-utils';
import { getTechIcon } from '../tech-icons';
import { ProjectPlaceholder } from '../placeholders';
import { BlobCluster, ContourWaves, ProfessionEmblem, StageBlob } from './art-graphics';
import type { Portfolio, Project, SectionId, Skill } from '@/types';

// ART DIRECTOR — a poster-like, art-directed world: slate canvas ruled by thin columns, fixed
// rails with rotated links, an ultra-heavy title set over a recessed circle and an original
// profession emblem, liquid accent blobs, contour waves, and case studies with oversized
// names on accent stages. Original composition; no reference artwork or code is used.

const SKIN: TemplateSkin = {
  signatureAccent: '181 100% 45%',
  background: '219 27% 20%',
  surface: '219 27% 24%',
  foreground: '0 0% 100%',
  muted: '219 12% 62%',
  border: '219 20% 30%',
};
const RAIL = 'bg-[hsl(219_27%_15%)]';

type Reveal = ReturnType<typeof useReveal>;

function Recessed({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn('rounded-full bg-[hsl(219_27%_20%)]', className)}
      style={{ boxShadow: '0 40px 90px -30px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px rgba(255,255,255,.03)' }}
    >
      {children}
    </div>
  );
}

function Heading({ eyebrow, title, reveal, align = 'start' }: { eyebrow?: string; title: string; reveal: Reveal; align?: 'start' | 'center' }) {
  return (
    <motion.div {...reveal({ y: 40 })} className={cn('mb-16', align === 'center' && 'text-center')}>
      {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[hsl(var(--primary))]">{eyebrow}</p>}
      <h2 className="text-[clamp(2.6rem,6.5vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight text-white">
        {title}
        <span className="text-[hsl(var(--primary))]">.</span>
      </h2>
    </motion.div>
  );
}

function AccentLink({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
  const cls = 'inline-flex items-center gap-1.5 text-xl font-bold text-[hsl(var(--primary))] underline decoration-2 underline-offset-[6px] transition-opacity hover:opacity-80';
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>{children}</button>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  );
}

// ============================================================================
// FRAME — rails, column rules and the full-screen overlay menu.
// ============================================================================

function Frame({ portfolio, visibleSections, embedded }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean }) {
  const { t, lang, setLang } = usePortfolioLocale();
  const [open, setOpen] = useState(false);
  const navSections = useNavSections(visibleSections);
  const ids = useMemo(() => visibleSections as string[], [visibleSections]);
  const active = useActiveSection(ids);
  useLockScroll(open && !embedded);
  const socials = socialEntries(portfolio.socialLinks);
  const pos = embedded ? 'absolute' : 'fixed';
  const go = (id: string) => {
    setOpen(false);
    window.setTimeout(() => scrollToSection(id), 50);
  };
  const railLink = 'text-[15px] font-bold text-white underline decoration-2 underline-offset-4 transition-colors hover:text-[hsl(var(--primary))] [writing-mode:vertical-rl] rotate-180';

  return (
    <>
      <div aria-hidden className={cn(pos, 'inset-y-0 inset-x-0 z-0 lg:inset-x-[70px]')}>
        {[20, 40, 60, 80].map((p) => (
          <span key={p} className="absolute inset-y-0 w-px bg-white/[0.06]" style={{ insetInlineStart: `${p}%` }} />
        ))}
      </div>

      <aside className={cn(pos, RAIL, 'inset-y-0 start-0 z-40 hidden w-[70px] flex-col items-center justify-between py-6 lg:flex')}>
        <button onClick={() => go('hero')} aria-label={portfolio.fullName} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-[hsl(219_27%_15%)]">
          {portfolio.fullName.charAt(0)}
        </button>
        {visibleSections.includes('about') ? <button onClick={() => go('about')} className={railLink}>{t('sections.about')}</button> : <span />}
        <span className="text-xs font-medium text-white/35 [writing-mode:vertical-rl] rotate-180">© {portfolio.fullName} {new Date().getFullYear()}</span>
      </aside>

      <aside className={cn(pos, RAIL, 'inset-y-0 end-0 z-40 hidden w-[70px] flex-col items-center justify-between py-5 lg:flex')}>
        <button onClick={() => setOpen(true)} aria-label={t('public.nav.openMenu')} className="flex h-12 w-12 flex-col items-center justify-center gap-[5px] rounded-full bg-black/20">
          <span className="h-[3px] w-6 bg-white" /><span className="h-[3px] w-6 bg-white" /><span className="h-[3px] w-4 self-end me-3 bg-white" />
        </button>
        {visibleSections.includes('contact') ? <button onClick={() => go('contact')} className={railLink}>{t('sections.contact')}</button> : <span />}
        <div className="flex flex-col items-center gap-3">
          {socials.slice(0, 3).map(([k, url]) => (
            <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="text-white/45 transition-colors hover:text-[hsl(var(--primary))] [&_svg]:h-4 [&_svg]:w-4">{getSocialIcon(k)}</a>
          ))}
        </div>
      </aside>

      <div className={cn(embedded ? 'sticky' : 'fixed', 'inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-5 lg:hidden', RAIL)}>
        <button onClick={() => go('hero')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-[hsl(219_27%_15%)]">{portfolio.fullName.charAt(0)}</button>
        <button onClick={() => setOpen(true)} aria-label={t('public.nav.openMenu')} className="flex flex-col gap-[5px] p-2">
          <span className="h-[3px] w-6 bg-white" /><span className="h-[3px] w-6 bg-white" /><span className="h-[3px] w-4 bg-white" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className={cn(embedded ? 'absolute' : 'fixed', 'inset-0 z-[60] overflow-y-auto bg-[hsl(219_27%_14%)]')}
          >
            <div className="flex items-center justify-between px-6 py-5 sm:px-10">
              <LanguageSwitcher compact lang={lang} onLanguageChange={setLang} />
              <button onClick={() => setOpen(false)} aria-label={t('public.nav.closeMenu')} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white hover:text-[hsl(var(--primary))]">
                <X className="h-7 w-7" />
              </button>
            </div>
            <nav className="grid gap-x-16 px-6 pb-16 pt-4 sm:px-16 md:grid-cols-2">
              {navSections.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  onClick={() => go(s)}
                  className="group flex items-baseline gap-5 border-b border-white/10 py-4 text-start"
                >
                  <span className="text-sm font-semibold text-[hsl(var(--primary))]">{String(i + 1).padStart(2, '0')}</span>
                  <span className={cn('text-[clamp(1.8rem,4.5vw,3.4rem)] font-extrabold leading-tight transition-colors', active === s ? 'text-[hsl(var(--primary))]' : 'text-white group-hover:text-[hsl(var(--primary))]')}>
                    {t(`sections.${s}`)}
                  </span>
                </motion.button>
              ))}
            </nav>
            {portfolio.ctaLabel && portfolio.ctaLink && (
              <div className="px-6 pb-12 sm:px-16"><AccentLink href={portfolio.ctaLink}>{portfolio.ctaLabel} <ArrowUpRight className="h-5 w-5" /></AccentLink></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// HERO — a poster: recessed circle, emblem, and a massive title over it.
// ============================================================================

function Hero({ portfolio, intensity, animate }: { portfolio: Portfolio; intensity: AmbientIntensity; animate: boolean }) {
  const reveal = useReveal(intensity);
  const title = portfolio.title.trim().replace(/\.$/, '');
  const size = Math.max(44, Math.min(150, 2000 / Math.max(title.length, 8)));

  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pt-16 lg:pt-0">
      <BlobCluster animate={animate} className="absolute -start-24 -top-20 w-[300px] opacity-95 sm:w-[380px]" />
      <BlobCluster animate={animate} seed={2} className="absolute -bottom-24 -end-24 hidden w-[420px] rotate-180 sm:block" />
      <motion.div {...reveal({ scale: 0.85, duration: 1.2 })} className="absolute">
        <Recessed className="h-[min(88vw,640px)] w-[min(88vw,640px)]" />
      </motion.div>
      <motion.div {...reveal({ scale: 0.6, delay: 0.3, duration: 1.2 })} className="absolute">
        <ProfessionEmblem profession={portfolio.profession} animate={animate} className="h-[min(70vw,440px)] w-[min(70vw,440px)]" />
      </motion.div>
      <div className="relative z-10 text-center">
        <motion.h1
          dir="auto"
          {...reveal({ y: 60, delay: 0.2, duration: 1 })}
          className="font-black leading-[0.92] tracking-[-0.03em] text-white drop-shadow-[0_8px_30px_rgba(0,0,0,.35)]"
          style={{ fontSize: `clamp(2.6rem, ${(size / 14.4).toFixed(2)}vw, ${size}px)` }}
        >
          {title}
          <span className="text-white">.</span>
        </motion.h1>
        <motion.p {...reveal({ y: 20, delay: 0.6 })} className="mt-[clamp(7rem,22vw,13rem)] text-sm font-semibold uppercase tracking-[0.35em] text-white/75">
          {portfolio.fullName}
        </motion.p>
      </div>
      <motion.button
        onClick={() => scrollToSection('about')}
        aria-label="scroll"
        className="absolute bottom-8 text-[hsl(var(--primary))]"
        animate={animate ? { y: [0, 10, 0] } : undefined}
        transition={animate ? { duration: 2, repeat: Infinity } : undefined}
      >
        <span className="mx-auto block h-12 w-px bg-[hsl(var(--primary))]" />
        <ArrowDown className="-mt-2 h-5 w-5" />
      </motion.button>
    </section>
  );
}

// ============================================================================
// ABOUT — story panel + real-data "beats".
// ============================================================================

function About({ portfolio, projectsCount, experienceStarts, intensity, animate }: { portfolio: Portfolio; projectsCount: number; experienceStarts: string[]; intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const years = yearsOfExperience(experienceStarts);
  const beats = [
    years > 0 && { big: `${years}+`, label: t('public.stats.yearsExperience'), Icon: Hourglass },
    projectsCount > 0 && { big: String(projectsCount), label: t('public.stats.projectsCompleted'), Icon: Layers },
    portfolio.location && { big: portfolio.location.split(',')[0], label: t('public.contact.location'), Icon: MapPin },
  ].filter(Boolean) as { big: string; label: string; Icon: typeof MapPin }[];

  return (
    <section id="about" className="relative overflow-hidden px-6 py-28 sm:px-12 lg:py-36">
      <div className="relative mx-auto max-w-5xl">
        <motion.div
          {...reveal({ y: 60, duration: 1 })}
          className="relative overflow-hidden bg-[hsl(219_27%_22%)] px-8 py-16 text-center shadow-[0_50px_100px_-40px_rgba(0,0,0,.6)] sm:px-16 sm:py-24"
        >
          <ProfessionEmblem profession={portfolio.profession} animate={false} className="absolute start-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.12] rtl:translate-x-1/2" />
          <h2 className="relative text-[clamp(2.4rem,5.5vw,4.4rem)] font-bold leading-tight text-white">{t('public.about.hello', { name: portfolio.fullName.split(' ')[0] })}</h2>
          {portfolio.bio && <p className="relative mx-auto mt-6 max-w-2xl text-[clamp(1.1rem,2vw,1.6rem)] leading-relaxed text-white/90">{portfolio.bio}</p>}
          {(portfolio.location || portfolio.email) && (
            <p className="relative mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-lg">
              {portfolio.location && <span className="inline-flex items-center gap-2 text-[hsl(var(--primary))] underline underline-offset-4"><MapPin className="h-4 w-4" />{portfolio.location}</span>}
              {portfolio.email && <a href={`mailto:${portfolio.email}`} className="inline-flex items-center gap-2 text-[hsl(var(--primary))] underline underline-offset-4"><Mail className="h-4 w-4" />{portfolio.email}</a>}
            </p>
          )}
        </motion.div>
      </div>
      <ContourWaves animate={animate} className="relative -mx-12 mt-16 h-40" />
      {beats.length > 0 && (
        <div className="relative mx-auto mt-10 grid max-w-6xl gap-12 sm:grid-cols-3">
          {beats.map((b, i) => (
            <motion.div key={b.label} {...reveal({ y: 50, delay: i * 0.12 })} className="flex flex-col items-start">
              <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-[hsl(219_27%_15%)]" />
                <motion.span
                  className="relative text-[hsl(var(--primary))]"
                  animate={animate ? { rotate: [-8, 8, -8], y: [0, -6, 0] } : undefined}
                  transition={animate ? { duration: 6 + i, repeat: Infinity, ease: 'easeInOut' } : undefined}
                >
                  <b.Icon className="h-16 w-16" strokeWidth={1.6} />
                </motion.span>
              </div>
              <h3 className="text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-tight text-white">{b.big}</h3>
              <p className="mt-2 text-lg text-white/55">{b.label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// WORK — case studies: oversized names, accent stage blobs, laptop frames.
// ============================================================================

function CaseStudy({ project, index, intensity }: { project: Project; index: number; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const flip = index % 2 === 1;
  const meta = [project.category, project.roleInProject, yearOf(project.date)].filter(Boolean).join(' · ');

  return (
    <article className="relative grid items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:py-24">
      <motion.div {...reveal({ x: flip ? 60 : -60, duration: 1 })} className={cn('relative z-10', flip && 'lg:order-2')}>
        {meta && <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[hsl(var(--primary))]">{meta}</p>}
        <h3 className="text-[clamp(2.6rem,6vw,5rem)] font-bold leading-[0.95] tracking-tight text-white">{project.title}</h3>
        {project.shortDescription && <p className="mt-6 max-w-md text-[1.3rem] leading-relaxed text-white/55">{project.shortDescription}</p>}
        {project.tags.length > 0 && <p className="mt-4 text-sm font-medium text-white/40">{project.tags.join('  /  ')}</p>}
        <div className="mt-8 flex flex-wrap items-center gap-8">
          {(project.liveUrl || project.externalUrl) && <AccentLink href={project.liveUrl || project.externalUrl}>{t('public.projects.viewWork')}</AccentLink>}
          {project.repositoryUrl && (
            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-lg font-semibold text-white/70 hover:text-white">
              <Github className="h-5 w-5" />{t('public.projects.code')}
            </a>
          )}
        </div>
      </motion.div>
      <div className={cn('relative', flip && 'lg:order-1')}>
        <motion.div
          {...reveal({ scale: 0.6, rotate: flip ? -12 : 12, duration: 1.1 })}
          className={cn('absolute -top-[26%] bottom-[-14%]', flip ? '-start-[18%] end-[14%]' : 'start-[14%] -end-[18%]')}
        >
          <StageBlob variant={index} className="h-full w-full" preserve="none" />
        </motion.div>
        <motion.div {...reveal({ y: 80, delay: 0.25, duration: 1 })} className="relative z-10 mx-auto w-[92%]">
          <div className="rounded-t-[14px] border-[10px] border-b-0 border-[hsl(220_20%_10%)] bg-[hsl(220_20%_10%)] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]">
            <div className="aspect-[16/10] overflow-hidden rounded-[4px] bg-black">
              {project.coverImage ? (
                <img src={resolveMediaUrl(project.coverImage)} alt={project.title} loading="lazy" className="h-full w-full object-cover object-top transition-transform [transition-duration:1200ms] hover:scale-105" />
              ) : (
                <ProjectPlaceholder variant="studio" title={project.title} index={index} />
              )}
            </div>
          </div>
          <div className="mx-[-6%] h-4 rounded-b-xl bg-gradient-to-b from-[hsl(220_15%_20%)] to-[hsl(220_20%_8%)]" />
        </motion.div>
      </div>
    </article>
  );
}

function Work({ projects, intensity }: { projects: Project[]; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const published = sortByOrder(projects.filter((p) => p.status === 'published'));
  if (published.length === 0) return null;
  return (
    <section id="projects" className="relative overflow-x-clip px-6 py-24 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t('public.projects.selected')} title={t('public.projects.heading')} reveal={reveal} />
        {published.map((p, i) => <CaseStudy key={p.id} project={p} index={i} intensity={intensity} />)}
      </div>
    </section>
  );
}

// ============================================================================
// EXPERIENCE — giant outlined years against the column grid.
// ============================================================================

function Experience({ experiences, intensity }: Pick<TemplateContentProps, 'experiences'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(experiences);
  if (sorted.length === 0) return null;
  return (
    <section id="experience" className="relative px-6 py-24 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Heading title={t('public.experience.heading')} reveal={reveal} />
        <div className="divide-y divide-white/10 border-y border-white/10">
          {sorted.map((e, i) => (
            <motion.div key={e.id} {...reveal({ y: 40, delay: i * 0.08 })} className="group grid gap-4 py-10 md:grid-cols-[minmax(0,260px)_1fr] md:gap-12">
              <span className="text-[clamp(3.5rem,8vw,6.5rem)] font-black leading-none text-transparent transition-colors duration-500 [-webkit-text-stroke:2px_hsl(var(--primary))] group-hover:text-[hsl(var(--primary))]">
                {yearOf(e.startDate)}
              </span>
              <div>
                <h3 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight text-white">{e.role}</h3>
                <p className="mt-1 text-lg font-semibold text-[hsl(var(--primary))]">
                  {e.company} <span className="font-normal text-white/45">· {yearOf(e.startDate)} — {e.current ? t('public.experience.present') : yearOf(e.endDate)}</span>
                </p>
                {e.description.length > 0 && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/55">{e.description.join(' ')}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SKILLS — dark "object" discs with a proficiency arc and the tool glyph.
// ============================================================================

function Skills({ skills, intensity }: { skills: Skill[]; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  if (skills.length === 0) return null;
  const groups = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category || t('public.skills.general')] ||= []).push(s);
    return acc;
  }, {});
  return (
    <section id="skills" className="relative px-6 py-24 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Heading title={t('public.skills.heading')} reveal={reveal} />
        <div className="space-y-16">
          {Object.entries(groups).map(([cat, list]) => (
            <div key={cat}>
              <motion.h3 {...reveal({ x: -30 })} className="mb-8 text-3xl font-bold text-white">{cat}</motion.h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-4 lg:grid-cols-6">
                {sortByOrder(list).map((s, i) => {
                  const icon = getTechIcon(s.name);
                  const c = 2 * Math.PI * 46;
                  return (
                    <motion.div key={s.id} {...reveal({ y: 40, delay: i * 0.05 })} className="group flex flex-col items-center text-center">
                      <div className="relative h-24 w-24 transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-6 sm:h-28 sm:w-28">
                        <span className="absolute inset-[6px] rounded-full bg-[hsl(219_27%_15%)]" />
                        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                          <circle cx="50" cy="50" r="46" fill="none" strokeWidth="3" style={{ stroke: 'hsl(var(--primary) / .15)' }} />
                          <motion.circle cx="50" cy="50" r="46" fill="none" strokeWidth="3" strokeLinecap="round" style={{ stroke: 'hsl(var(--primary))' }} strokeDasharray={c} initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * (1 - s.proficiency / 100) }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 + i * 0.05 }} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center">
                          {icon ? (
                            <svg viewBox="0 0 24 24" className="h-9 w-9" style={{ fill: 'hsl(var(--primary))' }}><path d={icon.path} /></svg>
                          ) : (
                            <span className="text-xl font-black text-[hsl(var(--primary))]">{s.name.slice(0, 2)}</span>
                          )}
                        </span>
                      </div>
                      <span className="mt-3 text-base font-semibold text-white">{s.name}</span>
                      <span className="text-xs text-white/40">{s.proficiency}%</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SERVICES / CERTIFICATIONS / TESTIMONIALS / GALLERY
// ============================================================================

function Services({ services, intensity }: Pick<TemplateContentProps, 'services'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(services);
  if (sorted.length === 0) return null;
  return (
    <section id="services" className="relative px-6 py-24 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Heading title={t('public.services.heading')} reveal={reveal} />
        {sorted.map((s, i) => (
          <motion.div key={s.id} {...reveal({ y: 40, delay: i * 0.08 })} className="group relative grid gap-4 border-t border-white/10 py-10 md:grid-cols-[120px_1fr_auto] md:items-center">
            <span className="text-6xl font-black text-[hsl(var(--primary))]">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-[clamp(1.8rem,3.5vw,3rem)] font-bold leading-tight text-white transition-transform duration-500 group-hover:translate-x-3 rtl:group-hover:-translate-x-3">{s.title}</h3>
              {s.description && <p className="mt-2 max-w-xl text-lg text-white/55">{s.description}</p>}
            </div>
            <div className="md:text-end">
              {s.priceLabel && <p className="text-2xl font-bold text-white">{s.priceLabel}</p>}
              {s.duration && <p className="text-sm text-white/45">{s.duration}</p>}
              {s.ctaLabel && s.ctaLink && <div className="mt-3"><AccentLink href={s.ctaLink}>{s.ctaLabel}</AccentLink></div>}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Certifications({ certifications, intensity }: Pick<TemplateContentProps, 'certifications'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(certifications);
  if (sorted.length === 0) return null;
  return (
    <section id="certifications" className="relative px-6 py-24 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Heading title={t('public.certifications.heading')} reveal={reveal} />
        <div className="grid gap-8 md:grid-cols-3">
          {sorted.map((c, i) => (
            <motion.div key={c.id} {...reveal({ y: 50, delay: i * 0.1 })} className="relative bg-[hsl(219_27%_23%)] p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]">
              <div className="-mt-16 mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(219_27%_15%)] text-2xl font-black text-[hsl(var(--primary))]">
                {yearOf(c.issueDate).slice(2) ? `'${yearOf(c.issueDate).slice(2)}` : '★'}
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[hsl(var(--primary))]">{c.type === 'education' ? t('public.experience.tabEducation') : t('public.certifications.heading')}</p>
              <h3 className="mt-3 text-2xl font-bold leading-tight text-white">{c.title}</h3>
              <p className="mt-2 text-white/55">{c.institution}</p>
              {c.verificationUrl && <div className="mt-5"><AccentLink href={c.verificationUrl}>{t('public.certifications.viewCredential')}</AccentLink></div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ testimonials, intensity }: Pick<TemplateContentProps, 'testimonials'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(testimonials);
  const [i, setI] = useState(0);
  if (sorted.length === 0) return null;
  const cur = sorted[Math.min(i, sorted.length - 1)];
  return (
    <section id="testimonials" className="relative overflow-hidden px-6 py-28 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <motion.div {...reveal({ y: 40 })} className="relative">
          <span aria-hidden className="absolute -top-20 start-0 select-none text-[14rem] font-black leading-none text-[hsl(var(--primary))] opacity-90">“</span>
          <AnimatePresence mode="wait">
            <motion.figure key={cur.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.5 }} className="relative pt-24">
              <blockquote className="text-[clamp(1.6rem,3.6vw,3rem)] font-bold leading-[1.2] text-white">{cur.quote}</blockquote>
              <figcaption className="mt-10 flex items-center gap-4">
                {cur.avatarUrl && <img src={resolveMediaUrl(cur.avatarUrl)} alt={cur.clientName} className="h-14 w-14 rounded-full object-cover" />}
                <div>
                  <p className="text-xl font-bold text-white">{cur.clientName}</p>
                  {cur.role && <p className="text-white/50">{cur.role}</p>}
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          {sorted.length > 1 && (
            <div className="mt-10 flex gap-3">
              <button onClick={() => setI((i - 1 + sorted.length) % sorted.length)} aria-label={t('public.testimonials.prev')} className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(219_27%_15%)] text-white hover:text-[hsl(var(--primary))]"><ChevronLeft className="h-6 w-6 rtl:rotate-180" /></button>
              <button onClick={() => setI((i + 1) % sorted.length)} aria-label={t('public.testimonials.next')} className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><ChevronRight className="h-6 w-6 rtl:rotate-180" /></button>
              <span className="ms-4 self-center text-lg font-bold text-white/40">{String(i + 1).padStart(2, '0')} / {String(sorted.length).padStart(2, '0')}</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Gallery({ gallery, intensity }: Pick<TemplateContentProps, 'gallery'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(gallery);
  if (sorted.length === 0) return null;
  const tilt = [-4, 3, -2, 5, -3, 2];
  return (
    <section id="gallery" className="relative px-6 py-24 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Heading title={t('public.gallery.heading')} reveal={reveal} />
        <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
          {sorted.map((g, i) => (
            <motion.figure
              key={g.id}
              {...reveal({ y: 60, rotate: tilt[i % tilt.length] * 2, delay: (i % 3) * 0.1 })}
              style={{ rotate: `${tilt[i % tilt.length]}deg` }}
              className="group mb-10 break-inside-avoid bg-white p-3 pb-12 shadow-[0_30px_60px_-25px_rgba(0,0,0,.7)] transition-transform duration-500 hover:!rotate-0 hover:scale-[1.03]"
            >
              <img src={resolveMediaUrl(g.imageUrl)} alt={g.title} loading="lazy" className="w-full" />
              <figcaption className="mt-3 text-center text-sm font-bold text-[hsl(219_27%_20%)]">{g.title}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONTACT — the landing: circle + emblem again, "Let's talk" as the last word.
// ============================================================================

function Contact({ portfolio, intensity, animate }: { portfolio: Portfolio; intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const { field, onSubmit } = useContactForm(portfolio.email, t);
  const [lead, last] = splitLastWord(t('public.contact.talkLine'));
  const input = 'w-full border-b-2 border-white/15 bg-transparent py-3 text-lg text-white placeholder:text-white/35 outline-none transition-colors focus:border-[hsl(var(--primary))]';
  return (
    <section id="contact" className="relative overflow-hidden px-6 pb-24 pt-10 sm:px-12 lg:px-20">
      <div className="relative flex min-h-[80svh] items-center justify-center">
        <BlobCluster animate={animate} seed={1} className="absolute -bottom-10 -start-24 w-[320px]" />
        <motion.div {...reveal({ scale: 0.85, duration: 1.2 })} className="absolute"><Recessed className="h-[min(86vw,600px)] w-[min(86vw,600px)]" /></motion.div>
        <ProfessionEmblem profession={portfolio.profession} animate={animate} className="absolute h-[min(62vw,380px)] w-[min(62vw,380px)]" />
        <div className="relative z-10 text-center">
          <motion.p {...reveal({ y: 20 })} className="mb-4 text-lg font-semibold text-white/85">{t('public.contact.talkLead')}</motion.p>
          <motion.h2 {...reveal({ y: 50, delay: 0.15 })} className="text-[clamp(3rem,10vw,8.5rem)] font-black leading-none tracking-tight text-white">
            {lead && <>{lead} </>}
            <span className="text-[hsl(var(--primary))] underline decoration-[0.08em] underline-offset-[0.12em]">{last}</span>
          </motion.h2>
          {portfolio.email && <a href={`mailto:${portfolio.email}`} className="mt-8 inline-block text-xl font-bold text-white underline decoration-[hsl(var(--primary))] decoration-2 underline-offset-8">{portfolio.email}</a>}
        </div>
      </div>
      {portfolio.email && (
        <motion.form {...reveal({ y: 40 })} onSubmit={onSubmit} className="relative mx-auto mt-10 grid max-w-4xl gap-6 bg-[hsl(219_27%_23%)] p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,.7)] sm:grid-cols-2 sm:p-12">
          <input className={input} placeholder={t('public.contact.namePlaceholder')} required {...field('name')} />
          <input className={input} type="email" placeholder={t('public.contact.emailPlaceholder')} {...field('email')} />
          <textarea className={cn(input, 'min-h-[110px] sm:col-span-2')} placeholder={t('public.contact.messagePlaceholder')} required {...field('message')} />
          <div className="sm:col-span-2">
            <button type="submit" className="bg-[hsl(var(--primary))] px-8 py-4 text-lg font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-1">{t('public.contact.send')}</button>
          </div>
        </motion.form>
      )}
      <div className="relative mt-14 flex justify-center gap-5 lg:hidden">
        {socialEntries(portfolio.socialLinks).map(([k, url]) => (
          <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[hsl(var(--primary))]">{getSocialIcon(k)}</a>
        ))}
      </div>
      <p className="relative mt-8 text-center text-sm text-white/35 lg:hidden">© {portfolio.fullName} {new Date().getFullYear()}</p>
    </section>
  );
}

export default function ArtDirectorTemplate({
  portfolio, projects, experiences, skills, services, certifications, testimonials, gallery, visibleSections, animation, embedded,
}: TemplateContentProps) {
  const intensity = getAmbientIntensity(animation.id);
  const animate = useAmbientMotion(intensity);
  const { accent } = resolveAccent(portfolio, SKIN.signatureAccent);
  const [h, s] = accent.split(/\s+/);
  const style = {
    ...skinStyle(SKIN, accent),
    '--art-ink': '219 27% 18%',
    '--art-blob': `${(parseFloat(h) + 28) % 360} ${s} 50%`,
    fontFamily: "'Poppins', system-ui, sans-serif",
  } as React.CSSProperties;
  const published = projects.filter((p) => p.status === 'published');

  const sections: Record<SectionId, React.ReactNode> = {
    hero: <Hero key="hero" portfolio={portfolio} intensity={intensity} animate={animate} />,
    about: <About key="about" portfolio={portfolio} projectsCount={published.length} experienceStarts={experiences.map((e) => e.startDate)} intensity={intensity} animate={animate} />,
    projects: <Work key="projects" projects={projects} intensity={intensity} />,
    experience: <Experience key="experience" experiences={experiences} intensity={intensity} />,
    skills: <Skills key="skills" skills={skills} intensity={intensity} />,
    services: <Services key="services" services={services} intensity={intensity} />,
    certifications: <Certifications key="certifications" certifications={certifications} intensity={intensity} />,
    testimonials: <Testimonials key="testimonials" testimonials={testimonials} intensity={intensity} />,
    gallery: <Gallery key="gallery" gallery={gallery} intensity={intensity} />,
    contact: <Contact key="contact" portfolio={portfolio} intensity={intensity} animate={animate} />,
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={style}>
        <Frame portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} />
        <main className="relative z-10 lg:px-[70px]">{visibleSections.map((id) => sections[id])}</main>
      </div>
    </MotionConfig>
  );
}
