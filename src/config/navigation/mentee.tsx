import {
  Dashboard,
  DocumentTasks,
  Events,
  FolderOpen,
  Certificate,
  Chat,
} from '@carbon/icons-react'

import type { RoleNavigation } from './navigation.types'

export const menteeNavigation: RoleNavigation = {
  role: 'mentee',
  title: 'Mentee',

  groups: [
    {
      items: [
        {
          label: 'Overview',
          path: '/mentee/overview',
          icon: <Dashboard size={20} />,
        },
        {
          label: 'My learning',
          path: '/mentee/learning',
          icon: <DocumentTasks size={20} />,
        },
        {
          label: 'Schedule',
          path: '/mentee/schedule',
          icon: <Events size={20} />,
        },
        {
          label: 'Assessments',
          path: '/mentee/assessments',
          icon: <Certificate size={20} />,
        },
        {
          label: 'Resources',
          path: '/mentee/resources',
          icon: <FolderOpen size={20} />,
        },
        {
          label: 'Feedback',
          path: '/mentee/feedback',
          icon: <Chat size={20} />,
        },
      ],
    },
  ],
}