import type { RouteObject } from 'react-router';
import NotificationsPage from './pages/NotificationsPage';

export const notificationRoutes: RouteObject[] = [
  { path: '/notifications', element: <NotificationsPage /> },
];
