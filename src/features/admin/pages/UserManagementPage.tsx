
import { useMemo, useState } from 'react'

import AdminPageHeader from '../components/shared/AdminPageHeader'
import AdminDataTable from '../components/shared/AdminDataTable'
import AdminStatus from '../components/shared/AdminStatus'
import type { AdminTableColumn } from '../components/shared/AdminDataTable'

import { adminUsers } from '../data/adminData'
import type { AdminUser } from '../types/admin.types'

import '../styles/UserManagementPage.scss'

interface UserManagementPageProps {
  title: string
}

function UserManagementPage({ title }: UserManagementPageProps) {
  const [users, setUsers] = useState(adminUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.name} ${user.email} ${user.id}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesRole =
        roleFilter === 'All' || user.role === roleFilter

      const matchesStatus =
        statusFilter === 'All' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  function toggleStatus(user: AdminUser) {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'

    if (!window.confirm(
      `Change ${user.name}'s account status to ${nextStatus}?`,
    )) {
      return
    }

    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? { ...item, status: nextStatus }
          : item,
      ),
    )

    setSelectedUser(null)
  }

  const columns: AdminTableColumn<AdminUser>[] = [
    {
      key: 'name',
      label: 'User',
      render: (user) => (
        <div className="admin-user-cell">
          <span className="admin-avatar">
            {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role' },
    { key: 'facility', label: 'Facility / Unit' },
    {
      key: 'status',
      label: 'Status',
      render: (user) => <AdminStatus value={user.status} />,
    },
    { key: 'createdAt', label: 'Created' },
    {
      key: 'id',
      label: 'Action',
      render: (user) => (
        <button
          className="admin-text-button"
          onClick={() => setSelectedUser(user)}
        >
          View details
        </button>
      ),
    },
  ]

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={title}
        description="View and manage accounts across the EmONC platform."
      />

      <div className="admin-demo-notice">
        Demonstration records. Account changes are local and are not persisted.
      </div>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <label htmlFor="admin-user-search">Search users</label>
            <input
              id="admin-user-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or ID"
            />
          </div>

          <div className="admin-filter">
            <label htmlFor="admin-role-filter">Role</label>
            <select
              id="admin-role-filter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option>All</option>
              <option>Program Lead</option>
              <option>County Mentor / RH / MOH</option>
              <option>Mentor</option>
              <option>Mentee</option>
              <option>System Administrator</option>
            </select>
          </div>

          <div className="admin-filter">
            <label htmlFor="admin-status-filter">Account status</label>
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        <div className="admin-table-heading">
          <div>
            <h2>Platform users</h2>
            <p>{filteredUsers.length} accounts found</p>
          </div>
        </div>

        <AdminDataTable columns={columns} rows={filteredUsers} />
      </section>

      {selectedUser && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-dialog-title"
          >
            <div className="admin-modal__header">
              <div>
                <span className="admin-page-header__eyebrow">
                  ACCOUNT DETAILS
                </span>
                <h2 id="admin-user-dialog-title">
                  {selectedUser.name}
                </h2>
              </div>
              <button
                className="admin-icon-button"
                aria-label="Close details"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>

            <dl className="admin-detail-list">
              <div><dt>Account ID</dt><dd>{selectedUser.id}</dd></div>
              <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
              <div><dt>Role</dt><dd>{selectedUser.role}</dd></div>
              <div><dt>Facility / Unit</dt><dd>{selectedUser.facility}</dd></div>
              <div><dt>Status</dt><dd><AdminStatus value={selectedUser.status} /></dd></div>
              <div><dt>Created</dt><dd>{selectedUser.createdAt}</dd></div>
              <div><dt>Last active</dt><dd>{selectedUser.lastActive}</dd></div>
            </dl>

            <div className="admin-modal__footer">
              <button
                className="admin-button admin-button--secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
              <button
                className="admin-button admin-button--primary"
                disabled={selectedUser.status === 'Pending'}
                onClick={() => toggleStatus(selectedUser)}
              >
                {selectedUser.status === 'Active'
                  ? 'Deactivate account'
                  : 'Activate account'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage
