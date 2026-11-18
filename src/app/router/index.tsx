import { createBrowserRouter, Navigate } from 'react-router';

import { programmeSelectionRoutes } from '../programme-selection/routes';
import { mpdsrRoutes } from '../../programmes/mpdsr/routes';
import { emoncRoutes } from '../../programmes/emonc/routes';

export const router = createBrowserRouter([
  ...programmeSelectionRoutes,
  ...emoncRoutes,
  ...mpdsrRoutes,
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
