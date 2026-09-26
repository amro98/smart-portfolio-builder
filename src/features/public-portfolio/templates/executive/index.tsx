import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, animate as animateValue, motion, useInView } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Award, BadgeCheck, CheckCircle2, Mail, MapPin, Menu, Quote, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { DISPLAY_FONT, yearOf, yearsOfExperience } from '../theme';
import {
  experienceRange, groupSkills, initials, projectLink, publishedProjects, useTemplateKit, useTemplateNav,
  type Kit, type TemplateLook,
} from '../kit';
import { Media, Sections } from '../kit-ui';
import type { Certification, Experience, GalleryItem, Portfolio, Project, SectionId, Service, Skill, Testimonial } from '@/types';

// EXECUTIVE — a boardroom silhouette: monogram top bar, a split hero with a framed portrait
// and credential chip, a navy statistics band with counting figures, a structured
// experience timeline, case-study cards, expertise bars, engagement cards and a credentials
// register. Gold is used as a restrained detail colour.

const LOOK: TemplateLook = {
  skins: {
    light: { signatureAccent: '213 55% 26%', background: '40 25% 97%', surface: '0 0% 100%', foreground: '215 45% 12%', muted: '215 14% 40%', border: '215 20% 88%' },
    dark: { signatureAccent: '38 62% 58%', background: '218 40% 7%', surface: '218 32% 11%', foreground: '40 25% 94%', muted: '215 14% 66%', border: '218 24% 19%' },
  },
  fonts: { display: "'Manrope', system-ui, sans-serif", body: "'Manrope', system-ui, sans-serif" },
};
const GOLD = '38 62% 52%';
const container = 'mx-auto max-w-6xl px-5 sm:px-8';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[hsl(var(--primary))]">
      <span className="h-px w-8" style={{ background: `hsl(${GOLD})` }} />
      {children}
    </p>
  );
}

function Title({ eyebrow, title, kit, center }: { eyebrow: string; title: string; kit: Kit; center?: boolean }) {
  return (
    <motion.div {...kit.reveal({ y: 24 })} className={cn('mb-12', center && 'flex flex-col items-center text-center')}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={DISPLAY_FONT} className="mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">{title}</h2>
    </motion.div>
  );
}

