import {
  Dashboard,
  DocumentTasks,
  Document,
  CloudUpload,
  Catalog,
} from '@carbon/icons-react'

import type { RoleNavigation } from './navigation.types'

export const programLeadNavigation: RoleNavigation = {
  role: 'program-lead',
  title: 'Program Lead',

  groups: [
    {
      items: [
        {
          label: 'Overview',
          path: '/program-lead/overview',
          icon: <Dashboard size={20} />,
        },
        {
          label: 'Training Modules',
          path: '/program-lead/modules',
          icon: <DocumentTasks size={20} />,
        },
        {
          label: 'Module Sections',
          path: '/program-lead/sections',
          icon: <Document size={20} />,
        },
        {
          label: 'Learning Materials',
          path: '/program-lead/materials',
          icon: <CloudUpload size={20} />,
        },
        {
          label: 'Module Library',
          path: '/program-lead/library',
          icon: <Catalog size={20} />,
        },
      ],
    },
  ],
}
