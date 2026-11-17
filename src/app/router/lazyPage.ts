import type { ComponentType } from 'react';

// Loads a page's code only when someone opens it, instead of all pages up front.
// Use in a route: { path: '/reports', lazy: lazyPage(() => import('./pages/DashboardPage')) }
export function lazyPage(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default });
}
