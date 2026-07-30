import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { useCreatePortfolio } from '@/lib/query/hooks';

const STEPS = ['Basic Info', 'Style', 'Sections'];

export default function CreatePortfolioWizardPage() {
  const navigate = useNavigate();
  const createPortfolio = useCreatePortfolio();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  async function handleCreate() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setStep(0);
      toast.error('Please enter a portfolio name.');
      return;
    }

    try {
      const portfolio = await createPortfolio.mutateAsync({
        name: trimmedName,
        data: {},
      });
      toast.success('Portfolio created successfully.');
      navigate(`/portfolios/${portfolio.id}/overview`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to create the portfolio. Please try again.'
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Portfolio" description="Wizard skeleton for creating a new portfolio." />

      <Card>
        <CardHeader>
          <CardTitle>{`Step ${step + 1}: ${STEPS[step]}`}</CardTitle>
          <CardDescription>
            {STEPS.map((item, index) => (index === step ? `[${item}]` : item)).join(' -> ')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <div className="space-y-2 rounded-md border border-dashed border-border p-6">
              <Label htmlFor="portfolio-name">Portfolio name</Label>
              <Input
                id="portfolio-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My Portfolio"
                maxLength={120}
                autoFocus
              />
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
              {STEPS[step]} placeholder content
            </div>
          )}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0 || createPortfolio.isPending}
            >
              Back
            </Button>
            <Button
              onClick={
                step === STEPS.length - 1
                  ? () => void handleCreate()
                  : () => setStep((prev) => Math.min(STEPS.length - 1, prev + 1))
              }
              disabled={(step === 0 && !name.trim()) || createPortfolio.isPending}
            >
              {createPortfolio.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === STEPS.length - 1 ? 'Create Portfolio' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
