import type { RouteObject } from 'react-router';
import { lazyPage } from '../../../../app/router/lazyPage';

export const profileRoutes: RouteObject[] = [{ path: '/profile', lazy: lazyPage(() => import('./pages/ProfilePage')) }];