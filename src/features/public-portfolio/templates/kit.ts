import { useMemo, useState } from 'react';
import { usePortfolioLocale } from '../portfolio-locale';
import { getAmbientIntensity } from './scene-config';
import { useAmbientMotion, useReveal } from './motion-utils';
import { scrollToSection, useActiveSection, useLockScroll, useNavSections } from './nav-utils';
import { fontVars, resolveAccent, skinStyle, yearOf, type TemplateSkin } from './theme';
import type { TemplateContentProps } from './shared';
import type { Experience, Project, SectionId } from '@/types';

// Shared plumbing for the second-generation templates (Editorial, Executive, Clinical, Lens,
// Bento, Terminal, Coach, Academic). It resolves behavior only — colour mode, accent,
// typography variables, motion, navigation state, section ordering, media URLs. Every
// template still owns its entire visual design; nothing here renders a styled section.

export interface TemplateLook {
  skins: Record<'light' | 'dark', TemplateSkin>;
  fonts: { display: string; body: string };
}

export function useTemplateKit(props: TemplateContentProps, look: TemplateLook) {
  const locale = usePortfolioLocale();
  const intensity = getAmbientIntensity(props.animation.id);
  const reveal = useReveal(intensity);
  const animate = useAmbientMotion(intensity);
  const mode = props.colorMode;
  const skin = look.skins[mode];
  const { accent, isSignature } = resolveAccent(props.portfolio, skin.signatureAccent, mode);
  const style = useMemo(
    () => ({ ...skinStyle(skin, accent), ...fontVars(look.fonts), colorScheme: mode }) as React.CSSProperties,
    [skin, accent, look.fonts, mode]
  );
  return { ...locale, intensity, reveal, animate, mode, accent, isSignature, style };
}

export type Kit = ReturnType<typeof useTemplateKit>;

/** Navigation state shared by every template's (visually distinct) navbar. */
export function useTemplateNav(visibleSections: SectionId[], embedded?: boolean) {
  const sections = useNavSections(visibleSections);
  const ids = useMemo(() => visibleSections as string[], [visibleSections]);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  useLockScroll(open && !embedded);
  const go = (id: string) => {
    setOpen(false);
    window.setTimeout(() => scrollToSection(id), 30);
  };
  return { sections, active, open, setOpen, go };
}

export function publishedProjects(projects: Project[]) {
  return projects.filter((p) => p.status === 'published').sort((a, b) => a.order - b.order);
}

export function experienceRange(e: Experience, present: string) {
  const start = yearOf(e.startDate);
  const end = e.current ? present : yearOf(e.endDate);
  return [start, end].filter(Boolean).join(' — ');
}

export function initials(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

/** Skills grouped by category, preserving first-seen category order. */
export function groupSkills<T extends { category: string }>(skills: T[], fallback: string) {
  const map = new Map<string, T[]>();
  for (const s of skills) {
    const key = s.category?.trim() || fallback;
    map.set(key, [...(map.get(key) ?? []), s]);
  }
  return [...map.entries()];
}

/** Primary link for a project, if any. */
export function projectLink(p: Project) {
  return p.liveUrl || p.externalUrl || p.repositoryUrl || '';
}
