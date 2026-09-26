import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Award, Check, Heart, Mail, MapPin, Menu, Quote, Sparkles, Star, Target, TrendingUp, X } from 'lucide-react';
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

// COACH — warm, results-led and CTA-forward without being loud: a serif headline hero with a
// blob-masked portrait and floating result badges, a social-proof strip built from real
// reviews, "programs" as pricing cards, a prominent reviews wall, a numbered journey for
// experience, and a "ready to start?" band before the contact form.

const LOOK: TemplateLook = {
  skins: {
    light: { signatureAccent: '24 85% 50%', background: '36 60% 97%', surface: '0 0% 100%', foreground: '25 32% 12%', muted: '25 12% 40%', border: '30 30% 88%' },
    dark: { signatureAccent: '28 90% 58%', background: '25 25% 8%', surface: '25 20% 12%', foreground: '36 40% 94%', muted: '30 12% 66%', border: '25 16% 20%' },
  },
  fonts: { display: "'DM Serif Display', Georgia, serif", body: "'DM Sans', system-ui, sans-serif" },
};
const container = 'mx-auto max-w-6xl px-5 sm:px-8';
const BLOB = 'M421,302Q385,354,338,389Q291,424,229,426Q167,428,121,386Q75,344,56,283Q37,222,65,166Q93,110,146,76Q199,42,262,50Q325,58,375,99Q425,140,441,195Q457,250,421,302Z';

function Heading({ kicker, title, kit, center }: { kicker: string; title: string; kit: Kit; center?: boolean }) {
  return (
    <motion.div {...kit.reveal({ y: 24 })} className={cn('mb-12', center && 'mx-auto max-w-2xl text-center')}>
      <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[hsl(var(--primary))]"><Sparkles className="h-4 w-4" />{kicker}</p>
      <h2 style={DISPLAY_FONT} className="mt-3 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.05]">{title}</h2>
    </motion.div>
  );
}

function Stars({ n, className }: { n: number; className?: string }) {
  return <span className={cn('flex', className)}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-4 w-4 text-[hsl(var(--primary))]', i < n && 'fill-current')} />)}</span>;
}

