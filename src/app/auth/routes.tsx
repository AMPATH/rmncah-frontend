import type { RouteObject } from 'react-router';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SetPasswordPage from './pages/SetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SessionsPage from './pages/SessionsPage';

// Pages anyone can open, including the links in invitation and reset emails.
export const publicAuthRoutes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  // Link in the reset email: /reset-password?token=...
  { path: '/reset-password', element: <SetPasswordPage mode="reset" /> },
  // Link in the invitation email: /accept-invitation?token=...
  { path: '/accept-invitation', element: <SetPasswordPage mode="invitation" /> },
];

// Pages that need a signed-in user.
export const signedInAuthRoutes: RouteObject[] = [
  { path: '/change-password', element: <ChangePasswordPage /> },
  { path: '/sessions', element: <SessionsPage /> },
];
