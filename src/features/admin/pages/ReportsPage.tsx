
import { useMemo, useState } from 'react'

import AdminPageHeader from '../components/shared/AdminPageHeader'
import AdminStatCard from '../components/shared/AdminStatCard'
import AdminStatus from '../components/shared/AdminStatus'

import {
  adminUsers,
  adminModules,
  adminActivities,
} from '../data/adminData'

import '../styles/ReportsPage.scss'

interface ReportsPageProps {
  title: string
}

function ReportsPage({ title }: ReportsPageProps) {
  const [reportType, setReportType] = useState('users')

  const roleReport = useMemo(() => {
    const roles = [
      'Program Lead',
      'County Mentor / RH / MOH',
      'Mentor',
      'Mentee',
      'System Administrator',
    ]

    return roles.map((role) => ({
      role,
      count: adminUsers.filter((user) => user.role === role).length,
    }))
  }, [])

  const moduleReport = [
    'Draft',
    'Published',
    'Archived',
  ].map((status) => ({
    status,
    count: adminModules.filter((module) => module.status === status).length,
  }))

  const activityReport = [
    'Successful',
    'Pending',
    'Failed',
  ].map((result) => ({
    result,
    count: adminActivities.filter((activity) => activity.result === result).length,
  }))

  function exportReport() {
    const rows = reportType === 'users'
      ? [
          ['ID', 'Name', 'Email', 'Role', 'Facility', 'Status'],
          ...adminUsers.map((user) => [
            user.id,
            user.name,
            user.email,
            user.role,
            user.facility,
            user.status,
          ]),
        ]
      : reportType === 'modules'
        ? [
            ['ID', 'Title', 'Category', 'Owner', 'Status'],
            ...adminModules.map((module) => [
              module.id,
              module.title,
              module.category,
              module.owner,
              module.status,
            ]),
          ]
        : [
            ['ID', 'Actor', 'Action', 'Resource', 'Date', 'Result'],
            ...adminActivities.map((activity) => [
              activity.id,
              activity.actor,
              activity.action,
              activity.resource,
              activity.date,
              activity.result,
            ]),
          ]

    const csv = rows
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`,
        ).join(','),
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `emonc-admin-${reportType}-demo-report.csv`

    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={title}
        description="Review system-wide account, module and administrative activity summaries."
      />

      <div className="admin-demo-notice">
        All reports use illustrative demonstration records. They are not clinical outcome or verified programme performance reports.
      </div>

      <section className="admin-stat-grid admin-stat-grid--three">
        <AdminStatCard
          label="Total accounts"
          value={adminUsers.length}
          description="Demonstration user records"
        />
        <AdminStatCard
          label="Training modules"
          value={adminModules.length}
          description="Demonstration module records"
        />
        <AdminStatCard
          label="Recorded activities"
          value={adminActivities.length}
          description="Demonstration activity records"
        />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h2>Generate report</h2>
            <p>Select a report category and export its demonstration data.</p>
          </div>
        </div>

        <div className="admin-report-controls">
          <div className="admin-filter">
            <label htmlFor="report-type">Report category</label>
            <select
              id="report-type"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
            >
              <option value="users">User accounts</option>
              <option value="modules">Training modules</option>
              <option value="activities">Administrative activities</option>
            </select>
          </div>

          <button
            className="admin-button admin-button--primary"
            onClick={exportReport}
          >
            Export CSV
          </button>
        </div>
      </section>

      <div className="admin-content-grid">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>User distribution</h2>
              <p>Demonstration accounts by application role.</p>
            </div>
          </div>

          <div className="admin-role-list">
            {roleReport.map((item) => {
              const percentage = adminUsers.length
                ? item.count / adminUsers.length * 100
                : 0

              return (
                <div className="admin-role-item" key={item.role}>
                  <div className="admin-role-item__heading">
                    <span>{item.role}</span>
                    <strong>{item.count}</strong>
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
              <h2>Module publication</h2>
              <p>Distribution by module status.</p>
            </div>
          </div>

          <div className="admin-report-list">
            {moduleReport.map((item) => (
              <div key={item.status}>
                <AdminStatus value={item.status} />
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h2>Administrative activity results</h2>
            <p>Recorded outcomes in the demonstration dataset.</p>
          </div>
        </div>

        <div className="admin-report-list">
          {activityReport.map((item) => (
            <div key={item.result}>
              <AdminStatus value={item.result} />
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ReportsPage
