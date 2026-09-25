import { useEffect, useMemo, useState } from 'react';
import type { SectionId } from '@/types';

// Shared navigation *behavior* (visual design is always template-specific). A portfolio can
// enable up to nine linkable sections — more than fits in any inline nav at 1440px — so every
// template splits them into what fits inline and what goes into its own overflow/menu UI.

export function useNavSections(visibleSections: SectionId[]) {
  return useMemo(() => visibleSections.filter((s) => s !== 'hero'), [visibleSections]);
}

export function splitNav(sections: SectionId[], maxInline: number) {
  if (sections.length <= maxInline) return { inline: sections, overflow: [] as SectionId[] };
  return { inline: sections.slice(0, maxInline - 1), overflow: sections.slice(maxInline - 1) };
}

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>('hero');

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function useScrollY(threshold = 0) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return past;
}

/** Locks page scroll while a full-screen menu/drawer is open. */
export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
