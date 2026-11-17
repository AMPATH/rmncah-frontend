import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../app/router/lazyPage';

export const actionRoutes: RouteObject[] = [
  { path: '/actions/:id/respond', lazy: lazyPage(() => import('./pages/AcceptEscalatePage')) },
  { path: '/actions/overdue', lazy: lazyPage(() => import('./pages/OverdueListPage')) },
  { path: '/actions/:id/reassign', lazy: lazyPage(() => import('./pages/OverdueReassignPage')) },
  { path: '/actions/:id/close', lazy: lazyPage(() => import('./pages/CloseOutPage')) },
  { path: '/actions/:id/edit', lazy: lazyPage(() => import('./pages/EditCancelPage')) },
];
