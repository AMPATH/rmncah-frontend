// Keeps the sign-in tokens in the browser so a refresh or a new tab stays signed in.
const ACCESS_KEY = 'rmncah.accessToken';
// Other tabs watch this key to notice a sign-in or sign-out here.
export const REFRESH_KEY = 'rmncah.refreshToken';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return read(ACCESS_KEY);
}

export function getRefreshToken() {
  return read(REFRESH_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string) {
  try {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch {
    // Storage is blocked (e.g. private browsing settings); nothing is saved.
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Nothing stored.
  }
}
