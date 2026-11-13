
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

export const adminNavigation: RoleNavigation = {
  role: 'admin',
  title: 'Administration Workspace',

  groups: [
    {
      items: [
        {
          label: 'Overview',
          path: '/admin/overview',
          icon: <Dashboard size={20} />,
        },
        {
          label: 'User Management',
          path: '/admin/users',
          icon: <UserMultiple size={20} />,
        },
        {
          label: 'Role & Permissions',
          path: '/admin/roles',
          icon: <User size={20} />,
        },
        {
          label: 'System Configuration',
          path: '/admin/configuration',
          icon: <Events size={20} />,
        },
        {
          label: 'Module Management',
          path: '/admin/modules',
          icon: <Hospital size={20} />,
        },
        {
          label: 'Audit Logs',
          path: '/admin/audit-logs',
          icon: <DocumentTasks size={20} />,
        },
        {
          label: 'Reports',
          path: '/admin/reports',
          icon: <ChartLine size={20} />,
        },
      ],
    },
  ],
}
