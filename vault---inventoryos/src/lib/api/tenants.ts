import { apiRequest } from './client';

export interface TenantDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export async function fetchCurrentTenant(): Promise<TenantDto> {
  return apiRequest<TenantDto>('/api/tenants/me');
}

export async function updateCurrentTenant(name: string): Promise<TenantDto> {
  return apiRequest<TenantDto>('/api/tenants/me', {
    method: 'PUT',
    body: { name },
  });
}
