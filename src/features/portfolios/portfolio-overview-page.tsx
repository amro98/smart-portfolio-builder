import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PortfolioOverviewPage() {
  const { portfolioId } = useParams();
  const id = portfolioId ?? 'unknown';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Portfolio Overview</h1>
      <Card>
        <CardHeader>
          <CardTitle>{id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Status: Draft (placeholder)</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/portfolios/${id}/overview`}>Preview</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/portfolios/${id}/publish`}>Publish</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={`/portfolios/${id}/content/profile`}>Edit Content</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
