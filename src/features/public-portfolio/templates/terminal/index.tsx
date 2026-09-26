import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown, FolderGit2, GitCommitHorizontal, Github, Globe, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { yearOf, yearsOfExperience } from '../theme';
import {
  experienceRange, groupSkills, publishedProjects, useTemplateKit, useTemplateNav,
  type Kit, type TemplateLook,
} from '../kit';
import { Media, Sections } from '../kit-ui';
import type { Certification, Experience, GalleryItem, Portfolio, Project, SectionId, Service, Skill, Testimonial } from '@/types';

// TERMINAL — a code-editor/terminal silhouette that stays readable: window chrome with file
// tabs as navigation, a hero terminal session that types itself, a README.md about, repo
// cards for projects, a `git log` experience history, `skills.json` with bars, `--help`
// services, `ls` certifications and a prompt-style contact form. Mono is used for chrome and
// code; long-form text stays in a proportional face.

const LOOK: TemplateLook = {
  skins: {
    dark: { signatureAccent: '137 55% 50%', background: '215 28% 7%', surface: '215 22% 10%', foreground: '210 30% 92%', muted: '212 12% 62%', border: '215 16% 19%' },
    light: { signatureAccent: '142 64% 30%', background: '40 20% 97%', surface: '0 0% 100%', foreground: '215 30% 14%', muted: '215 10% 42%', border: '215 15% 86%' },
  },
  fonts: { display: "'JetBrains Mono', ui-monospace, monospace", body: "'Inter', system-ui, sans-serif" },
};
const MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } as const;
const container = 'mx-auto max-w-5xl px-4 sm:px-6';
const FILES: Record<SectionId, string> = {
  hero: '~',
  about: 'README.md',
  projects: 'projects/',
  experience: 'experience.log',
  skills: 'skills.json',
  services: 'services --help',
  certifications: 'certs/',
  testimonials: 'reviews.md',
  gallery: 'screenshots/',
  contact: 'contact.sh',
};
const LANG_COLORS = ['#3178c6', '#f1e05a', '#e34c26', '#3572A5', '#00ADD8', '#dea584', '#b07219', '#563d7c', '#41b883', '#f34b7d'];

function hashColor(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return LANG_COLORS[h % LANG_COLORS.length];
}
function shortHash(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
  return h.toString(16).padStart(7, '0').slice(0, 7);
}
function slugify(text: string) {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'project';
}

function Window({ title, children, className, kit, id }: { title: string; children: React.ReactNode; className?: string; kit: Kit; id?: SectionId }) {
  return (
    <motion.section id={id} {...kit.reveal({ y: 24 })} className={cn('overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_24px_60px_-40px_rgba(0,0,0,0.6)]', className)}>
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-2.5" dir="ltr">
        <span className="flex gap-1.5"><span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" /></span>
        <span style={MONO} className="truncate text-xs text-[hsl(var(--muted-foreground))]">{title}</span>
      </div>
      {children}
    </motion.section>
  );
}

function Prompt({ children, user }: { children: React.ReactNode; user: string }) {
  return (
    <p style={MONO} className="text-sm" dir="ltr">
      <span className="text-[hsl(var(--primary))]">{user}@portfolio</span>
      <span className="text-[hsl(var(--muted-foreground))]">:~$ </span>
      {children}
    </p>
  );
}

