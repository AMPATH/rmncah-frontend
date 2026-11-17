
import { createBrowserRouter, Navigate } from 'react-router';

import AppLayout from '../../mpdsr/components/layout/AppLayout';
import ErrorPage from '../../mpdsr/components/layout/ErrorPage';
import EmONCApp from '../../features/emonc/EmONCApp';
import { issueRoutes } from '../../mpdsr/features/issues/routes';
import { actionRoutes } from '../../mpdsr/features/actions/routes';
import { adminRoutes } from '../../mpdsr/features/admin/routes';
import { dashboardRoutes } from '../../mpdsr/features/dashboard/routes';
import { notificationRoutes } from '../../mpdsr/features/notifications/routes';
import { recommendationRoutes } from '../../mpdsr/features/recommendations/routes';
import { myWorkRoutes } from '../../mpdsr/features/my-work/routes';
import { programmeRoutes } from '../../features/programmes/routes';

export const router = createBrowserRouter([
 
  ...programmeRoutes,

  
  {
    path: '/emonc/*',
    element: <EmONCApp />,
  },

  
  {
    element: <AppLayout />,
    // If the layout itself breaks, the error page takes the whole screen.
    errorElement: <ErrorPage fullPage />,
    children: [
      {
        // If a page breaks, the error page shows in its place and the menu stays.
        errorElement: <ErrorPage />,
        children: [...myWorkRoutes, ...issueRoutes, ...actionRoutes, ...dashboardRoutes, ...notificationRoutes, ...recommendationRoutes, ...adminRoutes],
      },
    ],
  },

  
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
