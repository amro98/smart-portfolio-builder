import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown, Mail, MapPin, Menu, Send, Star, X } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/api/client';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { usePortfolioLocale } from '../../portfolio-locale';
import { getAmbientIntensity, type AmbientIntensity } from '../scene-config';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { DISPLAY_FONT, firstName, fontVars, resolveAccent, skinStyle, splitLastWord, yearOf, yearsOfExperience, type TemplateSkin } from '../theme';
import { scrollToSection, splitNav, useActiveSection, useNavSections, useScrollY } from '../nav-utils';
import { useAmbientMotion, useReveal } from '../motion-utils';
import { getTechIcon, readableBrandColor } from '../tech-icons';
import { PortraitPlaceholder, ProjectPlaceholder } from '../placeholders';
import type { Portfolio, SectionId, Skill } from '@/types';

// PORTRAIT — an elegant, portrait-led personal site: near-black canvas washed with soft accent
// glows, wide display type with the last word in accent, a tilted stacked portrait with a
// rotating badge, rounded numbered work cards, tilted skill cards and an info-tile contact.
// Mobile-first composition; original implementation on our data model.

const SKIN: TemplateSkin = {
  signatureAccent: '113 76% 60%',
  background: '120 8% 4%',
  surface: '120 6% 9%',
  foreground: '0 0% 100%',
  muted: '120 4% 62%',
  border: '120 5% 16%',
};
const DISPLAY = DISPLAY_FONT;

type Reveal = ReturnType<typeof useReveal>;

function Glow({ className }: { className?: string }) {
  return <div aria-hidden className={cn('pointer-events-none absolute rounded-full bg-[hsl(var(--primary)/0.22)] blur-[110px]', className)} />;
}

function Title({ text, sub, reveal }: { text: string; sub?: string; reveal: Reveal }) {
  const [lead, last] = splitLastWord(text);
  return (
    <motion.div {...reveal({ y: 30 })} className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
      <h2 style={DISPLAY} className="text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-tight text-white">
        {lead && <>{lead} </>}
        <span className="text-[hsl(var(--primary))]">{last}</span>
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-md text-sm text-white/55">{sub}</p>}
    </motion.div>
  );
}

function Pill({ href, onClick, children, variant = 'solid' }: { href?: string; onClick?: () => void; children: React.ReactNode; variant?: 'solid' | 'ghost' }) {
  const cls = cn(
    'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5',
    variant === 'solid'
      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.8)]'
      : 'border border-white/15 bg-white/5 text-white hover:border-[hsl(var(--primary))]'
  );
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{children}</button>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
}

// ============================================================================
// NAV — floating bar: name, dot-marked active link, accent pill CTA.
// ============================================================================

