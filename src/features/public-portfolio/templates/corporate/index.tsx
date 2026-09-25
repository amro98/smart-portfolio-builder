import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, ArrowUpRight, Copy, FileText, Github, Mail, MapPin, Menu, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/api/client';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { usePortfolioLocale } from '../../portfolio-locale';
import { getAmbientIntensity, type AmbientIntensity } from '../scene-config';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { resolveAccent, skinStyle, splitLastWord, yearOf, type TemplateSkin } from '../theme';
import { scrollToSection, splitNav, useActiveSection, useLockScroll, useNavSections, useScrollY } from '../nav-utils';
import { useAmbientMotion, useReveal } from '../motion-utils';
import { getTechIcon, readableBrandColor } from '../tech-icons';
import { PortraitPlaceholder, ProjectPlaceholder } from '../placeholders';
import { FloatingShape, MotionCursor } from './motion-fx';
import type { Certification, Portfolio, Project, SectionId, Skill } from '@/types';

// MOTION — a UI/motion-driven portfolio: black world with an accent halo, custom cursor,
// floating outline shapes, a three-column hero around a haloed portrait, a draggable project
// slider with slide-out case details, tabbed experience/education and skills, and a marquee
// gallery. (Template id stays "corporate" for backward compatibility with saved portfolios.)

const SKIN: TemplateSkin = {
  signatureAccent: '258 82% 64%',
  background: '240 23% 3%',
  surface: '240 16% 8%',
  foreground: '0 0% 100%',
  muted: '240 8% 62%',
  border: '240 10% 16%',
};
const DISPLAY = { fontFamily: "'Unbounded', system-ui, sans-serif" } as const;

type Reveal = ReturnType<typeof useReveal>;

function Halo({ className }: { className?: string }) {
  return <div aria-hidden className={cn('pointer-events-none absolute rounded-full bg-[hsl(var(--primary)/0.45)] blur-[90px]', className)} />;
}

function Title({ text, reveal, align = 'center' }: { text: string; reveal: Reveal; align?: 'center' | 'start' }) {
  const [lead, last] = splitLastWord(text);
  return (
    <motion.h2 {...reveal({ y: 30 })} style={DISPLAY} className={cn('mb-14 text-[clamp(1.6rem,3.6vw,2.6rem)] font-semibold leading-[1.15] text-white', align === 'center' && 'text-center')}>
      {lead ? (
        <>
          <span className="block text-[hsl(var(--primary))]">{lead}</span>
          <span className="block">{last}</span>
        </>
      ) : (
        <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-white bg-clip-text text-transparent">{last}</span>
      )}
    </motion.h2>
  );
}

