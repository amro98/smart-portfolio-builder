import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/app/layouts/app-layout';
import PortfolioEditorLayout from '@/app/layouts/portfolio-editor-layout';
import AuthLayout from '@/app/layouts/auth-layout';
import LoginPage from '@/features/auth/login-page';
import RegisterPage from '@/features/auth/register-page';
import ForgotPasswordPage from '@/features/auth/forgot-password-page';
import ResetPasswordPage from '@/features/auth/reset-password-page';
import SocialConfirmPage from '@/features/auth/social-confirm-page';
import SocialCompletePage from '@/features/auth/social-complete-page';
import MyPortfoliosPage from '@/features/portfolios/my-portfolios-page';
import CreatePortfolioWizardPage from '@/features/portfolios/create-portfolio-wizard-page';
import TemplatesPage from '@/features/templates/templates-page';
import SettingsPage from '@/features/settings/settings-page';
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
import DesignPage from '@/features/design/design-page';
import PublishPage from '@/features/publish/publish-page';
import PreviewFramePage from '@/features/preview/preview-frame-page';
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
    // Not guest-guarded: a signed-in user may open a reset link from their email, and the
    // social pages perform their own identity switch (which must not be pre-empted by a
    // guard redirect).
    element: <AuthLayout />,
    children: [
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/auth/social/confirm', element: <SocialConfirmPage /> },
      { path: '/auth/social/complete', element: <SocialCompletePage /> },
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
          { path: 'overview', element: <OverviewPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'experience', element: <ExperiencePage /> },
          { path: 'skills', element: <SkillsPage /> },
          { path: 'services', element: <ServicesPage /> },
          { path: 'certifications', element: <CertificationsPage /> },
          { path: 'testimonials', element: <TestimonialsPage /> },
          { path: 'gallery', element: <GalleryPage /> },
          { path: 'design', element: <DesignPage /> },
          // Appearance, Sections and Preview were merged into Design & Preview; old links
          // and bookmarks land there.
          { path: 'appearance', element: <Navigate to="../design" replace /> },
          { path: 'sections', element: <Navigate to="../design" replace /> },
          { path: 'preview', element: <Navigate to="../design" replace /> },
          { path: 'publish', element: <PublishPage /> },
        ],
      },
      {
        path: '/templates',
        element: <TemplatesPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    // The dashboard-scoped editor was replaced by /portfolios/:portfolioId/*.
    // Old links/bookmarks are redirected rather than served by a duplicate layout.
    path: '/dashboard',
    element: <Navigate to="/portfolios" replace />,
  },
  {
    path: '/dashboard/*',
    element: <Navigate to="/portfolios" replace />,
  },
  {
    // Pricing/Billing have no real product behind them yet; redirect rather than
    // show a page pretending the functionality exists.
    path: '/pricing',
    element: <Navigate to="/portfolios" replace />,
  },
  {
    path: '/billing',
    element: <Navigate to="/portfolios" replace />,
  },
  {
    // Chrome-less: no AppLayout, no PortfolioEditorLayout. The Design & Preview workspace
    // embeds this via a real <iframe src> (at desktop/tablet/phone widths), so the portfolio
    // renders in a genuinely independent document/viewport — still authenticated +
    // ownership-checked (usePortfolio -> GET /portfolios/:id), never public.
    path: '/portfolios/:portfolioId/preview-frame',
    element: (
      <AuthGuard>
        <PreviewFramePage />
      </AuthGuard>
    ),
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