function Nav({ portfolio, visibleSections, embedded, kit }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean; kit: Kit }) {
  const nav = useTemplateNav(visibleSections, embedded);
  const cta = portfolio.ctaLabel || kit.t('public.hero.contactButton');
  return (
    <header className={cn(embedded ? 'absolute' : 'fixed', 'inset-x-0 top-0 z-50 bg-[hsl(var(--background)/0.9)] backdrop-blur')}>
      <div className={cn(container, 'flex h-20 items-center gap-6')}>
        <button onClick={() => nav.go('hero')} style={DISPLAY_FONT} className="me-auto truncate text-2xl">{portfolio.fullName}</button>
        <nav className="hidden items-center gap-7 lg:flex">
          {nav.sections.slice(0, 5).map((s) => (
            <button key={s} onClick={() => nav.go(s)} className={cn('text-[15px] font-medium transition-colors', nav.active === s ? 'text-[hsl(var(--primary))]' : 'hover:text-[hsl(var(--primary))]')}>{kit.t(`sections.${s}`)}</button>
          ))}
        </nav>
        <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
        <a href="#contact" className="hidden rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.3)] transition-transform hover:-translate-y-0.5 sm:inline-flex">{cta}</a>
        <button onClick={() => nav.setOpen(true)} className="lg:hidden" aria-label={kit.t('public.nav.openMenu')}><Menu className="h-6 w-6" /></button>
      </div>
      <AnimatePresence>
        {nav.open && (
          <motion.div initial={{ x: kit.dir === 'rtl' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: kit.dir === 'rtl' ? '-100%' : '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }} className={cn(embedded ? 'absolute' : 'fixed', 'inset-y-0 end-0 z-50 flex h-[100dvh] w-[86%] max-w-sm flex-col bg-[hsl(var(--card))] p-6 shadow-2xl')}>
            <button onClick={() => nav.setOpen(false)} className="self-end" aria-label={kit.t('public.nav.closeMenu')}><X className="h-6 w-6" /></button>
            <nav className="mt-6 flex flex-col gap-1">
              {nav.sections.map((s) => <button key={s} onClick={() => nav.go(s)} style={DISPLAY_FONT} className="rounded-2xl px-3 py-3 text-start text-2xl hover:bg-[hsl(var(--primary)/0.08)]">{kit.t(`sections.${s}`)}</button>)}
            </nav>
            <a href="#contact" onClick={() => nav.setOpen(false)} className="mt-auto rounded-full bg-[hsl(var(--primary))] py-4 text-center font-bold text-[hsl(var(--primary-foreground))]">{cta}</a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ portfolio, testimonials, years, kit }: { portfolio: Portfolio; testimonials: Testimonial[]; years: number; kit: Kit }) {
  const reviews = sortByOrder(testimonials);
  const avg = reviews.length ? reviews.reduce((s, t) => s + (t.rating || 5), 0) / reviews.length : 0;
  const cta = portfolio.ctaLabel || kit.t('public.hero.contactButton');
  return (
    <section id="hero" className="relative overflow-hidden pb-20 pt-32 lg:pt-36">
      <div aria-hidden className="absolute -top-40 end-[-10%] h-[520px] w-[520px] rounded-full bg-[hsl(var(--primary)/0.12)] blur-3xl" />
      <div className={cn(container, 'relative grid items-center gap-14 lg:grid-cols-2')}>
        <div>
          <motion.p {...kit.reveal({ y: 16 })} className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary)/0.12)] px-4 py-1.5 text-sm font-bold text-[hsl(var(--primary))]"><Heart className="h-4 w-4" />{portfolio.title}</motion.p>
          <motion.h1 {...kit.reveal({ y: 30, delay: 0.1 })} style={DISPLAY_FONT} className="mt-6 text-[clamp(3rem,6.4vw,5.4rem)] leading-[0.98]">
            {portfolio.fullName}
          </motion.h1>
          {portfolio.bio && <motion.p {...kit.reveal({ y: 20, delay: 0.2 })} className="mt-6 max-w-lg text-lg leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-4">{portfolio.bio}</motion.p>}
          <motion.div {...kit.reveal({ y: 20, delay: 0.3 })} className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-8 py-4 font-bold text-[hsl(var(--primary-foreground))] shadow-xl shadow-[hsl(var(--primary)/0.3)] transition-transform hover:-translate-y-0.5">{cta} <ArrowRight className="h-5 w-5 rtl:rotate-180" /></a>
            <a href="#services" className="inline-flex items-center gap-2 rounded-full px-4 py-4 font-bold underline decoration-[hsl(var(--primary))] decoration-2 underline-offset-8">{kit.t('public.tpl.programs')}</a>
          </motion.div>
          {reviews.length > 0 && (
            <motion.div {...kit.reveal({ y: 16, delay: 0.4 })} className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {reviews.slice(0, 4).map((r) => (
                  <span key={r.id} className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--primary)/0.2)] text-xs font-bold">{r.avatarUrl ? <Media src={r.avatarUrl} alt={r.clientName} /> : initials(r.clientName)}</span>
                ))}
              </div>
              <div>
                <Stars n={Math.round(avg)} />
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]"><span className="font-bold text-[hsl(var(--foreground))]" dir="ltr">{avg.toFixed(1)}</span> · {reviews.length} {kit.t('public.tpl.reviews')}</p>
              </div>
            </motion.div>
          )}
        </div>
        <motion.div {...kit.reveal({ scale: 0.9, delay: 0.2, duration: 1 })} className="relative mx-auto w-full max-w-md">
          <svg viewBox="0 0 480 480" className="absolute inset-0 -z-0 h-full w-full" aria-hidden>
            <motion.path d={BLOB} style={{ fill: 'hsl(var(--primary) / 0.18)' }} animate={kit.animate ? { rotate: [0, 8, 0] } : undefined} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          </svg>
          <svg viewBox="0 0 480 480" className="relative w-full" aria-label={portfolio.fullName}>
            <defs><clipPath id="coach-blob"><path d={BLOB} transform="translate(20 10) scale(0.93)" /></clipPath></defs>
            <g clipPath="url(#coach-blob)">
              <rect width="480" height="480" style={{ fill: 'hsl(var(--primary))' }} />
              {portfolio.avatarUrl ? (
                <foreignObject width="480" height="480"><Media src={portfolio.avatarUrl} alt={portfolio.fullName} eager /></foreignObject>
              ) : (
                <text x="240" y="275" textAnchor="middle" style={{ ...DISPLAY_FONT, fill: 'hsl(var(--primary-foreground))', fontSize: 120 }}>{initials(portfolio.fullName)}</text>
              )}
            </g>
          </svg>
          {years > 0 && (
            <motion.div animate={kit.animate ? { y: [0, -10, 0] } : undefined} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -start-2 top-12 flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] px-4 py-3 shadow-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"><TrendingUp className="h-5 w-5" /></span>
              <span><span style={DISPLAY_FONT} className="block text-2xl leading-none">{years}+</span><span className="text-xs text-[hsl(var(--muted-foreground))]">{kit.t('public.stats.yearsExperience')}</span></span>
            </motion.div>
          )}
          {reviews.length > 0 && (
            <motion.div animate={kit.animate ? { y: [0, 10, 0] } : undefined} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute -end-2 bottom-14 flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] px-4 py-3 shadow-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"><Target className="h-5 w-5" /></span>
              <span><span style={DISPLAY_FONT} className="block text-2xl leading-none">{reviews.length}</span><span className="text-xs text-[hsl(var(--muted-foreground))]">{kit.t('public.tpl.happyClients')}</span></span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function About({ portfolio, skills, kit }: { portfolio: Portfolio; skills: Skill[]; kit: Kit }) {
  const [lead, ...rest] = (portfolio.bio || '').trim().split(/(?<=[.!?؟])\s+/);
  const values = sortByOrder(skills).slice(0, 4);
  return (
    <section id="about" className="py-24">
      <div className={cn(container, 'grid gap-12 lg:grid-cols-[1fr_1.1fr]')}>
        <Heading kicker={kit.t('public.tpl.myStory')} title={kit.t('public.about.heading')} kit={kit} />
        <div>
          {lead && <motion.p {...kit.reveal({ y: 20 })} style={DISPLAY_FONT} className="text-[clamp(1.6rem,2.8vw,2.2rem)] leading-snug">{lead}</motion.p>}
          {rest.length > 0 && <motion.p {...kit.reveal({ y: 20, delay: 0.1 })} className="mt-6 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">{rest.join(' ')}</motion.p>}
          {values.length > 0 && (
            <motion.ul {...kit.reveal({ y: 16, delay: 0.2 })} className="mt-8 grid gap-3 sm:grid-cols-2">
              {values.map((v) => <li key={v.id} className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] px-4 py-3 font-semibold"><Check className="h-5 w-5 shrink-0 text-[hsl(var(--primary))]" />{v.name}</li>)}
            </motion.ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Programs({ services, kit }: { services: Service[]; kit: Kit }) {
  const items = sortByOrder(services);
  if (items.length === 0) return null;
  const featured = items.length > 1 ? 1 : 0;
  return (
    <section id="services" className="bg-[hsl(var(--card))] py-24">
      <div className={container}>
        <Heading kicker={kit.t('public.tpl.workWithMe')} title={kit.t('public.tpl.programs')} kit={kit} center />
        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <motion.article key={s.id} {...kit.reveal({ y: 30, delay: (i % 3) * 0.08 })} className={cn('relative flex flex-col rounded-[2rem] p-8', i === featured ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-2xl shadow-[hsl(var(--primary)/0.3)] lg:-translate-y-4' : 'border border-[hsl(var(--border))] bg-[hsl(var(--background))]')}>
              {i === featured && <span className="absolute -top-3 start-8 rounded-full bg-[hsl(var(--foreground))] px-3 py-1 text-xs font-bold text-[hsl(var(--background))]">{kit.t('public.tpl.mostPopular')}</span>}
              <h3 style={DISPLAY_FONT} className="text-3xl">{s.title}</h3>
              {s.priceLabel && <p className="mt-4 text-4xl font-bold">{s.priceLabel}</p>}
              {s.duration && <p className={cn('mt-1 text-sm', i === featured ? 'opacity-80' : 'text-[hsl(var(--muted-foreground))]')}>{s.duration}</p>}
              <p className={cn('mt-5 flex-1 leading-relaxed', i === featured ? 'opacity-90' : 'text-[hsl(var(--muted-foreground))]')}>{s.description}</p>
              <a href={s.ctaLink || '#contact'} target={s.ctaLink ? '_blank' : undefined} rel="noopener noreferrer" className={cn('mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold transition-transform hover:-translate-y-0.5', i === featured ? 'bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]')}>
                {s.ctaLabel || kit.t('public.tpl.getStarted')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Results({ testimonials, kit }: { testimonials: Testimonial[]; kit: Kit }) {
  const items = sortByOrder(testimonials);
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const featured = items[index % items.length];
  const rest = items.filter((it) => it.id !== featured.id).slice(0, 3);
  return (
    <section id="testimonials" className="py-24">
      <div className={container}>
        <Heading kicker={kit.t('public.tpl.results')} title={kit.t('public.tpl.realStories')} kit={kit} />
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <AnimatePresence mode="wait">
            <motion.figure key={featured.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4 }} className="relative flex flex-col justify-between rounded-[2rem] bg-[hsl(var(--foreground))] p-10 text-[hsl(var(--background))]">
              <Quote className="h-12 w-12 text-[hsl(var(--primary))]" />
              <blockquote style={DISPLAY_FONT} className="mt-6 text-[clamp(1.5rem,2.6vw,2.2rem)] leading-snug">{featured.quote}</blockquote>
              <figcaption className="mt-8 flex items-center justify-between gap-4">
                <span><span className="block font-bold">{featured.clientName}</span><span className="text-sm opacity-70">{featured.role}</span></span>
                <Stars n={featured.rating || 5} />
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="grid gap-4">
            {rest.map((tm) => (
              <button key={tm.id} onClick={() => setIndex(items.indexOf(tm))} className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-start transition-colors hover:border-[hsl(var(--primary))]">
                <Stars n={tm.rating || 5} />
                <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed">{tm.quote}</p>
                <p className="mt-3 text-sm font-bold">{tm.clientName} <span className="font-normal text-[hsl(var(--muted-foreground))]">· {tm.role}</span></p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Journey({ experiences, kit }: { experiences: Experience[]; kit: Kit }) {
  const items = sortByOrder(experiences);
  if (items.length === 0) return null;
  return (
    <section id="experience" className="bg-[hsl(var(--card))] py-24">
      <div className={container}>
        <Heading kicker={kit.t('public.tpl.theJourney')} title={kit.t('public.experience.heading')} kit={kit} center />
        <ol className="relative grid gap-8 md:grid-cols-3">
          <span aria-hidden className="absolute inset-x-[16%] top-7 hidden h-0.5 bg-[hsl(var(--primary)/0.25)] md:block" />
          {items.map((e, i) => (
            <motion.li key={e.id} {...kit.reveal({ y: 24, delay: i * 0.08 })} className="relative text-center">
              <span style={DISPLAY_FONT} className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-2xl text-[hsl(var(--primary-foreground))] ring-8 ring-[hsl(var(--card))]">{i + 1}</span>
              <p className="mt-5 text-sm font-bold text-[hsl(var(--primary))]" dir="ltr">{experienceRange(e, kit.t('public.experience.present'))}</p>
              <h3 style={DISPLAY_FONT} className="mt-2 text-2xl">{e.role}</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{e.company}</p>
              {e.description[0] && <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{e.description[0]}</p>}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Stories({ projects, kit }: { projects: Project[]; kit: Kit }) {
  const items = publishedProjects(projects);
  if (items.length === 0) return null;
  return (
    <section id="projects" className="py-24">
      <div className={container}>
        <Heading kicker={kit.t('public.tpl.results')} title={kit.t('public.tpl.successStories')} kit={kit} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => {
            const link = projectLink(p);
            return (
              <motion.article key={p.id} {...kit.reveal({ y: 24, delay: (i % 3) * 0.07 })} className="group overflow-hidden rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <div className="aspect-[4/3] overflow-hidden bg-[hsl(var(--primary)/0.12)]">
                  {p.coverImage ? <Media src={p.coverImage} alt={p.title} className="transition-transform duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><span style={DISPLAY_FONT} className="text-6xl text-[hsl(var(--primary))]">{initials(p.title)}</span></div>}
                </div>
                <div className="p-6">
                  {p.category && <span className="rounded-full bg-[hsl(var(--primary)/0.12)] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]">{p.category}</span>}
                  <h3 style={DISPLAY_FONT} className="mt-3 text-2xl">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{p.shortDescription}</p>
                  {link && <a href={link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 font-bold text-[hsl(var(--primary))]">{kit.t('public.projects.details')} <ArrowUpRight className="h-4 w-4" /></a>}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Approach({ skills, kit }: { skills: Skill[]; kit: Kit }) {
  const groups = groupSkills(sortByOrder(skills), kit.t('public.skills.general'));
  if (groups.length === 0) return null;
  return (
    <section id="skills" className="py-24">
      <div className={cn(container, 'text-center')}>
        <Heading kicker={kit.t('public.tpl.howIWork')} title={kit.t('public.tpl.myApproach')} kit={kit} center />
        <div className="flex flex-wrap justify-center gap-3">
          {groups.flatMap(([, list]) => list).map((s, i) => (
            <motion.span key={s.id} {...kit.reveal({ scale: 0.8, delay: Math.min(i, 12) * 0.03 })} className={cn('rounded-full px-5 py-3 text-[15px] font-semibold', i % 3 === 0 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))]')}>{s.name}</motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Badges({ certifications, kit }: { certifications: Certification[]; kit: Kit }) {
  const items = sortByOrder(certifications);
  if (items.length === 0) return null;
  return (
    <section id="certifications" className="py-20">
      <div className={container}>
        <Heading kicker={kit.t('public.tpl.qualified')} title={kit.t('sections.certifications')} kit={kit} center />
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((c, i) => (
            <motion.div key={c.id} {...kit.reveal({ y: 16, delay: (i % 4) * 0.05 })} className="flex items-center gap-4 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2 pe-6 ps-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Award className="h-6 w-6" /></span>
              <span><span className="block font-bold">{c.title}</span><span className="text-sm text-[hsl(var(--muted-foreground))]">{c.institution} · {yearOf(c.issueDate)}</span></span>
            </motion.div>
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
        <Heading kicker={kit.t('public.tpl.moments')} title={kit.t('public.gallery.heading')} kit={kit} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((g, i) => (
            <motion.figure key={g.id} {...kit.reveal({ y: 20, delay: (i % 3) * 0.05 })} className={cn('overflow-hidden rounded-[1.75rem]', i % 4 === 0 && 'row-span-2')}>
              <Media src={g.imageUrl} alt={g.title} className="transition-transform duration-700 hover:scale-105" />
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
  const cta = portfolio.ctaLabel || kit.t('public.hero.contactButton');
  const input = 'w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-5 py-3.5 outline-none focus:border-[hsl(var(--primary))]';
  return (
    <section id="contact" className="pb-12 pt-20">
      <div className={container}>
        <motion.div {...kit.reveal({ y: 30 })} className="relative overflow-hidden rounded-[2.5rem] bg-[hsl(var(--primary))] px-8 py-14 text-center text-[hsl(var(--primary-foreground))] sm:px-16">
          <div aria-hidden className="absolute -start-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-20 -end-10 h-64 w-64 rounded-full bg-black/10" />
          <h2 style={DISPLAY_FONT} className="relative text-[clamp(2.4rem,5vw,4rem)] leading-tight">{kit.t('public.tpl.readyToStart')}</h2>
          <p className="relative mx-auto mt-4 max-w-xl opacity-90">{kit.t('public.contact.description')}</p>
          {portfolio.email && <a href={`mailto:${portfolio.email}`} className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary-foreground))] px-8 py-4 font-bold text-[hsl(var(--primary))] transition-transform hover:-translate-y-0.5">{cta} <ArrowRight className="h-5 w-5 rtl:rotate-180" /></a>}
        </motion.div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div {...kit.reveal({ y: 20 })} className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
            <h3 style={DISPLAY_FONT} className="text-3xl">{kit.t('public.contact.subheading')}</h3>
            <ul className="mt-6 space-y-4">
              {portfolio.email && <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-[hsl(var(--primary))]" /><a href={`mailto:${portfolio.email}`} dir="ltr" className="break-all hover:underline">{portfolio.email}</a></li>}
              {portfolio.location && <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />{portfolio.location}</li>}
            </ul>
            {socials.length > 0 && <div className="mt-6 flex gap-2">{socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]">{getSocialIcon(k)}</a>)}</div>}
          </motion.div>
          <motion.form {...kit.reveal({ y: 20, delay: 0.08 })} onSubmit={onSubmit} className="grid gap-4 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 sm:grid-cols-2">
            <input {...field('name')} placeholder={kit.t('public.contact.namePlaceholder')} className={input} />
            <input {...field('email')} type="email" placeholder={kit.t('public.contact.emailPlaceholder')} className={input} />
            <textarea {...field('message')} rows={4} placeholder={kit.t('public.contact.messagePlaceholder')} className={cn(input, 'resize-none sm:col-span-2')} />
            <button type="submit" disabled={!portfolio.email} className="rounded-full bg-[hsl(var(--primary))] px-8 py-4 font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50 sm:col-span-2">{kit.t('public.contact.send')}</button>
          </motion.form>
        </div>
        <footer className="mt-12 flex flex-wrap justify-between gap-3 text-sm text-[hsl(var(--muted-foreground))]">
          <span>© {new Date().getFullYear()} {portfolio.fullName}</span>
          <span>{kit.t('public.footer.rights')}</span>
        </footer>
      </div>
    </section>
  );
}

export default function CoachTemplate(props: TemplateContentProps) {
  const kit = useTemplateKit(props, LOOK);
  const { portfolio, visibleSections, embedded } = props;
  const years = yearsOfExperience(props.experiences.map((e) => e.startDate));
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={kit.style}>
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} kit={kit} />
        <main>
          <Sections
            order={visibleSections}
            render={{
              hero: () => <Hero portfolio={portfolio} testimonials={props.testimonials} years={years} kit={kit} />,
              about: () => <About portfolio={portfolio} skills={props.skills} kit={kit} />,
              projects: () => <Stories projects={props.projects} kit={kit} />,
              experience: () => <Journey experiences={props.experiences} kit={kit} />,
              skills: () => <Approach skills={props.skills} kit={kit} />,
              services: () => <Programs services={props.services} kit={kit} />,
              certifications: () => <Badges certifications={props.certifications} kit={kit} />,
              testimonials: () => <Results testimonials={props.testimonials} kit={kit} />,
              gallery: () => <GallerySection gallery={props.gallery} kit={kit} />,
              contact: () => <Contact portfolio={portfolio} kit={kit} />,
            }}
          />
        </main>
      </div>
    </MotionConfig>
  );
}
