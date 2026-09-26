import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  Activity, ArrowRight, ArrowUpRight, Award, Brain, Building2, CalendarCheck, Check, GraduationCap, HeartPulse, Mail, MapPin,
  Menu, Microscope, ShieldCheck, Star, Stethoscope, X,
} from 'lucide-react';
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

// CLINICAL — calm, trustworthy medical design: soft rounded surfaces, an animated ECG pulse
// line and plus-grid backdrop in the hero, floating availability cards, prominent
// qualification cards, icon-led service cards and patient reviews. Motion stays gentle.

const LOOK: TemplateLook = {
  skins: {
    light: { signatureAccent: '174 72% 32%', background: '180 30% 97%', surface: '0 0% 100%', foreground: '192 42% 12%', muted: '192 12% 40%', border: '186 22% 88%' },
    dark: { signatureAccent: '172 66% 48%', background: '196 36% 7%', surface: '196 30% 11%', foreground: '180 22% 94%', muted: '186 12% 66%', border: '196 24% 18%' },
  },
  fonts: { display: "'Plus Jakarta Sans', system-ui, sans-serif", body: "'Plus Jakarta Sans', system-ui, sans-serif" },
};
const container = 'mx-auto max-w-6xl px-5 sm:px-8';
const SERVICE_ICONS = [Stethoscope, HeartPulse, Activity, Brain, ShieldCheck, Microscope];

function Title({ kicker, title, kit, center }: { kicker: string; title: string; kit: Kit; center?: boolean }) {
  return (
    <motion.div {...kit.reveal({ y: 20 })} className={cn('mb-12', center && 'text-center')}>
      <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary)/0.1)] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]">
        <HeartPulse className="h-3.5 w-3.5" /> {kicker}
      </span>
      <h2 style={DISPLAY_FONT} className="mt-4 text-[clamp(1.9rem,3.6vw,2.8rem)] font-extrabold leading-tight tracking-tight">{title}</h2>
    </motion.div>
  );
}

/** A looping ECG trace. Static (fully drawn) when motion is off. */
function PulseLine({ animate, className }: { animate: boolean; className?: string }) {
  const d = 'M0 60 H180 L200 60 L215 30 L232 95 L250 10 L268 80 L282 60 H460 L478 60 L490 42 L505 78 L520 60 H760 L780 60 L795 25 L812 100 L830 15 L848 75 L862 60 H1200';
  return (
    <svg viewBox="0 0 1200 110" preserveAspectRatio="none" className={cn('pointer-events-none', className)} aria-hidden>
      <path d={d} fill="none" strokeWidth="2" style={{ stroke: 'hsl(var(--primary) / 0.18)' }} />
      <motion.path
        d={d}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ stroke: 'hsl(var(--primary))' }}
        initial={animate ? { pathLength: 0, pathOffset: 0 } : false}
        animate={animate ? { pathLength: [0, 0.25, 0.25], pathOffset: [0, 0.75, 1] } : undefined}
        transition={animate ? { duration: 3.2, repeat: Infinity, ease: 'linear' } : undefined}
      />
    </svg>
  );
}

