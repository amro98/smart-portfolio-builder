import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function PortfolioContentProfilePage() {
  const { portfolioId } = useParams();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Profile Content</h1>
      <p className="text-sm text-muted-foreground">Portfolio: {portfolioId ?? 'unknown'}</p>

      <Card>
        <CardHeader>
          <CardTitle>Profile Fields (placeholder)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Professional Title</Label>
            <Input id="title" placeholder="Frontend Engineer" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Write a short bio..." rows={5} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
