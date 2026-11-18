import { apiPatch, apiPost } from '../../../api/apiClient';
import type { User } from '../../issues/types/issue.types';
import type { Location } from '../../../auth/locations';

export function createUser(user: Omit<User, 'id'>): Promise<User> {
  return apiPost<User>('/users', user);
}

export function updateUser(id: string, changes: Partial<Omit<User, 'id'>>): Promise<User> {
  return apiPatch<User>(`/users/${id}`, changes);
}

export function createLocation(location: Omit<Location, 'id'>): Promise<Location> {
  return apiPost<Location>('/locations', location);
}

export function setUserActive(id: string, active: boolean): Promise<User> {
  return apiPatch<User>(`/users/${id}`, { active });
}

export function deleteUser(id: string, byUserId: string, reason: string): Promise<User> {
  return apiPatch<User>(`/users/${id}`, {
    deleted: true,
    active: false,
    deletedAt: new Date().toISOString(),
    deletedById: byUserId,
    deleteReason: reason,
  });
}

export function restoreUser(id: string): Promise<User> {
  return apiPatch<User>(`/users/${id}`, { deleted: false });
}
