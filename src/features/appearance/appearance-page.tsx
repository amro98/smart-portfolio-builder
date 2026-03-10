import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Paintbrush,
  Type,
  Sparkles,
  Eye,
  EyeOff,
  Layout,
  Home,
  User,
  FolderOpen,
  Briefcase,
  Wrench,
  Coins,
  Award,
  MessageSquare,
  Image,
  Mail,
} from 'lucide-react';
import { usePortfolio, useUpdatePortfolio } from '@/lib/query/hooks';
import { templateList } from '@/lib/presets/templates';
import { colorPaletteList, colorPalettes } from '@/lib/presets/colors';
import { animationPresetList } from '@/lib/presets/animations';
import { professionList, professionPresets } from '@/lib/presets/professions';
import { fontPresetList } from '@/lib/presets/fonts';
import { ALL_SECTIONS } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingPage } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { AppearanceLivePreview } from './components/appearance-live-preview';
import type {
  TemplateId,
  ColorPaletteId,
  AnimationPresetId,
  FontPresetId,
  ThemeMode,
  SectionId,
  ProfessionCategory,
} from '@/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const SECTION_ICONS: Record<SectionId, React.ElementType> = {
  hero: Home,
  about: User,
  projects: FolderOpen,
  experience: Briefcase,
  skills: Wrench,
  services: Coins,
  certifications: Award,
  testimonials: MessageSquare,
  gallery: Image,
  contact: Mail,
};

