// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthProvider } from '../context/AuthProvider';
import RequireAuth from '../components/RequireAuth';
import { publicAuthRoutes, signedInAuthRoutes } from '../routes';

const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ success: false, message }), { status });
const user = (mustChangePassword: boolean) => ({
  id: '1',
  firstName: 'Test',
  lastName: 'Reporter 01',
  email: 'test.reporter01@mpdsr.test',
  status: 'ACTIVE',
  mustChangePassword,
});
const tokens = { accessToken: 'a1', refreshToken: 'r1', expiresIn: 900 };
const STRONG = 'Str0ng-Passw0rd';

function renderApp(path: string) {
  const router = createMemoryRouter(
    [
      ...publicAuthRoutes,
      {
        element: <RequireAuth />,
        children: [{ path: '/', element: <p>Welcome page</p> }, ...signedInAuthRoutes],
      },
    ],
    { initialEntries: [path] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
  return router;
}
const field = (label: RegExp) => screen.getByLabelText(label, { selector: 'input' });
const type = (label: RegExp, value: string) => fireEvent.change(field(label), { target: { value } });
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));

describe('sign-in pages', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('sends signed-out visitors to sign in, then back where they were going', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(ok({ ...tokens, user: user(false) })));
    const router = renderApp('/');
    await screen.findByRole('heading', { name: 'Sign in' });
    type(/^Email/, 'test.reporter01@mpdsr.test');
    type(/^Password/, 'password1');
    click('Sign in');
    await screen.findByText('Welcome page');
    expect(router.state.location.pathname).toBe('/');
  });

  it('shows one message for a wrong email or password', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(fail(401, 'Invalid email or password')));
    renderApp('/login');
    type(/^Email/, 'test.reporter01@mpdsr.test');
    type(/^Password/, 'wrong-password');
    click('Sign in');
    await screen.findByText('Invalid email or password.');
    expect((field(/^Password/) as HTMLInputElement).value).toBe('');
  });

  it('makes a new account choose its own password, then sign in again', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok({ ...tokens, user: user(true) }))
      .mockResolvedValueOnce(ok({ message: 'Password changed' }));
    vi.stubGlobal('fetch', fetchMock);
    const router = renderApp('/');
    await screen.findByRole('heading', { name: 'Sign in' });
    type(/^Email/, 'test.reporter01@mpdsr.test');
    type(/^Password/, 'Temp-passw0rd!');
    click('Sign in');
    await screen.findByRole('heading', { name: 'Choose your own password' });

    type(/^Current password/, 'Temp-passw0rd!');
    type(/^New password/, 'weak');
    click('Change password');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    type(/^New password/, STRONG);
    type(/^Confirm password/, STRONG);
    click('Change password');
    await screen.findByText(/Sign in again with your new password/);
    expect(router.state.location.pathname).toBe('/login');
  });

  it('takes the invitation code out of the address bar and explains an expired link', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(fail(400, 'Invitation is invalid or expired')));
    const router = renderApp('/accept-invitation?token=abc123');
    await screen.findByRole('heading', { name: 'Set up your account' });
    expect(router.state.location.search).toBe('');

    type(/^Password/, STRONG);
    type(/^Confirm password/, STRONG);
    click('Activate account');
    await screen.findByText(/Ask your system administrator to resend it/);
  });

  it('says when a reset link has no code', async () => {
    renderApp('/reset-password');
    expect(await screen.findByText(/missing its code/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Request a new reset link' })).toBeTruthy();
  });

  it('shows the same reply whether or not the email has an account', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(ok({ message: 'If the account exists, an email was sent' })));
    renderApp('/forgot-password');
    type(/^Email/, 'nobody@mpdsr.test');
    click('Send reset link');
    await screen.findByRole('heading', { name: 'Check your email' });
  });

  it('blocks pasting into the confirm field', async () => {
    renderApp('/accept-invitation?token=abc123');
    await screen.findByRole('heading', { name: 'Set up your account' });
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    field(/^Confirm password/).dispatchEvent(paste);
    expect(paste.defaultPrevented).toBe(true);
  });

  it('signs this tab out when another tab signs out', async () => {
    localStorage.setItem('rmncah.accessToken', 'a1');
    localStorage.setItem('rmncah.refreshToken', 'r1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(ok(user(false))));
    renderApp('/');
    await screen.findByText('Welcome page');

    localStorage.clear();
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'rmncah.refreshToken', newValue: null }));
    });
    await screen.findByText('You signed out in another tab.');
  });
});
