import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';

const MOCK_PORTFOLIOS = [
  { id: 'portfolio-1', name: 'Alex Morgan Portfolio', status: 'Published' },
  { id: 'portfolio-doc', name: 'Dr. Sarah Chen Portfolio', status: 'Draft' },
  { id: 'portfolio-photo', name: 'Jamie Rodriguez Portfolio', status: 'Published' },
];

export default function MyPortfoliosPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Portfolios" description="Manage and edit all your portfolio sites.">
        <Button asChild>
          <Link to="/portfolios/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Portfolio
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4">
        {MOCK_PORTFOLIOS.map((portfolio) => (
          <Card key={portfolio.id}>
            <CardHeader>
              <CardTitle className="text-lg">{portfolio.name}</CardTitle>
              <CardDescription>Status: {portfolio.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={`/portfolios/${portfolio.id}/overview`}>Edit</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
