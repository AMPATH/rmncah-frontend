import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../../app/router/lazyPage';

export const recommendationRoutes: RouteObject[] = [
  { path: '/recommendations/:code', lazy: lazyPage(() => import('./pages/RecommendationDetailPage')) },
];
