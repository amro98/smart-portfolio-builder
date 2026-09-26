import { getApiPublicUrl } from "../../../config/auth";
import { normalizeEmail } from "../credentials";
import { loadArctic } from "./arctic";
import { OAuthExchangeError, type OAuthProvider, type SocialProfile } from "./types";

const GOOGLE_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

function config() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
    redirectUri: `${getApiPublicUrl()}/auth/oauth/google/callback`,
  };
}

type GoogleIdTokenClaims = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

/** Pure claim checks, separated for testing. Returns null email unless Google says it's verified. */
export function profileFromGoogleClaims(claims: GoogleIdTokenClaims, clientId: string, nowSeconds = Date.now() / 1000): SocialProfile {
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!claims.iss || !GOOGLE_ISSUERS.has(claims.iss)) throw new OAuthExchangeError("Unexpected ID token issuer");
  if (!audiences.includes(clientId)) throw new OAuthExchangeError("ID token audience mismatch");
  if (typeof claims.exp !== "number" || claims.exp < nowSeconds) throw new OAuthExchangeError("ID token expired");
  if (!claims.sub) throw new OAuthExchangeError("ID token has no subject");

  return {
    providerAccountId: claims.sub,
    email: claims.email && claims.email_verified === true ? normalizeEmail(claims.email) : null,
    name: claims.name?.trim() || null,
  };
}

export const googleProvider: OAuthProvider = {
  id: "google",
  label: "Google",
  usesPkce: true,

  isConfigured() {
    const { clientId, clientSecret } = config();
    return !!clientId && !!clientSecret;
  },

  async createAuthorizationURL(state, codeVerifier) {
    const { Google } = await loadArctic();
    const { clientId, clientSecret, redirectUri } = config();
    const google = new Google(clientId, clientSecret, redirectUri);
    const url = google.createAuthorizationURL(state, codeVerifier ?? "", ["openid", "email", "profile"]);
    url.searchParams.set("prompt", "select_account");
    return url;
  },

  async fetchProfile(code, codeVerifier) {
    const { Google, decodeIdToken } = await loadArctic();
    const { clientId, clientSecret, redirectUri } = config();
    const google = new Google(clientId, clientSecret, redirectUri);
    let idToken: string;
    try {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier ?? "");
      idToken = tokens.idToken();
    } catch (error) {
      throw new OAuthExchangeError(error instanceof Error ? error.message : "Google code exchange failed");
    }
    // The ID token came straight from Google's token endpoint over TLS in exchange for our
    // client secret + PKCE verifier (OIDC Core §3.1.3.7), so its claims are checked rather
    // than its signature. The access token is used for nothing and discarded here.
    return profileFromGoogleClaims(decodeIdToken(idToken) as GoogleIdTokenClaims, clientId);
  },
};
