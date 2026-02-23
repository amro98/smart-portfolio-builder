import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView, type Variants } from 'framer-motion';
import {
  MapPin, Mail, ExternalLink, Github, Linkedin, Twitter,
  Instagram, Globe, Youtube, ArrowRight, Star, Calendar,
  Building, Award, Quote, Send, ChevronUp, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn, formatDate } from '@/lib/utils';
import { colorPalettes, type ThemeColors } from '@/lib/presets/colors';
import { animationPresets } from '@/lib/presets/animations';
import { fontPresets } from '@/lib/presets/fonts';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import type {
  PublicPortfolioData, SectionId, Portfolio, Project,
  Experience, Skill, Service, Certification, Testimonial, GalleryItem
} from '@/types';

interface PortfolioRendererProps {
  data: PublicPortfolioData;
}

function buildCssVars(colors: ThemeColors): Record<string, string> {
  return {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card': colors.card,
    '--card-foreground': colors.cardForeground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
  };
}

function getSocialIcon(key: string) {
  const icons: Record<string, React.ReactNode> = {
    github: <Github className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    website: <Globe className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
    behance: <Globe className="w-5 h-5" />,
    dribbble: <Globe className="w-5 h-5" />,
  };
  return icons[key] || <Globe className="w-5 h-5" />;
}

function SocialLinksList({ socialLinks }: { socialLinks: Portfolio['socialLinks'] }) {
  const links = Object.entries(socialLinks).filter(([, url]) => url && url.trim() !== '');
  if (links.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      {links.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          {getSocialIcon(key)}
        </a>
      ))}
    </div>
  );
}

