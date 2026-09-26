import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Download, Mail, MapPin, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/api/client';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { getSocialIcon, socialEntries, sortByOrder, useContactForm, type TemplateContentProps } from '../shared';
import { DISPLAY_FONT, yearOf } from '../theme';
import {
  experienceRange, groupSkills, initials, publishedProjects, useTemplateKit, useTemplateNav,
  type Kit, type TemplateLook,
} from '../kit';
import { Media, Sections } from '../kit-ui';
import type { Certification, Experience, GalleryItem, Portfolio, Project, SectionId, Service, Skill, Testimonial } from '@/types';

// ACADEMIC — a restrained scholarly homepage: a sticky profile column (portrait, affiliation,
// contacts, section index) beside a single reading column; projects become a numbered
// publications list with bracket links, experience becomes "Appointments", credentials are
// split into Education and Honours, and gallery images are captioned "Figure n."

const LOOK: TemplateLook = {
  skins: {
    light: { signatureAccent: '352 60% 30%', background: '45 25% 98%', surface: '45 18% 94%', foreground: '30 10% 10%', muted: '30 6% 38%', border: '35 12% 86%' },
    dark: { signatureAccent: '352 62% 68%', background: '220 15% 9%', surface: '220 13% 13%', foreground: '45 20% 92%', muted: '40 6% 64%', border: '220 10% 22%' },
  },
  fonts: { display: "'Source Serif 4', Georgia, serif", body: "'Source Serif 4', Georgia, serif" },
};
const SANS = { fontFamily: "'Inter', system-ui, sans-serif" } as const;
const small = 'text-xs font-medium uppercase tracking-[0.14em]';

function H2({ children, kit }: { children: React.ReactNode; kit: Kit }) {
  return (
    <motion.h2 {...kit.reveal({ y: 12 })} style={DISPLAY_FONT} className="mb-6 border-b border-[hsl(var(--border))] pb-2 text-2xl font-semibold text-[hsl(var(--primary))]">
      {children}
    </motion.h2>
  );
}

