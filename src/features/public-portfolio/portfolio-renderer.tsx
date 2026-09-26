import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colorPalettes, type ThemeColors } from '@/lib/presets/colors';
import { animationPresets } from '@/lib/presets/animations';
import { fontPresets } from '@/lib/presets/fonts';
import { getTemplate, resolveTemplateMode, templateList } from '@/lib/presets/templates';
import { PortfolioLocaleProvider, usePortfolioLocale } from './portfolio-locale';
import type { TemplateContentProps } from './templates/shared';
import type { AppLocale } from '@/lib/i18n/translations';
import type { PublicPortfolioData, SectionId, TemplateId } from '@/types';

interface PortfolioRendererProps {
  data: PublicPortfolioData;
  // True when rendered inside another page's own layout (template thumbnails) rather than
  // as its own document (/u/:slug or the editor's preview iframe). The portfolio's own nav
  // then stays scoped to its container instead of attaching to the browser viewport.
  embedded?: boolean;
  // Initial portfolio language; defaults to the visitor's browser language.
  lang?: AppLocale;
}

// Built once from the template registry: each template is its own lazily-loaded chunk, so a
// visitor only ever downloads the one design their portfolio actually uses.
const TEMPLATE_COMPONENTS = Object.fromEntries(templateList.map((t) => [t.id, lazy(t.load)])) as Record<
  TemplateId,
  React.LazyExoticComponent<React.ComponentType<TemplateContentProps>>
>;

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

function TemplateFallback({ background }: { background: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: background }}>
      <Loader2 className="h-6 w-6 animate-spin opacity-60" />
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

  const template = getTemplate(portfolio.templateId);
  const palette = colorPalettes[portfolio.colorPaletteId] || colorPalettes['monochrome'];
  const animation = animationPresets[portfolio.animationPresetId] || animationPresets['none'];
  const font = fontPresets[portfolio.fontPresetId] || fontPresets.signature;
  const colorMode = resolveTemplateMode(template, portfolio.themeMode);
  const themeColors = colorMode === 'dark' ? palette.dark : palette.light;

  const visibleSections: SectionId[] = portfolio.sectionOrder.filter((s) => portfolio.sectionVisibility[s]);
  const Template = TEMPLATE_COMPONENTS[template.id];

  // Font presets other than "signature" override each template's display/body families
  // (templates read them through --tpl-display / --tpl-body, see templates/theme.ts).
  const fontOverride = font.id !== 'signature' && font.headingFamily;

  return (
    <div
      dir={dir}
      data-font-override={fontOverride ? '' : undefined}
      className={cn('portfolio-bidi', colorMode === 'dark' ? 'dark' : '')}
      style={{
        ...buildCssVars(themeColors),
        ...(fontOverride ? { '--font-display-override': font.headingFamily, '--font-body-override': font.bodyFamily } : {}),
        backgroundColor: template.swatch.background,
        color: `hsl(${themeColors.foreground})`,
      } as React.CSSProperties}
    >
      <Suspense fallback={<TemplateFallback background={template.swatch.background} />}>
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
          colorMode={colorMode}
          embedded={embedded}
        />
      </Suspense>
    </div>
  );
}

export default PortfolioRenderer;
