/** Identity details we keep from a provider. No provider tokens ever leave the callback handler. */
export type SocialProfile = {
  providerAccountId: string;
  /** Normalized email, or null when the provider couldn't give a verified one. */
  email: string | null;
  name: string | null;
};

export interface OAuthProvider {
  id: string;
  label: string;
  /** Whether the client id/secret are configured; unconfigured providers are refused. */
  isConfigured(): boolean;
  /** Whether this provider uses PKCE (then a code verifier is generated and kept in the state cookie). */
  usesPkce: boolean;
  createAuthorizationURL(state: string, codeVerifier: string | null): Promise<URL>;
  /** Exchanges the authorization code and loads the user's identity. */
  fetchProfile(code: string, codeVerifier: string | null): Promise<SocialProfile>;
}

/** Thrown when the provider round-trip itself fails (bad code, provider outage, ...). */
export class OAuthExchangeError extends Error {}
