import type { RouteObject } from 'react-router';
import RecommendationDetailPage from './pages/RecommendationDetailPage';

export const recommendationRoutes: RouteObject[] = [
  { path: '/recommendations/:code', element: <RecommendationDetailPage /> },
];
