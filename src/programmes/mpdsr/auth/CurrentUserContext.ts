import { createContext } from 'react';
import type { User } from '../types/user.types.ts';
import type { Location } from './locations';

export interface CurrentUserValue {
  currentUser: User | null;
  users: User[];
  locations: Location[];
  // Every place the current user may see: their own places and everything inside them.
  scope: Set<string>;
  // False while users are still loading, so pages don't flash "no access".
  ready: boolean;
  setCurrentUserId: (id: string) => void;
  reloadSetup: () => void;
}

export const CurrentUserContext = createContext<CurrentUserValue | null>(null);
