import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowUpRight, Briefcase, Check, Copy, Layers, Mail, MapPin, Menu, Quote, Sparkles, Star, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { DISPLAY_FONT, firstName, yearOf, yearsOfExperience } from '../theme';
import { getTechIcon, readableBrandColor } from '../tech-icons';
import {
  experienceRange, groupSkills, initials, projectLink, publishedProjects, useTemplateKit, useTemplateNav,
  type Kit, type TemplateLook,
} from '../kit';
import { Media, Sections } from '../kit-ui';
import type { Certification, Experience, GalleryItem, Portfolio, Project, SectionId, Service, Skill, Testimonial } from '@/types';

// BENTO — a modular, dashboard-like personal site: a floating pill nav, a hero that IS a
// bento grid of mixed-size cards (intro, portrait, location, stats, "currently", socials,
// skills, copy-email), project mosaics with mixed spans, and every other section composed
// from tiles. Cards lift and glow slightly on hover.

const LOOK: TemplateLook = {
  skins: {
    light: { signatureAccent: '12 88% 56%', background: '60 5% 95%', surface: '0 0% 100%', foreground: '240 6% 10%', muted: '240 4% 46%', border: '240 6% 90%' },
    dark: { signatureAccent: '14 92% 62%', background: '240 6% 6%', surface: '240 5% 10%', foreground: '0 0% 96%', muted: '240 5% 65%', border: '240 4% 17%' },
  },
  fonts: { display: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
};
const container = 'mx-auto max-w-6xl px-4 sm:px-6';
const card = 'relative overflow-hidden rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))]';
const lift = 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_hsl(var(--primary)/0.45)]';

function Tile({ className, children, kit, delay = 0 }: { className?: string; children: React.ReactNode; kit: Kit; delay?: number }) {
  return (
    <motion.div {...kit.reveal({ y: 24, scale: 0.97, delay })} className={cn(card, lift, className)}>
      {children}
    </motion.div>
  );
}

function Label({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
      <Icon className="h-3.5 w-3.5" /> {children}
    </p>
  );
}

function SectionHead({ title, kit }: { title: string; kit: Kit }) {
  return (
    <motion.h2 {...kit.reveal({ y: 16 })} style={DISPLAY_FONT} className="mb-5 ps-2 text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight">
      {title}
      <span className="text-[hsl(var(--primary))]">.</span>
    </motion.h2>
  );
}

