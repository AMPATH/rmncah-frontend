import type { RouteObject } from 'react-router';
import ProgrammeSelectPage from './ProgrammeSelectPage';

export const programmeSelectionRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ProgrammeSelectPage />,
  },
];