function GlowButton({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  const cls = 'inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.6)] bg-[hsl(var(--primary)/0.12)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-6px_hsl(var(--primary)/0.8)] transition-all hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]';
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{children}</button>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
}

function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="mx-auto mb-12 flex w-fit flex-wrap justify-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onChange(tab.id)} className={cn('relative rounded-full px-5 py-2 text-sm font-semibold transition-colors', value === tab.id ? 'text-[hsl(var(--primary-foreground))]' : 'text-white/60 hover:text-white')}>
          {value === tab.id && <motion.span layoutId="motion-tab" className="absolute inset-0 rounded-full bg-[hsl(var(--primary))]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
          <span className="relative">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// NAV — name left, widely spaced links right; mobile side panel.
// ============================================================================

function Nav({ portfolio, visibleSections, embedded }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean }) {
  const { t, lang, setLang, dir } = usePortfolioLocale();
  const navSections = useNavSections(visibleSections);
  const ids = useMemo(() => visibleSections as string[], [visibleSections]);
  const active = useActiveSection(ids);
  const scrolled = useScrollY(30);
  const { inline, overflow } = splitNav(navSections, 5);
  const [open, setOpen] = useState(false);
  useLockScroll(open && !embedded);
  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };
  const from = dir === 'rtl' ? '-100%' : '100%';

  return (
    <header className={cn(embedded ? 'sticky' : 'fixed', 'inset-x-0 top-0 z-50 transition-colors duration-500', scrolled || embedded ? 'bg-[hsl(240_23%_3%/0.8)] backdrop-blur-xl' : '')}>
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-10 px-6">
        <button onClick={() => go('hero')} style={DISPLAY} className="me-auto text-base font-semibold text-white">{portfolio.fullName.split(' ')[0]}</button>
        <nav className="hidden items-center gap-10 lg:flex">
          {inline.map((s) => (
            <button key={s} onClick={() => go(s)} className={cn('relative whitespace-nowrap text-sm font-semibold transition-colors', active === s ? 'text-white' : 'text-white/55 hover:text-white')}>
              {t(`sections.${s}`)}
              {active === s && <motion.span layoutId="motion-nav" className="absolute -bottom-2 start-0 h-[2px] w-full bg-[hsl(var(--primary))]" />}
            </button>
          ))}
          {overflow.length > 0 && (
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 hover:text-white"><Menu className="h-4 w-4" />{t('public.nav.more')}</button>
          )}
        </nav>
        <LanguageSwitcher compact lang={lang} onLanguageChange={setLang} />
        <button onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white lg:hidden" aria-label={t('public.nav.openMenu')}>
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className={cn(embedded ? 'absolute' : 'fixed', 'inset-0 z-50 bg-black/60 backdrop-blur-sm')} />
            <motion.aside
              initial={{ x: from }}
              animate={{ x: 0 }}
              exit={{ x: from }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className={cn(embedded ? 'absolute' : 'fixed', 'inset-y-0 end-0 z-50 flex w-[min(360px,86vw)] flex-col bg-[hsl(240_16%_7%)] p-8 shadow-2xl')}
            >
              <button onClick={() => setOpen(false)} aria-label={t('public.nav.closeMenu')} className="self-end text-white/70 hover:text-white"><X className="h-6 w-6" /></button>
              <nav className="mt-8 flex flex-col gap-1">
                {navSections.map((s, i) => (
                  <motion.button key={s} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} onClick={() => go(s)} style={DISPLAY} className={cn('py-3 text-start text-lg font-semibold', active === s ? 'text-[hsl(var(--primary))]' : 'text-white')}>
                    {t(`sections.${s}`)}
                  </motion.button>
                ))}
              </nav>
              {portfolio.ctaLabel && portfolio.ctaLink && <div className="mt-auto"><GlowButton href={portfolio.ctaLink}>{portfolio.ctaLabel}</GlowButton></div>}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// ============================================================================
// HERO — greeting/name · haloed portrait · profession.
// ============================================================================

function Hero({ portfolio, intensity, animate }: { portfolio: Portfolio; intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const words = portfolio.title.trim().split(/\s+/);
  const small = words.length > 1 ? words[0] : t(`profession.${portfolio.profession}`);
  const big = words.length > 1 ? words.slice(1).join(' ') : words[0];
  const nameParts = portfolio.fullName.trim().split(/\s+/);
  const socials = socialEntries(portfolio.socialLinks);
  const resume = portfolio.resumeUrl || portfolio.ctaLink;

  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pb-16 pt-28">
      <FloatingShape kind="ring" animate={animate} className="start-[6%] top-[22%]" />
      <FloatingShape kind="triangle" animate={animate} delay={2} className="end-[8%] top-[18%] hidden sm:block" size={44} />
      <FloatingShape kind="plus" animate={animate} delay={4} className="bottom-[12%] start-[42%] hidden md:block" size={36} />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
        <motion.div {...reveal({ x: -50, delay: 0.3 })} className="order-2 text-center lg:order-1 lg:text-start">
          <p style={DISPLAY} className="text-lg font-medium text-[hsl(var(--primary))]">{t('public.hero.greeting')}</p>
          {/* Isolated rather than content-directed: the name block keeps the column's designed alignment. */}
          <h1 style={{ ...DISPLAY, unicodeBidi: 'isolate' }} className="mt-2 text-[clamp(2.2rem,4.4vw,3.4rem)] font-semibold leading-[1.05] text-white">
            {nameParts.map((p, i) => <span key={i} className="block" style={{ unicodeBidi: 'isolate' }}>{p}</span>)}
          </h1>
        </motion.div>

        <motion.div {...reveal({ y: 60, duration: 1.1 })} className="relative order-1 mx-auto w-[min(76vw,380px)] lg:order-2">
          <Halo className="inset-[12%_6%_18%] opacity-90" />
          <motion.div
            aria-hidden
            className="absolute inset-[-4%] rounded-full border border-dashed border-[hsl(var(--primary)/0.35)]"
            animate={animate ? { rotate: 360 } : undefined}
            transition={animate ? { duration: 50, repeat: Infinity, ease: 'linear' } : undefined}
          />
          <div className="relative aspect-[3/4] overflow-hidden rounded-b-[160px] rounded-t-[200px] [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
            {portfolio.avatarUrl ? (
              <img src={resolveMediaUrl(portfolio.avatarUrl)} alt={portfolio.fullName} className="h-full w-full object-cover object-top" />
            ) : (
              <PortraitPlaceholder name={portfolio.fullName} />
            )}
          </div>
        </motion.div>

        <motion.div {...reveal({ x: 50, delay: 0.45 })} className="order-3 text-center lg:text-start">
          <p style={DISPLAY} className="text-lg font-medium text-[hsl(var(--primary))]">{small}</p>
          <p style={DISPLAY} className="mt-2 bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--primary)/0.85)] to-white bg-clip-text text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05] text-transparent">
            {big}
          </p>
        </motion.div>
      </div>

      {socials.length > 0 && (
        <div className="absolute bottom-16 start-6 hidden flex-col gap-5 text-white/80 lg:flex xl:start-[max(1.5rem,calc((100vw-72rem)/2))] [&_svg]:h-5 [&_svg]:w-5">
          {socials.slice(0, 4).map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[hsl(var(--primary))]">{getSocialIcon(k)}</a>)}
        </div>
      )}
      {resume && (
        <a href={resume} target="_blank" rel="noopener noreferrer" className="absolute bottom-16 end-6 hidden items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/55 transition-colors hover:text-[hsl(var(--primary))] lg:flex xl:end-[max(1.5rem,calc((100vw-72rem)/2))]">
          {portfolio.resumeUrl ? t('public.hero.resume') : portfolio.ctaLabel} <FileText className="h-4 w-4" />
        </a>
      )}
    </section>
  );
}

// ============================================================================
// ABOUT
// ============================================================================

function About({ portfolio, intensity, animate }: { portfolio: Portfolio; intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  return (
    <section id="about" className="relative overflow-hidden px-6 py-24 sm:py-32">
      <FloatingShape kind="square" animate={animate} className="end-[10%] top-16 hidden md:block" size={48} />
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
        <motion.div {...reveal({ scale: 0.9 })} className="relative mx-auto w-full max-w-[380px]">
          <Halo className="inset-[10%] opacity-70" />
          <div className="relative aspect-square overflow-hidden rounded-[40px] bg-[hsl(240_16%_8%)] ring-1 ring-white/10">
            {portfolio.avatarUrl ? <img src={resolveMediaUrl(portfolio.avatarUrl)} alt={portfolio.fullName} className="h-full w-full object-cover object-top" /> : <PortraitPlaceholder name={portfolio.fullName} />}
          </div>
        </motion.div>
        <motion.div {...reveal({ x: 50 })}>
          <h2 style={DISPLAY} className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.15] text-white">
            <span className="block text-[hsl(var(--primary))]">{t(`profession.${portfolio.profession}`)}</span>
            {t('public.about.heading')}
          </h2>
          {portfolio.bio && <p className="mt-6 text-[15px] leading-relaxed text-white/65">{portfolio.bio}</p>}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55">
            {portfolio.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[hsl(var(--primary))]" />{portfolio.location}</span>}
            {portfolio.email && <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-[hsl(var(--primary))]" />{portfolio.email}</span>}
          </div>
          {(portfolio.resumeUrl || portfolio.ctaLink) && (
            <div className="mt-8"><GlowButton href={portfolio.resumeUrl || portfolio.ctaLink}>{portfolio.resumeUrl ? t('public.hero.resume') : portfolio.ctaLabel} <FileText className="h-4 w-4" /></GlowButton></div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PROJECTS — draggable slider; each card opens a slide-out case panel.
// ============================================================================

function ProjectDrawer({ project, index, onClose, embedded }: { project: Project; index: number; onClose: () => void; embedded?: boolean }) {
  const { t, dir } = usePortfolioLocale();
  useLockScroll(!embedded);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const from = dir === 'rtl' ? '-100%' : '100%';
  const meta = [
    project.roleInProject && [t('public.projects.role'), project.roleInProject],
    project.clientName && [t('public.projects.client'), project.clientName],
    yearOf(project.date) && [t('public.projects.year'), yearOf(project.date)],
  ].filter(Boolean) as [string, string][];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className={cn(embedded ? 'absolute' : 'fixed', 'inset-0 z-[70] bg-black/70 backdrop-blur-sm')} />
      <motion.aside
        role="dialog"
        aria-label={project.title}
        initial={{ x: from }}
        animate={{ x: 0 }}
        exit={{ x: from }}
        transition={{ type: 'spring', stiffness: 220, damping: 30 }}
        className={cn(embedded ? 'absolute' : 'fixed', 'inset-y-0 end-0 z-[71] w-[min(600px,100vw)] overflow-y-auto bg-[hsl(240_16%_6%)] shadow-2xl')}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {project.coverImage ? <img src={resolveMediaUrl(project.coverImage)} alt={project.title} className="h-full w-full object-cover" /> : <ProjectPlaceholder variant="motion" title={project.title} index={index} />}
          <button onClick={onClose} aria-label={t('public.projects.close')} className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-[hsl(var(--primary))]"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between">
            <span style={DISPLAY} className="text-3xl font-semibold text-[hsl(var(--primary))]">{String(index + 1).padStart(2, '0')}</span>
            {project.category && <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">{project.category}</span>}
          </div>
          <h3 style={DISPLAY} className="mt-4 text-2xl font-semibold leading-tight text-white">{project.title}</h3>
          {meta.length > 0 && (
            <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-white/10 py-5">
              {meta.map(([k, v]) => <div key={k}><dt className="text-xs text-white/40">{k}</dt><dd className="mt-1 text-sm font-semibold text-white">{v}</dd></div>)}
            </dl>
          )}
          <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-white/70">{project.fullDescription || project.shortDescription}</p>
          {project.tags.length > 0 && (
            <>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--primary))]">{t('public.projects.technologies')}</p>
              <div className="mt-3 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">{tag}</span>)}</div>
            </>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {(project.liveUrl || project.externalUrl) && <GlowButton href={project.liveUrl || project.externalUrl}>{t('public.projects.live')} <ArrowUpRight className="h-4 w-4" /></GlowButton>}
            {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"><Github className="h-4 w-4" />{t('public.projects.code')}</a>}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function Projects({ projects, intensity, embedded }: { projects: Project[]; intensity: AmbientIntensity; embedded?: boolean }) {
  const { t, dir } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const track = useRef<HTMLDivElement>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const published = sortByOrder(projects.filter((p) => p.status === 'published'));

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? Math.abs(el.scrollLeft) / max : 1);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [published.length]);

  if (published.length === 0) return null;
  const nudge = (d: 1 | -1) => track.current?.scrollBy({ left: d * 360 * (dir === 'rtl' ? -1 : 1), behavior: 'smooth' });

  return (
    <section id="projects" className="relative overflow-hidden py-24 sm:py-32">
      <Halo className="start-1/2 top-1/3 h-72 w-72 -translate-x-1/2 opacity-40" />
      <div className="px-6"><Title text={t('public.projects.heading')} reveal={reveal} /></div>
      <div
        ref={track}
        className="relative flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 [scroll-padding-inline:1.5rem] [scrollbar-width:none] lg:px-[max(1.5rem,calc((100%-72rem)/2))] lg:[scroll-padding-inline:max(1.5rem,calc((100%-72rem)/2))]"
      >
        {published.map((p, i) => (
          <motion.article
            key={p.id}
            {...reveal({ x: 80, delay: Math.min(i, 4) * 0.1 })}
            data-cursor="hover"
            onClick={() => setOpenIdx(i)}
            className="group relative flex w-[300px] shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-[32px] bg-gradient-to-b from-[hsl(240_16%_9%)] to-[hsl(240_16%_6%)] p-6 ring-1 ring-white/10 transition-transform duration-500 hover:-translate-y-2 sm:w-[340px]"
          >
            <div className="pointer-events-none absolute -bottom-20 start-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[hsl(var(--primary)/0.4)] blur-3xl transition-opacity group-hover:opacity-100 sm:opacity-60 rtl:translate-x-1/2" />
            <div className="relative flex items-start justify-between">
              <span style={DISPLAY} className="text-4xl font-semibold text-white">{String(i + 1).padStart(2, '0')}</span>
              {p.category && <span className="text-sm font-semibold text-white/60">{p.category}</span>}
            </div>
            <h3 style={DISPLAY} className="relative mt-6 text-lg font-semibold leading-snug text-white">{p.title}</h3>
            {p.tags.length > 0 && (
              <>
                <p className="relative mt-4 text-xs font-semibold text-[hsl(var(--primary))]">{t('public.projects.technologies')}</p>
                <p className="relative mt-1 line-clamp-2 text-xs leading-relaxed text-white/55">{p.tags.join(', ')}</p>
              </>
            )}
            <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl">
              {p.coverImage ? <img src={resolveMediaUrl(p.coverImage)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <ProjectPlaceholder variant="motion" title={p.title} index={i} />}
              <span className="absolute bottom-3 end-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-all group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary-foreground))]">
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" />
              </span>
            </div>
          </motion.article>
        ))}
      </div>
      <div className="mx-auto mt-6 flex max-w-6xl items-center gap-5 px-6">
        <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full origin-left bg-[hsl(var(--primary))] rtl:origin-right" style={{ scaleX: Math.max(0.08, progress) }} />
        </div>
        <button onClick={() => nudge(-1)} aria-label={t('public.testimonials.prev')} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-[hsl(var(--primary))]"><ArrowLeft className="h-4 w-4 rtl:rotate-180" /></button>
        <button onClick={() => nudge(1)} aria-label={t('public.testimonials.next')} className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><ArrowRight className="h-4 w-4 rtl:rotate-180" /></button>
      </div>
      <AnimatePresence>
        {openIdx !== null && <ProjectDrawer key="drawer" project={published[openIdx]} index={openIdx} onClose={() => setOpenIdx(null)} embedded={embedded} />}
      </AnimatePresence>
    </section>
  );
}

// ============================================================================
// EXPERIENCE — Experience / Education tabs over a centered timeline.
// ============================================================================

interface TimelineRow { id: string; title: string; org: string; year: string; text: string }

function Experience({ experiences, education, intensity }: { experiences: TemplateContentProps['experiences']; education: Certification[]; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const exp: TimelineRow[] = sortByOrder(experiences).map((e) => ({ id: e.id, title: e.role, org: e.company, year: e.current ? t('public.experience.present') : yearOf(e.endDate) || yearOf(e.startDate), text: e.description.join(' ') }));
  const edu: TimelineRow[] = sortByOrder(education).map((c) => ({ id: c.id, title: c.title, org: c.institution, year: yearOf(c.issueDate), text: '' }));
  const [tab, setTab] = useState<'exp' | 'edu'>(exp.length ? 'exp' : 'edu');
  if (exp.length === 0 && edu.length === 0) return null;
  const rows = tab === 'exp' ? exp : edu;

  return (
    <section id="experience" className="relative px-6 py-24 sm:py-32">
      <Title text={t('public.experience.heading')} reveal={reveal} />
      {exp.length > 0 && edu.length > 0 && (
        <Tabs tabs={[{ id: 'exp', label: t('public.experience.tabExperience') }, { id: 'edu', label: t('public.experience.tabEducation') }]} value={tab} onChange={setTab} />
      )}
      <div className="relative mx-auto max-w-5xl">
        <span aria-hidden className="absolute bottom-0 top-0 start-[7px] w-px bg-white/10 md:start-1/2" />
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }} className="space-y-12">
            {rows.map((r) => (
              <div key={r.id} className="relative grid gap-3 ps-10 md:grid-cols-[1fr_1fr] md:gap-16 md:ps-0">
                <span aria-hidden className="absolute start-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(240_23%_3%)] shadow-[0_0_16px_hsl(var(--primary))] md:start-1/2 md:-translate-x-1/2 rtl:md:translate-x-1/2" />
                <div className="md:text-end">
                  <h3 style={DISPLAY} className="text-lg font-semibold leading-snug text-white">{r.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-[hsl(var(--primary))]">{r.org}</p>
                </div>
                <div>
                  <p style={DISPLAY} className="text-lg font-semibold text-white/90">{r.year}</p>
                  {r.text && <p className="mt-2 text-sm leading-relaxed text-white/55">{r.text}</p>}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ============================================================================
// SKILLS — category tabs with interactive chips.
// ============================================================================

function Skills({ skills, intensity }: { skills: Skill[]; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const groups = useMemo(() => {
    const map = new Map<string, Skill[]>();
    skills.forEach((s) => {
      const k = s.category || t('public.skills.general');
      map.set(k, [...(map.get(k) ?? []), s]);
    });
    return [...map.entries()];
  }, [skills, t]);
  const [tab, setTab] = useState(0);
  if (groups.length === 0) return null;
  const [, list] = groups[Math.min(tab, groups.length - 1)];

  return (
    <section id="skills" className="relative overflow-hidden px-6 py-24 sm:py-32">
      <Halo className="-end-20 top-1/4 h-72 w-72 opacity-40" />
      <Title text={t('public.skills.heading')} reveal={reveal} />
      {groups.length > 1 && <Tabs tabs={groups.map(([k], i) => ({ id: String(i), label: k }))} value={String(Math.min(tab, groups.length - 1))} onChange={(v) => setTab(Number(v))} />}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }} className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortByOrder(list).map((s, i) => {
            const icon = getTechIcon(s.name);
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} data-cursor="hover" className="group relative overflow-hidden rounded-3xl bg-[hsl(240_16%_8%)] p-5 ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:ring-[hsl(var(--primary)/0.6)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                    {icon ? <svg viewBox="0 0 24 24" className="h-5 w-5" fill={readableBrandColor(icon)}><path d={icon.path} /></svg> : <span style={DISPLAY} className="text-sm font-bold text-[hsl(var(--primary))]">{s.name.charAt(0)}</span>}
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold text-white">{s.name}</span>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary)/0.6)] to-[hsl(var(--primary))]" initial={{ width: 0 }} animate={{ width: `${s.proficiency}%` }} transition={{ duration: 0.9, delay: 0.1 + i * 0.04 }} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
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
    <section id="services" className="relative px-6 py-24 sm:py-32">
      <Title text={t('public.services.heading')} reveal={reveal} />
      <div className={cn('mx-auto grid gap-6', sorted.length === 2 ? 'max-w-4xl md:grid-cols-2' : 'max-w-6xl md:grid-cols-3')}>
        {sorted.map((s, i) => (
          <motion.div key={s.id} {...reveal({ y: 40, delay: i * 0.1 })} className={cn('group relative flex flex-col overflow-hidden rounded-[32px] p-8 transition-transform duration-500 hover:-translate-y-2', i === 0 ? 'bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.45)]' : 'bg-[hsl(240_16%_8%)] ring-1 ring-white/10')}>
            <h3 style={DISPLAY} className="text-xl font-semibold text-white">{s.title}</h3>
            {s.description && <p className={cn('mt-4 flex-1 text-sm leading-relaxed', i === 0 ? 'text-white/85' : 'text-white/60')}>{s.description}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              {s.priceLabel && <span className="rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold text-white">{s.priceLabel}</span>}
              {s.duration && <span className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80">{s.duration}</span>}
            </div>
            {s.ctaLink && (
              <a href={s.ctaLink} target="_blank" rel="noopener noreferrer" aria-label={s.ctaLabel || s.title} className="mt-6 flex h-11 w-11 items-center justify-center self-end rounded-full bg-white text-black transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Certifications({ certifications, intensity, animate }: { certifications: Certification[]; intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(certifications);
  if (sorted.length === 0) return null;
  return (
    <section id="certifications" className="relative px-6 py-24 sm:py-32">
      <Title text={t('public.certifications.heading')} reveal={reveal} />
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((c, i) => (
          <motion.div key={c.id} {...reveal({ y: 40, delay: i * 0.08 })} className="relative overflow-hidden rounded-[28px] p-px">
            <motion.div
              aria-hidden
              className="absolute inset-[-60%] bg-[conic-gradient(from_0deg,transparent_0deg,hsl(var(--primary))_60deg,transparent_140deg)]"
              animate={animate ? { rotate: 360 } : undefined}
              transition={animate ? { duration: 6 + i, repeat: Infinity, ease: 'linear' } : undefined}
            />
            <div className="relative h-full rounded-[27px] bg-[hsl(240_16%_7%)] p-7">
              <p style={DISPLAY} className="text-3xl font-semibold text-[hsl(var(--primary))]">{yearOf(c.issueDate)}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{c.type === 'education' ? t('public.experience.tabEducation') : t('public.certifications.heading')}</p>
              <h3 style={DISPLAY} className="mt-2 text-base font-semibold leading-snug text-white">{c.title}</h3>
              <p className="mt-1 text-sm text-white/55">{c.institution}</p>
              {c.verificationUrl && <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--primary))]">{t('public.certifications.viewCredential')} <ArrowUpRight className="h-4 w-4" /></a>}
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
  if (sorted.length === 0) return null;
  return (
    <section id="testimonials" className="relative overflow-hidden py-24 sm:py-32">
      <div className="px-6"><Title text={t('public.testimonials.heading')} reveal={reveal} /></div>
      <div className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible">
        {sorted.map((tm, i) => (
          <motion.figure key={tm.id} {...reveal({ y: 40, delay: i * 0.08 })} className="relative w-[80%] shrink-0 snap-center overflow-hidden rounded-[28px] bg-gradient-to-b from-[hsl(240_16%_9%)] to-[hsl(240_16%_6%)] p-7 text-center ring-1 ring-white/10 md:w-auto">
            <div className="pointer-events-none absolute -top-16 start-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-[hsl(var(--primary)/0.35)] blur-3xl rtl:translate-x-1/2" />
            {tm.avatarUrl ? <img src={resolveMediaUrl(tm.avatarUrl)} alt={tm.clientName} className="relative mx-auto h-14 w-14 rounded-full object-cover ring-2 ring-[hsl(var(--primary)/0.6)]" /> : <span style={DISPLAY} className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.2)] font-bold text-[hsl(var(--primary))]">{tm.clientName.charAt(0)}</span>}
            <p style={DISPLAY} className="relative mt-4 text-sm font-semibold text-white">{tm.clientName}</p>
            {tm.role && <p className="text-xs text-white/45">{tm.role}</p>}
            <div className="relative mt-3 flex items-center justify-center gap-1 text-[hsl(var(--primary))]">
              {Array.from({ length: 5 }).map((_, k) => <Star key={k} className={cn('h-3.5 w-3.5', k < (tm.rating || 5) ? 'fill-current' : 'opacity-25')} />)}
              <span className="ms-1 text-xs font-bold text-white">{(tm.rating || 5).toFixed(1)}</span>
            </div>
            <blockquote className="relative mt-4 text-sm leading-relaxed text-white/65">{tm.quote}</blockquote>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function Gallery({ gallery, intensity, animate }: Pick<TemplateContentProps, 'gallery'> & { intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(gallery);
  if (sorted.length === 0) return null;
  const marquee = animate && sorted.length >= 3;
  const loop = marquee ? [...sorted, ...sorted] : sorted;
  return (
    <section id="gallery" className="relative overflow-hidden py-24 sm:py-32">
      <div className="px-6"><Title text={t('public.gallery.heading')} reveal={reveal} /></div>
      <div className={cn('group/marquee', !marquee && 'mx-auto max-w-6xl px-6')}>
        <motion.div
          className={cn('flex gap-5', marquee ? 'w-max hover:[animation-play-state:paused]' : 'flex-wrap justify-center')}
          animate={marquee ? { x: ['0%', '-50%'] } : undefined}
          transition={marquee ? { duration: sorted.length * 7, repeat: Infinity, ease: 'linear' } : undefined}
        >
          {loop.map((g, i) => (
            <figure key={`${g.id}-${i}`} data-cursor="hover" className="group relative h-[300px] w-[240px] shrink-0 overflow-hidden rounded-[28px] ring-1 ring-white/10 sm:h-[380px] sm:w-[300px]">
              <img src={resolveMediaUrl(g.imageUrl)} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 pt-16 text-start">
                <p style={DISPLAY} className="text-sm font-semibold text-white">{g.title}</p>
                {g.category && <p className="text-xs text-[hsl(var(--primary))]">{g.category}</p>}
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// CONTACT — copy email + info columns + form.
// ============================================================================

function Contact({ portfolio, intensity, animate }: { portfolio: Portfolio; intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const { field, onSubmit } = useContactForm(portfolio.email, t);
  const socials = socialEntries(portfolio.socialLinks);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(portfolio.email);
      toast.success(t('public.contact.copied'));
    } catch {
      window.location.href = `mailto:${portfolio.email}`;
    }
  };
  const input = 'w-full rounded-2xl bg-white/[0.04] px-5 py-3.5 text-sm text-white placeholder:text-white/35 outline-none ring-1 ring-white/10 focus:ring-[hsl(var(--primary))]';

  return (
    <section id="contact" className="relative overflow-hidden px-6 pb-16 pt-24 sm:pt-32">
      <Halo className="start-1/2 top-10 h-64 w-64 -translate-x-1/2 opacity-50" />
      <FloatingShape kind="ring" animate={animate} className="start-[12%] top-24 hidden md:block" size={40} />
      <FloatingShape kind="square" animate={animate} delay={3} className="end-[14%] top-40 hidden md:block" size={34} />
      <div className="relative mx-auto max-w-6xl">
        <Title text={t('public.contact.heading')} reveal={reveal} />
        <motion.div {...reveal({ y: 20 })} className="-mt-8 text-center">
          <p className="text-white/60">{t('public.contact.description')}</p>
          {portfolio.email && <div className="mt-6"><GlowButton onClick={copy}>{t('public.contact.copyEmail')} <Copy className="h-4 w-4" /></GlowButton></div>}
        </motion.div>
        <div className="mt-20 grid gap-12 border-t border-white/10 pt-14 md:grid-cols-3">
          <motion.div {...reveal({ y: 30 })} className="space-y-6">
            {portfolio.location && <div><p style={DISPLAY} className="text-sm font-semibold text-white">{t('public.contact.location')}</p><p className="mt-2 text-sm text-white/55">{portfolio.location}</p></div>}
            {portfolio.email && <div><p style={DISPLAY} className="text-sm font-semibold text-white">{t('public.contact.email')}</p><a href={`mailto:${portfolio.email}`} className="mt-2 block text-sm text-white/55 hover:text-white">{portfolio.email}</a></div>}
          </motion.div>
          {socials.length > 0 && (
            <motion.div {...reveal({ y: 30, delay: 0.1 })}>
              <p style={DISPLAY} className="text-sm font-semibold text-white">{t('public.contact.social')}</p>
              <ul className="mt-3 space-y-2">
                {socials.map(([k, url]) => (
                  <li key={k}><a href={url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm capitalize text-white/55 hover:text-white">{k} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a></li>
                ))}
              </ul>
            </motion.div>
          )}
          {portfolio.email && (
            <motion.form {...reveal({ y: 30, delay: 0.2 })} onSubmit={onSubmit} className="space-y-3">
              <p style={DISPLAY} className="text-sm font-semibold text-white">{t('public.contact.writeMe')}</p>
              <input className={input} placeholder={t('public.contact.namePlaceholder')} required {...field('name')} />
              <input className={input} type="email" placeholder={t('public.contact.emailPlaceholder')} {...field('email')} />
              <textarea className={cn(input, 'min-h-[110px]')} placeholder={t('public.contact.messagePlaceholder')} required {...field('message')} />
              <button type="submit" className="w-full rounded-2xl bg-[hsl(var(--primary))] py-3.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5">{t('public.contact.send')}</button>
            </motion.form>
          )}
        </div>
        <p className="mt-16 text-center text-xs text-white/35">© {new Date().getFullYear()} {portfolio.fullName}. {t('public.footer.rights')}</p>
      </div>
    </section>
  );
}

export default function MotionTemplate({
  portfolio, projects, experiences, skills, services, certifications, testimonials, gallery, visibleSections, animation, embedded,
}: TemplateContentProps) {
  const intensity = getAmbientIntensity(animation.id);
  const animate = useAmbientMotion(intensity);
  const { accent } = resolveAccent(portfolio, SKIN.signatureAccent);
  const style = { ...skinStyle(SKIN, accent), fontFamily: "'Inter', system-ui, sans-serif" } as React.CSSProperties;

  // Education lives in the Experience tabs when that section is shown, so the credentials
  // section doesn't repeat it — but nothing is dropped if Experience is hidden.
  const educationInTabs = visibleSections.includes('experience');
  const education = certifications.filter((c) => c.type === 'education');
  const credentialList = educationInTabs ? certifications.filter((c) => c.type !== 'education') : certifications;

  const sections: Record<SectionId, React.ReactNode> = {
    hero: <Hero key="hero" portfolio={portfolio} intensity={intensity} animate={animate} />,
    about: <About key="about" portfolio={portfolio} intensity={intensity} animate={animate} />,
    projects: <Projects key="projects" projects={projects} intensity={intensity} embedded={embedded} />,
    experience: <Experience key="experience" experiences={experiences} education={education} intensity={intensity} />,
    skills: <Skills key="skills" skills={skills} intensity={intensity} />,
    services: <Services key="services" services={services} intensity={intensity} />,
    certifications: <Certifications key="certifications" certifications={credentialList} intensity={intensity} animate={animate} />,
    testimonials: <Testimonials key="testimonials" testimonials={testimonials} intensity={intensity} />,
    gallery: <Gallery key="gallery" gallery={gallery} intensity={intensity} animate={animate} />,
    contact: <Contact key="contact" portfolio={portfolio} intensity={intensity} animate={animate} />,
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={style}>
        <MotionCursor enabled={!embedded} />
        <Halo className="start-1/2 top-[18vh] h-[420px] w-[420px] -translate-x-1/2 opacity-60 rtl:translate-x-1/2" />
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} />
        <main className="relative">{visibleSections.map((id) => sections[id])}</main>
      </div>
    </MotionConfig>
  );
}
