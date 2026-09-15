import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

const PortfolioIdContext = createContext<string | undefined>(undefined);

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

// Undefined when rendered outside a PortfolioIdProvider (e.g. no active portfolio route).
export function useCurrentPortfolioId(): string | undefined {
  return useContext(PortfolioIdContext);
}
