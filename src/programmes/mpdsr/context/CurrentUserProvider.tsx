import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../features/issues/types/issue.types';
import { useApiData } from '../hooks/useApiData';
import { getUsers } from '../auth/userService';
import { getLocations, placesWithin } from '../auth/locations';
import { useAuth } from '../../../app/auth/hooks/useAuth';
import { CAN_ACT_AS, CurrentUserContext } from './currentUserContext';

const STORAGE_KEY = 'mpdsr.actingAsUserId';

function readStoredId(): string {
  if (!CAN_ACT_AS) return '';
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function sameEmail(a: string | undefined, b: string) {
  return (a ?? '').trim().toLowerCase() === b.trim().toLowerCase();
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const { data: users, loading, reload: reloadUsers } = useApiData<User[]>(getUsers, []);
  const { data: locations, reload: reloadLocations } = useApiData(getLocations, []);
  const [actingAsId, setStoredId] = useState(readStoredId);

  // The MPDSR user is the person who signed in, matched by email.
  const signedInEmail = state.status === 'signedIn' ? state.user.email : '';
  const signedInUser =
    users.find((user) => user.deleted !== true && signedInEmail !== '' && sameEmail(user.email, signedInEmail)) ?? null;

  function setCurrentUserId(id: string) {
    if (!CAN_ACT_AS) return;
    setStoredId(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage blocked: the choice lasts until the page is reloaded.
    }
  }

  const actingAs = CAN_ACT_AS ? (users.find((user) => user.id === actingAsId) ?? null) : null;
  const currentUser = actingAs ?? signedInUser;
  const scope = placesWithin(currentUser?.assignedLocations ?? [], locations);

  function reloadSetup() {
    reloadUsers();
    reloadLocations();
  }

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        signedInUser,
        isActingAs: actingAs !== null && actingAs.id !== signedInUser?.id,
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
