import { createContext } from 'react';
import type { AuthUser } from '../services/authApi';

export type AuthState =
  | { status: 'checking' }
  // notice is shown on the sign-in page; keepPlace brings the user back to the same page after.
  | { status: 'signedOut'; notice?: string; keepPlace?: boolean }
  | { status: 'unreachable'; message: string }
  | { status: 'signedIn'; user: AuthUser };

export interface AuthContextValue {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (notice?: string) => Promise<void>;
  // Marks the user signed out without calling the server, e.g. after a password change.
  // The notice is shown on the sign-in page.
  endSession: (notice: string) => void;
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
