import { lazy, Suspense, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colorPalettes, type ThemeColors } from '@/lib/presets/colors';
import { animationPresets } from '@/lib/presets/animations';
import { fontPresets } from '@/lib/presets/fonts';
import { PortfolioLocaleProvider, usePortfolioLocale } from './portfolio-locale';
import type { TemplateContentProps } from './templates/shared';
import type { AppLocale } from '@/lib/i18n/translations';
import type { PublicPortfolioData, SectionId, TemplateId } from '@/types';

interface PortfolioRendererProps {
  data: PublicPortfolioData;
  // True when rendered inside another page's own layout (the editor's Preview tab, the
  // Appearance live-preview card) rather than as the standalone /u/:slug document. In that
  // case the portfolio's own nav must stay scoped to its preview container instead of
  // attaching to the real browser viewport, where it would overlap the SaaS app's chrome.
  embedded?: boolean;
  // Initial portfolio language; defaults to the visitor's browser language.
  lang?: AppLocale;
}

// One registry, keyed by the same TemplateId the Templates catalog, Appearance page and
// Create Portfolio wizard all read from `@/lib/presets/templates`. Each template is its own
// lazily-loaded module — a visitor only ever downloads the one design their portfolio
// actually uses, never all four.
const TEMPLATE_COMPONENTS: Record<TemplateId, React.LazyExoticComponent<React.ComponentType<TemplateContentProps>>> = {
  modern: lazy(() => import('./templates/modern')),
  minimal: lazy(() => import('./templates/minimal')),
  corporate: lazy(() => import('./templates/corporate')),
  creative: lazy(() => import('./templates/creative')),
};

function buildCssVars(colors: ThemeColors): Record<string, string> {
  return {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card': colors.card,
    '--card-foreground': colors.cardForeground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
  };
}

function TemplateFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function PortfolioRenderer({ data, embedded, lang }: PortfolioRendererProps) {
  // Isolated from the SaaS app's own language (useI18n/LocaleProvider): every template reads
  // the portfolio's language from PortfolioLocaleProvider, never the global one.
  return (
    <PortfolioLocaleProvider defaultLang={lang}>
      <PortfolioRendererContent data={data} embedded={embedded} />
    </PortfolioLocaleProvider>
  );
}

function PortfolioRendererContent({ data, embedded }: PortfolioRendererProps) {
  const { dir } = usePortfolioLocale();
  const { portfolio, projects, experiences, skills, services, certifications, testimonials, gallery } = data;

  const palette = colorPalettes[portfolio.colorPaletteId] || colorPalettes['monochrome'];
  const animation = animationPresets[portfolio.animationPresetId] || animationPresets['none'];
  const font = fontPresets[portfolio.fontPresetId] || fontPresets['professional'];

  const resolvedTheme = useMemo(() => {
    if (portfolio.themeMode === 'dark') return 'dark';
    if (portfolio.themeMode === 'light') return 'light';
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, [portfolio.themeMode]);

  const themeColors = resolvedTheme === 'dark' ? palette.dark : palette.light;
  const cssVars = buildCssVars(themeColors);

  const visibleSections: SectionId[] = portfolio.sectionOrder.filter((s) => portfolio.sectionVisibility[s]);

  const Template = TEMPLATE_COMPONENTS[portfolio.templateId] || TEMPLATE_COMPONENTS.modern;

  return (
    <div
      dir={dir}
      className={cn('portfolio-bidi', resolvedTheme === 'dark' ? 'dark' : '')}
      style={{
        ...cssVars,
        '--heading-family': font.headingFamily,
        '--heading-weight': font.headingWeight,
        '--body-family': font.bodyFamily,
        '--body-weight': font.bodyWeight,
        fontFamily: font.bodyFamily,
        fontWeight: font.bodyWeight,
        backgroundColor: `hsl(${themeColors.background})`,
        color: `hsl(${themeColors.foreground})`,
      } as React.CSSProperties}
    >
      <Suspense fallback={<TemplateFallback />}>
        <Template
          portfolio={portfolio}
          projects={projects}
          experiences={experiences}
          skills={skills}
          services={services}
          certifications={certifications}
          testimonials={testimonials}
          gallery={gallery}
          visibleSections={visibleSections}
          animation={animation}
          embedded={embedded}
        />
      </Suspense>
    </div>
  );
}

export default PortfolioRenderer;
