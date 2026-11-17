import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../features/issues/types/issue.types';
import { useApiData } from '../hooks/useApiData';
import { getUsers } from '../auth/userService';
import { getLocations, placesWithin } from '../auth/locations';
import { CurrentUserContext } from './currentUserContext';

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
  const { data: locations, reload: reloadLocations } = useApiData(getLocations, []);
  const [currentUserId, setStoredId] = useState(readStoredId);

  function setCurrentUserId(id: string) {
    setStoredId(id);

    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Storage can be blocked (e.g. private browsing).
    }
  }

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const scope = placesWithin(currentUser?.assignedLocations ?? [], locations);

  function reloadSetup() {
    reloadUsers();
    reloadLocations();
  }

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        users,
        locations,
        scope,
        ready: !loading,
        setCurrentUserId,
        reloadSetup,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}