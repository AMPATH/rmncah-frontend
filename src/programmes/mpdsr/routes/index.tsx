import type { RouteObject } from 'react-router';
import AppLayout from '../components/layout/AppLayout';
import ErrorPage from '../components/layout/ErrorPage';
import { issueRoutes } from '../features/issues/routes';
import { actionRoutes } from '../features/actions/routes';
import { dashboardRoutes } from '../features/dashboard/routes';
import { notificationRoutes } from '../features/notifications/routes';
import { adminRoutes } from '../features/admin/routes';
import { overviewRoutes } from '../features/overview/routes';
import { recommendationRoutes } from '../features/recommendations/routes';
import { profileRoutes } from '../features/profile/routes';

export const mpdsrRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <ErrorPage fullPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          ...overviewRoutes,
          ...recommendationRoutes,
          ...issueRoutes,
          ...actionRoutes,
          ...dashboardRoutes,
          ...notificationRoutes,
          ...adminRoutes,
          ...profileRoutes,
        ],
      },
    ],
  },
];
