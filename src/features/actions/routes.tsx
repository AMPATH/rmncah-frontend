import type { RouteObject } from 'react-router';
import AcceptEscalatePage from './pages/AcceptEscalatePage';
import CloseOutPage from './pages/CloseOutPage';
import OverdueListPage from './pages/OverdueListPage';
import OverdueReassignPage from './pages/OverdueReassignPage';

export const actionRoutes: RouteObject[] = [
  { path: '/actions/:id/respond', element: <AcceptEscalatePage /> },
  { path: '/actions/overdue', element: <OverdueListPage /> },
  { path: '/actions/:id/reassign', element: <OverdueReassignPage /> },
  { path: '/actions/:id/close', element: <CloseOutPage /> },
];
