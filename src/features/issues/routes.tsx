import type { RouteObject } from 'react-router';
import LogIssuePage from './pages/LogIssuePage';
import RecommendationPage from './pages/RecommendationPage';

export const issueRoutes: RouteObject[] = [
  { path: '/issues/new', element: <LogIssuePage /> },
  { path: '/issues/:id/recommendation', element: <RecommendationPage /> },
];
