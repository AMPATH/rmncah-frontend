import { apiPatch, apiPost } from '../../../api/apiClient';
import type { User } from '../../issues/types/issue.types';
import type { Location } from '../../../auth/locations';

// POST /users (admin)
export function createUser(user: Omit<User, 'id'>): Promise<User> {
  return apiPost<User>('/users', user);
}

// PATCH /users/:id (admin)
export function updateUser(id: string, changes: Partial<Omit<User, 'id'>>): Promise<User> {
  return apiPatch<User>(`/users/${id}`, changes);
}

// POST /locations (admin)
export function createLocation(location: Omit<Location, 'id'>): Promise<Location> {
  return apiPost<Location>('/locations', location);
}

// POST /users/:id/deactivate (admin). json-server: just sets the flag.
// A deactivated user keeps their history but can't be chosen for new work or sign in.
export function setUserActive(id: string, active: boolean): Promise<User> {
  return apiPatch<User>(`/users/${id}`, { active });
}
