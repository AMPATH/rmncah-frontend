import { createBrowserRouter, Navigate } from 'react-router';

import AppLayout from '../../components/layout/AppLayout';
import EmONCApp from '../../features/emonc/EmONCApp';
import { issueRoutes } from '../../features/issues/routes';
import { myWorkRoutes } from '../../features/my-work/routes';

export const router = createBrowserRouter([
  {
    path: '/emonc/*',
    element: <EmONCApp />,
  },
  {
    element: <AppLayout />,
    children: [...myWorkRoutes, ...issueRoutes],
  },
  {
    path: '*',
    element: <Navigate to="/my-work" replace />,
  },
]);