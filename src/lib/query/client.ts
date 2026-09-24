import { QueryClient } from '@tanstack/react-query';

// Single app-wide QueryClient. Lives in its own module (rather than inline in
// providers/index.tsx) so the auth store can import it too, without a store -> providers
// -> store circular import.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});