function Nav({ portfolio, visibleSections, embedded, kit }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean; kit: Kit }) {
  const nav = useTemplateNav(visibleSections, embedded);
  return (
    <header className={cn(embedded ? 'absolute' : 'fixed', 'inset-x-0 top-4 z-50 flex justify-center px-4')}>
      <div className="relative flex max-w-full items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.85)] p-1.5 shadow-lg backdrop-blur-xl">
        <button onClick={() => nav.go('hero')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--foreground))] text-xs font-bold text-[hsl(var(--background))]">{initials(portfolio.fullName)}</button>
        <nav className="hidden items-center md:flex">
          {nav.sections.slice(0, 5).map((s) => (
            <button key={s} onClick={() => nav.go(s)} className={cn('relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors', nav.active === s ? 'text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]')}>
              {nav.active === s && <motion.span layoutId="bento-pill" className="absolute inset-0 rounded-full bg-[hsl(var(--primary))]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{kit.t(`sections.${s}`)}</span>
            </button>
          ))}
        </nav>
        <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
        <button onClick={() => nav.setOpen(!nav.open)} className="flex h-9 w-9 items-center justify-center rounded-full md:hidden" aria-label={kit.t(nav.open ? 'public.nav.closeMenu' : 'public.nav.openMenu')}>
          {nav.open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <AnimatePresence>
          {nav.open && (
            <motion.nav initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} className="absolute inset-x-0 top-14 grid grid-cols-2 gap-2 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-xl md:hidden">
              {nav.sections.map((s) => (
                <button key={s} onClick={() => nav.go(s)} className="rounded-2xl bg-[hsl(var(--background))] px-4 py-3 text-start text-sm font-semibold">{kit.t(`sections.${s}`)}</button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function CopyEmail({ email, kit }: { email: string; kit: Kit }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(email).then(() => {
          setCopied(true);
          toast.success(kit.t('public.contact.copied'));
          window.setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary-foreground)/0.15)] px-4 py-2 text-sm font-semibold"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {kit.t('public.contact.copyEmail')}
    </button>
  );
}

function Hero({ portfolio, data, kit }: { portfolio: Portfolio; data: TemplateContentProps; kit: Kit }) {
  const years = yearsOfExperience(data.experiences.map((e) => e.startDate));
  const projects = publishedProjects(data.projects).length;
  const current = sortByOrder(data.experiences).find((e) => e.current) ?? sortByOrder(data.experiences)[0];
  const topSkills = sortByOrder(data.skills).slice(0, 8);
  const socials = socialEntries(portfolio.socialLinks);
  return (
    <section id="hero" className={cn(container, 'pb-10 pt-24')}>
      <div className="grid auto-rows-[minmax(150px,auto)] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Tile kit={kit} className="col-span-2 row-span-2 flex flex-col justify-between p-7 sm:p-9">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary)/0.12)] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]"><Sparkles className="h-3.5 w-3.5" />{portfolio.title}</span>
            <h1 style={DISPLAY_FONT} className="mt-6 text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight">
              {kit.t('public.hero.greeting')} <span className="text-[hsl(var(--primary))]">{firstName(portfolio.fullName)}</span>
            </h1>
            {portfolio.bio && <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-4">{portfolio.bio}</p>}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#projects" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--foreground))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--background))]">{kit.t('public.hero.viewWork')} <ArrowUpRight className="h-4 w-4" /></a>
            {portfolio.ctaLabel && portfolio.ctaLink && <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-5 py-2.5 text-sm font-semibold">{portfolio.ctaLabel}</a>}
          </div>
        </Tile>
        <Tile kit={kit} delay={0.05} className="row-span-2 min-h-[300px]">
          {portfolio.avatarUrl ? <Media src={portfolio.avatarUrl} alt={portfolio.fullName} eager className="absolute inset-0" /> : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.6)]"><span style={DISPLAY_FONT} className="text-6xl font-bold text-[hsl(var(--primary-foreground))]">{initials(portfolio.fullName)}</span></div>
          )}
        </Tile>
        <Tile kit={kit} delay={0.1} className="flex flex-col justify-between p-5">
          <Label icon={MapPin}>{kit.t('public.contact.location')}</Label>
          <div aria-hidden className="absolute inset-0 opacity-60 [background-image:radial-gradient(hsl(var(--muted-foreground)/0.35)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(circle_at_70%_60%,black,transparent_70%)]" />
          <span aria-hidden className="absolute end-[28%] top-[52%] h-3 w-3 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_0_6px_hsl(var(--primary)/0.25)]" />
          <p style={DISPLAY_FONT} className="relative text-lg font-bold leading-tight">{portfolio.location || '—'}</p>
        </Tile>
        <Tile kit={kit} delay={0.15} className="flex flex-col justify-between bg-[hsl(var(--foreground))] p-5 text-[hsl(var(--background))]">
          <Label icon={Zap}><span className="text-[hsl(var(--background)/0.7)]">{kit.t('public.tpl.byTheNumbers')}</span></Label>
          <div className="flex gap-5">
            {years > 0 && <div><p style={DISPLAY_FONT} className="text-3xl font-bold">{years}+</p><p className="text-[11px] opacity-70">{kit.t('public.stats.yearsExperience')}</p></div>}
            {projects > 0 && <div><p style={DISPLAY_FONT} className="text-3xl font-bold">{projects}</p><p className="text-[11px] opacity-70">{kit.t('sections.projects')}</p></div>}
          </div>
        </Tile>
        {current && (
          <Tile kit={kit} delay={0.2} className="col-span-2 flex flex-col justify-between p-5">
            <Label icon={Briefcase}>{kit.t(current.current ? 'public.tpl.currently' : 'public.tpl.latestRole')}</Label>
            <p style={DISPLAY_FONT} className="text-xl font-bold">{current.role} <span className="text-[hsl(var(--muted-foreground))]">@ {current.company}</span></p>
          </Tile>
        )}
        {topSkills.length > 0 && (
          <Tile kit={kit} delay={0.25} className={cn('flex flex-col justify-between gap-3 p-5', current ? 'col-span-2' : 'col-span-2 md:col-span-3')}>
            <Label icon={Layers}>{kit.t('public.skills.heading')}</Label>
            <div className="flex flex-wrap gap-2">
              {topSkills.map((s) => {
                const icon = getTechIcon(s.name);
                return (
                  <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm font-medium">
                    {icon && <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" style={{ fill: readableBrandColor(icon) }} aria-hidden><path d={icon.path} /></svg>}
                    {s.name}
                  </span>
                );
              })}
            </div>
          </Tile>
        )}
        {socials.length > 0 && (
          <Tile kit={kit} delay={0.3} className={cn('flex flex-col justify-between p-5', portfolio.email ? 'md:col-span-2' : 'col-span-2 md:col-span-4')}>
            <Label icon={Sparkles}>{kit.t('public.contact.social')}</Label>
            <div className="flex flex-wrap gap-2">
              {socials.slice(0, 4).map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--background))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]">{getSocialIcon(k)}</a>)}
            </div>
          </Tile>
        )}
        {portfolio.email && (
          <Tile kit={kit} delay={0.35} className={cn('flex flex-col justify-between gap-4 bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]', socials.length === 0 ? 'col-span-2 md:col-span-4' : 'md:col-span-2')}>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80"><Mail className="h-3.5 w-3.5" />{kit.t('public.tpl.sayHello')}</p>
            <CopyEmail email={portfolio.email} kit={kit} />
          </Tile>
        )}
      </div>
    </section>
  );
}

