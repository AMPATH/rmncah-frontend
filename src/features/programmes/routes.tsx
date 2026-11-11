import type { RouteObject } from 'react-router';
import ProgrammeSelectPage from './pages/ProgrammeSelectPage';

export const programmeRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ProgrammeSelectPage />,
  },
];
