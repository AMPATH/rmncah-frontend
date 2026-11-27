// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { changePassword, loadCurrentUser, login, logout, refreshAccessToken } from './authApi';

const user = {
  id: '1',
  firstName: 'Test',
  lastName: 'Admin',
  email: 'test.admin@mpdsr.test',
  status: 'ACTIVE',
  mustChangePassword: false,
};
const tokens = (n: number) => ({ accessToken: `a${n}`, refreshToken: `r${n}`, expiresIn: 900 });
const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
const fail = (status: number, message: string, details?: string[]) =>
  new Response(JSON.stringify({ success: false, message, details }), { status });

function mockFetch(...replies: Response[]) {
  const fetchMock = vi.fn();
  replies.forEach((reply) => fetchMock.mockResolvedValueOnce(reply));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
const authHeader = (fetchMock: ReturnType<typeof vi.fn>, call: number) =>
  (fetchMock.mock.calls[call][1] as RequestInit & { headers: Headers }).headers.get('Authorization');

describe('authApi', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('signs in and keeps both tokens', async () => {
    mockFetch(ok({ ...tokens(1), user }));
    expect((await login(user.email, 'password1')).firstName).toBe('Test');
    expect(localStorage.getItem('rmncah.accessToken')).toBe('a1');
    expect(localStorage.getItem('rmncah.refreshToken')).toBe('r1');
  });

  it('shows the first validation detail from the backend', async () => {
    mockFetch(fail(400, 'Validation failed', ['password must be longer than or equal to 8 characters']));
    await expect(login(user.email, 'short')).rejects.toMatchObject({
      status: 400,
      message: 'password must be longer than or equal to 8 characters',
    });
  });

  it('says so when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')));
    await expect(login(user.email, 'password1')).rejects.toMatchObject({ status: 0 });
  });

  it('renews an expired access token and tries again', async () => {
    localStorage.setItem('rmncah.accessToken', 'a1');
    localStorage.setItem('rmncah.refreshToken', 'r1');
    const fetchMock = mockFetch(fail(401, 'Unauthorized'), ok(tokens(2)), ok(user));
    expect((await loadCurrentUser())?.id).toBe('1');
    expect(authHeader(fetchMock, 2)).toBe('Bearer a2');
    expect(localStorage.getItem('rmncah.refreshToken')).toBe('r2');
  });

  it('treats a refused refresh as no session', async () => {
    localStorage.setItem('rmncah.refreshToken', 'old');
    mockFetch(fail(401, 'Unauthorized'), fail(401, 'Invalid refresh token'));
    expect(await loadCurrentUser()).toBeNull();
    expect(localStorage.getItem('rmncah.refreshToken')).toBeNull();
  });

  it('shares one refresh between requests that fail together', async () => {
    localStorage.setItem('rmncah.refreshToken', 'r1');
    const fetchMock = mockFetch(ok(tokens(2)));
    const results = await Promise.all([refreshAccessToken(), refreshAccessToken()]);
    expect(results).toEqual([true, true]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('signs out locally even when the server cannot be reached', async () => {
    localStorage.setItem('rmncah.accessToken', 'a1');
    localStorage.setItem('rmncah.refreshToken', 'r1');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await logout();
    expect(localStorage.getItem('rmncah.refreshToken')).toBeNull();
  });

  it('clears the tokens after a password change', async () => {
    localStorage.setItem('rmncah.accessToken', 'a1');
    localStorage.setItem('rmncah.refreshToken', 'r1');
    mockFetch(ok({ message: 'Password changed' }));
    await changePassword('Old-passw0rd!', 'New-passw0rd!');
    expect(localStorage.getItem('rmncah.accessToken')).toBeNull();
  });
});
