import { getApiPublicUrl } from "../../../config/auth";
import { normalizeEmail } from "../credentials";
import { loadArctic } from "./arctic";
import { OAuthExchangeError, type OAuthProvider, type SocialProfile } from "./types";

function config() {
  return {
    clientId: process.env.GITHUB_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() ?? "",
    redirectUri: `${getApiPublicUrl()}/auth/oauth/github/callback`,
  };
}

export type GitHubEmail = { email: string; primary: boolean; verified: boolean };

/**
 * Picks the address to sign up with from GET /user/emails: the verified primary, else any
 * verified address. Public-profile emails aren't used — they may be absent or unverified.
 */
export function pickGitHubEmail(emails: GitHubEmail[]): string | null {
  const verified = emails.filter((e) => e.verified && e.email);
  const chosen = verified.find((e) => e.primary) ?? verified[0];
  return chosen ? normalizeEmail(chosen.email) : null;
}

async function githubGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "smart-portfolio-builder",
    },
  });
  if (!response.ok) throw new OAuthExchangeError(`GitHub API ${path} responded ${response.status}`);
  return (await response.json()) as T;
}

export const githubProvider: OAuthProvider = {
  id: "github",
  label: "GitHub",
  // arctic's GitHub client has no PKCE parameter; the state check plus the confidential client
  // secret protect the code exchange.
  usesPkce: false,

  isConfigured() {
    const { clientId, clientSecret } = config();
    return !!clientId && !!clientSecret;
  },

  async createAuthorizationURL(state) {
    const { GitHub } = await loadArctic();
    const { clientId, clientSecret, redirectUri } = config();
    // `user:email` grants read access to the account's email list, including private addresses.
    return new GitHub(clientId, clientSecret, redirectUri).createAuthorizationURL(state, ["read:user", "user:email"]);
  },

  async fetchProfile(code) {
    const { GitHub } = await loadArctic();
    const { clientId, clientSecret, redirectUri } = config();
    let accessToken: string;
    try {
      const tokens = await new GitHub(clientId, clientSecret, redirectUri).validateAuthorizationCode(code);
      accessToken = tokens.accessToken();
    } catch (error) {
      throw new OAuthExchangeError(error instanceof Error ? error.message : "GitHub code exchange failed");
    }

    // The access token is only used for these two reads and never stored.
    const user = await githubGet<{ id: number; login: string; name: string | null }>("/user", accessToken);
    const emails = await githubGet<GitHubEmail[]>("/user/emails", accessToken).catch(() => [] as GitHubEmail[]);

    const profile: SocialProfile = {
      providerAccountId: String(user.id),
      email: pickGitHubEmail(emails),
      name: user.name?.trim() || user.login || null,
    };
    return profile;
  },
};
