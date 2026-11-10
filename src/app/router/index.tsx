import { createBrowserRouter, Navigate } from 'react-router';
import AppLayout from '../../components/layout/AppLayout';
import { issueRoutes } from '../../features/issues/routes';
import { myWorkRoutes } from '../../features/my-work/routes';


export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [...myWorkRoutes, ...issueRoutes],
  },
  { path: '*', element: <Navigate to="/my-work" replace /> },
]);
