import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AuthError, SESSION_ENDED_EVENT, loadCurrentUser, login, logout } from '../services/authApi';
import { REFRESH_KEY } from '../services/authSession';
import { AuthContext, type AuthState } from './AuthContext';

const SESSION_ENDED_NOTICE = 'Your session has ended. Sign in again to continue where you were.';
// How often, at most, the session is checked again when the user comes back to the tab.
const RECHECK_AFTER_MS = 60_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'checking' });
  const [attempt, setAttempt] = useState(0);
  const lastCheck = useRef(0);
  const statusRef = useRef(state.status);
  useEffect(() => {
    statusRef.current = state.status;
  }, [state.status]);

  // On page load, picks up an existing session instead of asking to sign in again.
  useEffect(() => {
    let cancelled = false;
    loadCurrentUser()
      .then((user) => {
        lastCheck.current = Date.now();
        if (!cancelled) setState(user ? { status: 'signedIn', user } : { status: 'signedOut' });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof AuthError ? error.message : 'Something went wrong.';
        setState({ status: 'unreachable', message });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // A request found the session over (expired, signed out elsewhere, account deactivated).
  useEffect(() => {
    function onEnded() {
      setState((current) =>
        current.status === 'signedIn' ? { status: 'signedOut', notice: SESSION_ENDED_NOTICE, keepPlace: true } : current,
      );
    }
    window.addEventListener(SESSION_ENDED_EVENT, onEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onEnded);
  }, []);

  // Keeps every open tab in step: signing out in one tab signs out the others,
  // and signing in (or renewing the session) in one tab is picked up by the rest.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== REFRESH_KEY && event.key !== null) return;
      if (event.newValue === null) {
        setState((current) =>
          current.status === 'signedIn' ? { status: 'signedOut', notice: 'You signed out in another tab.' } : current,
        );
        return;
      }
      // A renewed token in another tab needs nothing here; a new sign-in does.
      if (statusRef.current === 'signedIn') return;
      loadCurrentUser()
        .then((user) => {
          if (user) setState({ status: 'signedIn', user });
        })
        .catch(() => {
          // Server unreachable: this tab stays as it is.
        });
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // When the user comes back to the tab, checks the session is still alive,
  // so a page left open overnight doesn't look signed in when it isn't.
  const signedIn = state.status === 'signedIn';
  useEffect(() => {
    if (!signedIn) return;
    function onVisible() {
      if (document.visibilityState !== 'visible' || Date.now() - lastCheck.current < RECHECK_AFTER_MS) return;
      lastCheck.current = Date.now();
      loadCurrentUser()
        .then((user) => {
          setState((current) => {
            if (current.status !== 'signedIn') return current;
            return user ? { status: 'signedIn', user } : { status: 'signedOut', notice: SESSION_ENDED_NOTICE, keepPlace: true };
          });
        })
        .catch(() => {
          // Server unreachable: keep working; the next request will show the error.
        });
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [signedIn]);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await login(email, password);
    lastCheck.current = Date.now();
    setState({ status: 'signedIn', user });
  }, []);

  const signOut = useCallback(async (notice?: string) => {
    await logout();
    setState({ status: 'signedOut', notice });
  }, []);

  const endSession = useCallback((notice: string) => {
    setState({ status: 'signedOut', notice });
  }, []);

  const retry = useCallback(() => {
    setState({ status: 'checking' });
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(() => ({ state, signIn, signOut, endSession, retry }), [state, signIn, signOut, endSession, retry]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
