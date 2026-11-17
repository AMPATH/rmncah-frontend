import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../app/router/lazyPage';

export const adminRoutes: RouteObject[] = [
  { path: '/admin/users', lazy: lazyPage(() => import('./pages/UsersPage')) },
  { path: '/admin/users/:id', lazy: lazyPage(() => import('./pages/UserEditPage')) },
  { path: '/admin/places', lazy: lazyPage(() => import('./pages/PlacesPage')) },
  { path: '/admin/escalation', lazy: lazyPage(() => import('./pages/EscalationMatrixPage')) },
];
