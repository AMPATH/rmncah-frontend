import { apiGet } from '../api/apiClient';
import type { User } from '../features/issues/types/issue.types';

export function getUsers(): Promise<User[]> {
  return apiGet<User[]>('/users');
}
