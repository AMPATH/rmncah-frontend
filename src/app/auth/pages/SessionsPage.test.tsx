// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthProvider } from '../context/AuthProvider';
import RequireAuth from '../components/RequireAuth';
import { publicAuthRoutes, signedInAuthRoutes } from '../routes';
import { deviceName } from '../utils/deviceName';

const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
const noContent = () => new Response(null, { status: 204 });
const me = {
  id: '1',
  sessionId: 's-this',
  firstName: 'Test',
  lastName: 'Chair 01',
  email: 'test.chair01@mpdsr.test',
  status: 'ACTIVE',
  mustChangePassword: false,
};
const future = new Date(Date.now() + 86_400_000).toISOString();
const session = (id: string, userAgent: string, extra: object = {}) => ({
  id,
  ipAddress: '10.0.0.5',
  userAgent,
  createdAt: '2026-11-26T08:00:00.000Z',
  lastUsedAt: '2026-11-27T09:00:00.000Z',
  expiresAt: future,
  revokedAt: null,
  ...extra,
});
const CHROME_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/131.0 Safari/537.36';
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/604.1';

function renderSessions() {
  localStorage.setItem('rmncah.accessToken', 'a1');
  localStorage.setItem('rmncah.refreshToken', 'r1');
  const router = createMemoryRouter(
    [...publicAuthRoutes, { element: <RequireAuth />, children: [{ path: '/', element: <p>Welcome page</p> }, ...signedInAuthRoutes] }],
    { initialEntries: ['/sessions'] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
  return router;
}

describe('signed-in devices', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('names devices in plain words', () => {
    expect(deviceName(CHROME_WINDOWS)).toBe('Chrome on Windows');
    expect(deviceName(SAFARI_IPHONE)).toBe('Safari on iPhone or iPad');
    expect(deviceName(null)).toBe('Unknown device');
  });

  it('lists active devices, marks this one, and hides ended sessions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(ok(me)).mockResolvedValueOnce(
        ok([
          session('s-this', CHROME_WINDOWS),
          session('s-phone', SAFARI_IPHONE),
          session('s-old', CHROME_WINDOWS, { revokedAt: '2026-11-20T08:00:00.000Z' }),
        ]),
      ),
    );
    renderSessions();
    const list = await screen.findByRole('list', { name: 'Signed-in devices' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('This device')).toBeTruthy();
    expect(within(list).getAllByRole('button', { name: 'Sign out' })).toHaveLength(1);
  });

  it('signs out another device', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok(me))
      .mockResolvedValueOnce(ok([session('s-this', CHROME_WINDOWS), session('s-phone', SAFARI_IPHONE)]))
      .mockResolvedValueOnce(noContent());
    vi.stubGlobal('fetch', fetchMock);
    renderSessions();
    const list = await screen.findByRole('list', { name: 'Signed-in devices' });
    fireEvent.click(within(list).getByRole('button', { name: 'Sign out' }));
    await screen.findByText('Safari on iPhone or iPad has been signed out.');
    expect(fetchMock.mock.calls[2][0]).toContain('/auth/sessions/s-phone');
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  });

  it('signs out every device and goes to sign in', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok(me))
      .mockResolvedValueOnce(ok([session('s-this', CHROME_WINDOWS), session('s-phone', SAFARI_IPHONE)]))
      .mockResolvedValueOnce(noContent());
    vi.stubGlobal('fetch', fetchMock);
    const router = renderSessions();
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out of all devices' }));
    await screen.findByText('You are signed out on every device.');
    expect(router.state.location.pathname).toBe('/login');
    expect(localStorage.getItem('rmncah.refreshToken')).toBeNull();
  });
});