function Nav({ portfolio, visibleSections, embedded, kit }: { portfolio: Portfolio; visibleSections: SectionId[]; embedded?: boolean; kit: Kit }) {
  const nav = useTemplateNav(visibleSections, embedded);
  return (
    <header className={cn(embedded ? 'absolute' : 'fixed', 'inset-x-0 top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.95)] backdrop-blur')}>
      <div className="flex h-12 items-center gap-3 px-3 sm:px-4" dir="ltr">
        <span className="hidden gap-1.5 sm:flex"><span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" /></span>
        <button onClick={() => nav.go('hero')} style={MONO} className="shrink-0 text-sm font-semibold">
          <span className="text-[hsl(var(--primary))]">~/</span>{slugify(portfolio.fullName)}
        </button>
        <nav className="hidden min-w-0 [scrollbar-width:none] flex-1 items-stretch self-stretch overflow-x-auto md:flex">
          {nav.sections.map((s) => (
            <button key={s} onClick={() => nav.go(s)} style={MONO} className={cn('shrink-0 border-e border-[hsl(var(--border))] px-4 text-xs transition-colors first:border-s', nav.active === s ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-[inset_0_2px_0_hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]')}>
              {FILES[s]}
            </button>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
          <div className="relative md:hidden">
            <button onClick={() => nav.setOpen(!nav.open)} style={MONO} className="flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs" aria-expanded={nav.open}>
              files <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', nav.open && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {nav.open && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute end-0 top-10 w-56 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-xl">
                  {nav.sections.map((s) => (
                    <button key={s} onClick={() => nav.go(s)} style={MONO} className="block w-full rounded px-3 py-2 text-start text-xs hover:bg-[hsl(var(--background))]">{FILES[s]}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

interface Line { cmd: string; out: React.ReactNode }

function Hero({ portfolio, data, kit }: { portfolio: Portfolio; data: TemplateContentProps; kit: Kit }) {
  const user = slugify(portfolio.fullName.split(/\s+/)[0] ?? 'dev');
  const topSkills = sortByOrder(data.skills).slice(0, 8);
  const socials = socialEntries(portfolio.socialLinks);
  const lines: Line[] = useMemo(
    () =>
      [
        { cmd: 'whoami', out: <span className="text-2xl font-bold text-[hsl(var(--foreground))] sm:text-4xl" style={MONO}>{portfolio.fullName}</span> },
        { cmd: 'cat role.txt', out: <span className="text-[hsl(var(--primary))]">{portfolio.title}</span> },
        portfolio.location ? { cmd: 'echo $LOCATION', out: <span>{portfolio.location}</span> } : null,
        portfolio.bio ? { cmd: 'cat about.md', out: <span className="block max-w-2xl font-sans text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]" dir="auto">{portfolio.bio}</span> } : null,
        topSkills.length > 0 ? { cmd: 'ls ./stack', out: <span className="flex flex-wrap gap-x-5 gap-y-1">{topSkills.map((s) => <span key={s.id} style={{ color: hashColor(s.name) }}>{s.name}</span>)}</span> } : null,
        socials.length > 0 ? { cmd: 'ls ./links', out: <span className="flex flex-wrap gap-x-5 gap-y-1">{socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))] underline-offset-4 hover:underline">{k}/</a>)}</span> } : null,
      ].filter(Boolean) as Line[],
    [portfolio, topSkills, socials]
  );
  const [shown, setShown] = useState(kit.animate ? 0 : lines.length);
  useEffect(() => {
    if (!kit.animate) {
      setShown(lines.length);
      return;
    }
    if (shown >= lines.length) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), shown === 0 ? 350 : 520);
    return () => window.clearTimeout(id);
  }, [shown, lines.length, kit.animate]);

  return (
    <section id="hero" className={cn(container, 'flex min-h-[100svh] flex-col justify-center pb-14 pt-24')}>
      <Window title={`${user}@portfolio — zsh`} kit={kit}>
        <div className="space-y-4 p-5 sm:p-8" dir="ltr">
          {lines.slice(0, shown).map((l) => (
            <motion.div key={l.cmd} initial={kit.animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="space-y-1.5">
              <Prompt user={user}>{l.cmd}</Prompt>
              <div style={MONO} className="ps-0 text-sm sm:ps-4">{l.out}</div>
            </motion.div>
          ))}
          <Prompt user={user}><span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[hsl(var(--primary))]" /></Prompt>
        </div>
      </Window>
      <div className="mt-6 flex flex-wrap gap-3" dir="ltr">
        <a href="#projects" style={MONO} className="rounded-md bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))]">[ {kit.t('public.hero.viewWork')} ]</a>
        <a href="#contact" style={MONO} className="rounded-md border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-semibold hover:border-[hsl(var(--primary))]">[ {kit.t('public.hero.contactButton')} ]</a>
      </div>
    </section>
  );
}

function About({ portfolio, years, kit }: { portfolio: Portfolio; years: number; kit: Kit }) {
  return (
    <div className={cn(container, 'py-10')}>
      <Window id="about" title="README.md" kit={kit}>
        <article className="p-6 sm:p-8">
          <h2 style={MONO} className="text-2xl font-bold"><span className="text-[hsl(var(--muted-foreground))]"># </span>{portfolio.fullName}</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-[hsl(var(--muted-foreground))]">{portfolio.bio}</p>
          <h3 style={MONO} className="mt-8 font-bold"><span className="text-[hsl(var(--muted-foreground))]">## </span>{kit.t('public.tpl.quickFacts')}</h3>
          <ul style={MONO} className="mt-3 space-y-1.5 text-sm">
            <li><span className="text-[hsl(var(--primary))]">- </span>{kit.t('public.tpl.focus')}: <span className="text-[hsl(var(--muted-foreground))]">{portfolio.title}</span></li>
            {portfolio.location && <li><span className="text-[hsl(var(--primary))]">- </span>{kit.t('public.contact.location')}: <span className="text-[hsl(var(--muted-foreground))]">{portfolio.location}</span></li>}
            {years > 0 && <li><span className="text-[hsl(var(--primary))]">- </span>{kit.t('public.stats.yearsExperience')}: <span className="text-[hsl(var(--muted-foreground))]">{years}+</span></li>}
          </ul>
        </article>
      </Window>
    </div>
  );
}

function Repos({ projects, kit }: { projects: Project[]; kit: Kit }) {
  const items = publishedProjects(projects);
  if (items.length === 0) return null;
  return (
    <section id="projects" className={cn(container, 'py-10')}>
      <p style={MONO} className="mb-4 text-sm text-[hsl(var(--muted-foreground))]" dir="ltr"><span className="text-[hsl(var(--primary))]">$</span> ls ./projects <span className="opacity-60">— {items.length} repositories</span></p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((p, i) => (
          <motion.article key={p.id} {...kit.reveal({ y: 20, delay: (i % 2) * 0.06 })} className="group flex flex-col overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:border-[hsl(var(--primary)/0.6)]">
            {p.coverImage && <div className="aspect-[16/8] overflow-hidden border-b border-[hsl(var(--border))]"><Media src={p.coverImage} alt={p.title} className="transition-transform duration-500 group-hover:scale-[1.03]" /></div>}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2" dir="ltr">
                <FolderGit2 className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <h3 style={MONO} className="truncate font-semibold text-[hsl(var(--primary))]">{slugify(p.title)}</h3>
                {p.featured && <span className="ms-auto inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[11px] text-[hsl(var(--muted-foreground))]"><Star className="h-3 w-3" /> featured</span>}
              </div>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{p.title}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed">{p.shortDescription}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[hsl(var(--muted-foreground))]" dir="ltr">
                {p.tags.slice(0, 4).map((tag) => <span key={tag} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: hashColor(tag) }} />{tag}</span>)}
                <span className="ms-auto flex gap-3">
                  {p.repositoryUrl && <a href={p.repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label={kit.t('public.projects.code')} className="hover:text-[hsl(var(--foreground))]"><Github className="h-4 w-4" /></a>}
                  {(p.liveUrl || p.externalUrl) && <a href={p.liveUrl || p.externalUrl} target="_blank" rel="noopener noreferrer" aria-label={kit.t('public.projects.live')} className="hover:text-[hsl(var(--foreground))]"><Globe className="h-4 w-4" /></a>}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function GitLog({ experiences, kit }: { experiences: Experience[]; kit: Kit }) {
  const items = sortByOrder(experiences);
  if (items.length === 0) return null;
  return (
    <div className={cn(container, 'py-10')}>
      <Window id="experience" title="git log --career" kit={kit}>
        <ol className="space-y-7 p-5 sm:p-8">
          {items.map((e) => (
            <li key={e.id} className="relative ps-7">
              <GitCommitHorizontal className="absolute -start-1 top-0.5 h-5 w-5 text-[hsl(var(--primary))]" />
              <p style={MONO} className="text-xs text-amber-500" dir="ltr">commit {shortHash(e.id)} {e.current && <span className="text-[hsl(var(--primary))]">(HEAD → current)</span>}</p>
              <p style={MONO} className="mt-1 text-xs text-[hsl(var(--muted-foreground))]" dir="ltr">Date: {experienceRange(e, kit.t('public.experience.present'))}</p>
              <h3 className="mt-2 font-semibold">{e.role} <span className="text-[hsl(var(--muted-foreground))]">@ {e.company}</span></h3>
              {e.description.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {e.description.map((d, j) => <li key={j} className="flex gap-2"><span style={MONO} className="text-[hsl(var(--primary))]">+</span>{d}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </Window>
    </div>
  );
}

function SkillsJson({ skills, kit }: { skills: Skill[]; kit: Kit }) {
  const groups = groupSkills(sortByOrder(skills), kit.t('public.skills.general'));
  if (groups.length === 0) return null;
  const bar = (p: number) => {
    const filled = Math.round(p / 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  };
  return (
    <div className={cn(container, 'py-10')}>
      <Window id="skills" title="skills.json" kit={kit}>
        <div className="grid gap-0 md:grid-cols-2" dir="ltr">
          <pre style={MONO} className="overflow-x-auto border-b border-[hsl(var(--border))] p-5 text-sm leading-7 md:border-b-0 md:border-e sm:p-7">
            <span className="text-[hsl(var(--muted-foreground))]">{'{'}</span>
            {groups.map(([cat, list], gi) => (
              <span key={cat}>
                {'\n  '}<span className="text-sky-400">"{cat}"</span>: [
                {list.map((s, i) => (
                  <span key={s.id}>{'\n    '}<span className="text-amber-500">"{s.name}"</span>{i < list.length - 1 ? ',' : ''}</span>
                ))}
                {'\n  ]'}{gi < groups.length - 1 ? ',' : ''}
              </span>
            ))}
            {'\n'}<span className="text-[hsl(var(--muted-foreground))]">{'}'}</span>
          </pre>
          <ul style={MONO} className="space-y-2.5 p-5 text-sm sm:p-7">
            {sortByOrder(skills).slice(0, 12).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{s.name}</span>
                <span className="shrink-0 text-[hsl(var(--primary))]">{bar(s.proficiency)} <span className="text-[hsl(var(--muted-foreground))]">{String(s.proficiency).padStart(3, ' ')}%</span></span>
              </li>
            ))}
          </ul>
        </div>
      </Window>
    </div>
  );
}

function Help({ services, kit }: { services: Service[]; kit: Kit }) {
  const items = sortByOrder(services);
  if (items.length === 0) return null;
  return (
    <div className={cn(container, 'py-10')}>
      <Window id="services" title="services --help" kit={kit}>
        <div className="p-5 sm:p-8">
          <p style={MONO} className="text-sm text-[hsl(var(--muted-foreground))]" dir="ltr">USAGE: hire --service {'<name>'}</p>
          <p style={MONO} className="mt-5 text-sm font-semibold" dir="ltr">SERVICES:</p>
          <ul className="mt-3 space-y-5">
            {items.map((s) => (
              <li key={s.id} className="grid gap-1 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <span style={MONO} className="text-sm text-[hsl(var(--primary))]" dir="ltr">--{slugify(s.title)}</span>
                <span className="text-sm leading-relaxed">
                  <span className="font-semibold">{s.title}.</span> <span className="text-[hsl(var(--muted-foreground))]">{s.description}</span>
                  {(s.priceLabel || s.duration) && <span style={MONO} className="mt-1 block text-xs text-amber-500">{[s.priceLabel, s.duration].filter(Boolean).join(' · ')}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Window>
    </div>
  );
}

function Certs({ certifications, kit }: { certifications: Certification[]; kit: Kit }) {
  const items = sortByOrder(certifications);
  if (items.length === 0) return null;
  return (
    <div className={cn(container, 'py-10')}>
      <Window id="certifications" title="ls -la ./certs" kit={kit}>
        <ul style={MONO} className="divide-y divide-[hsl(var(--border))] text-sm">
          {items.map((c) => (
            <li key={c.id} className="grid grid-cols-[4rem_1fr] gap-3 px-5 py-3 sm:grid-cols-[7rem_4rem_1fr_auto] sm:px-8">
              <span className="hidden text-[hsl(var(--muted-foreground))] sm:block" dir="ltr">-rw-r--r--</span>
              <span className="text-amber-500">{yearOf(c.issueDate)}</span>
              <span className="min-w-0"><span className="font-semibold">{c.title}</span> <span className="text-[hsl(var(--muted-foreground))]">— {c.institution}</span></span>
              {c.verificationUrl && <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="col-start-2 text-[hsl(var(--primary))] hover:underline sm:col-start-auto">verify ↗</a>}
            </li>
          ))}
        </ul>
      </Window>
    </div>
  );
}

function Reviews({ testimonials, kit }: { testimonials: Testimonial[]; kit: Kit }) {
  const items = sortByOrder(testimonials);
  if (items.length === 0) return null;
  return (
    <section id="testimonials" className={cn(container, 'py-10')}>
      <p style={MONO} className="mb-4 text-sm text-[hsl(var(--muted-foreground))]" dir="ltr"><span className="text-[hsl(var(--primary))]">$</span> cat reviews.md</p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((tm, i) => (
          <motion.figure key={tm.id} {...kit.reveal({ y: 16, delay: (i % 2) * 0.06 })} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <p style={MONO} className="text-xs text-[hsl(var(--muted-foreground))]" dir="ltr">/**</p>
            <blockquote className="border-s-2 border-[hsl(var(--primary)/0.5)] py-1 ps-4 text-sm leading-relaxed">{tm.quote}</blockquote>
            <figcaption style={MONO} className="mt-1 text-xs text-[hsl(var(--muted-foreground))]"> * @author {tm.clientName}{tm.role && `, ${tm.role}`}<br /> */</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function Screens({ gallery, kit }: { gallery: GalleryItem[]; kit: Kit }) {
  const items = sortByOrder(gallery).filter((g) => g.imageUrl);
  if (items.length === 0) return null;
  return (
    <section id="gallery" className={cn(container, 'py-10')}>
      <p style={MONO} className="mb-4 text-sm text-[hsl(var(--muted-foreground))]" dir="ltr"><span className="text-[hsl(var(--primary))]">$</span> open ./screenshots</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((g, i) => (
          <motion.figure key={g.id} {...kit.reveal({ y: 16, delay: (i % 3) * 0.05 })} className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="aspect-[4/3] overflow-hidden"><Media src={g.imageUrl} alt={g.title} className="transition-transform duration-500 hover:scale-105" /></div>
            <figcaption style={MONO} className="truncate px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]" dir="ltr">{slugify(g.title)}.png</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function Contact({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  const { field, onSubmit } = useContactForm(portfolio.email, kit.t);
  const user = slugify(portfolio.fullName.split(/\s+/)[0] ?? 'dev');
  const socials = socialEntries(portfolio.socialLinks);
  const row = 'flex items-center gap-3 border-b border-[hsl(var(--border))] py-3';
  const input = 'min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground)/0.6)]';
  return (
    <div className={cn(container, 'pb-10 pt-10')}>
      <Window id="contact" title="contact.sh" kit={kit}>
        <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-2">
          <div>
            <Prompt user={user}>./contact.sh</Prompt>
            <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{kit.t('public.contact.description')}</p>
            {portfolio.email && <a href={`mailto:${portfolio.email}`} style={MONO} dir="ltr" className="mt-5 inline-flex items-center gap-2 break-all text-[hsl(var(--primary))] hover:underline">mailto:{portfolio.email} <ArrowUpRight className="h-4 w-4 shrink-0" /></a>}
            {socials.length > 0 && <div className="mt-6 flex gap-3">{socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="rounded-md border border-[hsl(var(--border))] p-2 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">{getSocialIcon(k)}</a>)}</div>}
          </div>
          <form onSubmit={onSubmit} style={MONO}>
            <label className={row}><span className="shrink-0 text-sm text-[hsl(var(--primary))]">name:</span><input {...field('name')} placeholder={kit.t('public.contact.namePlaceholder')} className={input} /></label>
            <label className={row}><span className="shrink-0 text-sm text-[hsl(var(--primary))]">email:</span><input {...field('email')} type="email" placeholder={kit.t('public.contact.emailPlaceholder')} className={input} /></label>
            <label className={cn(row, 'items-start')}><span className="shrink-0 pt-0.5 text-sm text-[hsl(var(--primary))]">msg:</span><textarea {...field('message')} rows={4} placeholder={kit.t('public.contact.messagePlaceholder')} className={cn(input, 'resize-none')} /></label>
            <button type="submit" disabled={!portfolio.email} className="mt-5 rounded-md bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] disabled:opacity-50">[ {kit.t('public.contact.send')} → ]</button>
          </form>
        </div>
      </Window>
      <footer style={MONO} className="mt-8 flex flex-wrap justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
        <span>© {new Date().getFullYear()} {portfolio.fullName}</span>
        <span dir="ltr">exit 0</span>
      </footer>
    </div>
  );
}

export default function TerminalTemplate(props: TemplateContentProps) {
  const kit = useTemplateKit(props, LOOK);
  const { portfolio, visibleSections, embedded } = props;
  const years = yearsOfExperience(props.experiences.map((e) => e.startDate));
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={kit.style}>
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(hsl(var(--foreground)/0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        <Nav portfolio={portfolio} visibleSections={visibleSections} embedded={embedded} kit={kit} />
        <main className="relative">
          <Sections
            order={visibleSections}
            render={{
              hero: () => <Hero portfolio={portfolio} data={props} kit={kit} />,
              about: () => <About portfolio={portfolio} years={years} kit={kit} />,
              projects: () => <Repos projects={props.projects} kit={kit} />,
              experience: () => <GitLog experiences={props.experiences} kit={kit} />,
              skills: () => <SkillsJson skills={props.skills} kit={kit} />,
              services: () => <Help services={props.services} kit={kit} />,
              certifications: () => <Certs certifications={props.certifications} kit={kit} />,
              testimonials: () => <Reviews testimonials={props.testimonials} kit={kit} />,
              gallery: () => <Screens gallery={props.gallery} kit={kit} />,
              contact: () => <Contact portfolio={portfolio} kit={kit} />,
            }}
          />
        </main>
      </div>
    </MotionConfig>
  );
}
