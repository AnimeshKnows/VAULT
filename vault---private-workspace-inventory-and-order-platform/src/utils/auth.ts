/**
 * VAULT Authentication & API client — wired to InventoryOS backend.
 */

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  tenantId: string;
  user: AuthUser;
}

/** Raw JSON shape returned by POST /api/auth/login|register|refresh */
interface BackendAuthResponse {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

export interface CurrentUserDto {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface ReportSummary {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  fulfilledOrders: number;
  cancelledOrders: number;
  revenue: number;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const getApiBaseUrl = (): string => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '');
  }
  return '/api-proxy';
};

const ACCESS_TOKEN_KEY = 'vault.accessToken';
const TENANT_ID_KEY = 'vault.tenantId';
const USER_KEY = 'vault.user';

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY) && localStorage.getItem(TENANT_ID_KEY));
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getStoredTenantId = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TENANT_ID_KEY) || '';
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const userJson = sessionStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as AuthUser;
  } catch {
    return null;
  }
};

function mapBackendAuth(data: BackendAuthResponse, names?: { firstName?: string; lastName?: string }): AuthResponse {
  return {
    accessToken: data.accessToken,
    tenantId: data.tenantId,
    user: {
      userId: data.userId,
      email: data.email,
      role: data.role,
      firstName: names?.firstName,
      lastName: names?.lastName,
    },
  };
}

export const storeAuthSession = (auth: AuthResponse): void => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(TENANT_ID_KEY, auth.tenantId);
  sessionStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: auth.user.userId,
      email: auth.user.email,
      role: auth.user.role,
      firstName: auth.user.firstName,
      lastName: auth.user.lastName,
    } satisfies AuthUser)
  );
};

/** Clears access token + user; keeps vault.tenantId for login convenience. */
export const clearAuthSession = (): void => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export const enterAuthenticatedShell = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vault:authenticated'));
  }
};

export const loadWorkspace = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vault:load_workspace'));
  }
};

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).enterAuthenticatedShell = enterAuthenticatedShell;
  (window as unknown as Record<string, unknown>).loadWorkspace = loadWorkspace;
}

export const generateGuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const isValidGuid = (id: string): boolean => {
  const guidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(id.trim());
};

async function parseError(res: Response, fallback: string): Promise<ApiError> {
  let message = fallback;
  let details: unknown;
  try {
    const data = await res.json();
    details = data;
    if (typeof data?.detail === 'string') message = data.detail;
    else if (typeof data?.title === 'string') message = data.title;
    else if (typeof data?.message === 'string') message = data.message;
    else if (data?.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors as Record<string, string[]>)[0];
      if (Array.isArray(first) && first[0]) message = first[0];
    }
  } catch {
    // ignore
  }
  return new ApiError(message, res.status, details);
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      clearAuthSession();
      return false;
    }
    const data = (await res.json()) as BackendAuthResponse;
    const mapped = mapBackendAuth(data, {
      firstName: getStoredUser()?.firstName,
      lastName: getStoredUser()?.lastName,
    });
    storeAuthSession(mapped);
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const tenantId = getStoredTenantId();
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
  }

  const doFetch = () =>
    fetch(`${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let res = await doFetch();

  if (res.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      const token = getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      res = await doFetch();
    }
  }

  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    throw await parseError(res, `Request failed (${res.status})`);
  }
  if (res.headers.get('content-length') === '0') return undefined as T;
  return (await res.json()) as T;
}

export const apiLogin = async (data: {
  tenantId: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const raw = await apiRequest<BackendAuthResponse>('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: {
        tenantId: data.tenantId,
        email: data.email,
        password: data.password,
      },
    });
    return mapBackendAuth(raw);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 429) {
        throw { status: 429, message: 'Too many attempts. Please wait a few minutes and try again.' };
      }
      throw { status: err.status, message: 'Invalid email, password, or workspace ID.' };
    }
    throw { status: 0, message: 'Cannot reach the VAULT API. Is the backend running?' };
  }
};

export const apiRegister = async (data: {
  tenantName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> => {
  try {
    const raw = await apiRequest<BackendAuthResponse>('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: {
        tenantName: data.tenantName,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
    return mapBackendAuth(raw, { firstName: data.firstName, lastName: data.lastName });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 429) {
        throw { status: 429, message: 'Too many attempts. Please wait and try again.' };
      }
      if (err.status === 409) {
        throw { status: 409, message: 'That email is already registered.' };
      }
      throw { status: err.status, message: err.message || 'Registration failed.' };
    }
    throw { status: 0, message: 'Cannot reach the VAULT API. Is the backend running?' };
  }
};

export async function apiLogout(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST', body: {} });
  } catch {
    // best-effort revoke
  } finally {
    clearAuthSession();
  }
}

export async function fetchCurrentUser(): Promise<CurrentUserDto> {
  return apiRequest<CurrentUserDto>('/api/auth/me');
}

export async function fetchReportSummary(): Promise<ReportSummary> {
  return apiRequest<ReportSummary>('/api/reports/summary');
}

export async function fetchUsers(): Promise<{ id: string }[]> {
  return apiRequest<{ id: string }[]>('/api/users');
}
