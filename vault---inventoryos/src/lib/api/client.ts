import {
  clearSession,
  getAccessToken,
  getTenantId,
  saveSession,
} from '../auth/session';

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  '/api-proxy';

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

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  try {
    // Refresh token is HttpOnly cookie — credentials must be included; no token in JS storage.
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    const data = (await res.json()) as {
      accessToken: string;
      userId: string;
      tenantId: string;
      email: string;
      role: string;
    };
    saveSession({
      accessToken: data.accessToken,
      userId: data.userId,
      tenantId: data.tenantId,
      email: data.email,
      role: data.role,
    });
    return true;
  } catch {
    clearSession();
    return false;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`;
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
    // ignore non-JSON bodies
  }
  return new ApiError(message, res.status, details);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const tenantId = getTenantId();
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
  }

  const doFetch = () =>
    fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
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

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export { API_BASE };