function About({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  return (
    <section id="about" className={cn(container, 'py-10')}>
      <SectionHead title={kit.t('public.about.heading')} kit={kit} />
      <Tile kit={kit} className="p-7 sm:p-10">
        <p className="whitespace-pre-line text-lg leading-relaxed">{portfolio.bio}</p>
      </Tile>
    </section>
  );
}

function ProjectsGrid({ projects, kit }: { projects: Project[]; kit: Kit }) {
  const items = publishedProjects(projects);
  if (items.length === 0) return null;
  const span = (i: number) => (i % 6 === 0 ? 'md:col-span-2 md:row-span-2' : i % 6 === 3 ? 'md:col-span-2' : '');
  return (
    <section id="projects" className={cn(container, 'py-10')}>
      <SectionHead title={kit.t('public.projects.selected')} kit={kit} />
      <div className="grid auto-rows-[260px] grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
        {items.map((p, i) => {
          const link = projectLink(p);
          const Wrapper = link ? 'a' : 'div';
          return (
            <motion.div key={p.id} {...kit.reveal({ y: 24, delay: (i % 4) * 0.05 })} className={cn('group', span(i))}>
              <Wrapper {...(link ? { href: link, target: '_blank', rel: 'noopener noreferrer' } : {})} className={cn(card, lift, 'flex h-full flex-col')}>
                <div className="relative min-h-0 flex-1 overflow-hidden bg-[hsl(var(--background))]">
                  {p.coverImage ? <Media src={p.coverImage} alt={p.title} className="transition-transform duration-700 group-hover:scale-105" /> : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.35),transparent_60%)]"><span style={DISPLAY_FONT} className="text-5xl font-bold text-[hsl(var(--primary))]">{initials(p.title)}</span></div>
                  )}
                  {link && <span className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--card))] opacity-0 shadow transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 style={DISPLAY_FONT} className="truncate font-bold">{p.title}</h3>
                    <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{p.shortDescription || p.category}</p>
                  </div>
                  {p.category && <span className="shrink-0 rounded-full bg-[hsl(var(--background))] px-2.5 py-1 text-[11px] font-semibold">{p.category}</span>}
                </div>
              </Wrapper>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function ExperienceGrid({ experiences, kit }: { experiences: Experience[]; kit: Kit }) {
  const items = sortByOrder(experiences);
  if (items.length === 0) return null;
  return (
    <section id="experience" className={cn(container, 'py-10')}>
      <SectionHead title={kit.t('public.experience.heading')} kit={kit} />
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {items.map((e, i) => (
          <Tile key={e.id} kit={kit} delay={(i % 2) * 0.05} className="flex gap-4 p-6">
            <span style={DISPLAY_FONT} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.12)] text-lg font-bold text-[hsl(var(--primary))]">{initials(e.company)}</span>
            <div className="min-w-0">
              <h3 style={DISPLAY_FONT} className="text-lg font-bold">{e.role}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{e.company} · <span dir="ltr">{experienceRange(e, kit.t('public.experience.present'))}</span></p>
              {e.description[0] && <p className="mt-2 text-sm leading-relaxed">{e.description[0]}</p>}
            </div>
          </Tile>
        ))}
      </div>
    </section>
  );
}

