import { apiRequest } from './client';
import { saveSession } from '../auth/session';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

function persistAuth(data: AuthResponse): AuthResponse {
  // Refresh token is set as HttpOnly cookie by the API — never persist it in JS storage.
  saveSession({
    accessToken: data.accessToken,
    userId: data.userId,
    tenantId: data.tenantId,
    email: data.email,
    role: data.role,
  });
  return data;
}

export async function registerTenant(input: {
  tenantName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      tenantName: input.tenantName,
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
    },
  });
  return persistAuth(data);
}

export async function login(input: {
  tenantId: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: {
      tenantId: input.tenantId,
      email: input.email,
      password: input.password,
    },
  });
  return persistAuth(data);
}

export async function logout(): Promise<void> {
  try {
    // Cookie supplies refresh token; empty body is fine.
    await apiRequest('/api/auth/logout', {
      method: 'POST',
      body: {},
    });
  } catch {
    // best-effort revoke
  }
}
