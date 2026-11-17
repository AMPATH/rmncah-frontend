import { useState } from 'react';
import { CurrentUserContext } from './CurrentUserContext';
import type { ReactNode } from 'react';
import type { User } from '../types/user.types.ts';
import { useApiData } from '../hooks/useApiData';
import { getUsers } from './userService';
import { getLocations, placesWithin } from './locations';
import type { Location } from './locations';

// Until sign-in exists, the current user is picked with "Acting as" in the profile panel
// and remembered in this browser. Sign-in will replace only this file.
const STORAGE_KEY = 'mpdsr.actingAsUserId';

function readStoredId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { data: users, loading, reload: reloadUsers } = useApiData<User[]>(getUsers, []);
  const { data: locations, reload: reloadLocations } = useApiData<Location[]>(getLocations, []);
  const [currentUserId, setStoredId] = useState(readStoredId);

  function setCurrentUserId(id: string) {
    setStoredId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Storage can be blocked (e.g. private browsing). The choice then lasts until refresh.
    }
  }

  function reloadSetup() {
    reloadUsers();
    reloadLocations();
  }

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const scope = placesWithin(currentUser?.assignedLocations ?? [], locations);

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, users, locations, scope, ready: !loading, setCurrentUserId, reloadSetup }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}
