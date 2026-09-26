import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  ArrowDown, Award, ChevronDown, ChevronLeft, ChevronRight, ChevronsUp, ExternalLink, Mail, MapPin, Menu, Quote, Star, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/api/client';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { usePortfolioLocale } from '../../portfolio-locale';
import { getAmbientIntensity, type AmbientIntensity } from '../scene-config';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { fontVars, resolveAccent, skinStyle, firstName, yearOf, type TemplateSkin } from '../theme';
import { scrollToSection, splitNav, useActiveSection, useNavSections, useScrollY } from '../nav-utils';
import { useAmbientMotion, useReveal } from '../motion-utils';
import { getTechIcon, readableBrandColor } from '../tech-icons';
import { ProjectPlaceholder } from '../placeholders';
import { ClusterNetwork } from './cluster-network';
import type { Portfolio, Project, SectionId, Skill } from '@/types';

// NETWORK — inspired by the immersive developer-portfolio genre (dark room, live node network,
// big light intro type, offset-underlined section titles, alternating full-bleed project slabs).
// Built from scratch on our data model; no reference code or assets are used.

const SKIN: TemplateSkin = {
  signatureAccent: '356 100% 65%',
  background: '0 0% 11%',
  surface: '0 0% 15%',
  foreground: '0 0% 100%',
  muted: '0 0% 70%',
  border: '0 0% 24%',
};
const NETWORK_BLUE = '212 72% 60%';
const SIGNATURE_SLAB = '249 79% 42%';

type Reveal = ReturnType<typeof useReveal>;

function darker(triplet: string, amount: number) {
  const [h, s, l] = triplet.split(/\s+/);
  return `${h} ${s} ${Math.max(18, parseFloat(l) - amount)}%`;
}

function SectionTitle({ children, reveal }: { children: React.ReactNode; reveal: Reveal }) {
  return (
    <div className="mb-14 flex justify-center px-6 sm:mb-20">
      <motion.h2 {...reveal({ y: 24 })} className="relative inline-block text-[clamp(2.4rem,6vw,4rem)] font-bold leading-none tracking-tight text-white">
        <motion.span
          aria-hidden
          className="absolute -bottom-[0.06em] end-[-0.35em] z-0 h-[0.34em] w-[80%] origin-left bg-[hsl(var(--primary))] rtl:origin-right"
          {...reveal({ clip: 'start', delay: 0.15, duration: 0.7 })}
        />
        <span className="relative z-10">{children}</span>
      </motion.h2>
    </div>
  );
}

function UnderlineLink({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
  const cls =
    'group inline-block border-b-2 border-[hsl(var(--primary))] px-3 pb-1 text-[15px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:text-[hsl(var(--primary))]';
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{children}</button>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  );
}

