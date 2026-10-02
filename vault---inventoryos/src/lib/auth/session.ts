const ACCESS_TOKEN_KEY = 'vault.accessToken';
const TENANT_ID_KEY = 'vault.tenantId';
const USER_KEY = 'vault.user';
const LEGACY_REFRESH_KEY = 'vault.refreshToken';

export interface SessionUser {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

/** Short-lived access JWT — sessionStorage only (cleared on tab close). Never store refresh tokens in JS storage. */
export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getTenantId(): string | null {
  return localStorage.getItem(TENANT_ID_KEY);
}

export function getSessionUser(): SessionUser | null {
  const raw = sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken() && getTenantId());
}

export function saveSession(params: {
  accessToken: string;
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}): void {
  // Purge any legacy refresh tokens left from earlier builds
  localStorage.removeItem(LEGACY_REFRESH_KEY);
  sessionStorage.removeItem(LEGACY_REFRESH_KEY);

  sessionStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken);
  localStorage.setItem(TENANT_ID_KEY, params.tenantId);
  const userJson = JSON.stringify({
    userId: params.userId,
    tenantId: params.tenantId,
    email: params.email,
    role: params.role,
  } satisfies SessionUser);
  sessionStorage.setItem(USER_KEY, userJson);
  localStorage.removeItem(USER_KEY);
}

export function clearSession(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_REFRESH_KEY);
  sessionStorage.removeItem(LEGACY_REFRESH_KEY);
  // Keep last tenant id for login convenience
}

export function clearSessionFully(): void {
  clearSession();
  localStorage.removeItem(TENANT_ID_KEY);
}
