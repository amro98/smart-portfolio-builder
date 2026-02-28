import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  List,
  Globe,
  Eye,
  CheckCircle,
  Circle,
  Plus,
  UserCog,
  ExternalLink,
  Send,
  FileEdit,
  Palette,
  Clock,
} from 'lucide-react';
import { usePortfolio, useProjects } from '@/lib/query/hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingPage } from '@/components/shared/loading-card';
import { ErrorState } from '@/components/shared/error-state';
import { useI18n } from '@/lib/i18n';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const MOCK_ACTIVITY = [
  {
    id: '1',
    icon: UserCog,
    text: 'Updated profile information',
    time: '2 hours ago',
  },
  {
    id: '2',
    icon: FolderOpen,
    text: 'Added project CloudSync',
    time: '5 hours ago',
  },
  {
    id: '3',
    icon: Palette,
    text: 'Changed color palette to Corporate Blue',
    time: '1 day ago',
  },
  {
    id: '4',
    icon: Globe,
    text: 'Published portfolio',
    time: '2 days ago',
  },
];

export default function OverviewPage() {
  const { t } = useI18n();
  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    refetch: refetchPortfolio,
  } = usePortfolio();

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useProjects();

  const isLoading = portfolioLoading || projectsLoading;
  const isError = portfolioError || projectsError;

  const enabledSections = useMemo(() => {
    if (!portfolio) return 0;
    return Object.values(portfolio.sectionVisibility).filter(Boolean).length;
  }, [portfolio]);

  const checklist = useMemo(() => {
    if (!portfolio || !projects) return [];
    return [
      {
        label: 'overview.portfolio.checklist.completeYourProfile',
        done: !!portfolio.fullName,
      },
      {
        label: 'overview.portfolio.checklist.addProject',
        done: (projects as unknown[]).length > 0,
      },
      {
        label: 'overview.portfolio.checklist.customizeAppearance',
        done: portfolio.templateId !== 'modern',
      },
      {
        label: 'overview.portfolio.checklist.publishPortfolio',
        done: portfolio.isPublished,
      },
    ];
  }, [portfolio, projects]);

  const completedCount = checklist.filter((c) => c.done).length;
  const progressValue = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load dashboard data."
        onRetry={() => {
          refetchPortfolio();
          refetchProjects();
        }}
      />
    );
  }

  const projectCount = (projects as unknown[])?.length ?? 0;

  const stats = [
    {
      label: 'overview.stats.projects',
      value: String(projectCount),
      icon: FolderOpen,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      label: 'overview.stats.sections',
      value: String(enabledSections),
      icon: List,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    },
    {
      label: 'overview.stats.status',
      value: portfolio?.isPublished ? (t('overview.stats.value.published')) : t('overview.stats.value.draft'),
      icon: Globe,
      color: portfolio?.isPublished
        ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
        : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      badge: true,
    },
    {
      label: 'overview.stats.views',
      value: '1,247',
      icon: Eye,
      color: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    },
  ];

  const quickActions = [
    {
      label: 'overview.portfolio.quickActions.actions.addProject',
      icon: Plus,
      to: '/dashboard/projects',
    },
    {
      label: 'overview.portfolio.quickActions.actions.editProfile',
      icon: UserCog,
      to: '/dashboard/profile',
    },
    {
      label: 'overview.portfolio.quickActions.actions.preview',
      icon: ExternalLink,
      to: `/u/${portfolio?.slug ?? ''}`,
    },
    {
      label: 'overview.portfolio.quickActions.actions.publish',
      icon: Send,
      to: '/dashboard/settings',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${t('overview.welcome')}${portfolio?.fullName ? `, ${portfolio.fullName}` : ''}`}
        description={t('overview.description')}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div
          variants={item}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{t(stat.label)}</p>
                    <div className="mt-0.5">
                      {stat.badge ? (
                        <Badge variant={portfolio?.isPublished ? 'success' : 'secondary'}>
                          {stat.value}
                        </Badge>
                      ) : (
                        <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('overview.completeYourPortfolio')}</CardTitle>
                <CardDescription>
                   {t('overview.portfolio.progress', { completedCount, total: checklist.length })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Progress value={progressValue} className="h-2" />
                <div className="space-y-3">
                  {checklist.map((task) => (
                    <div key={task.label} className="flex items-center gap-3">
                      {task.done ? (
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={
                          task.done
                            ? 'text-sm text-muted-foreground line-through'
                            : 'text-sm'
                        }
                      >
                        {t(task.label)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('overview.portfolio.quickActions')}</CardTitle>
                <CardDescription>{t('overview.portfolio.quickActions.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto flex-col gap-2 py-5"
                      asChild
                    >
                      <Link to={action.to}>
                        <action.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{t(action.label)}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('overview.portfolio.recentActivity')}</CardTitle>
              <CardDescription>{t('overview.portfolio.recentActivity.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <activity.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{activity.text}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
