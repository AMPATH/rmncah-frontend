import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './authSession';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Fired when the session can no longer be renewed, so the app sends the user to sign in.
export const SESSION_ENDED_EVENT = 'rmncah:session-ended';

export function endSessionHere() {
  clearTokens();
  window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
}

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DEACTIVATED';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: AccountStatus;
  mustChangePassword: boolean;
  // Sent by /auth/me (not by login): which session this browser is using.
  sessionId?: string;
  // The user's roles. The backend does not send these yet (gap 3 in the backend review);
  // until it does, the welcome page shows every programme.
  roles?: AuthRole[];
}

export type ProgrammeModule = 'PLATFORM' | 'MPDSR' | 'EMONC';

export interface AuthRole {
  code: string;
  module: ProgrammeModule;
}

// One place the account is signed in, from GET /auth/sessions.
export interface AuthSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  revokedAt: string | null;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginResult extends Tokens {
  user: AuthUser;
}

export class AuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

// Calls the backend and returns the "data" part of its { success, data } reply.
async function call<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new AuthError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  let body: { data?: T; message?: string; details?: string[] } = {};
  try {
    body = await response.json();
  } catch {
    // No JSON body.
  }

  if (!response.ok) {
    const message =
      response.status >= 500
        ? 'Something went wrong on the server. Try again in a moment.'
        : body.details?.[0] ?? body.message ?? `Request failed (${response.status})`;
    throw new AuthError(response.status, message);
  }
  return body.data as T;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const result = await call<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveTokens(result.accessToken, result.refreshToken);
  return result.user;
}

let refreshing: Promise<boolean> | null = null;

// Swaps the refresh token for new tokens. Returns false when the session has ended
// (no refresh token, or the backend refused it). Throws when the server can't be reached.
// Requests that fail together share one refresh, because each refresh token works only once.
export function refreshAccessToken(): Promise<boolean> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const tokens = await call<Tokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    saveTokens(tokens.accessToken, tokens.refreshToken);
    return true;
  } catch (error) {
    if (error instanceof AuthError && error.status === 0) throw error;
    clearTokens();
    return false;
  }
}

// The access token lasts 15 minutes; on a 401 this refreshes once and tries again.
async function callSignedIn<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await call<T>(path, init, getAccessToken());
  } catch (error) {
    if (!(error instanceof AuthError) || error.status !== 401) throw error;
    if (!(await refreshAccessToken())) throw error;
    return call<T>(path, init, getAccessToken());
  }
}

// Returns the signed-in user, or null when there is no session.
export async function loadCurrentUser(): Promise<AuthUser | null> {
  if (!getRefreshToken()) return null;
  try {
    return await callSignedIn<AuthUser>('/auth/me');
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      clearTokens();
      return null;
    }
    throw error;
  }
}

export async function logout() {
  try {
    await callSignedIn<void>('/auth/logout', { method: 'POST' });
  } catch {
    // Signing out locally still works when the server can't be reached.
  } finally {
    clearTokens();
  }
}

// The backend replies the same way whether or not the email has an account.
export async function requestPasswordReset(email: string) {
  await call<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  await call<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function acceptInvitation(token: string, password: string) {
  await call<{ message: string }>('/auth/accept-invitation', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

// The backend ends every session after a password change, so the user signs in again.
export async function changePassword(currentPassword: string, newPassword: string) {
  await callSignedIn<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  clearTokens();
}

// Sessions that are still signed in, newest first.
export async function getSessions(): Promise<AuthSession[]> {
  const sessions = await callSignedIn<AuthSession[]>('/auth/sessions');
  const now = Date.now();
  return sessions.filter((session) => session.revokedAt === null && new Date(session.expiresAt).getTime() > now);
}

// Signs out one other device.
export async function revokeSession(sessionId: string) {
  await callSignedIn<void>(`/auth/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
}

// Signs out every device, this one included.
export async function logoutAll() {
  try {
    await callSignedIn<void>('/auth/logout-all', { method: 'POST' });
  } finally {
    clearTokens();
  }
}
