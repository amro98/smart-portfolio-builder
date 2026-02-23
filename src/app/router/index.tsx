import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '@/app/layouts/dashboard-layout';
import AuthLayout from '@/app/layouts/auth-layout';
import LoginPage from '@/features/auth/login-page';
import RegisterPage from '@/features/auth/register-page';
import ForgotPasswordPage from '@/features/auth/forgot-password-page';
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
import { AuthGuard, GuestGuard } from './protected-route';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
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
    element: <Navigate to="/login" replace />,
  },
]);