export default function AppearancePage() {
  const { data: portfolio, isLoading, isError, refetch } = usePortfolio();
  const updatePortfolio = useUpdatePortfolio();
  const { t, dir } = useI18n();
  const [accentInput, setAccentInput] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: t('common.light'), icon: Sun },
    { value: 'dark', label: t('common.dark'), icon: Moon },
    { value: 'auto', label: t('common.auto'), icon: Monitor },
  ];

  const handleUpdate = useCallback(
    (data: Record<string, unknown>) => {
      updatePortfolio.mutate(data);
    },
    [updatePortfolio]
  );

  const handleResetAppearance = useCallback(() => {
    const sectionVisibility = ALL_SECTIONS.reduce((acc, section) => {
      acc[section] = true;
      return acc;
    }, {} as Record<SectionId, boolean>);

    handleUpdate({
      themeMode: 'auto',
      templateId: templateList[0]?.id,
      colorPaletteId: colorPaletteList[0]?.id,
      animationPresetId: animationPresetList[0]?.id,
      fontPresetId: fontPresetList[0]?.id,
      customAccentColor: '',
      sectionVisibility,
    });

    setAccentInput('');
    setResetDialogOpen(false);
    toast.success(t('appearance.reset.success'));
  }, [handleUpdate, t]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('appearance.title')} />
        <LoadingPage />
      </div>
    );
  }

  if (isError || !portfolio) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('appearance.title')} />
        <ErrorState message="Failed to load portfolio settings" onRetry={() => refetch()} />
      </div>
    );
  }

  const currentAccent = accentInput || portfolio.customAccentColor || '';
  const activeProfessionPreset = professionPresets[portfolio.profession];

  const handleApplyProfessionPreset = () => {
    const preset = professionPresets[portfolio.profession];
    const sectionVisibility = ALL_SECTIONS.reduce((acc, section) => {
      acc[section] = preset.sections.includes(section);
      return acc;
    }, {} as Record<SectionId, boolean>);

    handleUpdate({
      profession: preset.id,
      templateId: preset.template,
      colorPaletteId: preset.colorPalette,
      animationPresetId: preset.animationPreset,
      sectionOrder: preset.sections,
      sectionVisibility,
      ctaLabel: preset.ctaLabel,
    });

    toast.success(t('appearance.profession.applied'));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title={t('appearance.title')}
          description={t('appearance.description')}
        />
        <Button
          variant="outline"
          onClick={() => setResetDialogOpen(true)}
          className="h-10"
        >
          {t('appearance.reset.button')}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AppearanceLivePreview portfolio={portfolio} dir={dir} />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{t('appearance.profession.title')}</CardTitle>
            </div>
            <CardDescription>{t('appearance.profession.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('appearance.profession.selector')}</Label>
              <Select
                value={portfolio.profession}
                onValueChange={(value) => handleUpdate({ profession: value as ProfessionCategory })}
              >
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
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-3">
              <p className="text-sm font-medium">{t('appearance.profession.presetDetails')}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border bg-background p-2">
                  <span className="text-muted-foreground">{t('appearance.profession.template')}</span>
                  <p className="mt-1 font-medium capitalize">{activeProfessionPreset.template}</p>
                </div>
                <div className="rounded-md border bg-background p-2">
                  <span className="text-muted-foreground">{t('appearance.profession.palette')}</span>
                  <p className="mt-1 font-medium capitalize">{activeProfessionPreset.colorPalette.replace('-', ' ')}</p>
                </div>
                <div className="rounded-md border bg-background p-2">
                  <span className="text-muted-foreground">{t('appearance.profession.animation')}</span>
                  <p className="mt-1 font-medium capitalize">{activeProfessionPreset.animationPreset.replace('-', ' ')}</p>
                </div>
                <div className="rounded-md border bg-background p-2">
                  <span className="text-muted-foreground">{t('appearance.profession.cta')}</span>
                  <p className="mt-1 font-medium line-clamp-1">{activeProfessionPreset.ctaLabel}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('appearance.profession.sections')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfessionPreset.sections.map((sectionId) => (
                    <Badge key={sectionId} variant="secondary" className="text-[11px]">
                      {t(`sections.${sectionId}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleApplyProfessionPreset} className="w-full">
              {t('appearance.profession.applyPreset')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t('appearance.template.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('appearance.template.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {templateList.map((template) => {
              const isSelected = portfolio.templateId === template.id;
              const isDisabled = !template.available;

              return (
                <motion.div
                  key={template.id}
                  whileHover={template.available ? { y: -2 } : undefined}
                  whileTap={template.available ? { scale: 0.98 } : undefined}
                >
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleUpdate({ templateId: template.id as TemplateId })}
                    className={cn(
                      'relative w-full overflow-hidden rounded-lg border-2 text-left transition-all',
                      isSelected && 'ring-2 ring-primary border-primary',
                      !isSelected && !isDisabled && 'border-border hover:border-foreground/20',
                      isDisabled && 'cursor-not-allowed opacity-60 border-border'
                    )}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={template.previewImage}
                        alt={template.label}
                        className="h-full w-full object-cover"
                      />
                      {isDisabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                          <Badge variant="secondary">{t('appearance.template.disabled')}</Badge>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute right-2 top-2">
                          <Badge>{t('appearance.template.active')}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-medium">{template.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t('appearance.theme.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('appearance.theme.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {THEME_OPTIONS.map((option) => {
              const isSelected = portfolio.themeMode === option.value;
              const Icon = option.icon;

              return (
                <motion.div
                  key={option.value}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => handleUpdate({ themeMode: option.value })}
                    className={cn(
                      'flex w-full flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all',
                      isSelected && 'ring-2 ring-primary border-primary',
                      !isSelected && 'border-border hover:border-foreground/20'
                    )}
                  >
                    <Icon className={cn('h-6 w-6', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', isSelected && 'text-primary')}>
                      {option.label}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t('appearance.colorPalette.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('appearance.colorPalette.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {colorPaletteList.map((palette) => {
              const isSelected = portfolio.colorPaletteId === palette.id;
              const lightColors = palette.light;

              return (
                <motion.div
                  key={palette.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => handleUpdate({ colorPaletteId: palette.id as ColorPaletteId })}
                    className={cn(
                      'relative flex w-full flex-col gap-3 rounded-lg border-2 p-4 text-left transition-all',
                      isSelected && 'ring-2 ring-primary border-primary',
                      !isSelected && 'border-border hover:border-foreground/20'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute right-2 top-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border border-border"
                        style={{ backgroundColor: palette.accent }}
                      />
                      <div
                        className="h-5 w-5 rounded-full border border-border"
                        style={{ backgroundColor: `hsl(${lightColors.primary})` }}
                      />
                      <div
                        className="h-5 w-5 rounded-full border border-border"
                        style={{ backgroundColor: `hsl(${lightColors.secondary})` }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{palette.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {palette.description}
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t('appearance.typography.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('appearance.typography.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {fontPresetList.map((preset) => {
              const isSelected = portfolio.fontPresetId === preset.id;

              return (
                <motion.div
                  key={preset.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => handleUpdate({ fontPresetId: preset.id as FontPresetId })}
                    className={cn(
                      'relative flex w-full flex-col gap-3 rounded-lg border-2 p-5 text-left transition-all',
                      isSelected && 'ring-2 ring-primary border-primary',
                      !isSelected && 'border-border hover:border-foreground/20'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute right-2 top-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{preset.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {preset.description}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p
                        className="text-lg font-semibold leading-tight"
                        style={{
                          fontFamily: preset.headingFamily,
                          fontWeight: preset.headingWeight,
                        }}
                      >
                        {t('appearance.typography.headingSample')}
                      </p>
                      <p
                        className="text-sm text-muted-foreground"
                        style={{
                          fontFamily: preset.bodyFamily,
                          fontWeight: preset.bodyWeight,
                        }}
                      >
                        {t('appearance.typography.bodySample')}
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t('appearance.animationPreset.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('appearance.animationPreset.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {animationPresetList.map((preset) => {
              const isSelected = portfolio.animationPresetId === preset.id;

              return (
                <motion.div
                  key={preset.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate({ animationPresetId: preset.id as AnimationPresetId })
                    }
                    className={cn(
                      'relative flex w-full flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all',
                      isSelected && 'ring-2 ring-primary border-primary',
                      !isSelected && 'border-border hover:border-foreground/20'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute right-2 top-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <p className="font-medium text-sm">{preset.label}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t('appearance.customAccentColor.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('appearance.customAccentColor.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="customAccentColor" className="sr-only">
                {t('appearance.customAccentColor.inputLabel')}
              </Label>
              <Input
                id="customAccentColor"
                placeholder="#3b82f6"
                value={currentAccent}
                onChange={(e) => {
                  setAccentInput(e.target.value);
                }}
                onBlur={() => {
                  if (currentAccent !== portfolio.customAccentColor) {
                    handleUpdate({ customAccentColor: currentAccent });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdate({ customAccentColor: currentAccent });
                  }
                }}
              />
            </div>
            <div
              className="h-10 w-10 shrink-0 rounded-md border border-border"
              style={{
                backgroundColor: currentAccent && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(currentAccent)
                  ? currentAccent
                  : 'transparent',
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t('appearance.sectionVisibility.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('appearance.sectionVisibility.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {ALL_SECTIONS.map((sectionId, index) => {
              const Icon = SECTION_ICONS[sectionId];
              const isVisible = portfolio.sectionVisibility?.[sectionId] ?? true;

              return (
                <div key={sectionId}>
                  <div className="flex items-center justify-between rounded-md px-3 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', isVisible ? 'text-foreground' : 'text-muted-foreground')} />
                      <span className={cn('text-sm font-medium', !isVisible && 'text-muted-foreground')}>
                        {t(`sections.${sectionId}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isVisible ? (
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <Switch
                        checked={isVisible}
                        onCheckedChange={(checked) => {
                          handleUpdate({
                            sectionVisibility: {
                              ...portfolio.sectionVisibility,
                              [sectionId]: checked,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                  {index < ALL_SECTIONS.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title={t('appearance.reset.dialog.title')}
        description={t('appearance.reset.dialog.description')}
        onConfirm={handleResetAppearance}
        confirmLabel="appearance.reset.dialog.confirm"
        cancelLabel="appearance.reset.dialog.cancel"
        destructive
      />
    </div>
  );
}
