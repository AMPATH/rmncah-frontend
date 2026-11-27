import { createContext, useContext } from 'react';
import type { User } from '../features/issues/types/issue.types';
import type { Location } from '../auth/locations';

// "Acting as" lets developers try other roles. It is only there in development (npm run dev),
// never in a production build, where people are always themselves.
export const CAN_ACT_AS = import.meta.env.DEV;

export interface CurrentUserValue {
  // Who the pages act for: the signed-in person, or in development the "acting as" choice.
  currentUser: User | null;
  // The MPDSR user whose email matches the signed-in account, or null if there is none.
  signedInUser: User | null;
  isActingAs: boolean;
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