function TechTile({ name, proficiency, className }: { name: string; proficiency?: number; className?: string }) {
  const icon = getTechIcon(name);
  return (
    <div
      className={cn('group relative rounded-md p-[1.5px] transition-transform duration-300 hover:-translate-y-1', className)}
      style={{ background: 'linear-gradient(135deg, hsl(var(--net) / .9), hsl(var(--primary) / .9))' }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-[5px] bg-[hsl(0_0%_10%)] px-3 py-3 transition-shadow group-hover:shadow-[0_0_26px_-4px_hsl(var(--primary)/0.6)]">
        {icon ? (
          <svg viewBox="0 0 24 24" className="h-9 w-9 transition-transform duration-300 group-hover:scale-110" fill={readableBrandColor(icon)} aria-hidden>
            <path d={icon.path} />
          </svg>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded bg-white/10 text-sm font-bold text-white">{name.slice(0, 2).toUpperCase()}</span>
        )}
        <span className="max-w-full truncate text-[11px] font-bold uppercase tracking-wider text-white/75">{name}</span>
        {typeof proficiency === 'number' && (
          <span className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <span className="block h-full bg-gradient-to-r from-[hsl(var(--net))] to-[hsl(var(--primary))]" style={{ width: `${proficiency}%` }} />
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// NAVIGATION — invisible over the hero (the network owns the first screen), then a solid
// dark bar with right-aligned links and an accent active state. Extra sections go into a
// "More" dropdown on desktop; mobile gets a full-width dropdown panel.
// ============================================================================

function Nav({ portfolio, visibleSections, embedded }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean }) {
  const { t, lang, setLang } = usePortfolioLocale();
  const navSections = useNavSections(visibleSections);
  const ids = useMemo(() => visibleSections as string[], [visibleSections]);
  const active = useActiveSection(ids);
  const past = useScrollY(typeof window !== 'undefined' ? window.innerHeight * 0.55 : 400);
  const solid = embedded || past || !visibleSections.includes('hero');
  const { inline, overflow } = splitNav(navSections, 6);
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);

  const go = (id: string) => {
    scrollToSection(id);
    setOpen(false);
    setMore(false);
  };

  return (
    <header
      className={cn(
        'inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500',
        embedded ? 'sticky' : 'fixed',
        solid ? 'bg-[hsl(0_0%_16%)] shadow-[0_2px_14px_rgba(0,0,0,0.45)]' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <button
          onClick={() => go('hero')}
          className={cn('me-auto truncate text-sm font-semibold uppercase tracking-[0.25em] text-white transition-opacity', solid ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        >
          {portfolio.fullName}
        </button>
        <nav className={cn('hidden items-center gap-7 lg:flex', !solid && 'invisible')}>
          {inline.map((s) => (
            <button
              key={s}
              onClick={() => go(s)}
              className={cn('whitespace-nowrap text-[17px] font-medium tracking-wide transition-colors', active === s ? 'text-[hsl(var(--primary))]' : 'text-white hover:text-[hsl(var(--primary))]')}
            >
              {t(`sections.${s}`)}
            </button>
          ))}
          {overflow.length > 0 && (
            <div className="relative">
              <button onClick={() => setMore((m) => !m)} className="flex items-center gap-1 text-[17px] font-medium text-white hover:text-[hsl(var(--primary))]">
                {t('public.nav.more')} <ChevronDown className={cn('h-4 w-4 transition-transform', more && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {more && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute end-0 top-10 min-w-[220px] bg-[hsl(0_0%_16%)] py-2 shadow-xl"
                  >
                    {overflow.map((s) => (
                      <button key={s} onClick={() => go(s)} className={cn('block w-full px-5 py-2.5 text-start text-[15px] font-medium hover:text-[hsl(var(--primary))]', active === s ? 'text-[hsl(var(--primary))]' : 'text-white')}>
                        {t(`sections.${s}`)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {portfolio.ctaLabel && portfolio.ctaLink && (
            <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap border-2 border-[hsl(var(--primary))] px-3 py-1 text-sm font-semibold text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]">
              {portfolio.ctaLabel}
            </a>
          )}
        </nav>
        <LanguageSwitcher compact lang={lang} onLanguageChange={setLang} />
        <button className="p-1 text-white lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? t('public.nav.closeMenu') : t('public.nav.openMenu')}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[hsl(0_0%_16%)] lg:hidden"
          >
            <div className="flex flex-col px-6 py-4">
              {navSections.map((s) => (
                <button key={s} onClick={() => go(s)} className={cn('border-b border-white/5 py-3 text-start text-lg font-medium', active === s ? 'text-[hsl(var(--primary))]' : 'text-white')}>
                  {t(`sections.${s}`)}
                </button>
              ))}
              {portfolio.ctaLabel && portfolio.ctaLink && (
                <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer" className="mt-4 border-2 border-[hsl(var(--primary))] py-2 text-center font-semibold text-[hsl(var(--primary))]">
                  {portfolio.ctaLabel}
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

// ============================================================================
// HERO — nothing but the network and a big, light, typographic introduction.
// ============================================================================

function Hero({ portfolio, intensity, embedded, animate, hasProjects, net, accent }: { portfolio: Portfolio; intensity: AmbientIntensity; embedded?: boolean; animate: boolean; hasProjects: boolean; net: string; accent: string }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const title = portfolio.title.trim().replace(/\.$/, '');
  const target = hasProjects ? 'projects' : portfolio.sectionVisibility.about ? 'about' : 'contact';

  return (
    <section id="hero" className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {embedded && <ClusterNetwork mode="hero" intensity={intensity} animate={animate} networkColor={net} accentColor={accent} />}
      <h1 className="font-light leading-[1.28] tracking-tight text-white">
        <motion.span {...reveal({ y: 22, duration: 0.9 })} className="block text-[clamp(1.9rem,4.6vw,3.6rem)]">
          {t('public.hero.greeting')} <span className="font-normal text-[hsl(var(--primary))]">{firstName(portfolio.fullName)}</span>.
        </motion.span>
        <motion.span dir="auto" {...reveal({ y: 22, duration: 0.9, delay: 0.15 })} className="block text-[clamp(1.9rem,4.6vw,3.6rem)]">
          {title}.
        </motion.span>
      </h1>
      <motion.div {...reveal({ y: 16, delay: 0.35 })} className="mt-8">
        {hasProjects || !portfolio.ctaLink ? (
          <button
            onClick={() => scrollToSection(target)}
            className="group flex items-center gap-3 border-2 border-[hsl(var(--primary))] px-5 py-2 text-lg font-medium text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]"
          >
            {t('public.hero.viewWork')}
            <ArrowDown className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-90 rtl:group-hover:rotate-90" />
          </button>
        ) : (
          <a
            href={portfolio.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 border-2 border-[hsl(var(--primary))] px-5 py-2 text-lg font-medium text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]"
          >
            {portfolio.ctaLabel}
            <ArrowDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
          </a>
        )}
      </motion.div>
    </section>
  );
}

// ============================================================================
// ABOUT — outlined portrait + bio on one side, floating technology tiles on the other.
// ============================================================================

const FLOAT_SLOTS = [
  { top: '4%', left: '14%' }, { top: '0%', left: '58%' }, { top: '34%', left: '2%' },
  { top: '38%', left: '44%' }, { top: '30%', left: '78%' }, { top: '70%', left: '22%' }, { top: '72%', left: '62%' },
];

function About({ portfolio, skills, intensity, animate }: { portfolio: Portfolio; skills: Skill[]; intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const tiles = useMemo(() => {
    const sorted = [...skills].sort((a, b) => b.proficiency - a.proficiency);
    const withIcon = sorted.filter((s) => getTechIcon(s.name));
    return (withIcon.length >= 3 ? withIcon : sorted).slice(0, 7);
  }, [skills]);

  return (
    <section id="about" className="relative z-10 py-24 sm:py-28">
      <SectionTitle reveal={reveal}>{t('public.about.heading')}</SectionTitle>
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <motion.div {...reveal({ x: -40 })}>
          <div className="relative mx-auto h-48 w-48 lg:mx-0">
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
              <defs>
                <linearGradient id="net-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" style={{ stopColor: 'hsl(var(--net))' }} />
                  <stop offset="1" style={{ stopColor: 'hsl(var(--primary))' }} />
                </linearGradient>
              </defs>
              <motion.circle cx="100" cy="100" r="96" fill="none" stroke="url(#net-ring)" strokeWidth="4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
            </svg>
            {portfolio.avatarUrl ? (
              <img src={resolveMediaUrl(portfolio.avatarUrl)} alt={portfolio.fullName} className="absolute inset-[10px] h-[calc(100%-20px)] w-[calc(100%-20px)] rounded-full object-cover" />
            ) : (
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
                <circle cx="100" cy="78" r="34" fill="none" stroke="url(#net-ring)" strokeWidth="6" />
                <path d="M44 160 C54 122 146 122 156 160" fill="none" stroke="url(#net-ring)" strokeWidth="6" strokeLinecap="round" />
              </svg>
            )}
          </div>
          {portfolio.bio && <p className="mt-10 text-[17px] font-medium leading-[1.9] text-white/90">{portfolio.bio}</p>}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/70">
            {portfolio.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[hsl(var(--primary))]" />{portfolio.location}</span>}
            {portfolio.email && <a href={`mailto:${portfolio.email}`} className="inline-flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 text-[hsl(var(--primary))]" />{portfolio.email}</a>}
          </div>
        </motion.div>

        {tiles.length > 0 && (
          <div className="relative">
            <div className="grid grid-cols-3 gap-4 lg:hidden">
              {tiles.slice(0, 6).map((s) => <TechTile key={s.id} name={s.name} className="h-[92px]" />)}
            </div>
            <div className="relative hidden h-[440px] lg:block">
              {tiles.map((s, i) => (
                <motion.div
                  key={s.id}
                  className="absolute w-[136px]"
                  style={FLOAT_SLOTS[i]}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * i, duration: 0.8 }}
                >
                  <motion.div
                    animate={animate ? { y: [0, -12, 0], opacity: [1, 0.45, 1] } : undefined}
                    transition={animate ? { duration: 6 + (i % 3) * 1.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.9 } : undefined}
                  >
                    <TechTile name={s.name} className="h-[92px]" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// PROJECTS — alternating full-bleed color slabs with the screenshot breaking out of them.
// ============================================================================

function ProjectRow({ project, index, intensity }: { project: Project; index: number; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const flip = index % 2 === 1;
  const subtitle = project.category || project.roleInProject;

  return (
    <article className="relative mb-24 lg:mb-44 lg:h-[640px]">
      <motion.div
        aria-hidden
        {...reveal({ clip: flip ? 'end' : 'start', duration: 1 })}
        className={cn('absolute top-0 hidden h-full w-[64%] bg-[hsl(var(--slab))] lg:block', flip ? 'end-0' : 'start-0')}
      />
      <div className="relative mx-auto grid max-w-[1440px] gap-10 lg:block">
        <motion.div
          {...reveal({ x: flip ? 60 : -60, delay: 0.2, duration: 1 })}
          className={cn('relative bg-[hsl(var(--slab))] p-4 sm:p-6 lg:absolute lg:top-[13%] lg:w-[min(54%,860px)] lg:bg-transparent lg:p-0', flip ? 'lg:end-0' : 'lg:start-0')}
        >
          <div className="aspect-[16/10] overflow-hidden shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)]">
            {project.coverImage ? (
              <img src={resolveMediaUrl(project.coverImage)} alt={project.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]" loading="lazy" />
            ) : (
              <ProjectPlaceholder variant="network" title={project.title} index={index} />
            )}
          </div>
        </motion.div>
        <motion.div
          {...reveal({ y: 30, delay: 0.35 })}
          className={cn('px-6 lg:absolute lg:top-[13%] lg:w-[34%] lg:px-0', flip ? 'lg:start-[6%]' : 'lg:end-[6%]')}
        >
          <h3 className="text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-[1.15] text-white">
            {project.title}
            {subtitle && <span className="block">{subtitle}</span>}
          </h3>
          {project.shortDescription && <p className="mt-6 line-clamp-5 text-lg font-medium leading-relaxed text-white/90">{project.shortDescription}</p>}
          {project.tags.length > 0 && <p className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--net))]">{project.tags.slice(0, 5).join(' · ')}</p>}
          <div className="mt-8 flex flex-col items-start gap-5">
            {project.liveUrl && <UnderlineLink href={project.liveUrl}>{t('public.projects.live')}</UnderlineLink>}
            {project.repositoryUrl && <UnderlineLink href={project.repositoryUrl}>{t('public.projects.code')}</UnderlineLink>}
          </div>
        </motion.div>
      </div>
    </article>
  );
}

function Projects({ projects, intensity }: { projects: Project[]; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const published = sortByOrder(projects.filter((p) => p.status === 'published'));
  if (published.length === 0) return null;
  return (
    <section id="projects" className="relative z-10 py-24 sm:py-28">
      <SectionTitle reveal={reveal}>{t('public.projects.heading')}</SectionTitle>
      {published.map((p, i) => <ProjectRow key={p.id} project={p} index={i} intensity={intensity} />)}
    </section>
  );
}

// ============================================================================
// EXPERIENCE — a node-and-filament timeline in the same network language.
// ============================================================================

function Experience({ experiences, intensity }: Pick<TemplateContentProps, 'experiences'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(experiences);
  if (sorted.length === 0) return null;
  return (
    <section id="experience" className="relative z-10 py-24 sm:py-28">
      <SectionTitle reveal={reveal}>{t('public.experience.heading')}</SectionTitle>
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative">
          <motion.div aria-hidden className="absolute bottom-2 top-2 start-[7px] w-px origin-top bg-gradient-to-b from-[hsl(var(--net))] via-[hsl(var(--net)/0.6)] to-[hsl(var(--primary))] sm:start-[calc(200px+7px)]" {...reveal({ clip: 'up', duration: 1.4 })} />
          <div className="space-y-14">
            {sorted.map((exp, i) => (
              <motion.div key={exp.id} {...reveal({ y: 30, delay: i * 0.08 })} className="relative grid gap-3 ps-10 sm:grid-cols-[200px_1fr] sm:gap-0 sm:ps-0">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/60 sm:pe-10 sm:pt-1.5 sm:text-end">
                  {yearOf(exp.startDate)} — {exp.current ? t('public.experience.present') : yearOf(exp.endDate)}
                </div>
                <span aria-hidden className="absolute start-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-[hsl(var(--net))] bg-[hsl(0_0%_11%)] shadow-[0_0_14px_hsl(var(--net)/0.8)] sm:start-[200px]" />
                <div className="sm:ps-12">
                  <h3 className="text-2xl font-bold text-white">{exp.role}</h3>
                  <p className="mt-1 text-lg font-semibold text-[hsl(var(--primary))]">{exp.company}{exp.location && <span className="font-medium text-white/50"> · {exp.location}</span>}</p>
                  {exp.description.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {exp.description.map((d, k) => <li key={k} className="text-[15px] font-medium leading-relaxed text-white/80">{d}</li>)}
                    </ul>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SKILLS — the whole stack as gradient-framed technology tiles, grouped by category.
// ============================================================================

function Skills({ skills, intensity }: { skills: Skill[]; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  if (skills.length === 0) return null;
  const groups = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const k = s.category || t('public.skills.general');
    (acc[k] ||= []).push(s);
    return acc;
  }, {});
  return (
    <section id="skills" className="relative z-10 py-24 sm:py-28">
      <SectionTitle reveal={reveal}>{t('public.skills.heading')}</SectionTitle>
      <div className="mx-auto max-w-6xl space-y-14 px-6">
        {Object.entries(groups).map(([cat, list], gi) => (
          <motion.div key={cat} {...reveal({ y: 30, delay: gi * 0.06 })}>
            <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-[0.35em] text-white/60">{cat}</h3>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
              {sortByOrder(list).map((s, i) => (
                <motion.div key={s.id} {...reveal({ scale: 0.85, delay: i * 0.05, duration: 0.6 })}>
                  <TechTile name={s.name} proficiency={s.proficiency} className="h-[118px] w-[128px] sm:w-[144px]" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// SERVICES / CERTIFICATIONS / TESTIMONIALS / GALLERY — same dark-room language.
// ============================================================================

function Services({ services, intensity }: Pick<TemplateContentProps, 'services'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(services);
  if (sorted.length === 0) return null;
  return (
    <section id="services" className="relative z-10 py-24 sm:py-28">
      <SectionTitle reveal={reveal}>{t('public.services.heading')}</SectionTitle>
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((s, i) => (
          <motion.div key={s.id} {...reveal({ y: 40, delay: i * 0.1 })} className="group relative flex flex-col bg-[hsl(0_0%_14%)] p-8">
            <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left bg-[hsl(var(--primary))] transition-transform duration-500 group-hover:scale-x-100 sm:scale-x-[0.25] rtl:origin-right" />
            <span className="text-5xl font-bold text-transparent [-webkit-text-stroke:1.5px_hsl(var(--net))]">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-5 text-2xl font-bold text-white">{s.title}</h3>
            {s.description && <p className="mt-3 flex-1 text-[15px] font-medium leading-relaxed text-white/75">{s.description}</p>}
            {(s.priceLabel || s.duration) && (
              <p className="mt-6 text-lg font-semibold text-white">
                {s.priceLabel}
                {s.duration && <span className="ms-2 text-sm font-medium text-white/50">{s.duration}</span>}
              </p>
            )}
            {s.ctaLabel && s.ctaLink && <div className="mt-6"><UnderlineLink href={s.ctaLink}>{s.ctaLabel}</UnderlineLink></div>}
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
    <section id="certifications" className="relative z-10 py-24 sm:py-28">
      <SectionTitle reveal={reveal}>{t('public.certifications.heading')}</SectionTitle>
      <div className="mx-auto grid max-w-5xl gap-5 px-6 md:grid-cols-2">
        {sorted.map((c, i) => (
          <motion.div key={c.id} {...reveal({ x: i % 2 === 0 ? -30 : 30, delay: i * 0.06 })} className="flex items-start gap-5 border border-white/10 bg-[hsl(0_0%_13%)] p-6 transition-colors hover:border-[hsl(var(--net)/0.6)]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--net))] text-[hsl(var(--net))]"><Award className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[hsl(var(--primary))]">{c.type === 'education' ? t('public.experience.tabEducation') : t('public.certifications.heading')} · {yearOf(c.issueDate)}</p>
              <h3 className="mt-2 text-lg font-bold text-white">{c.title}</h3>
              <p className="text-sm font-medium text-white/60">{c.institution}</p>
              {c.verificationUrl && (
                <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-[hsl(var(--primary))]">
                  {t('public.certifications.viewCredential')} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
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
  const current = sorted[Math.min(i, sorted.length - 1)];
  return (
    <section id="testimonials" className="relative z-10 py-24 sm:py-28">
      <SectionTitle reveal={reveal}>{t('public.testimonials.heading')}</SectionTitle>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Quote className="mx-auto h-10 w-10 text-[hsl(var(--primary))]" />
        <AnimatePresence mode="wait">
          <motion.figure key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45 }}>
            <blockquote className="mt-6 text-[clamp(1.3rem,2.6vw,1.9rem)] font-light leading-relaxed text-white">“{current.quote}”</blockquote>
            <figcaption className="mt-8 flex items-center justify-center gap-4">
              {current.avatarUrl && <img src={resolveMediaUrl(current.avatarUrl)} alt={current.clientName} className="h-12 w-12 rounded-full object-cover" />}
              <div className="text-start">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white">{current.clientName}</p>
                {current.role && <p className="text-sm font-medium text-white/55">{current.role}</p>}
                {current.rating > 0 && (
                  <div className="mt-1 flex gap-0.5">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className={cn('h-3.5 w-3.5', k < current.rating ? 'fill-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'text-white/20')} />)}</div>
                )}
              </div>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
        {sorted.length > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button onClick={() => setI((i - 1 + sorted.length) % sorted.length)} aria-label={t('public.testimonials.prev')} className="border-2 border-white/20 p-2 text-white hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <div className="flex gap-2">
              {sorted.map((s, k) => <button key={s.id} onClick={() => setI(k)} aria-label={s.clientName} className={cn('h-2 transition-all', k === i ? 'w-8 bg-[hsl(var(--primary))]' : 'w-2 bg-white/25')} />)}
            </div>
            <button onClick={() => setI((i + 1) % sorted.length)} aria-label={t('public.testimonials.next')} className="border-2 border-white/20 p-2 text-white hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Gallery({ gallery, intensity }: Pick<TemplateContentProps, 'gallery'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(gallery);
  if (sorted.length === 0) return null;
  return (
    <section id="gallery" className="relative z-10 py-24 sm:py-28">
      <SectionTitle reveal={reveal}>{t('public.gallery.heading')}</SectionTitle>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-6 md:grid-cols-3 lg:gap-4">
        {sorted.map((g, i) => (
          <motion.figure
            key={g.id}
            {...reveal({ y: 30, delay: (i % 3) * 0.08 })}
            className={cn('group relative overflow-hidden bg-[hsl(var(--slab))]', i % 5 === 0 ? 'row-span-2 aspect-[3/4] md:aspect-auto' : 'aspect-square')}
          >
            <img src={resolveMediaUrl(g.imageUrl)} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-60" />
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-full p-4 text-start transition-transform duration-500 group-hover:translate-y-0 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:bg-gradient-to-t [@media(hover:none)]:from-black/75">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white">{g.title}</p>
              {g.category && <p className="text-xs font-semibold text-[hsl(var(--primary))]">{g.category}</p>}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// CONTACT + FOOTER — the network drifts back in behind the closing form.
// ============================================================================

function Contact({ portfolio, intensity }: { portfolio: Portfolio; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const { field, onSubmit } = useContactForm(portfolio.email, t);
  const input = 'w-full bg-[hsl(0_0%_16%)] px-4 py-3 text-[15px] text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]';
  return (
    <section id="contact" className="relative z-10 py-24 sm:py-32">
      <SectionTitle reveal={reveal}>{t('public.contact.heading')}</SectionTitle>
      <motion.div {...reveal({ y: 30 })} className="mx-auto max-w-[520px] px-6">
        <p className="text-[17px] font-medium leading-relaxed text-white/90">{t('public.contact.description')}</p>
        {portfolio.email ? (
          <form onSubmit={onSubmit} className="mt-10 space-y-2">
            <input className={input} placeholder={t('public.contact.namePlaceholder')} required {...field('name')} />
            <input className={input} type="email" placeholder={t('public.contact.emailPlaceholder')} {...field('email')} />
            <textarea className={cn(input, 'min-h-[130px] resize-y')} placeholder={t('public.contact.messagePlaceholder')} required {...field('message')} />
            <div className="flex justify-end pt-4">
              <button type="submit" className="border-b-2 border-[hsl(var(--primary))] px-3 pb-1 text-[15px] font-bold uppercase tracking-[0.2em] text-white hover:text-[hsl(var(--primary))]">
                {t('public.contact.send')}
              </button>
            </div>
          </form>
        ) : (
          portfolio.ctaLink && <div className="mt-10"><UnderlineLink href={portfolio.ctaLink}>{portfolio.ctaLabel}</UnderlineLink></div>
        )}
      </motion.div>
    </section>
  );
}

function Footer({ portfolio }: { portfolio: Portfolio }) {
  const { t } = usePortfolioLocale();
  const socials = socialEntries(portfolio.socialLinks);
  return (
    <footer className="relative z-10 mt-10 bg-[hsl(0_0%_16%)] pb-10 pt-16 text-center">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('public.nav.backToTop')}
        className="absolute start-1/2 top-0 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-[60%] rtl:translate-x-1/2"
      >
        <ChevronsUp className="h-6 w-6" />
      </button>
      <div className="flex items-center justify-center gap-5">
        {socials.map(([k, url]) => (
          <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[hsl(0_0%_16%)] transition-colors hover:bg-[hsl(var(--primary))] hover:text-white">
            {getSocialIcon(k)}
          </a>
        ))}
        {portfolio.email && (
          <a href={`mailto:${portfolio.email}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[hsl(0_0%_16%)] transition-colors hover:bg-[hsl(var(--primary))] hover:text-white">
            <Mail className="h-5 w-5" />
          </a>
        )}
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
        {portfolio.fullName} ©{new Date().getFullYear()} · {t('public.footer.rights')}
      </p>
    </footer>
  );
}

export default function NetworkTemplate({
  portfolio, projects, experiences, skills, services, certifications, testimonials, gallery, visibleSections, animation, embedded,
}: TemplateContentProps) {
  const intensity = getAmbientIntensity(animation.id);
  const animate = useAmbientMotion(intensity);
  const { accent, isSignature } = resolveAccent(portfolio, SKIN.signatureAccent);
  const net = isSignature ? NETWORK_BLUE : accent;
  const slab = isSignature ? SIGNATURE_SLAB : darker(accent, 20);
  const hasProjects = visibleSections.includes('projects') && projects.some((p) => p.status === 'published');

  const style = {
    ...skinStyle(SKIN, accent),
    '--net': net,
    '--slab': slab,
    ...fontVars({ display: "'Montserrat', system-ui, sans-serif", body: "'Montserrat', system-ui, sans-serif" }),
  } as React.CSSProperties;

  const sections: Record<SectionId, React.ReactNode> = {
    hero: <Hero key="hero" portfolio={portfolio} intensity={intensity} embedded={embedded} animate={animate} hasProjects={hasProjects} net={net} accent={accent} />,
    about: <About key="about" portfolio={portfolio} skills={skills} intensity={intensity} animate={animate} />,
    projects: <Projects key="projects" projects={projects} intensity={intensity} />,
    experience: <Experience key="experience" experiences={experiences} intensity={intensity} />,
    skills: <Skills key="skills" skills={skills} intensity={intensity} />,
    services: <Services key="services" services={services} intensity={intensity} />,
    certifications: <Certifications key="certifications" certifications={certifications} intensity={intensity} />,
    testimonials: <Testimonials key="testimonials" testimonials={testimonials} intensity={intensity} />,
    gallery: <Gallery key="gallery" gallery={gallery} intensity={intensity} />,
    contact: <Contact key="contact" portfolio={portfolio} intensity={intensity} />,
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={style}>
        {!embedded && <ClusterNetwork mode="page" intensity={intensity} animate={animate} networkColor={net} accentColor={accent} />}
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} />
        <main className="relative z-10">{visibleSections.map((id) => sections[id])}</main>
        <Footer portfolio={portfolio} />
      </div>
    </MotionConfig>
  );
}
