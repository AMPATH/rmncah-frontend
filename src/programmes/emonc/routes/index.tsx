import type { RouteObject } from 'react-router';
import EmONCApp from '../app/EmONCApp';

export const emoncRoutes: RouteObject[] = [
  {
    path: '/emonc/*',
    element: <EmONCApp />,
  },
];