function CountUp({ value, suffix = '', run }: { value: number; suffix?: string; run: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [shown, setShown] = useState(run ? 0 : value);
  useEffect(() => {
    if (!run) {
      setShown(value);
      return;
    }
    if (!inView) return;
    const controls = animateValue(0, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value, run]);
  return <span ref={ref} className="tabular-nums">{shown}{suffix}</span>;
}

function Nav({ portfolio, visibleSections, embedded, kit }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean; kit: Kit }) {
  const nav = useTemplateNav(visibleSections, embedded);
  const cta = portfolio.ctaLabel || kit.t('public.hero.contactButton');
  const ctaHref = portfolio.ctaLink && portfolio.ctaLink !== '#contact' ? portfolio.ctaLink : '#contact';
  return (
    <header className={cn(embedded ? 'absolute' : 'fixed', 'inset-x-0 top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.95)] backdrop-blur')}>
      <div className="h-[3px]" style={{ background: `hsl(${GOLD})` }} />
      <div className={cn(container, 'flex h-16 items-center gap-6')}>
        <button onClick={() => nav.go('hero')} className="me-auto flex min-w-0 items-center gap-3 text-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[hsl(var(--primary))] text-sm font-extrabold tracking-wider text-[hsl(var(--primary-foreground))]">{initials(portfolio.fullName)}</span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-extrabold">{portfolio.fullName}</span>
            <span className="block truncate text-xs text-[hsl(var(--muted-foreground))]">{portfolio.title}</span>
          </span>
        </button>
        <nav className="hidden items-center gap-6 lg:flex">
          {nav.sections.slice(0, 5).map((s) => (
            <button key={s} onClick={() => nav.go(s)} className={cn('relative py-2 text-sm font-semibold transition-colors', nav.active === s ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]')}>
              {kit.t(`sections.${s}`)}
              {nav.active === s && <motion.span layoutId="exec-nav" className="absolute inset-x-0 -bottom-[13px] h-0.5" style={{ background: `hsl(${GOLD})` }} />}
            </button>
          ))}
        </nav>
        <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
        <a href={ctaHref} target={ctaHref.startsWith('#') ? undefined : '_blank'} rel="noopener noreferrer" className="hidden bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 sm:inline-flex">
          {cta}
        </a>
        <button onClick={() => nav.setOpen(!nav.open)} className="lg:hidden" aria-label={kit.t(nav.open ? 'public.nav.closeMenu' : 'public.nav.openMenu')}>
          {nav.open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {nav.open && (
          <motion.nav initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] lg:hidden">
            <div className={cn(container, 'grid gap-1 py-4')}>
              {nav.sections.map((s) => (
                <button key={s} onClick={() => nav.go(s)} className="flex items-center justify-between border-b border-[hsl(var(--border))] py-3 text-start font-semibold">
                  {kit.t(`sections.${s}`)} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ portfolio, years, kit, next }: { portfolio: Portfolio; years: number; kit: Kit; next?: string }) {
  const statement = (portfolio.bio || '').trim().split(/(?<=[.!?؟])\s+/)[0];
  const cta = portfolio.ctaLabel || kit.t('public.hero.contactButton');
  const ctaHref = portfolio.ctaLink && portfolio.ctaLink !== '#contact' ? portfolio.ctaLink : '#contact';
  return (
    <section id="hero" className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div aria-hidden className="absolute inset-y-0 end-0 hidden w-[38%] bg-[hsl(var(--card))] lg:block" />
      <div className={cn(container, 'relative grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]')}>
        <div>
          <motion.div {...kit.reveal({ y: 20 })}><Eyebrow>{portfolio.title}</Eyebrow></motion.div>
          <motion.h1 {...kit.reveal({ y: 30, delay: 0.1 })} style={DISPLAY_FONT} className="mt-6 text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.02] tracking-tight">
            {portfolio.fullName}
          </motion.h1>
          {statement && <motion.p {...kit.reveal({ y: 20, delay: 0.2 })} className="mt-6 max-w-xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">{statement}</motion.p>}
          <motion.div {...kit.reveal({ y: 20, delay: 0.3 })} className="mt-9 flex flex-wrap gap-3">
            <a href={ctaHref} target={ctaHref.startsWith('#') ? undefined : '_blank'} rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] px-7 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5">
              {cta} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
            {next && (
              <a href={`#${next}`} className="inline-flex items-center gap-2 border border-[hsl(var(--foreground)/0.2)] px-7 py-3.5 text-sm font-bold transition-colors hover:border-[hsl(var(--foreground))]">
                {kit.t(`sections.${next}`)}
              </a>
            )}
          </motion.div>
          {portfolio.location && (
            <motion.p {...kit.reveal({ y: 10, delay: 0.4 })} className="mt-8 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"><MapPin className="h-4 w-4" /> {portfolio.location}</motion.p>
          )}
        </div>
        <motion.div {...kit.reveal({ y: 40, delay: 0.2, duration: 1 })} className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div aria-hidden className="absolute -bottom-5 -end-5 h-full w-full border-2" style={{ borderColor: `hsl(${GOLD})` }} />
          <div className="relative aspect-[4/5] overflow-hidden bg-[hsl(var(--muted))]">
            {portfolio.avatarUrl ? (
              <Media src={portfolio.avatarUrl} alt={portfolio.fullName} eager />
            ) : (
              <div className="flex h-full items-center justify-center bg-[hsl(var(--primary))]">
                <span style={DISPLAY_FONT} className="text-8xl font-extrabold text-[hsl(var(--primary-foreground)/0.9)]">{initials(portfolio.fullName)}</span>
              </div>
            )}
          </div>
          {years > 0 && (
            <div className="absolute -start-4 bottom-8 flex items-center gap-3 bg-[hsl(var(--card))] px-5 py-4 shadow-xl sm:-start-8">
              <BadgeCheck className="h-8 w-8 shrink-0" style={{ color: `hsl(${GOLD})` }} />
              <div>
                <p className="text-2xl font-extrabold leading-none">{years}+</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{kit.t('public.stats.yearsExperience')}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function StatsBand({ stats, kit }: { stats: { value: number; suffix?: string; label: string }[]; kit: Kit }) {
  if (stats.length === 0) return null;
  return (
    <div className="bg-[hsl(215_45%_12%)] text-white dark:bg-[hsl(var(--card))]">
      <div className={cn(container, 'grid grid-cols-2 divide-white/10 py-10 md:grid-cols-4 md:divide-x rtl:md:divide-x-reverse')}>
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-3 text-center">
            <p className="text-4xl font-extrabold" style={{ color: `hsl(${GOLD})` }}><CountUp value={s.value} suffix={s.suffix} run={kit.animate} /></p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function About({ portfolio, years, kit }: { portfolio: Portfolio; years: number; kit: Kit }) {
  const facts = [
    portfolio.location && { k: kit.t('public.contact.location'), v: portfolio.location },
    portfolio.email && { k: kit.t('public.contact.email'), v: portfolio.email, ltr: true },
    { k: kit.t('public.tpl.focus'), v: portfolio.title },
    years > 0 && { k: kit.t('public.stats.yearsExperience'), v: `${years}+` },
  ].filter(Boolean) as { k: string; v: string; ltr?: boolean }[];
  return (
    <section id="about" className="py-24">
      <div className={cn(container, 'grid gap-12 lg:grid-cols-[1.4fr_1fr]')}>
        <div>
          <Title eyebrow={kit.t('public.tpl.profile')} title={kit.t('public.about.heading')} kit={kit} />
          <motion.p {...kit.reveal({ y: 20 })} className="whitespace-pre-line text-lg leading-[1.8] text-[hsl(var(--muted-foreground))]">{portfolio.bio}</motion.p>
        </div>
        <motion.aside {...kit.reveal({ y: 30, delay: 0.1 })} className="self-start border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">{kit.t('public.tpl.atAGlance')}</p>
          <dl className="mt-5 divide-y divide-[hsl(var(--border))]">
            {facts.map((f) => (
              <div key={f.k} className="flex justify-between gap-4 py-3.5 text-sm">
                <dt className="text-[hsl(var(--muted-foreground))]">{f.k}</dt>
                <dd className="break-all text-end font-bold" dir={f.ltr ? 'ltr' : undefined}>{f.v}</dd>
              </div>
            ))}
          </dl>
        </motion.aside>
      </div>
    </section>
  );
}

function ExperienceSection({ experiences, kit }: { experiences: Experience[]; kit: Kit }) {
  const items = sortByOrder(experiences);
  if (items.length === 0) return null;
  return (
    <section id="experience" className="bg-[hsl(var(--card))] py-24">
      <div className={cn(container, 'grid gap-12 lg:grid-cols-[0.8fr_1.2fr]')}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Title eyebrow={kit.t('public.tpl.career')} title={kit.t('public.experience.heading')} kit={kit} />
        </div>
        <ol className="relative border-s-2 border-[hsl(var(--border))] ps-8">
          {items.map((e, i) => (
            <motion.li key={e.id} {...kit.reveal({ x: 24, delay: i * 0.05 })} className="relative pb-12 last:pb-0">
              <span className="absolute -start-[41px] top-1 flex h-5 w-5 items-center justify-center border-2 bg-[hsl(var(--card))]" style={{ borderColor: `hsl(${GOLD})` }}>
                <span className="h-2 w-2 bg-[hsl(var(--primary))]" />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-xl font-extrabold">{e.role}</h3>
                <span className="bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]" dir="ltr">{experienceRange(e, kit.t('public.experience.present'))}</span>
              </div>
              <p className="mt-1 font-semibold text-[hsl(var(--muted-foreground))]">{[e.company, e.location].filter(Boolean).join(' · ')}</p>
              {e.description.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {e.description.map((d, j) => (
                    <li key={j} className="flex gap-3 text-[15px] leading-relaxed"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: `hsl(${GOLD})` }} />{d}</li>
                  ))}
                </ul>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CaseStudies({ projects, kit }: { projects: Project[]; kit: Kit }) {
  const items = publishedProjects(projects);
  if (items.length === 0) return null;
  return (
    <section id="projects" className="py-24">
      <div className={container}>
        <Title eyebrow={kit.t('public.tpl.selectedEngagements')} title={kit.t('public.tpl.caseStudies')} kit={kit} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => {
            const link = projectLink(p);
            return (
              <motion.article key={p.id} {...kit.reveal({ y: 30, delay: (i % 3) * 0.08 })} className="group flex flex-col border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[16/9] overflow-hidden bg-[hsl(var(--muted))]">
                  {p.coverImage ? (
                    <Media src={p.coverImage} alt={p.title} className="transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[hsl(var(--primary))]"><span className="text-4xl font-extrabold text-[hsl(var(--primary-foreground)/0.85)]">{String(i + 1).padStart(2, '0')}</span></div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--primary))]">{[p.category, yearOf(p.date)].filter(Boolean).join(' · ')}</p>
                  <h3 className="mt-3 text-xl font-extrabold leading-snug">{p.title}</h3>
                  {p.clientName && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{kit.t('public.projects.client')}: <span className="font-semibold text-[hsl(var(--foreground))]">{p.clientName}</span></p>}
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{p.shortDescription}</p>
                  {link && (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]">
                      {kit.t('public.tpl.readCaseStudy')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                    </a>
                  )}
                </div>
                <span aria-hidden className="h-[3px] w-0 transition-all duration-500 group-hover:w-full" style={{ background: `hsl(${GOLD})` }} />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Expertise({ skills, kit }: { skills: Skill[]; kit: Kit }) {
  const groups = groupSkills(sortByOrder(skills), kit.t('public.skills.general'));
  if (groups.length === 0) return null;
  return (
    <section id="skills" className="bg-[hsl(var(--card))] py-24">
      <div className={container}>
        <Title eyebrow={kit.t('public.tpl.capabilities')} title={kit.t('public.tpl.areasOfExpertise')} kit={kit} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(([cat, list], i) => (
            <motion.div key={cat} {...kit.reveal({ y: 24, delay: (i % 3) * 0.08 })} className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6">
              <h3 className="text-sm font-extrabold uppercase tracking-[0.16em]">{cat}</h3>
              <ul className="mt-5 space-y-4">
                {list.map((s) => (
                  <li key={s.id}>
                    <div className="flex justify-between text-sm font-semibold"><span>{s.name}</span><span className="tabular-nums text-[hsl(var(--muted-foreground))]">{s.proficiency}%</span></div>
                    <div className="mt-1.5 h-1 bg-[hsl(var(--border))]">
                      <motion.div className="h-full bg-[hsl(var(--primary))]" initial={kit.intensity.level ? { width: 0 } : false} whileInView={{ width: `${s.proficiency}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} style={kit.intensity.level ? undefined : { width: `${s.proficiency}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Engagements({ services, kit }: { services: Service[]; kit: Kit }) {
  const items = sortByOrder(services);
  if (items.length === 0) return null;
  return (
    <section id="services" className="py-24">
      <div className={container}>
        <Title eyebrow={kit.t('public.tpl.howIHelp')} title={kit.t('public.tpl.engagements')} kit={kit} center />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <motion.article key={s.id} {...kit.reveal({ y: 30, delay: (i % 3) * 0.08 })} className={cn('flex flex-col p-8', i === 0 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))]')}>
              <h3 className="text-xl font-extrabold">{s.title}</h3>
              {s.priceLabel && <p className="mt-5 text-3xl font-extrabold">{s.priceLabel}</p>}
              {s.duration && <p className={cn('mt-1 text-sm', i === 0 ? 'opacity-80' : 'text-[hsl(var(--muted-foreground))]')}>{s.duration}</p>}
              <p className={cn('mt-5 flex-1 text-sm leading-relaxed', i === 0 ? 'opacity-90' : 'text-[hsl(var(--muted-foreground))]')}>{s.description}</p>
              <a href={s.ctaLink || '#contact'} target={s.ctaLink ? '_blank' : undefined} rel="noopener noreferrer" className={cn('mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold', i === 0 ? 'bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))]' : 'border border-[hsl(var(--foreground)/0.2)] hover:border-[hsl(var(--foreground))]')}>
                {s.ctaLabel || kit.t('public.hero.contactButton')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Credentials({ certifications, kit }: { certifications: Certification[]; kit: Kit }) {
  const items = sortByOrder(certifications);
  if (items.length === 0) return null;
  return (
    <section id="certifications" className="bg-[hsl(var(--card))] py-24">
      <div className={container}>
        <Title eyebrow={kit.t('public.tpl.qualifications')} title={kit.t('public.tpl.credentials')} kit={kit} />
        <div className="grid gap-px border border-[hsl(var(--border))] bg-[hsl(var(--border))] md:grid-cols-2">
          {items.map((c, i) => (
            <motion.div key={c.id} {...kit.reveal({ y: 16, delay: (i % 2) * 0.06 })} className="flex items-start gap-4 bg-[hsl(var(--background))] p-6">
              <Award className="h-7 w-7 shrink-0" style={{ color: `hsl(${GOLD})` }} />
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold">{c.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{c.institution}</p>
                {c.verificationUrl && <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]">{kit.t('public.certifications.viewCredential')} <ArrowUpRight className="h-3 w-3" /></a>}
              </div>
              <span className="text-sm font-bold tabular-nums text-[hsl(var(--muted-foreground))]">{yearOf(c.issueDate)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Perspectives({ testimonials, kit }: { testimonials: Testimonial[]; kit: Kit }) {
  const items = sortByOrder(testimonials);
  if (items.length === 0) return null;
  return (
    <section id="testimonials" className="py-24">
      <div className={container}>
        <Title eyebrow={kit.t('public.tpl.references')} title={kit.t('public.tpl.clientPerspectives')} kit={kit} center />
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((tm, i) => (
            <motion.figure key={tm.id} {...kit.reveal({ y: 24, delay: (i % 2) * 0.08 })} className="relative border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
              <Quote className="absolute end-6 top-6 h-10 w-10 text-[hsl(var(--primary)/0.12)]" />
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={cn('h-4 w-4', j < (tm.rating || 5) ? 'fill-current' : 'opacity-25')} style={{ color: `hsl(${GOLD})` }} />)}</div>
              <blockquote className="mt-5 text-[15px] leading-relaxed">{tm.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-5">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden bg-[hsl(var(--primary))] text-sm font-extrabold text-[hsl(var(--primary-foreground))]">
                  {tm.avatarUrl ? <Media src={tm.avatarUrl} alt={tm.clientName} /> : initials(tm.clientName)}
                </span>
                <span><span className="block font-extrabold">{tm.clientName}</span><span className="text-sm text-[hsl(var(--muted-foreground))]">{tm.role}</span></span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection({ gallery, kit }: { gallery: GalleryItem[]; kit: Kit }) {
  const items = sortByOrder(gallery).filter((g) => g.imageUrl);
  if (items.length === 0) return null;
  return (
    <section id="gallery" className="bg-[hsl(var(--card))] py-24">
      <div className={container}>
        <Title eyebrow={kit.t('public.tpl.inPractice')} title={kit.t('public.gallery.heading')} kit={kit} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((g, i) => (
            <motion.figure key={g.id} {...kit.reveal({ y: 20, delay: (i % 3) * 0.06 })} className="group">
              <div className="aspect-[4/3] overflow-hidden"><Media src={g.imageUrl} alt={g.title} className="transition-transform duration-700 group-hover:scale-105" /></div>
              <figcaption className="mt-2 text-sm font-semibold">{g.title}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  const { field, onSubmit } = useContactForm(portfolio.email, kit.t);
  const socials = socialEntries(portfolio.socialLinks);
  const input = 'w-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none transition-colors focus:border-[hsl(var(--primary))]';
  return (
    <section id="contact" className="py-24">
      <div className={cn(container, 'grid overflow-hidden lg:grid-cols-2')}>
        <motion.div {...kit.reveal({ x: -30 })} className="bg-[hsl(215_45%_12%)] p-10 text-white dark:bg-[hsl(var(--card))] sm:p-12">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: `hsl(${GOLD})` }}><span className="h-px w-8" style={{ background: `hsl(${GOLD})` }} />{kit.t('sections.contact')}</p>
          <h2 style={DISPLAY_FONT} className="mt-5 text-4xl font-extrabold leading-tight">{kit.t('public.tpl.discussNeeds')}</h2>
          <p className="mt-4 leading-relaxed text-white/70">{kit.t('public.contact.description')}</p>
          <ul className="mt-10 space-y-4 text-sm">
            {portfolio.email && <li className="flex items-center gap-3"><Mail className="h-4 w-4" style={{ color: `hsl(${GOLD})` }} /><a href={`mailto:${portfolio.email}`} dir="ltr" className="break-all hover:underline">{portfolio.email}</a></li>}
            {portfolio.location && <li className="flex items-center gap-3"><MapPin className="h-4 w-4" style={{ color: `hsl(${GOLD})` }} />{portfolio.location}</li>}
          </ul>
          {socials.length > 0 && <div className="mt-10 flex gap-3">{socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:border-white">{getSocialIcon(k)}</a>)}</div>}
        </motion.div>
        <motion.form {...kit.reveal({ x: 30 })} onSubmit={onSubmit} className="space-y-4 border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 sm:p-12">
          <input {...field('name')} placeholder={kit.t('public.contact.namePlaceholder')} className={input} />
          <input {...field('email')} type="email" placeholder={kit.t('public.contact.emailPlaceholder')} className={input} />
          <textarea {...field('message')} rows={5} placeholder={kit.t('public.contact.messagePlaceholder')} className={cn(input, 'resize-none')} />
          <button type="submit" disabled={!portfolio.email} className="inline-flex w-full items-center justify-center gap-2 bg-[hsl(var(--primary))] px-6 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50">
            {kit.t('public.contact.send')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </motion.form>
      </div>
      <footer className={cn(container, 'mt-20 flex flex-wrap justify-between gap-3 border-t border-[hsl(var(--border))] pt-6 text-sm text-[hsl(var(--muted-foreground))]')}>
        <span>© {new Date().getFullYear()} {portfolio.fullName}</span>
        <span>{kit.t('public.footer.rights')}</span>
      </footer>
    </section>
  );
}

export default function ExecutiveTemplate(props: TemplateContentProps) {
  const kit = useTemplateKit(props, LOOK);
  const { portfolio, visibleSections, embedded } = props;
  const years = yearsOfExperience(props.experiences.map((e) => e.startDate));
  const projectCount = publishedProjects(props.projects).length;
  const stats = [
    years > 0 && { value: years, suffix: '+', label: kit.t('public.stats.yearsExperience') },
    projectCount > 0 && { value: projectCount, label: kit.t('public.stats.projectsCompleted') },
    props.certifications.length > 0 && { value: props.certifications.length, label: kit.t('public.stats.certifications') },
    props.testimonials.length > 0 && { value: props.testimonials.length, label: kit.t('public.stats.testimonials') },
  ].filter(Boolean) as { value: number; suffix?: string; label: string }[];
  const next = visibleSections.find((s) => s === 'experience' || s === 'projects' || s === 'services');

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={kit.style}>
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} kit={kit} />
        <main>
          <Sections
            order={visibleSections}
            render={{
              hero: () => (
                <>
                  <Hero portfolio={portfolio} years={years} kit={kit} next={next} />
                  <StatsBand stats={stats} kit={kit} />
                </>
              ),
              about: () => <About portfolio={portfolio} years={years} kit={kit} />,
              projects: () => <CaseStudies projects={props.projects} kit={kit} />,
              experience: () => <ExperienceSection experiences={props.experiences} kit={kit} />,
              skills: () => <Expertise skills={props.skills} kit={kit} />,
              services: () => <Engagements services={props.services} kit={kit} />,
              certifications: () => <Credentials certifications={props.certifications} kit={kit} />,
              testimonials: () => <Perspectives testimonials={props.testimonials} kit={kit} />,
              gallery: () => <GallerySection gallery={props.gallery} kit={kit} />,
              contact: () => <Contact portfolio={portfolio} kit={kit} />,
            }}
          />
        </main>
      </div>
    </MotionConfig>
  );
}
