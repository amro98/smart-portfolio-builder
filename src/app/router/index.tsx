import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '@/app/layouts/dashboard-layout';
import AppLayout from '@/app/layouts/app-layout';
import PortfolioEditorLayout from '@/app/layouts/portfolio-editor-layout';
import AuthLayout from '@/app/layouts/auth-layout';
import LoginPage from '@/features/auth/login-page';
import RegisterPage from '@/features/auth/register-page';
import ForgotPasswordPage from '@/features/auth/forgot-password-page';
import MyPortfoliosPage from '@/features/portfolios/my-portfolios-page';
import CreatePortfolioWizardPage from '@/features/portfolios/create-portfolio-wizard-page';
import PortfolioOverviewPage from '@/features/portfolios/portfolio-overview-page';
import PortfolioContentProfilePage from '@/features/portfolios/portfolio-content-profile-page';
import PortfolioAppearancePage from '@/features/portfolios/portfolio-appearance-page';
import PortfolioPublishPage from '@/features/portfolios/portfolio-publish-page';
import PlaceholderShellPage from '@/features/portfolios/placeholder-shell-page';
import OnboardingPage from '@/features/onboarding/onboarding-page';
import OverviewPage from '@/features/dashboard/overview-page';
import ProfilePage from '@/features/dashboard/profile-page';
import ProjectsPage from '@/features/projects/projects-page';
import ExperiencePage from '@/features/experience/experience-page';
import SkillsPage from '@/features/skills/skills-page';
import ServicesPage from '@/features/services/services-page';
import CertificationsPage from '@/features/certifications/certifications-page';
import TestimonialsPage from '@/features/testimonials/testimonials-page';
import GalleryPage from '@/features/gallery/gallery-page';
import AppearancePage from '@/features/appearance/appearance-page';
import SectionsPage from '@/features/sections/sections-page';
import PublishPage from '@/features/publish/publish-page';
import PreviewPage from '@/features/preview/preview-page';
import PublicPortfolioPage from '@/features/public-portfolio/public-portfolio-page';
import { AuthAwareRedirect, AuthGuard, GuestGuard } from './protected-route';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthAwareRedirect />,
  },
  {
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: '/onboarding',
    element: (
      <AuthGuard>
        <OnboardingPage />
      </AuthGuard>
    ),
  },
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { path: '/portfolios', element: <MyPortfoliosPage /> },
      { path: '/portfolios/new', element: <CreatePortfolioWizardPage /> },
      {
        path: '/portfolios/:portfolioId',
        element: <PortfolioEditorLayout />,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: 'overview', element: <PortfolioOverviewPage /> },
          { path: 'content/profile', element: <PortfolioContentProfilePage /> },
          { path: 'appearance', element: <PortfolioAppearancePage /> },
          { path: 'publish', element: <PortfolioPublishPage /> },
        ],
      },
      {
        path: '/templates',
        element: <PlaceholderShellPage title="Templates" description="Templates catalog placeholder." />,
      },
      {
        path: '/pricing',
        element: <PlaceholderShellPage title="Pricing" description="Pricing page placeholder." />,
      },
      {
        path: '/billing',
        element: <PlaceholderShellPage title="Billing" description="Billing page placeholder." />,
      },
      {
        path: '/settings',
        element: <PlaceholderShellPage title="Settings" description="Settings page placeholder." />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'experience', element: <ExperiencePage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'certifications', element: <CertificationsPage /> },
      { path: 'testimonials', element: <TestimonialsPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'appearance', element: <AppearancePage /> },
      { path: 'sections', element: <SectionsPage /> },
      { path: 'publish', element: <PublishPage /> },
      { path: 'preview', element: <PreviewPage /> },
    ],
  },
  {
    path: '/u/:slug',
    element: <PublicPortfolioPage />,
  },
  {
    path: '*',
    element: <AuthAwareRedirect />,
  },
]);
