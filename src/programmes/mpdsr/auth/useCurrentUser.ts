import { useContext } from 'react';
import { CurrentUserContext } from './CurrentUserContext';
import type { CurrentUserValue } from './CurrentUserContext';

// Any component inside AppLayout can ask who the current user is.
export function useCurrentUser(): CurrentUserValue {
  const value = useContext(CurrentUserContext);

  if (!value) {
    throw new Error('useCurrentUser must be used inside <CurrentUserProvider>');
  }

  return value;
}
