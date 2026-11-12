import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../features/issues/types/issue.types';
import { useApiData } from '../hooks/useApiData';
import { getUsers } from './userService';
import { getLocations, placesWithin } from './locations';
import type { Location } from './locations';

// Until sign-in exists, the current user is picked with "Acting as" in the profile panel
// and remembered in this browser. Sign-in will replace only this file.
const STORAGE_KEY = 'mpdsr.actingAsUserId';

interface CurrentUserValue {
  currentUser: User | null;
  users: User[];
  locations: Location[];
  // Every place the current user may see: their own places and everything inside them.
  scope: Set<string>;
  // False while users are still loading, so pages don't flash "no access".
  ready: boolean;
  setCurrentUserId: (id: string) => void;
}

const CurrentUserContext = createContext<CurrentUserValue | null>(null);

function readStoredId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { data: users, loading } = useApiData<User[]>(getUsers, []);
  const { data: locations } = useApiData<Location[]>(getLocations, []);
  const [currentUserId, setStoredId] = useState(readStoredId);

  function setCurrentUserId(id: string) {
    setStoredId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Storage can be blocked (e.g. private browsing). The choice then lasts until refresh.
    }
  }

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const scope = placesWithin(currentUser?.assignedLocations ?? [], locations);

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, users, locations, scope, ready: !loading, setCurrentUserId }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

// Any component inside AppLayout can ask who the current user is.
export function useCurrentUser(): CurrentUserValue {
  const value = useContext(CurrentUserContext);
  if (!value) {
    throw new Error('useCurrentUser must be used inside <CurrentUserProvider>');
  }
  return value;
}
