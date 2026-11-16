
import { createBrowserRouter, Navigate } from 'react-router';

import AppLayout from '../../components/layout/AppLayout';
import EmONCApp from '../../features/emonc/EmONCApp';
import { issueRoutes } from '../../features/issues/routes';
import { actionRoutes } from '../../features/actions/routes';
import { dashboardRoutes } from '../../features/dashboard/routes';
import { notificationRoutes } from '../../features/notifications/routes';
import { recommendationRoutes } from '../../features/recommendations/routes';
import { myWorkRoutes } from '../../features/my-work/routes';
import { programmeRoutes } from '../../features/programmes/routes';

export const router = createBrowserRouter([
 
  ...programmeRoutes,

  
  {
    path: '/emonc/*',
    element: <EmONCApp />,
  },

  
  {
    element: <AppLayout />,
    children: [...myWorkRoutes, ...issueRoutes, ...actionRoutes, ...dashboardRoutes, ...notificationRoutes, ...recommendationRoutes],
  },

  
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
