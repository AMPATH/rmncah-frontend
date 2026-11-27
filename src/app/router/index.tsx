import { createBrowserRouter, Navigate } from 'react-router';

import { programmeSelectionRoutes } from '../programme-selection/routes';
import { mpdsrRoutes } from '../../programmes/mpdsr/routes';
import { emoncRoutes } from '../../programmes/emonc/routes';
import { publicAuthRoutes, signedInAuthRoutes } from '../auth/routes';
import RequireAuth from '../auth/components/RequireAuth';

export const router = createBrowserRouter([
  ...publicAuthRoutes,
  {
    // Pages inside here need a signed-in user.
    element: <RequireAuth />,
    children: [...programmeSelectionRoutes, ...mpdsrRoutes, ...signedInAuthRoutes],
  },
  ...emoncRoutes,
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
