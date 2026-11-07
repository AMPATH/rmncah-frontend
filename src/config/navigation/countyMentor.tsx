import {
  Dashboard,
  UserMultiple,
  User,
  Events,
  Hospital,
  DocumentTasks,
  Chat,
  Certificate,
  ChartLine,
} from '@carbon/icons-react'

import type { RoleNavigation } from './navigation.types'

export const countyMentorNavigation: RoleNavigation = {
  role: 'county-mentor',
  title: 'County Mentor / RH / MOH',

  groups: [
    {
      items: [
        {
          label: 'Overview',
          path: '/county-mentor/overview',
          icon: <Dashboard size={20} />,
        },
        {
          label: 'Mentors',
          path: '/county-mentor/mentors',
          icon: <UserMultiple size={20} />,
        },
        {
          label: 'Mentees',
          path: '/county-mentor/mentees',
          icon: <User size={20} />,
        },
        {
          label: 'Cohorts',
          path: '/county-mentor/cohorts',
          icon: <Events size={20} />,
        },
        {
          label: 'Facilities',
          path: '/county-mentor/facilities',
          icon: <Hospital size={20} />,
        },
        {
          label: 'Site assessments',
          path: '/county-mentor/site-assessments',
          icon: <DocumentTasks size={20} />,
        },
        {
          label: 'Feedback & challenges',
          path: '/county-mentor/feedback',
          icon: <Chat size={20} />,
        },
        {
          label: 'Certification',
          path: '/county-mentor/certification',
          icon: <Certificate size={20} />,
        },
        {
          label: 'Reports',
          path: '/county-mentor/reports',
          icon: <ChartLine size={20} />,
        },
      ],
    },
  ],
}