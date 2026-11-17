import { createContext, useContext } from 'react';
import type { User } from '../features/issues/types/issue.types';
import type { Location } from '../auth/locations';

export interface CurrentUserValue {
  currentUser: User | null;
  users: User[];
  locations: Location[];
  scope: Set<string>;
  ready: boolean;
  setCurrentUserId: (id: string) => void;
  reloadSetup: () => void;
}

export const CurrentUserContext = createContext<CurrentUserValue | null>(null);

export function useCurrentUser(): CurrentUserValue {
  const value = useContext(CurrentUserContext);

  if (!value) {
    throw new Error('useCurrentUser must be used inside <CurrentUserProvider>');
  }

  return value;
}
