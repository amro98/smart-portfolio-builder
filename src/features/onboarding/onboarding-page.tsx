import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  User,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  Palette,
  Camera,
  Heart,
  GraduationCap,
  Building,
  Sparkles,
  LayoutDashboard,
  FolderOpen,
  Zap,
  Coins,
  Award,
  MessageSquare,
  Image,
  Mail,
  Info,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { portfolioApi } from '@/lib/api/client';
import { professionPresets } from '@/lib/presets/professions';
import { colorPaletteList } from '@/lib/presets/colors';
import { animationPresetList } from '@/lib/presets/animations';
import { SECTION_LABELS, ALL_SECTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn, slugify } from '@/lib/utils';
import type {
  ProfessionCategory,
  ColorPaletteId,
  AnimationPresetId,
  ThemeMode,
  SectionId,
} from '@/types';

const PROFESSION_OPTIONS: { value: ProfessionCategory; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'doctor', label: 'Doctor / Medical' },
  { value: 'lawyer', label: 'Lawyer / Legal' },
  { value: 'designer', label: 'Designer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'coach', label: 'Coach / Consultant' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'student', label: 'Student' },
  { value: 'business-owner', label: 'Business Owner' },
  { value: 'other', label: 'Other' },
];

const SECTION_ICONS: Record<SectionId, React.ReactNode> = {
  hero: <LayoutDashboard className="h-5 w-5" />,
  about: <Info className="h-5 w-5" />,
  projects: <FolderOpen className="h-5 w-5" />,
  experience: <Briefcase className="h-5 w-5" />,
  skills: <Zap className="h-5 w-5" />,
  services: <Coins className="h-5 w-5" />,
  certifications: <Award className="h-5 w-5" />,
  testimonials: <MessageSquare className="h-5 w-5" />,
  gallery: <Image className="h-5 w-5" />,
  contact: <Mail className="h-5 w-5" />,
};

