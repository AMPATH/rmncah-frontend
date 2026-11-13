
import { useState } from 'react'

import AdminPageHeader from '../components/shared/AdminPageHeader'
import { adminPermissions, adminUsers } from '../data/adminData'
import type { AdminUserRole } from '../types/admin.types'

import '../styles/RolePermissionsPage.scss'

interface RolePermissionsPageProps {
  title: string
}

const roleDescriptions: {
  role: AdminUserRole
  description: string
}[] = [
  {
    role: 'Program Lead',
    description: 'Oversees training content, learning modules and publication.',
  },
  {
    role: 'County Mentor / RH / MOH',
    description: 'Coordinates county-level mentorship operations.',
  },
  {
    role: 'Mentor',
    description: 'Supports assigned mentees, cohorts and competency development.',
  },
  {
    role: 'Mentee',
    description: 'Accesses mentor-assigned learning and mentorship activities.',
  },
  {
    role: 'System Administrator',
    description: 'Oversees platform accounts, configuration and administration.',
  },
]

function RolePermissionsPage({ title }: RolePermissionsPageProps) {
  const [selectedRole, setSelectedRole] =
    useState<AdminUserRole>('System Administrator')

  const selectedDescription = roleDescriptions.find(
    (item) => item.role === selectedRole,
  )

  const groupedPermissions = Array.from(
    new Set(adminPermissions.map((item) => item.category)),
  )

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={title}
        description="Review application roles and the permissions associated with each responsibility."
      />

      <div className="admin-demo-notice">
        Illustrative permission matrix. Effective authorization must be enforced by backend services.
      </div>

      <div className="admin-role-layout">
        <section className="admin-panel admin-role-selector">
          <div className="admin-panel__header">
            <div>
              <h2>Application roles</h2>
              <p>Choose a role to inspect.</p>
            </div>
          </div>

          {roleDescriptions.map((item) => (
            <button
              key={item.role}
              className={`admin-role-option ${
                selectedRole === item.role
                  ? 'admin-role-option--selected'
                  : ''
              }`}
              onClick={() => setSelectedRole(item.role)}
            >
              <span>{item.role}</span>
              <small>
                {adminUsers.filter((user) => user.role === item.role).length}
                {' '}demo accounts
              </small>
            </button>
          ))}
        </section>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <span className="admin-page-header__eyebrow">
                SELECTED ROLE
              </span>
              <h2>{selectedRole}</h2>
              <p>{selectedDescription?.description}</p>
            </div>
          </div>

          <div className="admin-permission-list">
            {groupedPermissions.map((category) => (
              <section key={category}>
                <h3>{category}</h3>

                {adminPermissions
                  .filter((permission) => permission.category === category)
                  .map((permission) => (
                    <div
                      className="admin-permission-row"
                      key={permission.id}
                    >
                      <div>
                        <strong>{permission.label}</strong>
                        <p>{permission.description}</p>
                      </div>

                      <span className="admin-permission-indicator">
                        {selectedRole === 'System Administrator'
                          ? 'Administrative'
                          : 'Defined by role'}
                      </span>
                    </div>
                  ))}
              </section>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default RolePermissionsPage
