import {
  Award, Briefcase, FolderKanban, Globe, Handshake, Images, LayoutDashboard, MessageSquareQuote, Paintbrush, Sparkles, UserRound,
} from 'lucide-react';

// The portfolio editor's navigation — one list shared by the editor sidebar and the
// Design & Preview workspace's compact menu. Appearance, Sections and Preview were merged
// into "Design & Preview"; their old routes redirect there.
export function editorNavItems(portfolioId: string) {
  return [
    { labelKey: 'dashboard.nav.overview', to: `/portfolios/${portfolioId}/overview`, icon: LayoutDashboard },
    { labelKey: 'dashboard.nav.profile', to: `/portfolios/${portfolioId}/profile`, icon: UserRound },
    { labelKey: 'dashboard.nav.projects', to: `/portfolios/${portfolioId}/projects`, icon: FolderKanban },
    { labelKey: 'dashboard.nav.experience', to: `/portfolios/${portfolioId}/experience`, icon: Briefcase },
    { labelKey: 'dashboard.nav.skills', to: `/portfolios/${portfolioId}/skills`, icon: Sparkles },
    { labelKey: 'dashboard.nav.services', to: `/portfolios/${portfolioId}/services`, icon: Handshake },
    { labelKey: 'dashboard.nav.certifications', to: `/portfolios/${portfolioId}/certifications`, icon: Award },
    { labelKey: 'dashboard.nav.testimonials', to: `/portfolios/${portfolioId}/testimonials`, icon: MessageSquareQuote },
    { labelKey: 'dashboard.nav.gallery', to: `/portfolios/${portfolioId}/gallery`, icon: Images },
    { labelKey: 'dashboard.nav.design', to: `/portfolios/${portfolioId}/design`, icon: Paintbrush },
    { labelKey: 'dashboard.nav.publish', to: `/portfolios/${portfolioId}/publish`, icon: Globe },
  ];
}

export function designHref(portfolioId: string) {
  return `/portfolios/${portfolioId}/design`;
}
