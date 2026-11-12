
import AdminPageHeader from '../components/shared/AdminPageHeader'
import AdminStatCard from '../components/shared/AdminStatCard'
import AdminStatus from '../components/shared/AdminStatus'
import AdminDataTable from '../components/shared/AdminDataTable'

import {
  adminUsers,
  adminModules,
  adminActivities,
} from '../data/adminData'

import '../styles/OverviewPage.scss'

interface OverviewPageProps {
  title: string
  onNavigate?: (path: string) => void
}

function OverviewPage({
  title,
  onNavigate,
}: OverviewPageProps) {
  const activeUsers = adminUsers.filter(
    (user) => user.status === 'Active',
  ).length

  const pendingUsers = adminUsers.filter(
    (user) => user.status === 'Pending',
  ).length

  const publishedModules = adminModules.filter(
    (module) => module.status === 'Published',
  ).length

  const roleCounts = [
    'Program Lead',
    'County Mentor / RH / MOH',
    'Mentor',
    'Mentee',
    'System Administrator',
  ].map((role) => ({
    role,
    count: adminUsers.filter((user) => user.role === role).length,
  }))

  const columns = [
    { key: 'actor' as const, label: 'Actor' },
    { key: 'action' as const, label: 'Activity' },
    { key: 'resource' as const, label: 'Resource' },
    {
      key: 'result' as const,
      label: 'Result',
      render: (row: (typeof adminActivities)[number]) => (
        <AdminStatus value={row.result} />
      ),
    },
    { key: 'date' as const, label: 'Date' },
  ]

  return (
    <div className="admin-page admin-dashboard">
      <AdminPageHeader
        title={title}
        eyebrow="ADMINISTRATION WORKSPACE"
        description="Monitor platform activity, manage access and oversee system administration."
      />

      <div className="admin-demo-notice">
        <span className="admin-demo-notice__indicator" />
        Demonstration data — live platform information is not yet connected.
      </div>

      <section className="admin-stat-grid">
        <AdminStatCard
          label="Registered users"
          value={adminUsers.length}
          description="Illustrative platform accounts"
        />
        <AdminStatCard
          label="Active accounts"
          value={activeUsers}
          description="Accounts marked active in demo data"
        />
        <AdminStatCard
          label="Pending accounts"
          value={pendingUsers}
          description="Awaiting account review"
        />
        <AdminStatCard
          label="Published modules"
          value={publishedModules}
          description="Modules marked as published"
        />
      </section>

      <div className="admin-content-grid">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Users by role</h2>
              <p>Distribution of demonstration accounts.</p>
            </div>
            <button
              className="admin-text-button"
              onClick={() => onNavigate?.('/admin/users')}
            >
              View users
            </button>
          </div>

          <div className="admin-role-list">
            {roleCounts.map(({ role, count }) => {
              const percentage = adminUsers.length
                ? (count / adminUsers.length) * 100
                : 0

              return (
                <div className="admin-role-item" key={role}>
                  <div className="admin-role-item__heading">
                    <span>{role}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="admin-progress">
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Administrative attention</h2>
              <p>Items to review in the demonstration environment.</p>
            </div>
          </div>

          <div className="admin-attention-list">
            <div>
              <span className="admin-attention-list__number">
                {pendingUsers}
              </span>
              <div>
                <strong>Pending accounts</strong>
                <p>Accounts awaiting review.</p>
              </div>
              <button
                className="admin-text-button"
                onClick={() => onNavigate?.('/admin/users')}
              >
                Review
              </button>
            </div>

            <div>
              <span className="admin-attention-list__number">
                {adminModules.filter((item) => item.status === 'Draft').length}
              </span>
              <div>
                <strong>Draft modules</strong>
                <p>Modules not yet published.</p>
              </div>
              <button
                className="admin-text-button"
                onClick={() => onNavigate?.('/admin/modules')}
              >
                View
              </button>
            </div>

            <div>
              <span className="admin-attention-list__number">
                {adminActivities.filter((item) => item.result === 'Pending').length}
              </span>
              <div>
                <strong>Pending activities</strong>
                <p>Demonstration activity records.</p>
              </div>
              <button
                className="admin-text-button"
                onClick={() => onNavigate?.('/admin/audit-logs')}
              >
                Inspect
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h2>Recent administrative activity</h2>
            <p>Illustrative records of recent platform events.</p>
          </div>
          <button
            className="admin-text-button"
            onClick={() => onNavigate?.('/admin/audit-logs')}
          >
            View audit logs
          </button>
        </div>

        <AdminDataTable
          columns={columns}
          rows={adminActivities.slice(0, 4)}
        />
      </section>
    </div>
  )
}

export default OverviewPage