function Profile({ portfolio, affiliation, visibleSections, embedded, kit }: { portfolio: Portfolio; affiliation?: string; visibleSections: SectionId[]; embedded?: boolean; kit: Kit }) {
  const nav = useTemplateNav(visibleSections, embedded);
  const socials = socialEntries(portfolio.socialLinks);
  const links = (
    <nav style={SANS} className="space-y-0.5">
      {nav.sections.map((s) => (
        <button key={s} onClick={() => nav.go(s)} className={cn('block w-full border-s-2 py-1.5 ps-3 text-start text-sm transition-colors', nav.active === s ? 'border-[hsl(var(--primary))] font-semibold text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]')}>
          {kit.t(`sections.${s}`)}
        </button>
      ))}
    </nav>
  );
  return (
    <>
      {/* Desktop: sticky profile column. */}
      <aside className="hidden lg:block">
        <div className={cn(embedded ? '' : 'sticky top-0', 'flex max-h-screen flex-col gap-6 overflow-y-auto py-12 pe-4')}>
          <div className="aspect-square w-40 overflow-hidden rounded-sm bg-[hsl(var(--card))]">
            {portfolio.avatarUrl ? <Media src={portfolio.avatarUrl} alt={portfolio.fullName} eager /> : <div className="flex h-full items-center justify-center"><span style={DISPLAY_FONT} className="text-5xl text-[hsl(var(--muted-foreground))]">{initials(portfolio.fullName)}</span></div>}
          </div>
          <div>
            <p style={DISPLAY_FONT} className="text-2xl font-semibold leading-tight">{portfolio.fullName}</p>
            <p className="mt-1 italic text-[hsl(var(--muted-foreground))]">{portfolio.title}</p>
            {affiliation && <p style={SANS} className="mt-2 text-sm">{affiliation}</p>}
          </div>
          <ul style={SANS} className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
            {portfolio.location && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{portfolio.location}</li>}
            {portfolio.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><a href={`mailto:${portfolio.email}`} dir="ltr" className="break-all hover:text-[hsl(var(--primary))]">{portfolio.email}</a></li>}
          </ul>
          {socials.length > 0 && <div className="flex gap-3 text-[hsl(var(--muted-foreground))] [&_svg]:h-4 [&_svg]:w-4">{socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="hover:text-[hsl(var(--primary))]">{getSocialIcon(k)}</a>)}</div>}
          {links}
          <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
        </div>
      </aside>

      {/* Mobile/tablet: compact top bar + drawer. */}
      <header className={cn(embedded ? 'absolute' : 'fixed', 'inset-x-0 top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.95)] backdrop-blur lg:hidden')}>
        <div className="flex h-14 items-center gap-3 px-5">
          <span style={DISPLAY_FONT} className="me-auto truncate text-lg font-semibold">{portfolio.fullName}</span>
          <LanguageSwitcher compact lang={kit.lang} onLanguageChange={kit.setLang} />
          <button onClick={() => nav.setOpen(!nav.open)} aria-label={kit.t(nav.open ? 'public.nav.closeMenu' : 'public.nav.openMenu')}>{nav.open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
        </div>
        <AnimatePresence>
          {nav.open && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-[hsl(var(--border))] px-5"><div className="py-4">{links}</div></motion.div>}
        </AnimatePresence>
      </header>
    </>
  );
}

function Intro({ portfolio, affiliation, interests, kit }: { portfolio: Portfolio; affiliation?: string; interests: string[]; kit: Kit }) {
  return (
    <section id="hero" className="pb-10 pt-10 lg:pt-12">
      <div className="mb-8 flex items-center gap-5 lg:hidden">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-[hsl(var(--card))]">{portfolio.avatarUrl ? <Media src={portfolio.avatarUrl} alt={portfolio.fullName} eager /> : <div className="flex h-full items-center justify-center text-3xl text-[hsl(var(--muted-foreground))]">{initials(portfolio.fullName)}</div>}</div>
        <p style={SANS} className="text-sm text-[hsl(var(--muted-foreground))]">{[affiliation, portfolio.location].filter(Boolean).join(' · ')}</p>
      </div>
      <motion.h1 {...kit.reveal({ y: 20 })} style={DISPLAY_FONT} className="text-[clamp(2.4rem,5vw,3.6rem)] font-semibold leading-tight">{portfolio.fullName}</motion.h1>
      <motion.p {...kit.reveal({ y: 12, delay: 0.1 })} className="mt-2 text-xl italic text-[hsl(var(--muted-foreground))]">
        {portfolio.title}{affiliation && <> · <span className="not-italic text-[hsl(var(--foreground))]">{affiliation}</span></>}
      </motion.p>
      {portfolio.bio && <motion.p {...kit.reveal({ y: 12, delay: 0.15 })} className="mt-6 text-lg leading-[1.8]">{portfolio.bio}</motion.p>}
      {interests.length > 0 && (
        <motion.p {...kit.reveal({ y: 12, delay: 0.2 })} className="mt-6 leading-relaxed">
          <span style={SANS} className={cn(small, 'me-2 text-[hsl(var(--muted-foreground))]')}>{kit.t('public.tpl.researchInterests')}:</span>
          <span className="italic">{interests.join(', ')}</span>
        </motion.p>
      )}
      <motion.div {...kit.reveal({ y: 12, delay: 0.25 })} style={SANS} className="mt-8 flex flex-wrap gap-3">
        {portfolio.resumeUrl && <a href={resolveMediaUrl(portfolio.resumeUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))]"><Download className="h-4 w-4" /> {kit.t('public.tpl.downloadCv')}</a>}
        {portfolio.email && <a href={`mailto:${portfolio.email}`} className="inline-flex items-center gap-2 rounded-sm border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold hover:border-[hsl(var(--primary))]"><Mail className="h-4 w-4" /> {kit.t('public.contact.email')}</a>}
      </motion.div>
    </section>
  );
}

function Biography({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  return (
    <section id="about" className="py-8">
      <H2 kit={kit}>{kit.t('public.tpl.biography')}</H2>
      <motion.p {...kit.reveal({ y: 12 })} className="whitespace-pre-line text-[1.05rem] leading-[1.85]">{portfolio.bio}</motion.p>
    </section>
  );
}

function Publications({ projects, kit }: { projects: Project[]; kit: Kit }) {
  const items = publishedProjects(projects);
  if (items.length === 0) return null;
  return (
    <section id="projects" className="py-8">
      <H2 kit={kit}>{kit.t('public.tpl.publications')}</H2>
      <ol className="space-y-6">
        {items.map((p, i) => {
          const links = [
            p.liveUrl && { label: kit.t('public.projects.live'), href: p.liveUrl },
            p.externalUrl && { label: kit.t('public.tpl.link'), href: p.externalUrl },
            p.repositoryUrl && { label: kit.t('public.projects.code'), href: p.repositoryUrl },
          ].filter(Boolean) as { label: string; href: string }[];
          return (
            <motion.li key={p.id} {...kit.reveal({ y: 12, delay: Math.min(i, 5) * 0.04 })} className="grid grid-cols-[2.5rem_1fr] gap-2">
              <span style={SANS} className="pt-1 text-sm tabular-nums text-[hsl(var(--muted-foreground))]">[{i + 1}]</span>
              <div>
                <p className="leading-relaxed">
                  <span className="font-semibold">{p.title}.</span>{' '}
                  {p.category && <span className="italic">{p.category}</span>}
                  {yearOf(p.date) && <span className="text-[hsl(var(--muted-foreground))]">, {yearOf(p.date)}</span>}
                  {p.clientName && <span className="text-[hsl(var(--muted-foreground))]">. {p.clientName}</span>}
                </p>
                {p.shortDescription && <p className="mt-1 text-[0.95rem] leading-relaxed text-[hsl(var(--muted-foreground))]">{p.shortDescription}</p>}
                <div style={SANS} className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-sm border border-[hsl(var(--primary)/0.4)] px-2 py-0.5 font-semibold uppercase tracking-wide text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]">{l.label}</a>)}
                  {p.tags.length > 0 && <span className="italic text-[hsl(var(--muted-foreground))]">{kit.t('public.tpl.keywords')}: {p.tags.join(', ')}</span>}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

function Appointments({ experiences, kit }: { experiences: Experience[]; kit: Kit }) {
  const items = sortByOrder(experiences);
  if (items.length === 0) return null;
  return (
    <section id="experience" className="py-8">
      <H2 kit={kit}>{kit.t('public.tpl.appointments')}</H2>
      <ul className="space-y-5">
        {items.map((e) => (
          <motion.li key={e.id} {...kit.reveal({ y: 12 })} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-6">
            <div>
              <p className="font-semibold">{e.role}</p>
              <p className="italic text-[hsl(var(--muted-foreground))]">{[e.company, e.location].filter(Boolean).join(', ')}</p>
              {e.description.length > 0 && <ul className="mt-1.5 list-disc space-y-1 ps-5 text-[0.95rem] text-[hsl(var(--muted-foreground))] marker:text-[hsl(var(--primary))]">{e.description.map((d, j) => <li key={j}>{d}</li>)}</ul>}
            </div>
            <span style={SANS} className="text-sm tabular-nums text-[hsl(var(--muted-foreground))] sm:text-end" dir="ltr">{experienceRange(e, kit.t('public.experience.present'))}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function EducationHonours({ certifications, kit }: { certifications: Certification[]; kit: Kit }) {
  const items = sortByOrder(certifications);
  if (items.length === 0) return null;
  const groups = [
    { title: kit.t('public.tpl.education'), list: items.filter((c) => c.type === 'education') },
    { title: kit.t('public.tpl.honours'), list: items.filter((c) => c.type !== 'education') },
  ].filter((g) => g.list.length > 0);
  return (
    <section id="certifications" className="space-y-10 py-8">
      {groups.map((g) => (
        <div key={g.title}>
          <H2 kit={kit}>{g.title}</H2>
          <ul className="space-y-4">
            {g.list.map((c) => (
              <motion.li key={c.id} {...kit.reveal({ y: 10 })} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-6">
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="italic text-[hsl(var(--muted-foreground))]">
                    {c.institution}
                    {c.verificationUrl && <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" style={SANS} className="ms-2 text-xs not-italic text-[hsl(var(--primary))] underline underline-offset-2">{kit.t('public.certifications.viewCredential')}</a>}
                  </p>
                </div>
                <span style={SANS} className="text-sm tabular-nums text-[hsl(var(--muted-foreground))]">{yearOf(c.issueDate)}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function Interests({ skills, kit }: { skills: Skill[]; kit: Kit }) {
  const groups = groupSkills(sortByOrder(skills), kit.t('public.skills.general'));
  if (groups.length === 0) return null;
  return (
    <section id="skills" className="py-8">
      <H2 kit={kit}>{kit.t('public.tpl.methods')}</H2>
      <dl className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        {groups.map(([cat, list]) => (
          <div key={cat} className="contents">
            <dt style={SANS} className={cn(small, 'pt-1 text-[hsl(var(--muted-foreground))]')}>{cat}</dt>
            <dd className="leading-relaxed">{list.map((s) => s.name).join(' · ')}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Teaching({ services, kit }: { services: Service[]; kit: Kit }) {
  const items = sortByOrder(services);
  if (items.length === 0) return null;
  return (
    <section id="services" className="py-8">
      <H2 kit={kit}>{kit.t('public.tpl.teaching')}</H2>
      <ul className="space-y-5">
        {items.map((s) => (
          <motion.li key={s.id} {...kit.reveal({ y: 10 })}>
            <p className="font-semibold">{s.title}{(s.duration || s.priceLabel) && <span style={SANS} className="ms-2 text-sm font-normal text-[hsl(var(--muted-foreground))]">({[s.duration, s.priceLabel].filter(Boolean).join(', ')})</span>}</p>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-[hsl(var(--muted-foreground))]">{s.description}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function Endorsements({ testimonials, kit }: { testimonials: Testimonial[]; kit: Kit }) {
  const items = sortByOrder(testimonials);
  if (items.length === 0) return null;
  return (
    <section id="testimonials" className="py-8">
      <H2 kit={kit}>{kit.t('public.tpl.endorsements')}</H2>
      <div className="space-y-6">
        {items.map((tm) => (
          <motion.figure key={tm.id} {...kit.reveal({ y: 10 })} className="border-s-2 border-[hsl(var(--primary))] ps-5">
            <blockquote className="italic leading-relaxed">“{tm.quote}”</blockquote>
            <figcaption style={SANS} className="mt-2 text-sm">— {tm.clientName}{tm.role && <span className="text-[hsl(var(--muted-foreground))]">, {tm.role}</span>}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function Figures({ gallery, kit }: { gallery: GalleryItem[]; kit: Kit }) {
  const items = sortByOrder(gallery).filter((g) => g.imageUrl);
  if (items.length === 0) return null;
  return (
    <section id="gallery" className="py-8">
      <H2 kit={kit}>{kit.t('public.tpl.figures')}</H2>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((g, i) => (
          <motion.figure key={g.id} {...kit.reveal({ y: 12 })}>
            <div className="overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><Media src={g.imageUrl} alt={g.title} className="aspect-[4/3]" /></div>
            <figcaption className="mt-2 text-sm leading-snug"><span className="font-semibold">{kit.t('public.tpl.figure')} {i + 1}.</span> {g.title}{g.description && <span className="text-[hsl(var(--muted-foreground))]"> {g.description}</span>}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function Contact({ portfolio, kit }: { portfolio: Portfolio; kit: Kit }) {
  const { field, onSubmit } = useContactForm(portfolio.email, kit.t);
  const input = 'w-full rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))]';
  return (
    <section id="contact" className="pb-16 pt-8">
      <H2 kit={kit}>{kit.t('sections.contact')}</H2>
      <div className="grid gap-8 sm:grid-cols-2">
        <address className="not-italic leading-relaxed">
          <p className="font-semibold">{portfolio.fullName}</p>
          <p className="italic text-[hsl(var(--muted-foreground))]">{portfolio.title}</p>
          {portfolio.location && <p className="mt-2">{portfolio.location}</p>}
          {portfolio.email && <a href={`mailto:${portfolio.email}`} dir="ltr" className="mt-2 block break-all text-[hsl(var(--primary))] underline underline-offset-2">{portfolio.email}</a>}
        </address>
        {portfolio.email && (
          <form onSubmit={onSubmit} style={SANS} className="space-y-3">
            <input {...field('name')} placeholder={kit.t('public.contact.namePlaceholder')} className={input} />
            <input {...field('email')} type="email" placeholder={kit.t('public.contact.emailPlaceholder')} className={input} />
            <textarea {...field('message')} rows={4} placeholder={kit.t('public.contact.messagePlaceholder')} className={cn(input, 'resize-none')} />
            <button type="submit" className="rounded-sm bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))]">{kit.t('public.contact.send')}</button>
          </form>
        )}
      </div>
      <p style={SANS} className="mt-16 border-t border-[hsl(var(--border))] pt-4 text-xs text-[hsl(var(--muted-foreground))]">© {new Date().getFullYear()} {portfolio.fullName} · {kit.t('public.footer.rights')}</p>
    </section>
  );
}

export default function AcademicTemplate(props: TemplateContentProps) {
  const kit = useTemplateKit(props, LOOK);
  const { portfolio, visibleSections, embedded } = props;
  const exps = sortByOrder(props.experiences);
  const affiliation = (exps.find((e) => e.current) ?? exps[0])?.company;
  const interests = [...new Set(sortByOrder(props.skills).map((s) => s.category?.trim()).filter(Boolean))].slice(0, 5) as string[];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip" style={kit.style}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[17rem_1fr] lg:gap-16">
          <Profile portfolio={portfolio} affiliation={affiliation} visibleSections={visibleSections} embedded={embedded} kit={kit} />
          {/* pt-14 clears the fixed mobile header whichever section comes first. */}
          <main className="min-w-0 max-w-3xl pt-14 lg:pt-0">
            <Sections
              order={visibleSections}
              render={{
                hero: () => <Intro portfolio={portfolio} affiliation={affiliation} interests={interests} kit={kit} />,
                about: () => <Biography portfolio={portfolio} kit={kit} />,
                projects: () => <Publications projects={props.projects} kit={kit} />,
                experience: () => <Appointments experiences={props.experiences} kit={kit} />,
                skills: () => <Interests skills={props.skills} kit={kit} />,
                services: () => <Teaching services={props.services} kit={kit} />,
                certifications: () => <EducationHonours certifications={props.certifications} kit={kit} />,
                testimonials: () => <Endorsements testimonials={props.testimonials} kit={kit} />,
                gallery: () => <Figures gallery={props.gallery} kit={kit} />,
                contact: () => <Contact portfolio={portfolio} kit={kit} />,
              }}
            />
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