function Nav({ portfolio, visibleSections, embedded }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean }) {
  const { t, lang, setLang } = usePortfolioLocale();
  const navSections = useNavSections(visibleSections);
  const ids = useMemo(() => visibleSections as string[], [visibleSections]);
  const active = useActiveSection(ids);
  const scrolled = useScrollY(30);
  const { inline, overflow } = splitNav(navSections, 5);
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const go = (id: string) => {
    scrollToSection(id);
    setOpen(false);
    setMore(false);
  };

  return (
    <header className={cn(embedded ? 'sticky' : 'fixed', 'inset-x-0 top-0 z-50 transition-all duration-500', scrolled || embedded ? 'bg-[hsl(120_8%_4%/0.85)] backdrop-blur-xl' : 'bg-transparent')}>
      <div className="mx-auto flex h-[76px] max-w-6xl items-center gap-6 px-5 sm:px-8">
        <button onClick={() => go('hero')} style={DISPLAY} className="me-auto text-lg font-semibold text-white">
          {firstName(portfolio.fullName)}
        </button>
        <nav className="hidden items-center gap-8 lg:flex">
          {inline.map((s) => (
            <button key={s} onClick={() => go(s)} className={cn('flex items-center gap-2 whitespace-nowrap text-[15px] font-semibold transition-colors', active === s ? 'text-white' : 'text-white/60 hover:text-white')}>
              <span className={cn('h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] transition-opacity', active === s ? 'opacity-100' : 'opacity-0')} />
              {t(`sections.${s}`)}
            </button>
          ))}
          {overflow.length > 0 && (
            <div className="relative">
              <button onClick={() => setMore((m) => !m)} className="flex items-center gap-1 text-[15px] font-semibold text-white/60 hover:text-white">
                {t('public.nav.more')} <ChevronDown className={cn('h-4 w-4 transition-transform', more && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {more && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute end-0 top-9 min-w-[230px] rounded-2xl border border-white/10 bg-[hsl(120_6%_9%)] p-2 shadow-2xl">
                    {overflow.map((s) => (
                      <button key={s} onClick={() => go(s)} className={cn('block w-full rounded-xl px-4 py-2.5 text-start text-sm font-semibold hover:bg-white/5', active === s ? 'text-[hsl(var(--primary))]' : 'text-white/80')}>
                        {t(`sections.${s}`)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>
        <LanguageSwitcher compact lang={lang} onLanguageChange={setLang} />
        {portfolio.ctaLabel && portfolio.ctaLink && (
          <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer" className="hidden rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 sm:inline-flex">
            {portfolio.ctaLabel}
          </a>
        )}
        <button onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white lg:hidden" aria-label={t('public.nav.openMenu')}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 top-0 z-50 rounded-b-[32px] border-b border-white/10 bg-[hsl(120_6%_8%)] px-6 pb-8 pt-6 shadow-2xl lg:hidden">
            <div className="flex items-center justify-between">
              <span style={DISPLAY} className="text-lg font-semibold text-white">{firstName(portfolio.fullName)}</span>
              <button onClick={() => setOpen(false)} aria-label={t('public.nav.closeMenu')} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {navSections.map((s) => (
                <button key={s} onClick={() => go(s)} className={cn('rounded-2xl px-4 py-3 text-start text-sm font-semibold', active === s ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-white/5 text-white')}>
                  {t(`sections.${s}`)}
                </button>
              ))}
            </div>
            {portfolio.ctaLabel && portfolio.ctaLink && <div className="mt-5"><Pill href={portfolio.ctaLink}>{portfolio.ctaLabel} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Pill></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ============================================================================
// HERO — centered statement + tilted stacked portrait + rotating badge.
// ============================================================================

function RotatingBadge({ text, animate, onClick }: { text: string; animate: boolean; onClick: () => void }) {
  const { dir } = usePortfolioLocale();
  // Chromium drops RTL text on a <textPath>, so RTL scripts get one upright word per slot instead.
  const words = text.split('·').map((w) => w.trim()).filter(Boolean);
  return (
    <button onClick={onClick} aria-label={text} className="absolute -bottom-7 -end-9 z-20 flex h-[112px] w-[112px] items-center justify-center rounded-full bg-[hsl(120_8%_4%)] shadow-xl">
      <motion.svg viewBox="0 0 100 100" className="absolute inset-1.5 h-[calc(100%-12px)] w-[calc(100%-12px)]" animate={animate ? { rotate: 360 } : undefined} transition={animate ? { duration: 16, repeat: Infinity, ease: 'linear' } : undefined}>
        {dir === 'rtl' ? (
          words.map((word, i) => {
            const step = 360 / words.length;
            return (
              <g key={i}>
                <text x="50" y="16" textAnchor="middle" transform={`rotate(${i * step} 50 50)`} className="fill-white text-[10px] font-semibold">{word}</text>
                <circle cx="50" cy="13" r="1.3" transform={`rotate(${i * step + step / 2} 50 50)`} style={{ fill: 'hsl(var(--primary))' }} />
              </g>
            );
          })
        ) : (
          <>
            <defs><path id="portrait-badge" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" /></defs>
            <text className="fill-white text-[8.4px] font-semibold uppercase tracking-[0.18em]"><textPath href="#portrait-badge" textLength="236" lengthAdjust="spacing">{text}</textPath></text>
          </>
        )}
      </motion.svg>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><ArrowDown className="h-5 w-5" /></span>
    </button>
  );
}

function Hero({ portfolio, intensity, animate }: { portfolio: Portfolio; intensity: AmbientIntensity; animate: boolean }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const [lead, last] = splitLastWord(portfolio.title);
  const tagline = portfolio.bio ? (portfolio.bio.split(/(?<=[.!؟?])\s/)[0] ?? '').slice(0, 140) : '';

  return (
    <section id="hero" className="relative overflow-hidden px-5 pb-28 pt-32 text-center sm:pt-40">
      <Glow className="-start-40 top-10 h-[420px] w-[420px]" />
      <Glow className="-end-40 top-1/3 h-[380px] w-[380px] opacity-70" />
      <motion.p {...reveal({ y: 16 })} className="relative text-sm font-medium text-white/85 sm:text-base">
        {t('public.hero.intro', { name: firstName(portfolio.fullName) })}
        {portfolio.location && <span className="text-white/50"> — {t('public.hero.basedIn', { location: portfolio.location.split(',')[0] })}</span>}
      </motion.p>
      <motion.h1 {...reveal({ y: 30, delay: 0.1 })} style={DISPLAY} className="relative mx-auto mt-4 max-w-4xl text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.02] text-white">
        {lead && <span className="block">{lead}</span>}
        <span className="block text-[hsl(var(--primary))]">{last}</span>
      </motion.h1>
      {tagline && <motion.p {...reveal({ y: 20, delay: 0.2 })} className="relative mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/60">{tagline}</motion.p>}

      <div className="relative mx-auto mt-14 w-[min(70vw,300px)]">
        <motion.div
          aria-hidden
          initial={intensity.level > 0 ? { rotate: 0, opacity: 0 } : undefined}
          animate={{ rotate: -14, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 translate-x-[-6%] rounded-[32px] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.35)]"
        />
        <motion.div
          initial={intensity.level > 0 ? { rotate: 8, y: 60, opacity: 0 } : undefined}
          animate={{ rotate: -5, y: 0, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-gradient-to-b from-[hsl(var(--primary)/0.85)] via-[hsl(var(--primary)/0.45)] to-[hsl(120_6%_12%)] shadow-[0_40px_80px_-30px_hsl(var(--primary)/0.6)]"
        >
          {portfolio.avatarUrl ? (
            <img src={resolveMediaUrl(portfolio.avatarUrl)} alt={portfolio.fullName} className="h-full w-full object-cover object-top" />
          ) : (
            <PortraitPlaceholder name={portfolio.fullName} />
          )}
        </motion.div>
        <RotatingBadge text={t('public.hero.scrollBadge')} animate={animate} onClick={() => scrollToSection(portfolio.sectionVisibility.about ? 'about' : 'projects')} />
      </div>
    </section>
  );
}

// ============================================================================
// ABOUT — straight portrait with a stat badge, big statement, stats row.
// ============================================================================

function About({ portfolio, stats, intensity }: { portfolio: Portfolio; stats: { value: string; label: string }[]; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sentences = portfolio.bio ? portfolio.bio.split(/(?<=[.!؟?])\s/) : [];
  const statement = sentences[0] ?? '';
  const rest = sentences.slice(1).join(' ');

  return (
    <section id="about" className="relative overflow-hidden px-5 py-24 sm:px-8">
      <Glow className="-end-32 bottom-0 h-[360px] w-[360px]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <motion.div {...reveal({ x: -40 })} className="relative mx-auto w-full max-w-[340px]">
          <div className="aspect-[4/5] overflow-hidden rounded-[32px] bg-[hsl(120_6%_10%)] ring-1 ring-white/10">
            {portfolio.avatarUrl ? <img src={resolveMediaUrl(portfolio.avatarUrl)} alt={portfolio.fullName} className="h-full w-full object-cover object-top" /> : <PortraitPlaceholder name={portfolio.fullName} />}
          </div>
          {stats[0] && (
            <div className="absolute -bottom-6 -end-4 rounded-3xl bg-[hsl(var(--primary))] px-6 py-4 text-[hsl(var(--primary-foreground))] shadow-xl sm:-end-10">
              <p style={DISPLAY} className="text-3xl font-bold leading-none">{stats[0].value}</p>
              <p className="mt-1 text-xs font-semibold">{stats[0].label}</p>
            </div>
          )}
        </motion.div>
        <div>
          <motion.p {...reveal({ y: 30 })} style={DISPLAY} className="text-[clamp(1.5rem,3vw,2.3rem)] font-medium leading-snug text-white">
            <span className="text-[hsl(var(--primary))]">{t('public.about.heading')}: </span>
            {statement}
          </motion.p>
          {rest && <motion.p {...reveal({ y: 20, delay: 0.1 })} className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/60">{rest}</motion.p>}
          <motion.div {...reveal({ y: 20, delay: 0.2 })} className="mt-8 flex flex-wrap items-center gap-3">
            {portfolio.sectionVisibility.contact && <Pill onClick={() => scrollToSection('contact')}>{t('public.hero.contactButton')} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Pill>}
            {portfolio.email && <Pill href={`mailto:${portfolio.email}`} variant="ghost"><Mail className="h-4 w-4" />{portfolio.email}</Pill>}
          </motion.div>
          {stats.length > 1 && (
            <motion.div {...reveal({ y: 20, delay: 0.3 })} className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl bg-[hsl(120_6%_9%)] p-4 ring-1 ring-white/5">
                  <p style={DISPLAY} className="text-2xl font-bold text-[hsl(var(--primary))]">{s.value}</p>
                  <p className="mt-1 text-xs leading-tight text-white/55">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WORK — rounded numbered cards (swipeable row on mobile).
// ============================================================================

function Work({ projects, intensity }: Pick<TemplateContentProps, 'projects'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const published = sortByOrder(projects.filter((p) => p.status === 'published'));
  if (published.length === 0) return null;
  return (
    <section id="projects" className="relative overflow-hidden py-24">
      <Glow className="start-1/3 top-1/4 h-[420px] w-[420px] opacity-60" />
      <Title text={t('public.projects.heading')} reveal={reveal} />
      <div className={cn('relative mx-auto flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:px-8 md:grid md:grid-cols-2 md:overflow-visible', published.length % 2 === 0 && published.length <= 4 ? 'max-w-5xl' : 'lg:grid-cols-3')}>
        {published.map((p, i) => (
          <motion.article key={p.id} {...reveal({ y: 50, delay: (i % 3) * 0.12 })} className="group relative w-[82%] shrink-0 snap-center overflow-hidden rounded-[30px] bg-[hsl(120_6%_9%)] p-3 ring-1 ring-white/5 md:w-auto">
            <div className="pointer-events-none absolute -bottom-24 start-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[hsl(var(--primary)/0.35)] blur-3xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-60 rtl:translate-x-1/2" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
              {p.coverImage ? (
                <img src={resolveMediaUrl(p.coverImage)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <ProjectPlaceholder variant="portrait" title={p.title} index={i} />
              )}
              {(p.liveUrl || p.repositoryUrl) && (
                <a href={p.liveUrl || p.repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label={t('public.projects.viewWork')} className="absolute end-3 top-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="h-5 w-5" />
                </a>
              )}
            </div>
            <div className="relative px-3 pb-3 pt-5">
              <span style={DISPLAY} className="text-4xl font-semibold text-[hsl(var(--primary))]">{String(i + 1).padStart(2, '0')}</span>
              <h3 style={DISPLAY} className="mt-2 text-xl font-semibold text-white">{p.title}</h3>
              {p.shortDescription && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/55">{p.shortDescription}</p>}
              {p.tags.length > 0 && <p className="mt-3 text-xs text-white/40">{p.tags.slice(0, 4).join(', ')}</p>}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// EXPERIENCE — centered spine with alternating rounded cards.
// ============================================================================

function Experience({ experiences, intensity }: Pick<TemplateContentProps, 'experiences'> & { intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const sorted = sortByOrder(experiences);
  if (sorted.length === 0) return null;
  return (
    <section id="experience" className="relative px-5 py-24 sm:px-8">
      <Title text={t('public.experience.heading')} reveal={reveal} />
      <div className="relative mx-auto max-w-5xl">
        <span aria-hidden className="absolute bottom-0 top-0 start-4 w-px bg-gradient-to-b from-[hsl(var(--primary))] via-white/15 to-transparent md:start-1/2" />
        <div className="space-y-10">
          {sorted.map((e, i) => {
            const right = i % 2 === 1;
            return (
              <div key={e.id} className="relative md:grid md:grid-cols-2 md:gap-16">
                <span aria-hidden className="absolute start-4 top-7 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_20px_hsl(var(--primary))] md:start-1/2 rtl:translate-x-1/2" />
                <motion.div {...reveal({ x: right ? 40 : -40 })} className={cn('ms-10 rounded-[28px] bg-[hsl(120_6%_9%)] p-7 ring-1 ring-white/5 md:ms-0', right && 'md:col-start-2')}>
                  <span className="inline-block rounded-full bg-[hsl(var(--primary)/0.15)] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
                    {formatDate(e.startDate)} — {e.current ? t('public.experience.present') : formatDate(e.endDate)}
                  </span>
                  <h3 style={DISPLAY} className="mt-4 text-xl font-semibold text-white">{e.role}</h3>
                  <p className="text-sm font-medium text-white/60">{e.company}{e.location && ` · ${e.location}`}</p>
                  {e.description.length > 0 && <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-white/55">{e.description.map((d, k) => <li key={k}>{d}</li>)}</ul>}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SKILLS — a stack of gently tilted category cards with tech chips.
// ============================================================================

function Skills({ skills, intensity }: { skills: Skill[]; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  if (skills.length === 0) return null;
  const groups = Object.entries(
    skills.reduce<Record<string, Skill[]>>((acc, s) => {
      (acc[s.category || t('public.skills.general')] ||= []).push(s);
      return acc;
    }, {})
  );
  return (
    <section id="skills" className="relative overflow-hidden px-5 py-24 sm:px-8">
      <Glow className="-start-40 top-1/3 h-[400px] w-[400px]" />
      <Title text={t('public.skills.heading')} reveal={reveal} />
      <div className="relative mx-auto max-w-3xl space-y-5">
        {groups.map(([cat, list], gi) => {
          const lead = list.map((s) => getTechIcon(s.name)).find(Boolean);
          return (
            <motion.div
              key={cat}
              {...reveal({ y: 50, rotate: gi % 2 ? 4 : -4, delay: gi * 0.08 })}
              className={cn('flex flex-col gap-5 rounded-[28px] bg-[hsl(120_6%_9%)] p-6 ring-1 ring-white/5 sm:flex-row sm:items-center', gi % 2 ? 'sm:rotate-[1.5deg]' : 'sm:-rotate-[1.5deg]')}
            >
              <div className="flex items-center gap-4 sm:w-[210px] sm:shrink-0">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))]">
                  {lead ? <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d={lead.path} /></svg> : <span style={DISPLAY} className="text-lg font-bold">{cat.charAt(0)}</span>}
                </span>
                <h3 style={DISPLAY} className="text-2xl font-semibold text-white">{cat}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {sortByOrder(list).map((s) => {
                  const icon = getTechIcon(s.name);
                  return (
                    <span key={s.id} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/85" title={`${s.proficiency}%`}>
                      {icon ? <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={readableBrandColor(icon)}><path d={icon.path} /></svg> : <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />}
                      {s.name}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
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
    <section id="services" className="relative px-5 py-24 sm:px-8">
      <Title text={t('public.services.heading')} reveal={reveal} />
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {sorted.map((s, i) => (
          <motion.div key={s.id} {...reveal({ y: 40, delay: i * 0.1 })} className={cn('group flex flex-col rounded-[30px] p-7 ring-1 transition-transform hover:-translate-y-1', i === 0 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] ring-transparent' : 'bg-[hsl(120_6%_9%)] text-white ring-white/5')}>
            <span style={DISPLAY} className={cn('text-4xl font-semibold', i === 0 ? 'opacity-60' : 'text-[hsl(var(--primary))]')}>{String(i + 1).padStart(2, '0')}</span>
            <h3 style={DISPLAY} className="mt-4 text-2xl font-semibold">{s.title}</h3>
            {s.description && <p className={cn('mt-3 flex-1 text-sm leading-relaxed', i === 0 ? 'opacity-80' : 'text-white/55')}>{s.description}</p>}
            <div className="mt-6 flex items-center justify-between gap-3">
              <span className={cn('rounded-full px-4 py-2 text-sm font-semibold', i === 0 ? 'bg-black/15' : 'bg-white/5')}>{s.priceLabel || s.duration}</span>
              {s.ctaLink && (
                <a href={s.ctaLink} target="_blank" rel="noopener noreferrer" aria-label={s.ctaLabel || s.title} className={cn('flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:rotate-45', i === 0 ? 'bg-black/15' : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]')}>
                  <ArrowUpRight className="h-5 w-5" />
                </a>
              )}
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
    <section id="certifications" className="relative px-5 py-24 sm:px-8">
      <Title text={t('public.certifications.heading')} reveal={reveal} />
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
        {sorted.map((c, i) => (
          <motion.div key={c.id} {...reveal({ y: 30, delay: i * 0.08 })} className="flex items-start gap-5 rounded-[28px] bg-[hsl(120_6%_9%)] p-6 ring-1 ring-white/5">
            <span style={DISPLAY} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.15)] text-lg font-bold text-[hsl(var(--primary))]">{yearOf(c.issueDate)}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{c.type === 'education' ? t('public.experience.tabEducation') : t('public.certifications.heading')}</p>
              <h3 style={DISPLAY} className="mt-1 text-lg font-semibold text-white">{c.title}</h3>
              <p className="text-sm text-white/55">{c.institution}</p>
              {c.verificationUrl && <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--primary))]">{t('public.certifications.viewCredential')} <ArrowUpRight className="h-4 w-4" /></a>}
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
    <section id="testimonials" className="relative overflow-hidden py-24">
      <Glow className="end-1/4 top-1/3 h-[360px] w-[360px] opacity-60" />
      <Title text={t('public.testimonials.heading')} reveal={reveal} />
      <div className="relative mx-auto flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:px-8 md:grid md:grid-cols-3 md:overflow-visible">
        {sorted.map((tm, i) => (
          <motion.figure key={tm.id} {...reveal({ y: 40, delay: i * 0.1 })} className="flex w-[82%] shrink-0 snap-center flex-col rounded-[30px] bg-gradient-to-b from-[hsl(120_6%_11%)] to-[hsl(120_6%_7%)] p-7 ring-1 ring-white/5 md:w-auto">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))]">
              <span className="text-sm font-bold">{tm.rating ? `${tm.rating}.0` : '5.0'}</span>
              {Array.from({ length: 5 }).map((_, k) => <Star key={k} className={cn('h-3.5 w-3.5', k < (tm.rating || 5) ? 'fill-current' : 'opacity-25')} />)}
            </div>
            <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-white/80">“{tm.quote}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              {tm.avatarUrl ? <img src={resolveMediaUrl(tm.avatarUrl)} alt={tm.clientName} className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.2)] font-bold text-[hsl(var(--primary))]">{tm.clientName.charAt(0)}</span>}
              <div>
                <p className="text-sm font-semibold text-white">{tm.clientName}</p>
                {tm.role && <p className="text-xs text-white/45">{tm.role}</p>}
              </div>
            </figcaption>
          </motion.figure>
        ))}
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
    <section id="gallery" className="relative px-5 py-24 sm:px-8">
      <Title text={t('public.gallery.heading')} reveal={reveal} />
      <div className="mx-auto max-w-6xl columns-2 gap-4 md:columns-3">
        {sorted.map((g, i) => (
          <motion.figure key={g.id} {...reveal({ y: 40, delay: (i % 3) * 0.1 })} className="group relative mb-4 break-inside-avoid overflow-hidden rounded-[26px]">
            <img src={resolveMediaUrl(g.imageUrl)} alt={g.title} loading="lazy" className="w-full transition-transform duration-700 group-hover:scale-105" />
            <figcaption className="absolute inset-x-3 bottom-3 translate-y-3 rounded-2xl bg-black/55 px-4 py-2.5 text-sm font-semibold text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
              {g.title}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// CONTACT + FOOTER
// ============================================================================

function Contact({ portfolio, intensity }: { portfolio: Portfolio; intensity: AmbientIntensity }) {
  const { t } = usePortfolioLocale();
  const reveal = useReveal(intensity);
  const { field, onSubmit } = useContactForm(portfolio.email, t);
  const socials = socialEntries(portfolio.socialLinks);
  const input = 'w-full rounded-2xl bg-[hsl(120_6%_10%)] px-5 py-4 text-sm text-white placeholder:text-white/35 outline-none ring-1 ring-white/5 transition focus:ring-[hsl(var(--primary))]';
  const tiles = [
    portfolio.email && { icon: Mail, label: t('public.contact.email'), value: portfolio.email, href: `mailto:${portfolio.email}` },
    portfolio.location && { icon: MapPin, label: t('public.contact.location'), value: portfolio.location, href: undefined },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <section id="contact" className="relative overflow-hidden px-5 py-24 sm:px-8">
      <Glow className="start-1/4 bottom-0 h-[380px] w-[380px]" />
      <Title text={t('public.contact.heading')} sub={t('public.contact.description')} reveal={reveal} />
      <div className="relative mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.2fr_0.8fr]">
        {portfolio.email && (
          <motion.form {...reveal({ x: -30 })} onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={input} placeholder={t('public.contact.namePlaceholder')} required {...field('name')} />
              <input className={input} type="email" placeholder={t('public.contact.emailPlaceholder')} {...field('email')} />
            </div>
            <textarea className={cn(input, 'min-h-[170px]')} placeholder={t('public.contact.messagePlaceholder')} required {...field('message')} />
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.75)] py-4 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5">
              {t('public.contact.send')} <Send className="h-4 w-4 rtl:-scale-x-100" />
            </button>
          </motion.form>
        )}
        <motion.div {...reveal({ x: 30 })} className="space-y-3">
          {tiles.map((tile) => (
            <a key={tile.label} href={tile.href} className="group flex items-center gap-4 rounded-2xl bg-[hsl(120_6%_9%)] p-4 ring-1 ring-white/5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"><tile.icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-white/45">{tile.label}</span>
                <span className="block truncate text-sm font-semibold text-white">{tile.value}</span>
              </span>
              {tile.href && <ArrowUpRight className="h-5 w-5 text-white/40 transition-colors group-hover:text-[hsl(var(--primary))]" />}
            </a>
          ))}
          {socials.length > 0 && (
            <div className="rounded-2xl bg-[hsl(120_6%_9%)] p-4 ring-1 ring-white/5">
              <p className="text-xs text-white/45">{t('public.contact.social')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {socials.map(([k, url]) => (
                  <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-white transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] [&_svg]:h-4 [&_svg]:w-4">
                    {getSocialIcon(k)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ portfolio, visibleSections }: { portfolio: Portfolio; visibleSections: SectionId[] }) {
  const { t } = usePortfolioLocale();
  const links = visibleSections.filter((s) => s !== 'hero').slice(0, 4);
  return (
    <footer className="relative border-t border-white/5 px-5 pb-8 pt-16 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 md:flex-row md:items-end">
        <p style={DISPLAY} className="max-w-xl text-[clamp(1.4rem,3vw,2.2rem)] font-semibold uppercase leading-tight text-white">
          {t('public.footer.collaborate', { name: firstName(portfolio.fullName) })}
        </p>
        <div className="flex flex-col gap-5 md:items-end">
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-white/60">
            {links.map((s) => <button key={s} onClick={() => scrollToSection(s)} className="hover:text-white">{t(`sections.${s}`)}</button>)}
          </div>
          <div className="flex gap-3 text-white/60 [&_svg]:h-4 [&_svg]:w-4">
            {socialEntries(portfolio.socialLinks).map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--primary))]">{getSocialIcon(k)}</a>)}
          </div>
        </div>
      </div>
      <p className="mt-12 text-center text-xs text-white/35">© {new Date().getFullYear()} {portfolio.fullName}. {t('public.footer.rights')}</p>
    </footer>
  );
}

export default function PortraitTemplate({
  portfolio, projects, experiences, skills, services, certifications, testimonials, gallery, visibleSections, animation, embedded,
}: TemplateContentProps) {
  const { t } = usePortfolioLocale();
  const intensity = getAmbientIntensity(animation.id);
  const animate = useAmbientMotion(intensity);
  const { accent } = resolveAccent(portfolio, SKIN.signatureAccent);
  const years = yearsOfExperience(experiences.map((e) => e.startDate));
  const published = projects.filter((p) => p.status === 'published').length;
  const stats = [
    years > 0 && { value: `${years}+`, label: t('public.stats.yearsExperience') },
    published > 0 && { value: String(published), label: t('public.stats.projectsCompleted') },
    testimonials.length > 0 && { value: String(testimonials.length), label: t('public.stats.testimonials') },
  ].filter(Boolean) as { value: string; label: string }[];

  const style = {
    ...skinStyle(SKIN, accent),
    ...fontVars({ display: "'Syne', system-ui, sans-serif", body: "'Poppins', system-ui, sans-serif" }),
  } as React.CSSProperties;

  const sections: Record<SectionId, React.ReactNode> = {
    hero: <Hero key="hero" portfolio={portfolio} intensity={intensity} animate={animate} />,
    about: <About key="about" portfolio={portfolio} stats={stats} intensity={intensity} />,
    projects: <Work key="projects" projects={projects} intensity={intensity} />,
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
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} />
        <main>{visibleSections.map((id) => sections[id])}</main>
        <Footer portfolio={portfolio} visibleSections={visibleSections} />
      </div>
    </MotionConfig>
  );
}
