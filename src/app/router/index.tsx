
import { createBrowserRouter, Navigate } from 'react-router';

import AppLayout from '../../components/layout/AppLayout';
import EmONCApp from '../../features/emonc/EmONCApp';
import { issueRoutes } from '../../features/issues/routes';
import { myWorkRoutes } from '../../features/my-work/routes';
import { programmeRoutes } from '../../features/programmes/routes';

export const router = createBrowserRouter([
  // Programme selection landing page
  ...programmeRoutes,

  // Existing EmONC application
  {
    path: '/emonc/*',
    element: <EmONCApp />,
  },

  // Existing MPDSR application
  {
    element: <AppLayout />,
    children: [...myWorkRoutes, ...issueRoutes],
  },

  // Unknown routes return to programme selection
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