function SkillsGrid({ skills, kit }: { skills: Skill[]; kit: Kit }) {
  const groups = groupSkills(sortByOrder(skills), kit.t('public.skills.general'));
  if (groups.length === 0) return null;
  return (
    <section id="skills" className={cn(container, 'py-10')}>
      <SectionHead title={kit.t('public.skills.heading')} kit={kit} />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        {groups.map(([cat, list], i) => (
          <Tile key={cat} kit={kit} delay={(i % 3) * 0.05} className="p-6">
            <h3 style={DISPLAY_FONT} className="font-bold">{cat}</h3>
            <ul className="mt-4 space-y-3">
              {list.map((s) => (
                <li key={s.id} className="text-sm">
                  <div className="flex justify-between"><span className="font-medium">{s.name}</span><span className="text-[hsl(var(--muted-foreground))]">{s.proficiency}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-[hsl(var(--background))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${s.proficiency}%` }} /></div>
                </li>
              ))}
            </ul>
          </Tile>
        ))}
      </div>
    </section>
  );
}

function ServicesGrid({ services, kit }: { services: Service[]; kit: Kit }) {
  const items = sortByOrder(services);
  if (items.length === 0) return null;
  return (
    <section id="services" className={cn(container, 'py-10')}>
      <SectionHead title={kit.t('public.services.heading')} kit={kit} />
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {items.map((s, i) => (
          <Tile key={s.id} kit={kit} delay={(i % 3) * 0.05} className={cn('flex flex-col p-6', i === 0 && 'md:col-span-2')}>
            <div className="flex items-start justify-between gap-3">
              <h3 style={DISPLAY_FONT} className="text-xl font-bold">{s.title}</h3>
              {s.priceLabel && <span className="shrink-0 rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-bold text-[hsl(var(--primary-foreground))]">{s.priceLabel}</span>}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{s.description}</p>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">{s.duration}</span>
              {s.ctaLink && <a href={s.ctaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--primary))]">{s.ctaLabel || kit.t('public.hero.contactButton')}<ArrowUpRight className="h-4 w-4" /></a>}
            </div>
          </Tile>
        ))}
      </div>
    </section>
  );
}

function CertificationsGrid({ certifications, kit }: { certifications: Certification[]; kit: Kit }) {
  const items = sortByOrder(certifications);
  if (items.length === 0) return null;
  return (
    <section id="certifications" className={cn(container, 'py-10')}>
      <SectionHead title={kit.t('sections.certifications')} kit={kit} />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
        {items.map((c, i) => (
          <Tile key={c.id} kit={kit} delay={(i % 4) * 0.04} className="flex flex-col justify-between gap-6 p-5">
            <span className="text-xs font-bold text-[hsl(var(--primary))]">{yearOf(c.issueDate)}</span>
            <div>
              <h3 className="font-bold leading-snug">{c.title}</h3>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{c.institution}</p>
            </div>
          </Tile>
        ))}
      </div>
    </section>
  );
}

function TestimonialsGrid({ testimonials, kit }: { testimonials: Testimonial[]; kit: Kit }) {
  const items = sortByOrder(testimonials);
  if (items.length === 0) return null;
  return (
    <section id="testimonials" className={cn(container, 'py-10')}>
      <SectionHead title={kit.t('public.testimonials.heading')} kit={kit} />
      <div className="columns-1 gap-4 md:columns-3 [&>*]:mb-4">
        {items.map((tm, i) => (
          <Tile key={tm.id} kit={kit} delay={(i % 3) * 0.05} className="break-inside-avoid p-6">
            <Quote className="h-6 w-6 text-[hsl(var(--primary))]" />
            <p className="mt-3 text-[15px] leading-relaxed">{tm.quote}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span><span className="block text-sm font-bold">{tm.clientName}</span><span className="text-xs text-[hsl(var(--muted-foreground))]">{tm.role}</span></span>
              <span className="flex">{Array.from({ length: tm.rating || 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current text-[hsl(var(--primary))]" />)}</span>
            </div>
          </Tile>
        ))}
      </div>
    </section>
  );
}

function GalleryGrid({ gallery, kit }: { gallery: GalleryItem[]; kit: Kit }) {
  const items = sortByOrder(gallery).filter((g) => g.imageUrl);
  if (items.length === 0) return null;
  return (
    <section id="gallery" className={cn(container, 'py-10')}>
      <SectionHead title={kit.t('public.gallery.heading')} kit={kit} />
      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {items.map((g, i) => (
          <motion.figure key={g.id} {...kit.reveal({ scale: 0.95, delay: (i % 4) * 0.04 })} className={cn(card, lift, 'group', i % 5 === 0 && 'col-span-2 row-span-2', i % 5 === 3 && 'row-span-2')}>
            <Media src={g.imageUrl} alt={g.title} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
            <figcaption className="absolute bottom-3 start-3 rounded-full bg-[hsl(var(--card)/0.9)] px-3 py-1 text-xs font-semibold backdrop-blur">{g.title}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function Contact({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  const { field, onSubmit } = useContactForm(portfolio.email, kit.t);
  const input = 'w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]';
  return (
    <section id="contact" className={cn(container, 'pb-10 pt-10')}>
      <div className="grid gap-3 md:grid-cols-5 md:gap-4">
        <Tile kit={kit} className="flex flex-col justify-between gap-8 bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] md:col-span-2">
          <h2 style={DISPLAY_FONT} className="text-4xl font-bold leading-tight">{kit.t('public.contact.talkLine')}<span className="opacity-60">.</span></h2>
          <div className="space-y-3">
            <p className="opacity-85">{kit.t('public.contact.description')}</p>
            {portfolio.email && <a href={`mailto:${portfolio.email}`} dir="ltr" className="block break-all font-semibold underline underline-offset-4">{portfolio.email}</a>}
            {portfolio.email && <CopyEmail email={portfolio.email} kit={kit} />}
          </div>
        </Tile>
        <Tile kit={kit} delay={0.08} className="p-6 md:col-span-3 sm:p-8">
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <input {...field('name')} placeholder={kit.t('public.contact.namePlaceholder')} className={input} />
            <input {...field('email')} type="email" placeholder={kit.t('public.contact.emailPlaceholder')} className={input} />
            <textarea {...field('message')} rows={5} placeholder={kit.t('public.contact.messagePlaceholder')} className={cn(input, 'resize-none sm:col-span-2')} />
            <button type="submit" disabled={!portfolio.email} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--foreground))] px-6 py-3.5 text-sm font-semibold text-[hsl(var(--background))] disabled:opacity-50 sm:col-span-2">
              {kit.t('public.contact.send')} <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </Tile>
      </div>
      <footer className="mt-8 flex flex-wrap justify-between gap-3 px-2 text-xs text-[hsl(var(--muted-foreground))]">
        <span>© {new Date().getFullYear()} {portfolio.fullName}</span>
        <span>{kit.t('public.footer.rights')}</span>
      </footer>
    </section>
  );
}

export default function BentoTemplate(props: TemplateContentProps) {
  const kit = useTemplateKit(props, LOOK);
  const { portfolio, visibleSections, embedded } = props;
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={kit.style}>
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} kit={kit} />
        <main className="pb-6">
          <Sections
            order={visibleSections}
            render={{
              hero: () => <Hero portfolio={portfolio} data={props} kit={kit} />,
              about: () => <About portfolio={portfolio} kit={kit} />,
              projects: () => <ProjectsGrid projects={props.projects} kit={kit} />,
              experience: () => <ExperienceGrid experiences={props.experiences} kit={kit} />,
              skills: () => <SkillsGrid skills={props.skills} kit={kit} />,
              services: () => <ServicesGrid services={props.services} kit={kit} />,
              certifications: () => <CertificationsGrid certifications={props.certifications} kit={kit} />,
              testimonials: () => <TestimonialsGrid testimonials={props.testimonials} kit={kit} />,
              gallery: () => <GalleryGrid gallery={props.gallery} kit={kit} />,
              contact: () => <Contact portfolio={portfolio} kit={kit} />,
            }}
          />
        </main>
      </div>
    </MotionConfig>
  );
}
