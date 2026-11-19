import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../../app/router/lazyPage';

export const overviewRoutes: RouteObject[] = [
  { path: '/mpdsr', lazy: lazyPage(() => import('./pages/OverviewPage')) },
];
