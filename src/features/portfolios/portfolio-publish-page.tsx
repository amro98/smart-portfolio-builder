import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PortfolioPublishPage() {
  const { portfolioId } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Panel (placeholder)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Portfolio: {portfolioId ?? 'unknown'}</p>
        <p className="text-sm text-muted-foreground">Publishing controls and domain setup will be added here.</p>
        <div className="flex gap-2">
          <Button size="sm">Publish</Button>
          <Button size="sm" variant="outline">Unpublish</Button>
        </div>
      </CardContent>
    </Card>
  );
}
