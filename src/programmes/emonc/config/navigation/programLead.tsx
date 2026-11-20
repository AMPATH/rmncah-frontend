import {
  Dashboard,
  DocumentTasks,
  Document,
  CloudUpload,
  Catalog,
  UserMultiple,
  User,
  Group,
} from '@carbon/icons-react'

import type { RoleNavigation } from './navigation.types.ts'

export const programLeadNavigation: RoleNavigation = {
  role: 'program-lead',
  title: 'Program Lead',

  groups: [
    {
      label: 'Programme Oversight',
      items: [
        {
          label: 'Overview',
          path: '/program-lead/overview',
          icon: <Dashboard size={20} />,
        },
      ],
    },
    {
      label: 'Programme Management',
      items: [
        {
          label: 'Mentors',
          path: '/program-lead/mentors',
          icon: <UserMultiple size={20} />,
        },
        {
          label: 'Mentees',
          path: '/program-lead/mentees',
          icon: <User size={20} />,
        },
        {
          label: 'Cohorts',
          path: '/program-lead/cohorts',
          icon: <Group size={20} />,
        },
      ],
    },
    {
      label: 'Curriculum Management',
      items: [
        {
          label: 'Training Modules',
          path: '/program-lead/training-modules',
          icon: <DocumentTasks size={20} />,
        },
        {
          label: 'Module Sections',
          path: '/program-lead/module-sections',
          icon: <Document size={20} />,
        },
        {
          label: 'Learning Materials',
          path: '/program-lead/learning-materials',
          icon: <CloudUpload size={20} />,
        },
        {
          label: 'Module Library',
          path: '/program-lead/module-library',
          icon: <Catalog size={20} />,
        },
      ],
    },
  ],
}
