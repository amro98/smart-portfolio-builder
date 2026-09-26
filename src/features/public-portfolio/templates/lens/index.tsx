import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { DISPLAY_FONT, yearOf } from '../theme';
import { useLockScroll, useScrollY } from '../nav-utils';
import {
  experienceRange, groupSkills, initials, projectLink, publishedProjects, useTemplateKit, useTemplateNav,
  type Kit, type TemplateLook,
} from '../kit';
import { Media, Sections } from '../kit-ui';
import type { Certification, Experience, GalleryItem, Portfolio, Project, SectionId, Service, Skill, Testimonial } from '@/types';

// LENS — image-first and cinematic: a full-bleed hero slideshow with slow Ken Burns motion
// and a frame counter, an overlay nav with a full-screen index, a masonry gallery with a
// keyboard-navigable lightbox, full-width project "series" revealed with clip-path, and a
// quote set over a dimmed image. Type is a thin high-contrast serif with wide tracking.

const LOOK: TemplateLook = {
  skins: {
    dark: { signatureAccent: '40 45% 78%', background: '0 0% 4%', surface: '0 0% 8%', foreground: '40 22% 94%', muted: '40 6% 60%', border: '0 0% 16%' },
    light: { signatureAccent: '24 28% 36%', background: '40 20% 96%', surface: '40 14% 91%', foreground: '0 0% 8%', muted: '0 0% 40%', border: '0 0% 84%' },
  },
  fonts: { display: "'Bodoni Moda', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
};
const track = 'text-[11px] font-medium uppercase tracking-[0.32em]';

function Frame({ src, alt, className, eager }: { src?: string; alt: string; className?: string; eager?: boolean }) {
  if (src) return <Media src={src} alt={alt} eager={eager} className={className} />;
  // A designed "unexposed frame" when there is no image yet.
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_30%_30%,hsl(var(--primary)/0.35),transparent_60%),radial-gradient(ellipse_at_80%_80%,hsl(var(--primary)/0.15),transparent_55%)] bg-[hsl(var(--card))]', className)}>
      <div className="absolute inset-4 border border-[hsl(var(--foreground)/0.15)]" />
      <span style={DISPLAY_FONT} className="absolute inset-0 flex items-center justify-center text-5xl italic text-[hsl(var(--foreground)/0.35)]">{initials(alt) || '—'}</span>
    </div>
  );
}

