import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../app/router/lazyPage';

export const dashboardRoutes: RouteObject[] = [
  { path: '/reports', lazy: lazyPage(() => import('./pages/DashboardPage')) },
];
