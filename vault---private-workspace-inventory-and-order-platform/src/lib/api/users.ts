import { apiRequest } from './client';
import type { UserAccount } from '../../types';

interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export function mapUser(dto: ApiUser): UserAccount {
  return {
    id: dto.id,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: dto.role === 'Admin' ? 'Admin' : 'Staff',
    activeStatus: dto.isActive ? 'Active' : 'Inactive',
    lastActive: dto.updatedAt || dto.createdAt,
  };
}

export async function fetchUsers(): Promise<UserAccount[]> {
  const items = await apiRequest<ApiUser[]>('/api/users');
  return items.map(mapUser);
}

export async function createUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Staff';
}): Promise<UserAccount> {
  const created = await apiRequest<ApiUser>('/api/users', {
    method: 'POST',
    body: input,
  });
  return mapUser(created);
}

export async function updateUser(
  id: string,
  input: {
    firstName: string;
    lastName: string;
    role: 'Admin' | 'Staff';
    isActive: boolean;
  }
): Promise<UserAccount> {
  const updated = await apiRequest<ApiUser>(`/api/users/${id}`, {
    method: 'PUT',
    body: input,
  });
  return mapUser(updated);
}

export async function deactivateUser(id: string): Promise<void> {
  await apiRequest<void>(`/api/users/${id}`, { method: 'DELETE' });
}
