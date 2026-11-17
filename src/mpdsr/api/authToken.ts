// Where the sign-in token is kept between page loads.
// Sign-in stores it, apiClient sends it with every request, and Log out clears it.
const TOKEN_KEY = 'mpdsr.authToken';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage can be blocked; the user then signs in again after a refresh.
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}
