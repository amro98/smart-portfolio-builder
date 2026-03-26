import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PortfolioAppearancePage() {
  const { portfolioId } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance (placeholder)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Portfolio: {portfolioId ?? 'unknown'}</p>
        <p className="text-sm text-muted-foreground">Use the existing dashboard appearance editor for now.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/appearance">Open Legacy Appearance</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
