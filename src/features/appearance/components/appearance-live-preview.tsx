import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicPortfolio } from "@/lib/query/hooks";
import { PortfolioRenderer } from "@/features/public-portfolio/portfolio-renderer";
import type { Portfolio, PublicPortfolioData } from "@/types";

type Props = {
  portfolio: Portfolio;
  dir?: 'ltr' | 'rtl';
};

export function AppearanceLivePreview({ portfolio, dir = 'ltr' }: Props) {
  const slug =
    (portfolio as any)?.slug ||
    (portfolio as any)?.profile?.slug ||
    "alex-morgan";

  const { data: publicData, isLoading } = usePublicPortfolio(slug);

  // While loading the public data, show a skeleton.
  if (isLoading || !publicData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Live Preview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Skeleton className="h-[360px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // IMPORTANT:
  // Use the real public data (images/content), but override appearance settings
  // with the current portfolio state so changes reflect immediately.
  const dataObj: PublicPortfolioData = {
    ...publicData,
    portfolio: {
      ...publicData.portfolio,
      ...portfolio,
    },
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
              <PortfolioRenderer data={dataObj} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