const STEP_LABELS = ['Profile', 'Style', 'Sections'];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const slideTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuthStore();
  const { setOnboardingStep } = useUIStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [profession, setProfession] = useState<ProfessionCategory>('developer');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [colorPaletteId, setColorPaletteId] = useState<ColorPaletteId>('monochrome');
  const [animationPresetId, setAnimationPresetId] = useState<AnimationPresetId>('modern');

  const [enabledSections, setEnabledSections] = useState<Record<SectionId, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_SECTIONS.forEach((s) => {
      initial[s] = false;
    });
    return initial as Record<SectionId, boolean>;
  });

  const currentPreset = useMemo(() => professionPresets[profession], [profession]);

  useEffect(() => {
    if (currentPreset) {
      setColorPaletteId(currentPreset.colorPalette);
      setAnimationPresetId(currentPreset.animationPreset);
      const updated: Record<string, boolean> = {};
      ALL_SECTIONS.forEach((s) => {
        updated[s] = currentPreset.sections.includes(s);
      });
      setEnabledSections(updated as Record<SectionId, boolean>);
    }
  }, [currentPreset]);

  useEffect(() => {
    if (!slugManuallyEdited && fullName) {
      setSlug(slugify(fullName));
    }
  }, [fullName, slugManuallyEdited]);

  useEffect(() => {
    setOnboardingStep(currentStep);
  }, [currentStep, setOnboardingStep]);

  const canProceedStep0 = fullName.trim() !== '' && title.trim() !== '' && slug.trim() !== '';

  const goNext = useCallback(() => {
    if (currentStep === 0 && !canProceedStep0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (currentStep < 2) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, canProceedStep0]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const toggleSection = useCallback((sectionId: SectionId) => {
    setEnabledSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const sectionVisibility = { ...enabledSections };
      const sectionOrder = ALL_SECTIONS.filter((s) => sectionVisibility[s]);

      await portfolioApi.update({
        fullName: fullName.trim(),
        title: title.trim(),
        slug: slug.trim(),
        profession,
        location: location.trim(),
        bio: bio.trim(),
        themeMode,
        colorPaletteId,
        animationPresetId,
        sectionOrder,
        sectionVisibility,
        ctaLabel: currentPreset.ctaLabel,
      });

      completeOnboarding();
      toast.success('Portfolio created successfully!');
      navigate('/dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    fullName,
    title,
    slug,
    profession,
    location,
    bio,
    themeMode,
    colorPaletteId,
    animationPresetId,
    enabledSections,
    currentPreset,
    completeOnboarding,
    navigate,
  ]);

  const progressValue = ((currentStep + 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8 sm:py-12">
        <div className="mb-8 text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <Layers className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Set Up Your Portfolio
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete these steps to create your professional portfolio.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEP_LABELS.map((label, index) => (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                      index < currentStep
                        ? 'border-primary bg-primary text-primary-foreground'
                        : index === currentStep
                          ? 'border-primary bg-background text-primary'
                          : 'border-muted-foreground/30 bg-background text-muted-foreground/50'
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      index <= currentStep
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1 rounded-full transition-colors',
                      index < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-lg border bg-card shadow-sm">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="p-6 sm:p-8"
            >
              {currentStep === 0 && (
                <StepProfile
                  fullName={fullName}
                  setFullName={setFullName}
                  title={title}
                  setTitle={setTitle}
                  slug={slug}
                  setSlug={(val) => {
                    setSlugManuallyEdited(true);
                    setSlug(val);
                  }}
                  profession={profession}
                  setProfession={setProfession}
                  location={location}
                  setLocation={setLocation}
                  bio={bio}
                  setBio={setBio}
                />
              )}
              {currentStep === 1 && (
                <StepStyle
                  profession={profession}
                  themeMode={themeMode}
                  setThemeMode={setThemeMode}
                  colorPaletteId={colorPaletteId}
                  setColorPaletteId={setColorPaletteId}
                  animationPresetId={animationPresetId}
                  setAnimationPresetId={setAnimationPresetId}
                  recommendedColor={currentPreset.colorPalette}
                  recommendedAnimation={currentPreset.animationPreset}
                />
              )}
              {currentStep === 2 && (
                <StepSections
                  enabledSections={enabledSections}
                  toggleSection={toggleSection}
                  recommendedSections={currentPreset.sections}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0}
            className={cn(currentStep === 0 && 'invisible')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < 2 ? (
            <Button onClick={goNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Portfolio
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepProfile({
  fullName,
  setFullName,
  title,
  setTitle,
  slug,
  setSlug,
  profession,
  setProfession,
  location,
  setLocation,
  bio,
  setBio,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  profession: ProfessionCategory;
  setProfession: (v: ProfessionCategory) => void;
  location: string;
  setLocation: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Basic Profile</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself to personalize your portfolio.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">
            Professional Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Senior Software Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">
            Username / Slug <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">portfolio.io/</span>
            <Input
              id="slug"
              placeholder="jane-doe"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profession">Profession Category</Label>
          <Select
            value={profession}
            onValueChange={(val) => setProfession(val as ProfessionCategory)}
          >
            <SelectTrigger id="profession">
              <SelectValue placeholder="Select your profession" />
            </SelectTrigger>
            <SelectContent>
              {PROFESSION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">Short Bio</Label>
          <Textarea
            id="bio"
            placeholder="A few words about yourself..."
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function StepStyle({
  profession,
  themeMode,
  setThemeMode,
  colorPaletteId,
  setColorPaletteId,
  animationPresetId,
  setAnimationPresetId,
  recommendedColor,
  recommendedAnimation,
}: {
  profession: ProfessionCategory;
  themeMode: ThemeMode;
  setThemeMode: (v: ThemeMode) => void;
  colorPaletteId: ColorPaletteId;
  setColorPaletteId: (v: ColorPaletteId) => void;
  animationPresetId: AnimationPresetId;
  setAnimationPresetId: (v: AnimationPresetId) => void;
  recommendedColor: ColorPaletteId;
  recommendedAnimation: AnimationPresetId;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Style Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Choose the look and feel of your portfolio. We have pre-selected options based
          on your profession.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Theme Mode</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={cn(
              'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors',
              themeMode === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/40'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                themeMode === 'light'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Light</p>
              <p className="text-xs text-muted-foreground">Clean and bright</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={cn(
              'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors',
              themeMode === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/40'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                themeMode === 'dark'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Dark</p>
              <p className="text-xs text-muted-foreground">Sleek and modern</p>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Color Palette</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {colorPaletteList.map((palette) => {
            const isRecommended = palette.id === recommendedColor;
            const isSelected = palette.id === colorPaletteId;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => setColorPaletteId(palette.id)}
                className={cn(
                  'relative flex flex-col gap-2 rounded-lg border-2 p-3 text-left transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40'
                )}
              >
                {isRecommended && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2.5 right-2 text-[10px]"
                  >
                    Recommended
                  </Badge>
                )}
                <div className="flex gap-1">
                  <div
                    className="h-6 w-6 rounded-full border border-border"
                    style={{ backgroundColor: palette.accent }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border border-border"
                    style={{
                      backgroundColor: `hsl(${palette.light.primary})`,
                    }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border border-border"
                    style={{
                      backgroundColor: `hsl(${palette.light.secondary})`,
                    }}
                  />
                </div>
                <p className="text-xs font-medium text-foreground">{palette.label}</p>
                {isSelected && (
                  <div className="absolute bottom-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Animation Style</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {animationPresetList.map((preset) => {
            const isRecommended = preset.id === recommendedAnimation;
            const isSelected = preset.id === animationPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setAnimationPresetId(preset.id)}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{preset.label}</p>
                    {isRecommended && (
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                      >
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {preset.description}
                  </p>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepSections({
  enabledSections,
  toggleSection,
  recommendedSections,
}: {
  enabledSections: Record<SectionId, boolean>;
  toggleSection: (id: SectionId) => void;
  recommendedSections: SectionId[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Content Sections</h2>
        <p className="text-sm text-muted-foreground">
          Choose which sections to include. Recommended sections for your profession are
          already enabled.
        </p>
      </div>

      <div className="grid gap-3">
        {ALL_SECTIONS.map((sectionId) => {
          const isEnabled = enabledSections[sectionId];
          const isRecommended = recommendedSections.includes(sectionId);
          return (
            <div
              key={sectionId}
              className={cn(
                'flex items-center justify-between rounded-lg border p-4 transition-colors',
                isEnabled
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-background'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md',
                    isEnabled
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {SECTION_ICONS[sectionId]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {SECTION_LABELS[sectionId]}
                    </p>
                    {isRecommended && (
                      <Badge variant="outline" className="text-[10px]">
                        Suggested
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={() => toggleSection(sectionId)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
