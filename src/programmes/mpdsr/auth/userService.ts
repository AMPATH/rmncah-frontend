import { apiGet } from '../services/apiClient';
import type { User } from '../types/user.types.ts';

export function getUsers(): Promise<User[]> {
  return apiGet<User[]>('/users');
}
