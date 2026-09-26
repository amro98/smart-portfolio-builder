import { ApiError } from '@/lib/api/client';

// Maps backend error codes (JSON `code`, or the `authError` query param the OAuth callback
// redirects with) to translation keys. Raw backend messages are never shown to users.
const CODE_TO_KEY: Record<string, string> = {
  INVALID_CREDENTIALS: 'auth.errors.invalidCredentials',
  EMAIL_EXISTS: 'auth.errors.emailExists',
  SOCIAL_EMAIL_EXISTS: 'auth.errors.socialEmailExists',
  oauth_account_exists: 'auth.errors.socialEmailExists',
  SOCIAL_PENDING_EXPIRED: 'auth.errors.socialPendingExpired',
  SOCIAL_LINK_CONFLICT: 'auth.errors.socialLinkConflict',
  SOCIAL_LINK_STALE: 'auth.errors.socialLinkStale',
  oauth_state_invalid: 'auth.errors.oauthStateInvalid',
  oauth_cancelled: 'auth.errors.oauthCancelled',
  oauth_failed: 'auth.errors.oauthFailed',
  oauth_email_missing: 'auth.errors.oauthEmailMissing',
  provider_unavailable: 'auth.errors.providerUnavailable',
  RESET_TOKEN_EXPIRED: 'auth.errors.resetTokenExpired',
  RESET_TOKEN_INVALID: 'auth.errors.resetTokenInvalid',
  RATE_LIMITED: 'auth.errors.rateLimited',
  NETWORK_ERROR: 'auth.errors.network',
  VALIDATION_ERROR: 'auth.errors.validation',
  WEAK_PASSWORD: 'auth.password.requirementsNotMet',
};

export function authErrorCode(error: unknown): string | undefined {
  return error instanceof ApiError ? error.code : undefined;
}

export function authErrorKey(codeOrError: unknown): string {
  const code = typeof codeOrError === 'string' ? codeOrError : authErrorCode(codeOrError);
  return (code && CODE_TO_KEY[code]) || 'auth.errors.generic';
}

/** Codes where the right next step is "sign in with your existing method, or reset the password". */
export function isExistingAccountCode(code: string | undefined) {
  return code === 'EMAIL_EXISTS' || code === 'SOCIAL_EMAIL_EXISTS' || code === 'oauth_account_exists';
}

export function providerLabel(provider: string | null | undefined) {
  if (provider === 'google') return 'Google';
  if (provider === 'github') return 'GitHub';
  return provider ?? '';
}
