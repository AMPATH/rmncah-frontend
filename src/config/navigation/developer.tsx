import {
  Dashboard,
  UserMultiple,
  User,
  Events,
  DocumentTasks,
  ChartLine,
  Hospital,
} from '@carbon/icons-react'

import type { RoleNavigation } from './navigation.types'

export const developerNavigation: RoleNavigation = {
  role: 'developer',
  title: 'Developer / System Administrator',

  groups: [
    {
      items: [
        {
          label: 'Overview',
          path: '/developer/overview',
          icon: <Dashboard size={20} />,
        },
        {
          label: 'User Management',
          path: '/developer/users',
          icon: <UserMultiple size={20} />,
        },
        {
          label: 'Role & Permissions',
          path: '/developer/roles',
          icon: <User size={20} />,
        },
        {
          label: 'System Configuration',
          path: '/developer/configuration',
          icon: <Events size={20} />,
        },
        {
          label: 'Module Management',
          path: '/developer/modules',
          icon: <Hospital size={20} />,
        },
        {
          label: 'Audit Logs',
          path: '/developer/audit-logs',
          icon: <DocumentTasks size={20} />,
        },
        {
          label: 'Reports',
          path: '/developer/reports',
          icon: <ChartLine size={20} />,
        },
      ],
    },
  ],
}