import type { RouteObject } from 'react-router';
import LogIssuePage from './pages/LogIssuePage';

export const issueRoutes: RouteObject[] = [
  { path: '/issues/new', element: <LogIssuePage /> },
];
