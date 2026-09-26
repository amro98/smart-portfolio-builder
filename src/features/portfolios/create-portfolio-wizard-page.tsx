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
import { getTemplate, templateList } from '@/lib/presets/templates';
import { getRecommendedStyle, rankTemplatesForProfession } from '@/lib/presets/recommendations';
import { DESIGN_VERSION } from '@/lib/design/design-settings';
import { TemplateCard } from '@/features/design/controls/template-card';
import { colorPaletteList } from '@/lib/presets/colors';
import { fontPresetList } from '@/lib/presets/fonts';
import { animationPresetList } from '@/lib/presets/animations';
import { professionList, professionPresets } from '@/lib/presets/professions';
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
  const initialStyle = getRecommendedStyle('other', preselectedTemplateId);

  const [name, setName] = useState('');
  const [profession, setProfession] = useState<ProfessionCategory>('other');
  const [templateId, setTemplateId] = useState<TemplateId>(initialStyle.templateId);
  const [colorPaletteId, setColorPaletteId] = useState<ColorPaletteId>(initialStyle.colorPaletteId);
  const [fontPresetId, setFontPresetId] = useState<FontPresetId>(initialStyle.fontPresetId);
  const [animationPresetId, setAnimationPresetId] = useState<AnimationPresetId>(initialStyle.animationPresetId);
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(initialStyle.sectionOrder);
  const [sectionVisibility, setSectionVisibility] = useState<Record<SectionId, boolean>>(initialStyle.sectionVisibility);
  // Manual choices always win over profession recommendations: once the user picks a value
  // (or arrives with a template chosen on /templates), later profession changes leave it alone.
  const [touched, setTouched] = useState<Set<string>>(() => new Set(preselectedTemplateId ? ['template'] : []));
  const touch = (key: string) => setTouched((prev) => new Set(prev).add(key));

  const currentPreset = professionPresets[profession];
  const ranked = rankTemplatesForProfession(profession, 4);
  const rankOf = (id: TemplateId) => ranked.find((r) => r.template.id === id)?.rank;
  const orderedTemplates = [...ranked.map((r) => r.template), ...templateList.filter((tpl) => !rankOf(tpl.id))];

  function handleProfessionChange(value: ProfessionCategory) {
    setProfession(value);
    const style = getRecommendedStyle(value);
    if (!touched.has('template')) setTemplateId(style.templateId);
    if (!touched.has('palette')) setColorPaletteId(style.colorPaletteId);
    if (!touched.has('font')) setFontPresetId(style.fontPresetId);
    if (!touched.has('animation')) setAnimationPresetId(style.animationPresetId);
    if (!touched.has('sections')) {
      setSectionOrder(style.sectionOrder);
      setSectionVisibility(style.sectionVisibility);
    }
  }

  function toggleSection(id: SectionId) {
    touch('sections');
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
          sectionOrder,
          sectionVisibility,
          designVersion: DESIGN_VERSION,
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('wizard.title')}</h1>
        <p className="mt-1 text-[15px] text-foreground-secondary">{t('wizard.description')}</p>
      </div>

      <ol className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3.5 shadow-card sm:gap-3 sm:px-5">
        {STEPS.map((label, index) => (
          <li key={label} aria-current={index === step ? 'step' : undefined} className="flex flex-1 items-center gap-2 last:flex-none sm:gap-3">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                index < step
                  ? 'border-primary bg-primary text-primary-foreground'
                  : index === step
                    ? 'border-primary bg-primary-soft text-primary-soft-foreground ring-4 ring-primary/10'
                    : 'border-input bg-surface-secondary text-muted-foreground'
              )}
            >
              {index < step ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className={cn('text-sm font-medium', index === step ? 'text-foreground' : index < step ? 'hidden text-foreground-secondary sm:inline' : 'hidden text-muted-foreground sm:inline')}>
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <div className={cn('h-0.5 min-w-4 flex-1 rounded-full transition-colors', index < step ? 'bg-primary' : 'bg-divider')} />
            )}
          </li>
        ))}
      </ol>

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
                        {t(`profession.${item.id}`)}
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
                {ranked.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t('design.template.recommendedFor', { profession: t(`profession.${profession}`) })}
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {orderedTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      rank={rankOf(template.id)}
                      showDescription
                      selected={templateId === template.id}
                      onSelect={() => {
                        touch('template');
                        setTemplateId(template.id);
                      }}
                    />
                  ))}
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
                        onClick={() => {
                          touch('palette');
                          setColorPaletteId(palette.id);
                        }}
                        className={cn(
                          'relative flex flex-col gap-2 rounded-lg border-2 p-3 text-start transition-all',
                          isSelected ? 'border-primary bg-primary-soft ring-4 ring-primary/15' : 'border-border bg-card hover:border-input hover:bg-accent/60'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute end-2 top-2">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex gap-1">
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: palette.accent }} />
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: `hsl(${palette.dark.primary})` }} />
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: `hsl(${palette.light.secondary})` }} />
                        </div>
                        <p className="text-xs font-medium">{t(`palette.${palette.id}`)}</p>
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
                          onClick={() => {
                            touch('font');
                            setFontPresetId(preset.id);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg border-2 p-3 text-start transition-all',
                            isSelected ? 'border-primary bg-primary-soft ring-4 ring-primary/15' : 'border-border bg-card hover:border-input hover:bg-accent/60'
                          )}
                        >
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={preset.headingFamily ? { fontFamily: preset.headingFamily, fontWeight: preset.headingWeight } : undefined}
                            >
                              {t(`font.${preset.id}`)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {preset.id === 'signature' ? t('font.signature.hint', { template: getTemplate(templateId).name }) : t(`font.${preset.id}.hint`)}
                            </p>
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
                          onClick={() => {
                            touch('animation');
                            setAnimationPresetId(preset.id);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg border-2 p-3 text-start transition-all',
                            isSelected ? 'border-primary bg-primary-soft ring-4 ring-primary/15' : 'border-border bg-card hover:border-input hover:bg-accent/60'
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium">{t(`animation.${preset.id}`)}</p>
                            <p className="text-xs text-muted-foreground">{t(`animation.${preset.id}.hint`)}</p>
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
              {sectionOrder.map((sectionId) => {
                const isEnabled = sectionVisibility[sectionId];
                const isRecommended = currentPreset.sections.includes(sectionId);
                return (
                  <div
                    key={sectionId}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-4 transition-colors',
                      isEnabled ? 'border-primary/30 bg-primary-soft' : 'border-border bg-card'
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
              {createPortfolio.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {step === STEPS.length - 1 ? t('wizard.create') : t('wizard.next')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
