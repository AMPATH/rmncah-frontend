
import type { RouteObject } from 'react-router'

import EmONCApp from '../app/EmONCApp'
import { CurriculumProvider } from '../data/providers/CurriculumProvider'

export const emoncRoutes: RouteObject[] = [
  {
    path: '/emonc/*',
    element: (
      <CurriculumProvider>
        <EmONCApp />
      </CurriculumProvider>
    ),
  },
]
