import type { RouteObject } from 'react-router';
import MyWorkPage from './pages/MyWorkPage';

export const myWorkRoutes: RouteObject[] = [
  { path: '/my-work', element: <MyWorkPage /> },
];
