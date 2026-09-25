import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Github, Linkedin, Twitter, Instagram, Globe, Youtube, ChevronUp } from 'lucide-react';
import type { AnimationPreset } from '@/lib/presets/animations';
import type {
  Portfolio, Project, Experience, Skill, Service,
  Certification, Testimonial, GalleryItem, SectionId,
} from '@/types';

// The prop contract every template implementation consumes. All shared behavior (section
// order/visibility, media URL resolution, theme/CSS vars, language, fonts) is resolved once
// by PortfolioRendererContent and handed down here — a template only decides how to *lay out*
// this data, it never re-derives it.
export interface TemplateContentProps {
  portfolio: Portfolio;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  services: Service[];
  certifications: Certification[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  visibleSections: SectionId[];
  animation: AnimationPreset;
  embedded?: boolean;
}

export function getSocialIcon(key: string) {
  const icons: Record<string, React.ReactNode> = {
    github: <Github className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    website: <Globe className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
    behance: <Globe className="w-5 h-5" />,
    dribbble: <Globe className="w-5 h-5" />,
  };
  return icons[key] || <Globe className="w-5 h-5" />;
}

export function SocialLinksList({
  socialLinks,
  className,
}: {
  socialLinks: Portfolio['socialLinks'];
  className?: string;
}) {
  const links = Object.entries(socialLinks).filter(([, url]) => url && url.trim() !== '');
  if (links.length === 0) return null;
  return (
    <div className={className ?? 'flex items-center gap-3'}>
      {links.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          {getSocialIcon(key)}
        </a>
      ))}
    </div>
  );
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export function useScrolled(threshold = 50) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  return scrolled;
}

// Shared "back to top" affordance — tracks the real window scroll, so it's intentionally a
// no-op when embedded (the editor's Preview iframe is its own document/window, so this still
// works correctly there too; only the Appearance live-preview truly embeds without its own
// scroll, and there `embedded` suppresses it since fixed positioning would escape the card).
export function ScrollToTop({ embedded }: { embedded?: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (embedded) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 end-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

// There is no backend mail relay, so every template's contact form hands the message to the
// visitor's own mail client (addressed to the owner) rather than faking a "sent" state.
export function useContactForm(email: string, t: (key: string) => string) {
  const [values, setValues] = useState({ name: '', email: '', message: '' });

  const field = (key: 'name' | 'email' | 'message') => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((s) => ({ ...s, [key]: e.target.value })),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!values.name.trim() || !values.message.trim()) {
      toast.error(t('public.contact.validationError'));
      return;
    }
    const subject = `Portfolio contact from ${values.name.trim()}`;
    const body = [values.message.trim(), '', `— ${values.name.trim()}${values.email.trim() ? ` (${values.email.trim()})` : ''}`].join('\n');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success(t('toast.messageOpening'));
    setValues({ name: '', email: '', message: '' });
  };

  return { field, onSubmit };
}

export function socialEntries(socialLinks: Portfolio['socialLinks']) {
  return Object.entries(socialLinks).filter(([, url]) => url && url.trim() !== '') as [string, string][];
}
