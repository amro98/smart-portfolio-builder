import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePortfolio } from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';
import { templateList } from '@/lib/presets/templates';
import { colorPaletteList } from '@/lib/presets/colors';
import { fontPresetList } from '@/lib/presets/fonts';
import { animationPresetList } from '@/lib/presets/animations';
import { professionList, professionPresets } from '@/lib/presets/professions';
import { ALL_SECTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type {
  ProfessionCategory,
  TemplateId,
  ColorPaletteId,
  FontPresetId,
  AnimationPresetId,
  SectionId,
} from '@/types';

export default function CreatePortfolioWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const createPortfolio = useCreatePortfolio();
  const [step, setStep] = useState(0);

  const STEPS = [t('wizard.step.basicInfo'), t('wizard.step.style'), t('wizard.step.sections')];

  // A template can be preselected by navigating here from /templates.
  const preselectedTemplateId = (location.state as { templateId?: TemplateId } | null)?.templateId;

  const [name, setName] = useState('');
  const [profession, setProfession] = useState<ProfessionCategory>('other');
  const [templateId, setTemplateId] = useState<TemplateId>(preselectedTemplateId ?? 'modern');
  const [colorPaletteId, setColorPaletteId] = useState<ColorPaletteId>('elegant-neutral');
  const [fontPresetId, setFontPresetId] = useState<FontPresetId>('professional');
  const [animationPresetId, setAnimationPresetId] = useState<AnimationPresetId>('soft');
  const [sectionVisibility, setSectionVisibility] = useState<Record<SectionId, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_SECTIONS.forEach((s) => {
      initial[s] = professionPresets.other.sections.includes(s);
    });
    return initial as Record<SectionId, boolean>;
  });

  const currentPreset = professionPresets[profession];

  function handleProfessionChange(value: ProfessionCategory) {
    setProfession(value);
    const preset = professionPresets[value];
    setTemplateId(preset.template);
    setColorPaletteId(preset.colorPalette);
    setAnimationPresetId(preset.animationPreset);
    setSectionVisibility(() => {
      const next: Record<string, boolean> = {};
      ALL_SECTIONS.forEach((s) => {
        next[s] = preset.sections.includes(s);
      });
      return next as Record<SectionId, boolean>;
    });
  }

  function toggleSection(id: SectionId) {
    setSectionVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const canProceedStep0 = name.trim().length > 0;

  function goNext() {
    if (step === 0 && !canProceedStep0) {
      toast.error(t('wizard.nameRequired'));
      return;
    }
    setStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  }

  function goBack() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  async function handleCreate() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setStep(0);
      toast.error(t('wizard.nameRequired'));
      return;
    }

    try {
      const portfolio = await createPortfolio.mutateAsync({
        name: trimmedName,
        data: {
          fullName: trimmedName,
          title: trimmedName,
          profession,
          templateId,
          colorPaletteId,
          fontPresetId,
          animationPresetId,
          ctaLabel: currentPreset.ctaLabel,
          sectionOrder: ALL_SECTIONS,
          sectionVisibility,
        },
      });
      toast.success(t('wizard.createSuccess'));
      navigate(`/portfolios/${portfolio.id}/overview`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('wizard.createError'));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('wizard.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('wizard.description')}</p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                index < step
                  ? 'border-primary bg-primary text-primary-foreground'
                  : index === step
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground/50'
              )}
            >
              {index < step ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className={cn('text-sm font-medium', index <= step ? 'text-foreground' : 'text-muted-foreground/50')}>
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <div className={cn('h-0.5 flex-1 rounded-full', index < step ? 'bg-primary' : 'bg-muted-foreground/20')} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{`Step ${step + 1}: ${STEPS[step]}`}</CardTitle>
          <CardDescription>
            {step === 0 && t('wizard.step.basicInfo.description')}
            {step === 1 && t('wizard.step.style.description')}
            {step === 2 && t('wizard.step.sections.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-2 max-w-md">
              <Label htmlFor="portfolio-name">{t('wizard.nameLabel')}</Label>
              <Input
                id="portfolio-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('wizard.namePlaceholder')}
                maxLength={120}
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-2 max-w-sm">
                <Label>{t('wizard.professionLabel')}</Label>
                <Select value={profession} onValueChange={(v) => handleProfessionChange(v as ProfessionCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {professionList.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('wizard.professionHint')}
                </p>
              </div>

              <div className="space-y-3">
                <Label>{t('wizard.templateLabel')}</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {templateList.map((template) => {
                    const isSelected = templateId === template.id;
                    const isDisabled = !template.available;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setTemplateId(template.id as TemplateId)}
                        className={cn(
                          'relative overflow-hidden rounded-lg border-2 text-left transition-all',
                          isSelected && 'ring-2 ring-primary border-primary',
                          !isSelected && !isDisabled && 'border-border hover:border-foreground/20',
                          isDisabled && 'cursor-not-allowed opacity-60 border-border'
                        )}
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <img src={template.previewImage} alt={template.label} className="h-full w-full object-cover" />
                          {isDisabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                              <Badge variant="secondary">{t('templates.comingSoon')}</Badge>
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute right-2 top-2">
                              <Badge>{t('wizard.selected')}</Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm">{template.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{template.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t('wizard.paletteLabel')}</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {colorPaletteList.map((palette) => {
                    const isSelected = colorPaletteId === palette.id;
                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => setColorPaletteId(palette.id as ColorPaletteId)}
                        className={cn(
                          'relative flex flex-col gap-2 rounded-lg border-2 p-3 text-left transition-all',
                          isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-foreground/20'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute right-2 top-2">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex gap-1">
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: palette.accent }} />
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: `hsl(${palette.light.primary})` }} />
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: `hsl(${palette.light.secondary})` }} />
                        </div>
                        <p className="text-xs font-medium">{palette.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label>{t('wizard.fontLabel')}</Label>
                  <div className="space-y-2">
                    {fontPresetList.map((preset) => {
                      const isSelected = fontPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFontPresetId(preset.id as FontPresetId)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg border-2 p-3 text-left transition-all',
                            isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-foreground/20'
                          )}
                        >
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ fontFamily: preset.headingFamily, fontWeight: preset.headingWeight }}
                            >
                              {preset.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{preset.description}</p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>{t('wizard.animationLabel')}</Label>
                  <div className="space-y-2">
                    {animationPresetList.map((preset) => {
                      const isSelected = animationPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAnimationPresetId(preset.id as AnimationPresetId)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg border-2 p-3 text-left transition-all',
                            isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-foreground/20'
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium">{preset.label}</p>
                            <p className="text-xs text-muted-foreground">{preset.description}</p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3">
              {ALL_SECTIONS.map((sectionId) => {
                const isEnabled = sectionVisibility[sectionId];
                const isRecommended = currentPreset.sections.includes(sectionId);
                return (
                  <div
                    key={sectionId}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-4 transition-colors',
                      isEnabled ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-foreground">{t(`sections.${sectionId}`)}</p>
                      {isRecommended && (
                        <Badge variant="outline" className="text-[10px]">
                          {t('wizard.suggested')}
                        </Badge>
                      )}
                    </div>
                    <Switch checked={isEnabled} onCheckedChange={() => toggleSection(sectionId)} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={step === 0 || createPortfolio.isPending}
            >
              {t('wizard.back')}
            </Button>
            <Button
              onClick={step === STEPS.length - 1 ? () => void handleCreate() : goNext}
              disabled={(step === 0 && !canProceedStep0) || createPortfolio.isPending}
            >
              {createPortfolio.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === STEPS.length - 1 ? t('wizard.create') : t('wizard.next')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
