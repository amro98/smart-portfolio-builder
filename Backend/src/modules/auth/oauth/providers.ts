import { githubProvider } from "./github";
import { googleProvider } from "./google";
import type { OAuthProvider } from "./types";

// Adding a provider = implementing OAuthProvider in its own file and registering it here.
// Routes, state handling, confirmation and account creation are provider-agnostic.
const PROVIDERS: Record<string, OAuthProvider> = {
  [googleProvider.id]: googleProvider,
  [githubProvider.id]: githubProvider,
};

export function getProvider(id: string): OAuthProvider | undefined {
  return Object.prototype.hasOwnProperty.call(PROVIDERS, id) ? PROVIDERS[id] : undefined;
}

export function listProviders() {
  return Object.values(PROVIDERS).map((p) => ({ id: p.id, label: p.label, enabled: p.isConfigured() }));
}
