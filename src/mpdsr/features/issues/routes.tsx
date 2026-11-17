import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../app/router/lazyPage';

export const issueRoutes: RouteObject[] = [
  { path: '/issues', lazy: lazyPage(() => import('./pages/IssuesPage')) },
  { path: '/issues/new', lazy: lazyPage(() => import('./pages/LogIssuePage')) },
  { path: '/issues/:code', lazy: lazyPage(() => import('./pages/IssueDetailPage')) },
  { path: '/issues/:code/edit', lazy: lazyPage(() => import('./pages/IssueEditPage')) },
  { path: '/issues/:id/recommendation', lazy: lazyPage(() => import('./pages/RecommendationPage')) },
];
