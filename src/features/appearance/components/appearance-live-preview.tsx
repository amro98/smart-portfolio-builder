import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioRenderer } from "@/features/public-portfolio/portfolio-renderer";
import type { AppLocale } from "@/lib/i18n";
import type { Portfolio, PublicPortfolioData } from "@/types";

type Props = {
  portfolio: Portfolio;
  dir?: 'ltr' | 'rtl';
  lang?: AppLocale;
};

export function AppearanceLivePreview({ portfolio, dir = 'ltr', lang }: Props) {
  // Render straight from the current draft (it already carries its own projects/
  // experiences/etc.) instead of the public endpoint, which 404s until the portfolio
  // is actually published and would leave this preview stuck on a loading state.
  const dataObj: PublicPortfolioData = {
    portfolio,
    projects: portfolio.projects,
    experiences: portfolio.experiences,
    skills: portfolio.skills,
    services: portfolio.services,
    certifications: portfolio.certifications,
    testimonials: portfolio.testimonials,
    gallery: portfolio.gallery,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Live Preview</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {/* Window */}
        <div className="rounded-lg border border-border/60 overflow-hidden bg-background">
          {/* Scale wrapper */}
          <div className="relative h-[380px] overflow-hidden">
            <div
              className={`pointer-events-none ${dir === 'rtl' ? 'origin-top-right' : 'origin-top-left'}`}
              style={{
                transform: "scale(0.33)",
                width: "310%",
                direction: dir,
              }}
            >
              {/* Same language as the dashboard, so the content direction matches the scale origin above. */}
              <PortfolioRenderer key={lang} data={dataObj} embedded lang={lang} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
