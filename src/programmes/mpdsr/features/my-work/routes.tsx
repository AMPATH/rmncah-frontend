import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../../app/router/lazyPage';

export const myWorkRoutes: RouteObject[] = [
  { path: '/mpdsr', lazy: lazyPage(() => import('./pages/MyWorkPage')) },
];
