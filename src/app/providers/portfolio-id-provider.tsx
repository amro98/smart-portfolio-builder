import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// Fallback used when a component is rendered outside PortfolioIdProvider (e.g. legacy /dashboard/* routes)
const DEFAULT_PORTFOLIO_ID = 'portfolio-1';

const PortfolioIdContext = createContext<string>(DEFAULT_PORTFOLIO_ID);

interface PortfolioIdProviderProps {
  portfolioId: string;
  children: ReactNode;
}

export function PortfolioIdProvider({ portfolioId, children }: PortfolioIdProviderProps) {
  return (
    <PortfolioIdContext.Provider value={portfolioId}>
      {children}
    </PortfolioIdContext.Provider>
  );
}

export function useCurrentPortfolioId(): string {
  return useContext(PortfolioIdContext);
}