function Nav({ portfolio, visibleSections, embedded, kit }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean; kit: Kit }) {
  const nav = useTemplateNav(visibleSections, embedded);
  const solid = useScrollY(80) || embedded;
  return (
    <>
      <header className={cn(embedded ? 'absolute' : 'fixed', 'inset-x-0 top-0 z-50 transition-colors duration-500', solid ? 'bg-[hsl(var(--background)/0.9)] backdrop-blur' : 'bg-gradient-to-b from-black/60 to-transparent')}>
        <div className={cn('flex h-16 items-center gap-5 px-5 sm:px-10', solid ? 'text-[hsl(var(--foreground))]' : 'text-white')}>
          <button onClick={() => nav.go('hero')} className={cn(track, 'me-auto truncate')}>{portfolio.fullName}</button>
          <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
          <button onClick={() => nav.setOpen(true)} className={cn(track, 'flex items-center gap-3')} aria-label={kit.t('public.nav.openMenu')}>
            {kit.t('public.nav.menu')}
            <span className="flex flex-col gap-1.5"><span className="h-px w-7 bg-current" /><span className="h-px w-5 self-end bg-current" /></span>
          </button>
        </div>
      </header>
      <AnimatePresence>
        {nav.open && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className={cn(embedded ? 'absolute' : 'fixed', 'inset-0 z-[60] flex h-[100dvh] flex-col bg-[hsl(var(--background))] px-6 py-5 sm:px-10')}
          >
            <div className="flex items-center justify-between">
              <span className={track}>{portfolio.fullName}</span>
              <button onClick={() => nav.setOpen(false)} aria-label={kit.t('public.nav.closeMenu')}><X className="h-7 w-7" /></button>
            </div>
            <nav className="my-auto space-y-2 overflow-y-auto py-6">
              {nav.sections.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  onClick={() => nav.go(s)}
                  className="group flex w-full items-baseline gap-5 text-start"
                >
                  <span className={cn(track, 'w-8 text-[hsl(var(--muted-foreground))]')}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={DISPLAY_FONT} className="text-[clamp(2.2rem,7vw,5rem)] italic leading-tight transition-colors group-hover:text-[hsl(var(--primary))]">{kit.t(`sections.${s}`)}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero({ portfolio, slides, kit }: { portfolio: Portfolio; slides: string[]; kit: Kit }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  useEffect(() => {
    if (!kit.animate || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => window.clearInterval(id);
  }, [kit.animate, count]);
  return (
    <section id="hero" className="relative h-[100svh] min-h-[560px] overflow-hidden bg-black text-white">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
        >
          <motion.div className="h-full w-full" initial={{ scale: kit.animate ? 1.12 : 1 }} animate={{ scale: 1 }} transition={{ duration: 7, ease: 'linear' }}>
            <Frame src={slides[index]} alt={portfolio.fullName} eager />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-8 px-5 pb-10 sm:px-10 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.p {...kit.reveal({ y: 16, delay: 0.3 })} className={cn(track, 'text-white/70')}>{portfolio.title}</motion.p>
          <motion.h1 {...kit.reveal({ y: 40, delay: 0.15, duration: 1.2 })} style={DISPLAY_FONT} className="mt-3 text-[clamp(3rem,9vw,8.5rem)] font-normal leading-[0.9] tracking-[-0.02em]">
            {portfolio.fullName}
          </motion.h1>
          {portfolio.location && <motion.p {...kit.reveal({ y: 16, delay: 0.4 })} style={DISPLAY_FONT} className="mt-4 text-xl italic text-white/75">{portfolio.location}</motion.p>}
        </div>
        {count > 1 && (
          <div className="flex items-center gap-4" dir="ltr">
            <span className={cn(track, 'tabular-nums')}>{String(index + 1).padStart(2, '0')}</span>
            <span className="relative h-px w-28 overflow-hidden bg-white/25">
              <motion.span key={index} className="absolute inset-y-0 left-0 bg-white" initial={{ width: 0 }} animate={{ width: kit.animate ? '100%' : `${((index + 1) / count) * 100}%` }} transition={{ duration: kit.animate ? 5.5 : 0.3, ease: 'linear' }} />
            </span>
            <span className={cn(track, 'tabular-nums text-white/60')}>{String(count).padStart(2, '0')}</span>
            <button onClick={() => setIndex((i) => (i - 1 + count) % count)} aria-label="previous" className="ms-2 rounded-full border border-white/30 p-2 hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setIndex((i) => (i + 1) % count)} aria-label="next" className="rounded-full border border-white/30 p-2 hover:bg-white/10"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </section>
  );
}

function Lightbox({ items, index, onClose, onNav, kit }: { items: GalleryItem[]; index: number; onClose: () => void; onNav: (dir: 1 | -1) => void; kit: Kit }) {
  useLockScroll(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(kit.dir === 'rtl' ? -1 : 1);
      if (e.key === 'ArrowLeft') onNav(kit.dir === 'rtl' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNav, kit.dir]);
  const item = items[index];
  return (
    <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex flex-col bg-black/95 text-white">
      <div className="flex items-center justify-between px-5 py-4">
        <span className={cn(track, 'tabular-nums')} dir="ltr">{index + 1} / {items.length}</span>
        <button onClick={onClose} aria-label={kit.t('public.projects.close')}><X className="h-7 w-7" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
        <motion.div key={item.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="h-full max-h-[78vh] w-full max-w-5xl">
          <Media src={item.imageUrl} alt={item.title} className="!object-contain" />
        </motion.div>
        <button onClick={() => onNav(-1)} aria-label={kit.t('public.testimonials.prev')} className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 p-3 hover:bg-white/10"><ChevronLeft className="h-5 w-5 rtl:rotate-180" /></button>
        <button onClick={() => onNav(1)} aria-label={kit.t('public.testimonials.next')} className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 p-3 hover:bg-white/10"><ChevronRight className="h-5 w-5 rtl:rotate-180" /></button>
      </div>
      <p style={DISPLAY_FONT} className="px-5 py-6 text-center text-xl italic">{item.title}{item.category && <span className={cn(track, 'ms-4 not-italic text-white/50')}>{item.category}</span>}</p>
    </motion.div>
  );
}

function GallerySection({ gallery, kit }: { gallery: GalleryItem[]; kit: Kit }) {
  const items = useMemo(() => sortByOrder(gallery).filter((g) => g.imageUrl), [gallery]);
  const [open, setOpen] = useState<number | null>(null);
  const onNav = useCallback((d: 1 | -1) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);
  if (items.length === 0) return null;
  return (
    <section id="gallery" className="px-3 py-24 sm:px-6">
      <SectionLabel title={kit.t('public.gallery.heading')} count={items.length} kit={kit} />
      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 [&>*]:mb-3">
        {items.map((g, i) => (
          <motion.button key={g.id} {...kit.reveal({ y: 30, delay: (i % 3) * 0.06 })} onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden break-inside-avoid">
            <Media src={g.imageUrl} alt={g.title} className="h-auto transition-transform [transition-duration:1200ms] group-hover:scale-105" />
            <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-5 text-start text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
              <span style={DISPLAY_FONT} className="text-xl italic">{g.title}</span>
            </span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>{open !== null && <Lightbox items={items} index={open} onClose={() => setOpen(null)} onNav={onNav} kit={kit} />}</AnimatePresence>
    </section>
  );
}

function SectionLabel({ title, count, kit }: { title: string; count?: number; kit: Kit }) {
  return (
    <motion.div {...kit.reveal({ y: 20 })} className="mb-10 flex items-end justify-between gap-6 border-b border-[hsl(var(--border))] px-2 pb-5 sm:px-4">
      <h2 style={DISPLAY_FONT} className="text-[clamp(2.4rem,6vw,5rem)] font-normal italic leading-none">{title}</h2>
      {count !== undefined && <span className={cn(track, 'tabular-nums text-[hsl(var(--muted-foreground))]')}>{String(count).padStart(2, '0')}</span>}
    </motion.div>
  );
}

function Series({ projects, kit }: { projects: Project[]; kit: Kit }) {
  const items = publishedProjects(projects);
  if (items.length === 0) return null;
  return (
    <section id="projects" className="py-24">
      <div className="px-3 sm:px-6"><SectionLabel title={kit.t('public.tpl.series')} count={items.length} kit={kit} /></div>
      <div className="space-y-3 px-3 sm:px-6">
        {items.map((p, i) => {
          const link = projectLink(p);
          return (
            <motion.article key={p.id} {...kit.reveal({ clip: 'up', duration: 1.2 })} className="group relative h-[70vh] min-h-[380px] overflow-hidden">
              <Frame src={p.coverImage} alt={p.title} className="transition-transform [transition-duration:1600ms] group-hover:scale-[1.04]" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className={cn('absolute bottom-0 flex max-w-2xl flex-col gap-3 p-6 text-white sm:p-10', i % 2 === 0 ? 'start-0' : 'end-0 text-end')}>
                <span className={cn(track, 'text-white/70')}>{String(i + 1).padStart(2, '0')} — {[p.category, yearOf(p.date)].filter(Boolean).join(' · ')}</span>
                <h3 style={DISPLAY_FONT} className="text-[clamp(2rem,5vw,4rem)] leading-none">{p.title}</h3>
                {p.shortDescription && <p className="text-sm leading-relaxed text-white/80">{p.shortDescription}</p>}
                {link && <a href={link} target="_blank" rel="noopener noreferrer" className={cn(track, 'inline-flex w-fit items-center gap-2 border-b border-white/60 pb-1', i % 2 !== 0 && 'self-end')}>{kit.t('public.projects.viewWork')} <ArrowUpRight className="h-3.5 w-3.5" /></a>}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function About({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  const [quote, ...rest] = (portfolio.bio || '').trim().split(/(?<=[.!?؟])\s+/);
  return (
    <section id="about" className="mx-auto grid max-w-6xl gap-12 px-5 py-28 sm:px-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
      <motion.div {...kit.reveal({ clip: 'up', duration: 1.1 })} className="aspect-[3/4] overflow-hidden">
        <Frame src={portfolio.avatarUrl} alt={portfolio.fullName} className="grayscale" />
      </motion.div>
      <div>
        <p className={cn(track, 'text-[hsl(var(--primary))]')}>{kit.t('public.about.heading')}</p>
        {quote && <motion.p {...kit.reveal({ y: 24 })} style={DISPLAY_FONT} className="mt-6 text-[clamp(1.8rem,3.6vw,3rem)] italic leading-snug">{quote}</motion.p>}
        {rest.length > 0 && <motion.p {...kit.reveal({ y: 16, delay: 0.1 })} className="mt-6 leading-relaxed text-[hsl(var(--muted-foreground))]">{rest.join(' ')}</motion.p>}
        <p className={cn(track, 'mt-10 text-[hsl(var(--muted-foreground))]')}>{[portfolio.title, portfolio.location].filter(Boolean).join(' — ')}</p>
      </div>
    </section>
  );
}

function Sessions({ services, kit }: { services: Service[]; kit: Kit }) {
  const items = sortByOrder(services);
  if (items.length === 0) return null;
  return (
    <section id="services" className="mx-auto max-w-6xl px-5 py-24 sm:px-10">
      <SectionLabel title={kit.t('public.tpl.sessions')} kit={kit} />
      <ul className="divide-y divide-[hsl(var(--border))]">
        {items.map((s, i) => (
          <motion.li key={s.id} {...kit.reveal({ y: 16, delay: i * 0.05 })} className="grid gap-3 py-8 md:grid-cols-[1fr_1.4fr_auto] md:items-baseline md:gap-10">
            <h3 style={DISPLAY_FONT} className="text-3xl italic">{s.title}</h3>
            <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{s.description}{s.duration && <span className={cn(track, 'mt-2 block')}>{s.duration}</span>}</p>
            <div className="flex items-center gap-5 md:justify-end">
              {s.priceLabel && <span style={DISPLAY_FONT} className="text-2xl">{s.priceLabel}</span>}
              {s.ctaLink && <a href={s.ctaLink} target="_blank" rel="noopener noreferrer" aria-label={s.ctaLabel || s.title} className="rounded-full border border-[hsl(var(--border))] p-2.5 transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"><ArrowUpRight className="h-4 w-4" /></a>}
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function Quiet({ id, title, children, kit }: { id: SectionId; title: string; children: React.ReactNode; kit: Kit }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-20 sm:px-10">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <motion.h2 {...kit.reveal({ y: 16 })} style={DISPLAY_FONT} className="text-4xl italic">{title}</motion.h2>
        <motion.div {...kit.reveal({ y: 16, delay: 0.1 })}>{children}</motion.div>
      </div>
    </section>
  );
}

function ExperienceSection({ experiences, kit }: { experiences: Experience[]; kit: Kit }) {
  const items = sortByOrder(experiences);
  if (items.length === 0) return null;
  return (
    <Quiet id="experience" title={kit.t('public.tpl.clientsCommissions')} kit={kit}>
      <ul className="divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
        {items.map((e) => (
          <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
            <span><span className="font-medium">{e.role}</span><span className="text-[hsl(var(--muted-foreground))]"> — {e.company}</span></span>
            <span className={cn(track, 'text-[hsl(var(--muted-foreground))]')} dir="ltr">{experienceRange(e, kit.t('public.experience.present'))}</span>
          </li>
        ))}
      </ul>
    </Quiet>
  );
}

function Craft({ skills, kit }: { skills: Skill[]; kit: Kit }) {
  const groups = groupSkills(sortByOrder(skills), kit.t('public.skills.general'));
  if (groups.length === 0) return null;
  return (
    <Quiet id="skills" title={kit.t('public.tpl.craft')} kit={kit}>
      <div className="space-y-6">
        {groups.map(([cat, list]) => (
          <div key={cat}>
            <p className={cn(track, 'text-[hsl(var(--muted-foreground))]')}>{cat}</p>
            <p style={DISPLAY_FONT} className="mt-2 text-2xl leading-relaxed">{list.map((s) => s.name).join(' · ')}</p>
          </div>
        ))}
      </div>
    </Quiet>
  );
}

function Recognition({ certifications, kit }: { certifications: Certification[]; kit: Kit }) {
  const items = sortByOrder(certifications);
  if (items.length === 0) return null;
  return (
    <Quiet id="certifications" title={kit.t('public.tpl.recognition')} kit={kit}>
      <ul className="space-y-4">
        {items.map((c) => (
          <li key={c.id} className="flex items-baseline justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
            <span><span className="font-medium">{c.title}</span><span className="block text-sm text-[hsl(var(--muted-foreground))]">{c.institution}</span></span>
            <span className={cn(track, 'text-[hsl(var(--muted-foreground))]')}>{yearOf(c.issueDate)}</span>
          </li>
        ))}
      </ul>
    </Quiet>
  );
}

function Words({ testimonials, backdrop, kit }: { testimonials: Testimonial[]; backdrop?: string; kit: Kit }) {
  const items = sortByOrder(testimonials);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!kit.animate || items.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => window.clearInterval(id);
  }, [kit.animate, items.length]);
  if (items.length === 0) return null;
  const tm = items[index % items.length];
  return (
    <section id="testimonials" className="relative overflow-hidden py-32 text-white">
      <div className="absolute inset-0"><Frame src={backdrop} alt="" /></div>
      <div aria-hidden className="absolute inset-0 bg-black/75" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.figure key={tm.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.6 }}>
            <blockquote style={DISPLAY_FONT} className="text-[clamp(1.6rem,3.6vw,2.8rem)] italic leading-snug">“{tm.quote}”</blockquote>
            <figcaption className={cn(track, 'mt-8 text-white/70')}>{tm.clientName}{tm.role && ` — ${tm.role}`}</figcaption>
          </motion.figure>
        </AnimatePresence>
        {items.length > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {items.map((it, i) => <button key={it.id} onClick={() => setIndex(i)} aria-label={`${i + 1}`} className={cn('h-px w-8 transition-colors', i === index ? 'bg-white' : 'bg-white/30')} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function Contact({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  const { field, onSubmit } = useContactForm(portfolio.email, kit.t);
  const socials = socialEntries(portfolio.socialLinks);
  const input = 'w-full border-0 border-b border-[hsl(var(--border))] bg-transparent px-0 py-3 outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--foreground))]';
  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 pb-10 pt-28 sm:px-10">
      <motion.h2 {...kit.reveal({ y: 30 })} style={DISPLAY_FONT} className="text-[clamp(3rem,9vw,8rem)] italic leading-[0.9]">
        {portfolio.ctaLabel || kit.t('public.tpl.bookSession')}
      </motion.h2>
      <div className="mt-14 grid gap-14 md:grid-cols-2">
        <div>
          {portfolio.email && <a href={`mailto:${portfolio.email}`} dir="ltr" className="break-all text-xl underline decoration-1 underline-offset-8 hover:text-[hsl(var(--primary))]">{portfolio.email}</a>}
          {portfolio.location && <p className={cn(track, 'mt-6 text-[hsl(var(--muted-foreground))]')}>{portfolio.location}</p>}
          {socials.length > 0 && <div className="mt-8 flex gap-5">{socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">{getSocialIcon(k)}</a>)}</div>}
        </div>
        {portfolio.email && (
          <form onSubmit={onSubmit} className="space-y-3">
            <input {...field('name')} placeholder={kit.t('public.contact.namePlaceholder')} className={input} />
            <input {...field('email')} type="email" placeholder={kit.t('public.contact.emailPlaceholder')} className={input} />
            <textarea {...field('message')} rows={4} placeholder={kit.t('public.contact.messagePlaceholder')} className={cn(input, 'resize-none')} />
            <button type="submit" className={cn(track, 'mt-4 border border-[hsl(var(--foreground))] px-8 py-4 transition-colors hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]')}>{kit.t('public.contact.send')}</button>
          </form>
        )}
      </div>
      <footer className={cn(track, 'mt-24 flex flex-wrap justify-between gap-3 border-t border-[hsl(var(--border))] pt-6 text-[hsl(var(--muted-foreground))]')}>
        <span>© {new Date().getFullYear()} {portfolio.fullName}</span>
        <span>{kit.t('public.footer.rights')}</span>
      </footer>
    </section>
  );
}

export default function LensTemplate(props: TemplateContentProps) {
  const kit = useTemplateKit(props, LOOK);
  const { portfolio, visibleSections, embedded } = props;
  const slides = useMemo(() => {
    const urls = [
      portfolio.coverUrl,
      ...sortByOrder(props.gallery).map((g) => g.imageUrl),
      ...publishedProjects(props.projects).map((p) => p.coverImage),
    ].filter((u): u is string => !!u);
    const unique = [...new Set(urls)].slice(0, 6);
    return unique.length > 0 ? unique : [''];
  }, [portfolio.coverUrl, props.gallery, props.projects]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={kit.style}>
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} kit={kit} />
        <main>
          <Sections
            order={visibleSections}
            render={{
              hero: () => <Hero portfolio={portfolio} slides={slides} kit={kit} />,
              about: () => <About portfolio={portfolio} kit={kit} />,
              projects: () => <Series projects={props.projects} kit={kit} />,
              experience: () => <ExperienceSection experiences={props.experiences} kit={kit} />,
              skills: () => <Craft skills={props.skills} kit={kit} />,
              services: () => <Sessions services={props.services} kit={kit} />,
              certifications: () => <Recognition certifications={props.certifications} kit={kit} />,
              testimonials: () => <Words testimonials={props.testimonials} backdrop={slides[slides.length > 1 ? 1 : 0]} kit={kit} />,
              gallery: () => <GallerySection gallery={props.gallery} kit={kit} />,
              contact: () => <Contact portfolio={portfolio} kit={kit} />,
            }}
          />
        </main>
      </div>
    </MotionConfig>
  );
}
