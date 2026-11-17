import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../app/router/lazyPage';

export const notificationRoutes: RouteObject[] = [
  { path: '/notifications', lazy: lazyPage(() => import('./pages/NotificationsPage')) },
];
