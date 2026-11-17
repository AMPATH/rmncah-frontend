import type { RouteObject } from 'react-router';

import AppLayout from '../layout/AppLayout';

import { issueRoutes } from '../features/issues/routes';
import { actionRoutes } from '../features/actions/routes';
import { dashboardRoutes } from '../features/dashboard/routes';
import { notificationRoutes } from '../features/notifications/routes';
import { adminRoutes } from '../features/admin/routes';
import { myWorkRoutes } from '../features/my-work/routes';
import { recommendationRoutes } from '../features/recommendations/routes';

export const mpdsrRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      ...myWorkRoutes,
      ...recommendationRoutes,
      ...issueRoutes,
      ...actionRoutes,
      ...dashboardRoutes,
      ...notificationRoutes,
      ...adminRoutes,
    ],
  },
];