function Nav({ portfolio, visibleSections, embedded, kit }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean; kit: Kit }) {
  const nav = useTemplateNav(visibleSections, embedded);
  const cta = portfolio.ctaLabel || kit.t('public.tpl.bookAppointment');
  return (
    <header className={cn(embedded ? 'absolute' : 'fixed', 'inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5')}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.92)] px-4 shadow-sm backdrop-blur">
        <button onClick={() => nav.go('hero')} className="me-auto flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Activity className="h-5 w-5" /></span>
          <span style={DISPLAY_FONT} className="truncate font-extrabold">{portfolio.fullName}</span>
        </button>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.sections.slice(0, 5).map((s) => (
            <button key={s} onClick={() => nav.go(s)} className={cn('rounded-lg px-3 py-2 text-sm font-semibold transition-colors', nav.active === s ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]')}>
              {kit.t(`sections.${s}`)}
            </button>
          ))}
        </nav>
        <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
        <a href="#contact" className="hidden items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] sm:inline-flex">
          <CalendarCheck className="h-4 w-4" /> {cta}
        </a>
        <button onClick={() => nav.setOpen(!nav.open)} className="lg:hidden" aria-label={kit.t(nav.open ? 'public.nav.closeMenu' : 'public.nav.openMenu')}>
          {nav.open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {nav.open && (
          <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mx-auto mt-2 grid max-w-6xl gap-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-lg lg:hidden">
            {nav.sections.map((s) => (
              <button key={s} onClick={() => nav.go(s)} className="rounded-xl px-4 py-3 text-start font-semibold hover:bg-[hsl(var(--primary)/0.08)]">{kit.t(`sections.${s}`)}</button>
            ))}
            <a href="#contact" onClick={() => nav.setOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 font-bold text-[hsl(var(--primary-foreground))]"><CalendarCheck className="h-4 w-4" />{cta}</a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ portfolio, stats, kit }: { portfolio: Portfolio; stats: { value: string; label: string }[]; kit: Kit }) {
  const cta = portfolio.ctaLabel || kit.t('public.tpl.bookAppointment');
  return (
    <section id="hero" className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.08)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <PulseLine animate={kit.animate} className="absolute inset-x-0 bottom-2 h-20 w-full opacity-70" />
      <div className={cn(container, 'relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]')}>
        <div>
          <motion.span {...kit.reveal({ y: 16 })} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--card))] px-4 py-1.5 text-sm font-semibold text-[hsl(var(--primary))]">
            <Stethoscope className="h-4 w-4" /> {portfolio.title}
          </motion.span>
          <motion.h1 {...kit.reveal({ y: 30, delay: 0.1 })} style={DISPLAY_FONT} className="mt-6 text-[clamp(2.6rem,5.6vw,4.6rem)] font-extrabold leading-[1.05] tracking-tight">
            {portfolio.fullName}
          </motion.h1>
          {portfolio.bio && <motion.p {...kit.reveal({ y: 20, delay: 0.2 })} className="mt-5 max-w-xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-4">{portfolio.bio}</motion.p>}
          <motion.div {...kit.reveal({ y: 20, delay: 0.3 })} className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3.5 font-bold text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.25)] transition-transform hover:-translate-y-0.5">
              <CalendarCheck className="h-5 w-5" /> {cta}
            </a>
            <a href="#services" className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3.5 font-bold transition-colors hover:border-[hsl(var(--primary))]">
              {kit.t('sections.services')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
          </motion.div>
          {stats.length > 0 && (
            <motion.dl {...kit.reveal({ y: 16, delay: 0.4 })} className="mt-10 flex flex-wrap gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3">
                  <dt className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{s.label}</dt>
                  <dd className="text-2xl font-extrabold text-[hsl(var(--primary))]">{s.value}</dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>
        <motion.div {...kit.reveal({ y: 40, delay: 0.2, duration: 1 })} className="relative mx-auto w-full max-w-md">
          <div aria-hidden className="absolute -inset-4 rounded-[2.5rem] border-2 border-dashed border-[hsl(var(--primary)/0.25)]" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-b from-[hsl(var(--primary)/0.25)] to-[hsl(var(--primary)/0.05)]">
            {portfolio.avatarUrl ? (
              <Media src={portfolio.avatarUrl} alt={portfolio.fullName} eager />
            ) : (
              <div className="flex h-full items-center justify-center"><span style={DISPLAY_FONT} className="text-8xl font-extrabold text-[hsl(var(--primary)/0.6)]">{initials(portfolio.fullName)}</span></div>
            )}
          </div>
          <motion.div
            animate={kit.animate ? { y: [0, -8, 0] } : undefined}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -start-6 top-10 flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-xl"
          >
            <span className="relative flex h-3 w-3"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative h-3 w-3 rounded-full bg-emerald-500" /></span>
            <span className="text-sm font-bold">{kit.t('public.tpl.acceptingPatients')}</span>
          </motion.div>
          {portfolio.location && (
            <motion.div
              animate={kit.animate ? { y: [0, 8, 0] } : undefined}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -end-4 bottom-10 flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-xl"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"><MapPin className="h-4 w-4" /></span>
              <span className="text-sm font-semibold">{portfolio.location}</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function About({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  return (
    <section id="about" className="py-20">
      <div className={container}>
        <motion.div {...kit.reveal({ y: 24 })} className="grid gap-10 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 sm:p-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"><HeartPulse className="h-7 w-7" /></span>
            <h2 style={DISPLAY_FONT} className="mt-6 text-3xl font-extrabold">{kit.t('public.tpl.patientCentered')}</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">{kit.t('public.about.heading')}</p>
          </div>
          <p className="whitespace-pre-line text-lg leading-[1.8] text-[hsl(var(--muted-foreground))]">{portfolio.bio}</p>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection({ services, kit }: { services: Service[]; kit: Kit }) {
  const items = sortByOrder(services);
  if (items.length === 0) return null;
  return (
    <section id="services" className="py-20">
      <div className={container}>
        <Title kicker={kit.t('public.tpl.care')} title={kit.t('public.tpl.treatments')} kit={kit} center />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
            return (
              <motion.article key={s.id} {...kit.reveal({ y: 24, delay: (i % 3) * 0.07 })} className="group flex flex-col rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.08)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] transition-colors group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary-foreground))]"><Icon className="h-6 w-6" /></span>
                <h3 className="mt-5 text-lg font-extrabold">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{s.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold">
                  {s.duration && <span className="rounded-full bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-[hsl(var(--primary))]">{s.duration}</span>}
                  {s.priceLabel && <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1">{s.priceLabel}</span>}
                </div>
                {s.ctaLink && <a href={s.ctaLink} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]">{s.ctaLabel || kit.t('public.tpl.bookAppointment')} <ArrowUpRight className="h-4 w-4" /></a>}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Qualifications({ certifications, kit }: { certifications: Certification[]; kit: Kit }) {
  const items = sortByOrder(certifications);
  if (items.length === 0) return null;
  return (
    <section id="certifications" className="bg-[hsl(var(--primary)/0.05)] py-20">
      <div className={container}>
        <Title kicker={kit.t('public.tpl.verified')} title={kit.t('public.tpl.qualificationsCerts')} kit={kit} />
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((c, i) => {
            const Icon = c.type === 'education' ? GraduationCap : Award;
            return (
              <motion.div key={c.id} {...kit.reveal({ y: 20, delay: (i % 2) * 0.07 })} className="flex gap-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Icon className="h-7 w-7" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold">{c.title}</h3>
                    {c.verificationUrl && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"><ShieldCheck className="h-3 w-3" /> {kit.t('public.tpl.verifiedBadge')}</span>}
                  </div>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{c.institution}{yearOf(c.issueDate) && ` · ${yearOf(c.issueDate)}`}</p>
                  {c.verificationUrl && <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]">{kit.t('public.certifications.viewCredential')} <ArrowUpRight className="h-3 w-3" /></a>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ExperienceSection({ experiences, kit }: { experiences: Experience[]; kit: Kit }) {
  const items = sortByOrder(experiences);
  if (items.length === 0) return null;
  return (
    <section id="experience" className="py-20">
      <div className={container}>
        <Title kicker={kit.t('public.tpl.practice')} title={kit.t('public.tpl.clinicalExperience')} kit={kit} />
        <div className="space-y-4">
          {items.map((e, i) => (
            <motion.article key={e.id} {...kit.reveal({ y: 20, delay: i * 0.05 })} className="grid gap-4 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:grid-cols-[auto_1fr_auto] sm:items-start">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"><Building2 className="h-6 w-6" /></span>
              <div>
                <h3 className="text-lg font-extrabold">{e.role}</h3>
                <p className="text-sm font-semibold text-[hsl(var(--primary))]">{[e.company, e.location].filter(Boolean).join(' · ')}</p>
                {e.description.length > 0 && (
                  <ul className="mt-3 grid gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                    {e.description.map((d, j) => <li key={j} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />{d}</li>)}
                  </ul>
                )}
              </div>
              <span className="w-fit rounded-full bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]" dir="ltr">{experienceRange(e, kit.t('public.experience.present'))}</span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Research({ projects, kit }: { projects: Project[]; kit: Kit }) {
  const items = publishedProjects(projects);
  if (items.length === 0) return null;
  return (
    <section id="projects" className="py-20">
      <div className={container}>
        <Title kicker={kit.t('public.tpl.work')} title={kit.t('public.tpl.researchCases')} kit={kit} />
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((p, i) => {
            const link = projectLink(p);
            return (
              <motion.article key={p.id} {...kit.reveal({ y: 20, delay: (i % 2) * 0.07 })} className="flex overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <div className="hidden w-40 shrink-0 bg-[hsl(var(--primary)/0.08)] sm:block">
                  {p.coverImage ? <Media src={p.coverImage} alt={p.title} /> : <div className="flex h-full items-center justify-center text-[hsl(var(--primary))]"><Microscope className="h-10 w-10" /></div>}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">{[p.category, yearOf(p.date)].filter(Boolean).join(' · ')}</p>
                  <h3 className="mt-2 text-lg font-extrabold leading-snug">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{p.shortDescription}</p>
                  {link && <a href={link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]">{kit.t('public.projects.details')} <ArrowUpRight className="h-4 w-4" /></a>}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Specialties({ skills, kit }: { skills: Skill[]; kit: Kit }) {
  const groups = groupSkills(sortByOrder(skills), kit.t('public.skills.general'));
  if (groups.length === 0) return null;
  return (
    <section id="skills" className="py-20">
      <div className={container}>
        <Title kicker={kit.t('public.tpl.expertise')} title={kit.t('public.tpl.specialties')} kit={kit} center />
        <div className="space-y-8">
          {groups.map(([cat, list]) => (
            <motion.div key={cat} {...kit.reveal({ y: 16 })} className="text-center">
              <p className="mb-3 text-sm font-bold text-[hsl(var(--muted-foreground))]">{cat}</p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {list.map((s) => <span key={s.id} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-semibold"><Check className="h-4 w-4 text-[hsl(var(--primary))]" />{s.name}</span>)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews({ testimonials, kit }: { testimonials: Testimonial[]; kit: Kit }) {
  const items = sortByOrder(testimonials);
  if (items.length === 0) return null;
  const avg = items.reduce((sum, t) => sum + (t.rating || 5), 0) / items.length;
  return (
    <section id="testimonials" className="py-20">
      <div className={container}>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Title kicker={kit.t('public.tpl.patientReviews')} title={kit.t('public.testimonials.heading')} kit={kit} />
          <motion.div {...kit.reveal({ y: 16 })} className="mb-12 flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3">
            <span className="text-3xl font-extrabold" dir="ltr">{avg.toFixed(1)}</span>
            <span><span className="flex">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={cn('h-4 w-4 text-amber-400', j < Math.round(avg) && 'fill-current')} />)}</span><span className="text-xs text-[hsl(var(--muted-foreground))]">{items.length} {kit.t('public.tpl.reviews')}</span></span>
          </motion.div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((tm, i) => (
            <motion.figure key={tm.id} {...kit.reveal({ y: 20, delay: (i % 3) * 0.07 })} className="flex flex-col rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <span className="flex">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={cn('h-4 w-4 text-amber-400', j < (tm.rating || 5) && 'fill-current')} />)}</span>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed">“{tm.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-bold text-[hsl(var(--primary))]">{tm.avatarUrl ? <Media src={tm.avatarUrl} alt={tm.clientName} /> : initials(tm.clientName)}</span>
                <span><span className="block text-sm font-bold">{tm.clientName}</span><span className="text-xs text-[hsl(var(--muted-foreground))]">{tm.role}</span></span>
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
    <section id="gallery" className="py-20">
      <div className={container}>
        <Title kicker={kit.t('public.tpl.inPractice')} title={kit.t('public.gallery.heading')} kit={kit} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((g, i) => (
            <motion.figure key={g.id} {...kit.reveal({ scale: 0.95, delay: (i % 4) * 0.05 })} className={cn('overflow-hidden rounded-3xl', i % 5 === 0 && 'col-span-2 row-span-2')}>
              <Media src={g.imageUrl} alt={g.title} className="aspect-square transition-transform duration-700 hover:scale-105" />
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
  const input = 'w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none transition-colors focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]';
  return (
    <section id="contact" className="py-20">
      <div className={container}>
        <motion.div {...kit.reveal({ y: 24 })} className="grid overflow-hidden rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] lg:grid-cols-2">
          <div className="relative overflow-hidden bg-[hsl(var(--primary))] p-10 text-[hsl(var(--primary-foreground))] sm:p-12">
            <PulseLine animate={kit.animate} className="absolute inset-x-0 bottom-6 h-16 w-full opacity-40 [&_path]:!stroke-current" />
            <CalendarCheck className="h-10 w-10 opacity-90" />
            <h2 style={DISPLAY_FONT} className="mt-6 text-3xl font-extrabold leading-tight">{portfolio.ctaLabel || kit.t('public.tpl.bookAppointment')}</h2>
            <p className="mt-3 opacity-85">{kit.t('public.contact.description')}</p>
            <ul className="relative mt-10 space-y-4 text-sm font-semibold">
              {portfolio.email && <li className="flex items-center gap-3"><Mail className="h-5 w-5" /><a href={`mailto:${portfolio.email}`} dir="ltr" className="break-all hover:underline">{portfolio.email}</a></li>}
              {portfolio.location && <li className="flex items-center gap-3"><MapPin className="h-5 w-5" />{portfolio.location}</li>}
            </ul>
            {socials.length > 0 && <div className="relative mt-8 flex gap-2">{socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25">{getSocialIcon(k)}</a>)}</div>}
          </div>
          <form onSubmit={onSubmit} className="space-y-4 p-10 sm:p-12">
            <input {...field('name')} placeholder={kit.t('public.contact.namePlaceholder')} className={input} />
            <input {...field('email')} type="email" placeholder={kit.t('public.contact.emailPlaceholder')} className={input} />
            <textarea {...field('message')} rows={5} placeholder={kit.t('public.contact.messagePlaceholder')} className={cn(input, 'resize-none')} />
            <button type="submit" disabled={!portfolio.email} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3.5 font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50">
              {kit.t('public.contact.send')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </form>
        </motion.div>
        <footer className="mt-12 flex flex-wrap justify-between gap-3 text-sm text-[hsl(var(--muted-foreground))]">
          <span>© {new Date().getFullYear()} {portfolio.fullName}</span>
          <span>{kit.t('public.footer.rights')}</span>
        </footer>
      </div>
    </section>
  );
}

export default function ClinicalTemplate(props: TemplateContentProps) {
  const kit = useTemplateKit(props, LOOK);
  const { portfolio, visibleSections, embedded } = props;
  const years = yearsOfExperience(props.experiences.map((e) => e.startDate));
  const stats = [
    years > 0 && { value: `${years}+`, label: kit.t('public.stats.yearsExperience') },
    props.certifications.length > 0 && { value: String(props.certifications.length), label: kit.t('public.stats.certifications') },
    props.testimonials.length > 0 && { value: String(props.testimonials.length), label: kit.t('public.tpl.patientReviews') },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={kit.style}>
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} kit={kit} />
        <main>
          <Sections
            order={visibleSections}
            render={{
              hero: () => <Hero portfolio={portfolio} stats={stats} kit={kit} />,
              about: () => <About portfolio={portfolio} kit={kit} />,
              projects: () => <Research projects={props.projects} kit={kit} />,
              experience: () => <ExperienceSection experiences={props.experiences} kit={kit} />,
              skills: () => <Specialties skills={props.skills} kit={kit} />,
              services: () => <ServicesSection services={props.services} kit={kit} />,
              certifications: () => <Qualifications certifications={props.certifications} kit={kit} />,
              testimonials: () => <Reviews testimonials={props.testimonials} kit={kit} />,
              gallery: () => <GallerySection gallery={props.gallery} kit={kit} />,
              contact: () => <Contact portfolio={portfolio} kit={kit} />,
            }}
          />
        </main>
      </div>
    </MotionConfig>
  );
}
