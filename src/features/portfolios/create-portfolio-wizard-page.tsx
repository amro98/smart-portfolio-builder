import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';

const STEPS = ['Basic Info', 'Style', 'Sections'];

export default function CreatePortfolioWizardPage() {
  const [step, setStep] = useState(0);

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
          <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
            {STEPS[step]} placeholder content
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep((prev) => Math.max(0, prev - 1))} disabled={step === 0}>
              Back
            </Button>
            <Button onClick={() => setStep((prev) => Math.min(STEPS.length - 1, prev + 1))} disabled={step === STEPS.length - 1}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
