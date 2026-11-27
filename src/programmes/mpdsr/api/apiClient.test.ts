// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGet } from './apiClient';
import { SESSION_ENDED_EVENT } from '../../../app/auth/services/authApi';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const unauthorized = () => new Response('{}', { status: 401 });

describe('apiClient sign-in handling', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('rmncah.accessToken', 'a1');
    localStorage.setItem('rmncah.refreshToken', 'r1');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends the sign-in token', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(ok([]));
    vi.stubGlobal('fetch', fetchMock);
    await apiGet('/issues');
    expect((fetchMock.mock.calls[0][1] as { headers: Headers }).headers.get('Authorization')).toBe('Bearer a1');
  });

  it('renews the token on a 401 and repeats the request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(ok({ success: true, data: { accessToken: 'a2', refreshToken: 'r2', expiresIn: 900 } }))
      .mockResolvedValueOnce(ok([{ id: 'x' }]));
    vi.stubGlobal('fetch', fetchMock);
    expect(await apiGet('/issues')).toEqual([{ id: 'x' }]);
    expect((fetchMock.mock.calls[2][1] as { headers: Headers }).headers.get('Authorization')).toBe('Bearer a2');
  });

  it('ends the session when the token cannot be renewed', async () => {
    const ended = vi.fn();
    window.addEventListener(SESSION_ENDED_EVENT, ended);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(unauthorized()).mockResolvedValueOnce(new Response('{}', { status: 401 })),
    );
    await expect(apiGet('/issues')).rejects.toMatchObject({ status: 401 });
    expect(ended).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('rmncah.refreshToken')).toBeNull();
    window.removeEventListener(SESSION_ENDED_EVENT, ended);
  });
});