function AnimatedSection({
  id,
  children,
  className,
  variants,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  variants: Record<string, unknown>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      id={id}
      ref={ref}
      variants={variants as Variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-12 text-center">
      <h2
        className="text-3xl sm:text-4xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--heading-family)' }}
      >
        {title}
      </h2>
      <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-primary" />
    </div>
  );
}

function HeroSection({
  portfolio,
  animation,
}: {
  portfolio: Portfolio;
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      id="hero"
      ref={ref}
      variants={animation.hero}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {portfolio.coverUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${portfolio.coverUrl})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary" />
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {portfolio.avatarUrl && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <img
              src={portfolio.avatarUrl}
              alt={portfolio.fullName}
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-background shadow-xl"
            />
          </motion.div>
        )}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={cn(
            'text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4',
            portfolio.coverUrl ? 'text-white' : ''
          )}
          style={{ fontFamily: 'var(--heading-family)' }}
        >
          {portfolio.fullName}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={cn(
            'text-xl sm:text-2xl mb-6',
            portfolio.coverUrl ? 'text-white/80' : 'text-muted-foreground'
          )}
        >
          {portfolio.title}
        </motion.p>
        {portfolio.bio && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={cn(
              'max-w-2xl mx-auto text-base sm:text-lg mb-8 leading-relaxed',
              portfolio.coverUrl ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            {portfolio.bio}
          </motion.p>
        )}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          {portfolio.ctaLabel && portfolio.ctaLink && (
            <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="text-base px-8 py-6">
                {portfolio.ctaLabel}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          )}
          {portfolio.sectionVisibility.contact && (
            <Button
              variant={portfolio.coverUrl ? 'secondary' : 'outline'}
              size="lg"
              className="text-base px-8 py-6"
              onClick={() => scrollToSection('contact')}
            >
              {t('public.hero.contactButton')}
            </Button>
          )}
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <SocialLinksList socialLinks={portfolio.socialLinks} />
        </motion.div>
      </div>
    </motion.section>
  );
}

function AboutSection({
  portfolio,
  animation,
}: {
  portfolio: Portfolio;
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();

  return (
    <AnimatedSection
      id="about"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.about.heading')} />
        <div className="max-w-3xl mx-auto text-center">
          {portfolio.bio && (
            <p className="text-lg leading-relaxed text-muted-foreground mb-8">
              {portfolio.bio}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {portfolio.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{portfolio.location}</span>
              </div>
            )}
            {portfolio.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <a href={`mailto:${portfolio.email}`} className="hover:text-primary transition-colors">
                  {portfolio.email}
                </a>
              </div>
            )}
          </div>
          {portfolio.profession && (
            <div className="mt-6">
              <Badge variant="secondary" className="text-sm px-4 py-1.5 capitalize">
                {t(`profession.${portfolio.profession}`)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}

function ProjectsSection({
  projects,
  animation,
}: {
  projects: Project[];
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();

  const published = projects
    .filter((p) => p.status === 'published')
    .sort((a, b) => a.order - b.order);

  if (published.length === 0) return null;

  return (
    <AnimatedSection
      id="projects"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.projects.heading')} />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * animation.staggerChildren, duration: 0.5 }}
              whileHover={{
                scale: animation.cardHover.scale,
                y: animation.cardHover.y,
                transition: animation.cardHover.transition,
              }}
              className="group rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {project.coverImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <h3
                  className="text-lg font-semibold mb-2 line-clamp-1"
                  style={{ fontFamily: 'var(--heading-family)' }}
                >
                  {project.title}
                </h3>
                {project.shortDescription && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.shortDescription}
                  </p>
                )}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        {t('public.projects.live')}
                      </Button>
                    </a>
                  )}
                  {project.repositoryUrl && (
                    <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Github className="w-3.5 h-3.5 mr-1.5" />
                        {t('public.projects.code')}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function ExperienceSection({
  experiences,
  animation,
}: {
  experiences: Experience[];
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();

  const sorted = [...experiences].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return null;

  return (
    <AnimatedSection
      id="experience"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.experience.heading')} />
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-10">
              {sorted.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * animation.staggerChildren, duration: 0.5 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ fontFamily: 'var(--heading-family)' }}
                        >
                          {exp.role}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-0.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>{exp.company}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formatDate(exp.startDate)} - {exp.current ? t('public.experience.present') : formatDate(exp.endDate)}
                        </span>
                      </div>
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3" />
                        <span>{exp.location}</span>
                      </div>
                    )}
                    {exp.description.length > 0 && (
                      <ul className="space-y-1.5">
                        {exp.description.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.industryTag && (
                      <div className="mt-4">
                        <Badge variant="outline" className="text-xs">
                          {exp.industryTag}
                        </Badge>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

function SkillsSection({
  skills,
  animation,
}: {
  skills: Skill[];
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();

  if (skills.length === 0) return null;

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || t('public.skills.general');
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <AnimatedSection
      id="skills"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.skills.heading')} />
        <div className="grid gap-10 sm:grid-cols-2">
          {Object.entries(grouped).map(([category, categorySkills], catIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIdx * 0.1, duration: 0.5 }}
            >
              <h3
                className="text-lg font-semibold mb-6"
                style={{ fontFamily: 'var(--heading-family)' }}
              >
                {category}
              </h3>
              <div className="space-y-4">
                {categorySkills
                  .sort((a, b) => a.order - b.order)
                  .map((skill, idx) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * animation.staggerChildren, duration: 0.4 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
                      </div>
                      <Progress value={skill.proficiency} className="h-2" />
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function ServicesSection({
  services,
  animation,
}: {
  services: Service[];
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();

  const sorted = [...services].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return null;

  return (
    <AnimatedSection
      id="services"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.services.heading')} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * animation.staggerChildren, duration: 0.5 }}
              whileHover={{
                scale: animation.cardHover.scale,
                y: animation.cardHover.y,
                transition: animation.cardHover.transition,
              }}
              className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-lg transition-shadow text-center"
            >
              <h3
                className="text-lg font-semibold mb-3"
                style={{ fontFamily: 'var(--heading-family)' }}
              >
                {service.title}
              </h3>
              {service.description && (
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>
              )}
              <Separator className="my-4" />
              <div className="space-y-2 mb-6">
                {service.priceLabel && (
                  <p className="text-2xl font-bold text-primary">{service.priceLabel}</p>
                )}
                {service.duration && (
                  <p className="text-xs text-muted-foreground">{service.duration}</p>
                )}
              </div>
              {service.ctaLabel && service.ctaLink && (
                <a href={service.ctaLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">
                    {service.ctaLabel}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function CertificationsSection({
  certifications,
  animation,
}: {
  certifications: Certification[];
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();

  const sorted = [...certifications].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return null;

  return (
    <AnimatedSection
      id="certifications"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.certifications.heading')} />
        <div className="max-w-3xl mx-auto space-y-6">
          {sorted.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * animation.staggerChildren, duration: 0.5 }}
              className="flex items-start gap-4 rounded-xl border border-border/50 bg-card p-6 shadow-sm"
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                  <h3
                    className="text-base font-semibold"
                    style={{ fontFamily: 'var(--heading-family)' }}
                  >
                    {cert.title}
                  </h3>
                  <Badge variant="outline" className="text-xs shrink-0 w-fit">
                    {cert.type === 'education' ? 'Education' : 'Certification'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{cert.institution}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDate(cert.issueDate)}
                    {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                  </span>
                </div>
                {cert.credentialId && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Credential ID: {cert.credentialId}
                  </p>
                )}
                {cert.verificationUrl && (
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    {t('public.certifications.viewCredential')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function TestimonialsSection({
  testimonials,
  animation,
}: {
  testimonials: Testimonial[];
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();

  const sorted = [...testimonials].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return null;

  return (
    <AnimatedSection
      id="testimonials"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.testimonials.heading')} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * animation.staggerChildren, duration: 0.5 }}
              className="rounded-xl border border-border/50 bg-card p-6 shadow-sm"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>
              {testimonial.rating > 0 && (
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < testimonial.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-border'
                      )}
                    />
                  ))}
                </div>
              )}
              <Separator className="mb-4" />
              <div className="flex items-center gap-3">
                {testimonial.avatarUrl ? (
                  <img
                    src={testimonial.avatarUrl}
                    alt={testimonial.clientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {testimonial.clientName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{testimonial.clientName}</p>
                  {testimonial.role && (
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function GallerySection({
  gallery,
  animation,
}: {
  gallery: GalleryItem[];
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();

  const sorted = [...gallery].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return null;

  return (
    <AnimatedSection
      id="gallery"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.gallery.heading')} />
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {sorted.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * animation.staggerChildren, duration: 0.5 }}
              className="group relative break-inside-avoid rounded-xl overflow-hidden"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end">
                <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  {item.description && (
                    <p className="text-white/70 text-xs mt-1">{item.description}</p>
                  )}
                  {item.category && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {item.category}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function ContactSection({
  portfolio,
  animation,
}: {
  portfolio: Portfolio;
  animation: (typeof animationPresets)[keyof typeof animationPresets];
}) {
  const { t } = useI18n();
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('toast.messageSent'));
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <AnimatedSection
      id="contact"
      variants={animation.sectionReveal}
      className="py-20 sm:py-28"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={t('public.contact.heading')} />
        <div className="grid gap-10 lg:grid-cols-2 max-w-4xl mx-auto">
          <div>
            <h3
              className="text-xl font-semibold mb-4"
              style={{ fontFamily: 'var(--heading-family)' }}
            >
              {t('public.contact.subheading')}
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('public.contact.description')}
            </p>
            <div className="space-y-4 mb-8">
              {portfolio.email && (
                <a
                  href={`mailto:${portfolio.email}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{portfolio.email}</span>
                </a>
              )}
              {portfolio.location && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{portfolio.location}</span>
                </div>
              )}
            </div>
            <SocialLinksList socialLinks={portfolio.socialLinks} />
            {portfolio.ctaLabel && portfolio.ctaLink && (
              <div className="mt-6">
                <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    {portfolio.ctaLabel}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
              </div>
            )}
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder={t('public.contact.namePlaceholder')}
                  value={formState.name}
                  onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder={t('public.contact.emailPlaceholder')}
                  value={formState.email}
                  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div>
                <Textarea
                  placeholder={t('public.contact.messagePlaceholder')}
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {t('public.contact.send')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

function NavBar({
  portfolio,
  visibleSections,
}: {
  portfolio: Portfolio;
  visibleSections: SectionId[];
}) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navSections = visibleSections.filter((s) => s !== 'hero');

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => scrollTo('hero')}
          className={cn(
            'text-base font-semibold transition-colors cursor-pointer',
            scrolled ? 'text-foreground' : 'text-foreground'
          )}
          style={{ fontFamily: 'var(--heading-family)' }}
        >
          {portfolio.fullName}
        </button>
        <div className="hidden md:flex items-center gap-1">
          <LanguageSwitcher compact />
          {navSections.map((section) => (
            <button
              key={section}
              onClick={() => scrollTo(section)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/50 cursor-pointer"
            >
              {t(`sections.${section}`)}
            </button>
          ))}
          {portfolio.ctaLabel && portfolio.ctaLink && (
            <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer" className="ml-2">
              <Button size="sm">
                {portfolio.ctaLabel}
              </Button>
            </a>
          )}
        </div>
        <button
          className="md:hidden p-2 text-foreground cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/50 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              <LanguageSwitcher className="mb-3" />
              {navSections.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollTo(section)}
                  className="block w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors cursor-pointer"
                >
                  {t(`sections.${section}`)}
                </button>
              ))}
              {portfolio.ctaLabel && portfolio.ctaLink && (
                <a href={portfolio.ctaLink} target="_blank" rel="noopener noreferrer" className="block mt-2">
                  <Button size="sm" className="w-full">
                    {portfolio.ctaLabel}
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Footer({ portfolio }: { portfolio: Portfolio }) {
  const { t } = useI18n();

  return (
    <footer className="py-8 border-t border-border/50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {new Date().getFullYear()} {portfolio.fullName}. {t('public.footer.rights')}
        </p>
      </div>
    </footer>
  );
}

export function PortfolioRenderer({ data }: PortfolioRendererProps) {
  const { portfolio, projects, experiences, skills, services, certifications, testimonials, gallery } = data;

  const palette = colorPalettes[portfolio.colorPaletteId] || colorPalettes['monochrome'];
  const animation = animationPresets[portfolio.animationPresetId] || animationPresets['none'];
  const font = fontPresets[portfolio.fontPresetId] || fontPresets['professional'];

  const resolvedTheme = useMemo(() => {
    if (portfolio.themeMode === 'dark') return 'dark';
    if (portfolio.themeMode === 'light') return 'light';
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, [portfolio.themeMode]);

  const themeColors = resolvedTheme === 'dark' ? palette.dark : palette.light;
  const cssVars = buildCssVars(themeColors);

  const visibleSections = portfolio.sectionOrder.filter(
    (s) => portfolio.sectionVisibility[s]
  );

  const sectionRenderers: Record<SectionId, React.ReactNode> = {
    hero: <HeroSection key="hero" portfolio={portfolio} animation={animation} />,
    about: <AboutSection key="about" portfolio={portfolio} animation={animation} />,
    projects: <ProjectsSection key="projects" projects={projects} animation={animation} />,
    experience: <ExperienceSection key="experience" experiences={experiences} animation={animation} />,
    skills: <SkillsSection key="skills" skills={skills} animation={animation} />,
    services: <ServicesSection key="services" services={services} animation={animation} />,
    certifications: <CertificationsSection key="certifications" certifications={certifications} animation={animation} />,
    testimonials: <TestimonialsSection key="testimonials" testimonials={testimonials} animation={animation} />,
    gallery: <GallerySection key="gallery" gallery={gallery} animation={animation} />,
    contact: <ContactSection key="contact" portfolio={portfolio} animation={animation} />,
  };

  return (
    <div
      className={cn(resolvedTheme === 'dark' ? 'dark' : '')}
      style={{
        ...cssVars,
        '--heading-family': font.headingFamily,
        '--heading-weight': font.headingWeight,
        '--body-family': font.bodyFamily,
        '--body-weight': font.bodyWeight,
        fontFamily: font.bodyFamily,
        fontWeight: font.bodyWeight,
        backgroundColor: `hsl(${themeColors.background})`,
        color: `hsl(${themeColors.foreground})`,
      } as React.CSSProperties}
    >
      <NavBar portfolio={portfolio} visibleSections={visibleSections} />
      <main>
        <AnimatePresence mode="sync">
          {visibleSections.map((sectionId) => sectionRenderers[sectionId])}
        </AnimatePresence>
      </main>
      <Footer portfolio={portfolio} />
      <ScrollToTop />
    </div>
  );
}

export default PortfolioRenderer;
