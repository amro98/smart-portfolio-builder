import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Globe,
  Youtube,
  Figma,
  Dribbble,
  Camera,
  Trash2,
  Save,
  User,
  CalendarDays,
  Mail,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { usePortfolio, useUpdatePortfolio } from '@/lib/query/hooks';
import { uploadsApi, resolveMediaUrl, ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/lib/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingPage } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import type { Portfolio } from '@/types';
import { useI18n } from '@/lib/i18n';

const profileSchema = z.object({
  fullName: z.string().min(1, 'profile.basicInformation.fullName.required').max(100),
  title: z.string().max(120).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  slug: z
    .string()
    .min(3, 'profile.basicInformation.slug.required')
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'profile.basicInformation.slug.invalid'),
  ctaLabel: z.string().max(50).optional().or(z.literal('')),
  ctaLink: z.string().url('profile.basicInformation.ctaLink.invalid').optional().or(z.literal('')),
  socialLinks: z.object({
    linkedin: z.string().optional().or(z.literal('')),
    github: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
    behance: z.string().optional().or(z.literal('')),
    dribbble: z.string().optional().or(z.literal('')),
    website: z.string().optional().or(z.literal('')),
    youtube: z.string().optional().or(z.literal('')),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// The avatar is staged locally (a picked File + an object-URL preview, or an explicit
// "removed" marker) and only actually uploaded/persisted when the user clicks Save
// Changes, alongside every other field, in one PATCH — never on its own.
type StagedAvatar =
  | { type: 'unchanged' }
  | { type: 'file'; file: File; previewUrl: string }
  | { type: 'removed' };

const SOCIAL_FIELDS = [
  { key: 'linkedin' as const, label: 'profile.socialLinks.fields.linkedin', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'github' as const, label: 'profile.socialLinks.fields.github', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'twitter' as const, label: 'profile.socialLinks.fields.twitter', icon: Twitter, placeholder: 'https://x.com/username' },
  { key: 'instagram' as const, label: 'profile.socialLinks.fields.instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'behance' as const, label: 'profile.socialLinks.fields.behance', icon: Figma, placeholder: 'https://behance.net/username' },
  { key: 'dribbble' as const, label: 'profile.socialLinks.fields.dribbble', icon: Dribbble, placeholder: 'https://dribbble.com/username' },
  { key: 'website' as const, label: 'profile.socialLinks.fields.website', icon: Globe, placeholder: 'https://yoursite.com' },
  { key: 'youtube' as const, label: 'profile.socialLinks.fields.youtube', icon: Youtube, placeholder: 'https://youtube.com/@channel' },
] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function ProfilePage() {
  const { t } = useI18n();
  const {
    data: portfolio,
    isLoading,
    isError,
    refetch,
  } = usePortfolio();

  const updatePortfolio = useUpdatePortfolio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stagedAvatar, setStagedAvatar] = useState<StagedAvatar>({ type: 'unchanged' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      title: '',
      bio: '',
      location: '',
      slug: '',
      ctaLabel: '',
      ctaLink: '',
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: '',
        instagram: '',
        behance: '',
        dribbble: '',
        website: '',
        youtube: '',
      },
    },
  });

  useEffect(() => {
    if (!portfolio) return;
    // A background refetch (e.g. another tab, a query invalidation elsewhere) must never
    // clobber edits the user hasn't saved yet — only resync when there's nothing staged.
    if (isDirty || stagedAvatar.type !== 'unchanged') return;

    reset({
      fullName: portfolio.fullName ?? '',
      title: portfolio.title ?? '',
      bio: portfolio.bio ?? '',
      location: portfolio.location ?? '',
      slug: portfolio.slug ?? '',
      ctaLabel: portfolio.ctaLabel ?? '',
      ctaLink: portfolio.ctaLink ?? '',
      socialLinks: {
        linkedin: portfolio.socialLinks?.linkedin ?? '',
        github: portfolio.socialLinks?.github ?? '',
        twitter: portfolio.socialLinks?.twitter ?? '',
        instagram: portfolio.socialLinks?.instagram ?? '',
        behance: portfolio.socialLinks?.behance ?? '',
        dribbble: portfolio.socialLinks?.dribbble ?? '',
        website: portfolio.socialLinks?.website ?? '',
        youtube: portfolio.socialLinks?.youtube ?? '',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, reset]);

  // Release the staged blob: preview URL whenever it's replaced or the component unmounts.
  useEffect(() => {
    if (stagedAvatar.type !== 'file') return;
    return () => URL.revokeObjectURL(stagedAvatar.previewUrl);
  }, [stagedAvatar]);

  const slugValue = watch('slug');
  const fullNameValue = watch('fullName');

  const displayAvatar =
    stagedAvatar.type === 'file'
      ? stagedAvatar.previewUrl
      : stagedAvatar.type === 'removed'
        ? ''
        : resolveMediaUrl(portfolio?.avatarUrl);

  const hasUnsavedChanges = isDirty || stagedAvatar.type !== 'unchanged';
  const isSaving = isSubmitting || updatePortfolio.isPending;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WEBP, or GIF image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(`Image must be smaller than ${Math.floor(MAX_IMAGE_SIZE_BYTES / (1024 * 1024))}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Stage only — no upload, no portfolio update, no refetch until Save Changes.
    if (stagedAvatar.type === 'file') {
      URL.revokeObjectURL(stagedAvatar.previewUrl);
    }
    setStagedAvatar({ type: 'file', file, previewUrl: URL.createObjectURL(file) });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleRemoveAvatar() {
    if (stagedAvatar.type === 'file') {
      URL.revokeObjectURL(stagedAvatar.previewUrl);
    }
    setStagedAvatar({ type: 'removed' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    let avatarUrl = portfolio?.avatarUrl ?? '';

    if (stagedAvatar.type === 'file') {
      try {
        const { url } = await uploadsApi.uploadImage(stagedAvatar.file);
        avatarUrl = url;
      } catch (error) {
        // Upload never reached the portfolio update — form values and the staged file
        // stay exactly as they were so the user can just hit Save again.
        toast.error(error instanceof Error ? error.message : 'Failed to upload image.');
        return;
      }
    } else if (stagedAvatar.type === 'removed') {
      avatarUrl = '';
    }

    const payload: Partial<Portfolio> = {
      fullName: values.fullName,
      title: values.title ?? '',
      bio: values.bio ?? '',
      location: values.location ?? '',
      slug: values.slug,
      ctaLabel: values.ctaLabel ?? '',
      ctaLink: values.ctaLink ?? '',
      avatarUrl,
      socialLinks: {
        linkedin: values.socialLinks.linkedin ?? '',
        github: values.socialLinks.github ?? '',
        twitter: values.socialLinks.twitter ?? '',
        instagram: values.socialLinks.instagram ?? '',
        behance: values.socialLinks.behance ?? '',
        dribbble: values.socialLinks.dribbble ?? '',
        website: values.socialLinks.website ?? '',
        youtube: values.socialLinks.youtube ?? '',
      },
    };

    try {
      await updatePortfolio.mutateAsync(payload);
    } catch {
      // useUpdatePortfolio already surfaces a toast; keep form + staged avatar intact.
      return;
    }

    if (stagedAvatar.type === 'file') {
      URL.revokeObjectURL(stagedAvatar.previewUrl);
    }
    setStagedAvatar({ type: 'unchanged' });
    reset(values);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load profile data."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('profile.title')}
        description={t('profile.description')}
      >
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!hasUnsavedChanges || isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t('profile.saveChanges')}
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('profile.basicInformation')}</CardTitle>
              <CardDescription>{t('profile.basicInformation.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('profile.basicInformation.fullName')}</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{t(`${errors.fullName.message}`)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">{t('profile.basicInformation.title')}</Label>
                  <Input
                    id="title"
                    placeholder="Full-Stack Developer"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{(errors.title.message)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('profile.basicInformation.bio')}</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell visitors about yourself..."
                  rows={4}
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">{t('profile.basicInformation.location')}</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    {...register('location')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">{t('profile.basicInformation.slug')}</Label>
                  <Input
                    id="slug"
                    placeholder="johndoe"
                    {...register('slug')}
                  />
                  {slugValue && (
                    <p className="text-xs text-muted-foreground">/u/{slugValue}</p>
                  )}
                  {errors.slug && (
                    <p className="text-sm text-destructive">{t(`${errors.slug.message}`)}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ctaLabel">{t('profile.basicInformation.ctaLabel')}</Label>
                  <Input
                    id="ctaLabel"
                    placeholder="Get in Touch"
                    {...register('ctaLabel')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">{t('profile.basicInformation.ctaLink')}</Label>
                  <Input
                    id="ctaLink"
                    placeholder="https://calendly.com/you"
                    {...register('ctaLink')}
                  />
                  {errors.ctaLink && (
                    <p className="text-sm text-destructive">{t(`${errors.ctaLink.message}`)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('profile.socialLinks.title')}</CardTitle>
              <CardDescription>{t('profile.socialLinks.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {SOCIAL_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`social-${field.key}`}>{t(field.label)}</Label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={`social-${field.key}`}
                        className="pl-10"
                        placeholder={field.placeholder}
                        {...register(`socialLinks.${field.key}`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('profile.avatar.title')}</CardTitle>
              <CardDescription>{t('profile.avatar.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-muted bg-muted">
                {isSaving ? (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={fullNameValue || 'Avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
                    {fullNameValue ? getInitials(fullNameValue) : <User className="h-10 w-10 text-muted-foreground" />}
                  </div>
                )}
              </div>
              {stagedAvatar.type !== 'unchanged' && !isSaving && (
                <p className="text-xs text-muted-foreground">{t('profile.avatar.staged')}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isSaving}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {t('profile.avatar.uploadButton')}
                </Button>
                {displayAvatar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isSaving}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('profile.avatar.removeButton')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('profile.info.title')}</CardTitle>
              <CardDescription>{t('profile.info.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t('profile.info.email')}</p>
                  <p className="text-sm truncate">{portfolio?.email || 'Not set'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t('profile.info.Profession')}</p>
                  <p className="text-sm capitalize">{portfolio?.profession?.replace('-', ' ') || 'Not set'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t('profile.info.memberSince')}</p>
                  <p className="text-sm">
                    {portfolio?.updatedAt ? formatDate(portfolio.updatedAt) : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
