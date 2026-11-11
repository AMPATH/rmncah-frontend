import {
  Dashboard,
  Events,
  UserMultiple,
  DocumentTasks,
  Chat,
  Certificate,
  ChartLine,
  FolderOpen,
} from '@carbon/icons-react'

import type { RoleNavigation } from './navigation.types'

export const mentorNavigation: RoleNavigation = {
  role: 'mentor',
  title: 'Mentor',

  groups: [
    {
      items: [
        {
          label: 'Overview',
          path: '/mentor/overview',
          icon: <Dashboard size={20} />,
        },
        {
          label: 'My cohorts',
          path: '/mentor/cohorts',
          icon: <Events size={20} />,
        },
        {
          label: 'Mentees',
          path: '/mentor/mentees',
          icon: <UserMultiple size={20} />,
        },
        {
          label: 'Learning plan',
          path: '/mentor/learning-plan',
          icon: <DocumentTasks size={20} />,
        },
        {
          label: 'Assessments',
          path: '/mentor/assessments',
          icon: <Certificate size={20} />,
        },
        {
          label: 'Resources',
          path: '/mentor/resources',
          icon: <FolderOpen size={20} />,
        },
        {
          label: 'Cohort submissions',
          path: '/mentor/cohort-submissions',
          icon: <ChartLine size={20} />,
        },
        {
          label: 'Feedback',
          path: '/mentor/feedback',
          icon: <Chat size={20} />,
        },
      ],
    },
  ],
}