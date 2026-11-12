
import { useMemo, useState } from 'react'

import AdminPageHeader from '../components/shared/AdminPageHeader'
import AdminDataTable from '../components/shared/AdminDataTable'
import AdminStatus from '../components/shared/AdminStatus'
import type { AdminTableColumn } from '../components/shared/AdminDataTable'

import { adminActivities } from '../data/adminData'
import type { AdminActivity } from '../types/admin.types'

import '../styles/AuditLogsPage.scss'

interface AuditLogsPageProps {
  title: string
}

function AuditLogsPage({ title }: AuditLogsPageProps) {
  const [search, setSearch] = useState('')
  const [resultFilter, setResultFilter] = useState('All')
  const [selectedActivity, setSelectedActivity] =
    useState<AdminActivity | null>(null)

  const filteredActivities = useMemo(() => {
    return adminActivities.filter((activity) => {
      const matchesSearch =
        `${activity.actor} ${activity.action} ${activity.resource} ${activity.description}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesResult =
        resultFilter === 'All' || activity.result === resultFilter

      return matchesSearch && matchesResult
    })
  }, [search, resultFilter])

  const columns: AdminTableColumn<AdminActivity>[] = [
    { key: 'date', label: 'Date and time' },
    { key: 'actor', label: 'Actor' },
    { key: 'action', label: 'Action' },
    { key: 'resource', label: 'Affected resource' },
    {
      key: 'result',
      label: 'Result',
      render: (activity) => <AdminStatus value={activity.result} />,
    },
    {
      key: 'id',
      label: 'Details',
      render: (activity) => (
        <button
          className="admin-text-button"
          onClick={() => setSelectedActivity(activity)}
        >
          Inspect
        </button>
      ),
    },
  ]

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={title}
        description="Review administrative events and maintain visibility into important platform activities."
      />

      <div className="admin-demo-notice">
        These are illustrative records, not verified production audit logs. Actual audit records must come from an authoritative backend service.
      </div>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <label htmlFor="audit-search">Search audit records</label>
            <input
              id="audit-search"
              placeholder="Search actor, action or resource"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="admin-filter">
            <label htmlFor="audit-result">Result</label>
            <select
              id="audit-result"
              value={resultFilter}
              onChange={(event) => setResultFilter(event.target.value)}
            >
              <option>All</option>
              <option>Successful</option>
              <option>Failed</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        <div className="admin-table-heading">
          <div>
            <h2>Activity records</h2>
            <p>{filteredActivities.length} records found</p>
          </div>
          <span className="admin-readonly-label">Read only</span>
        </div>

        <AdminDataTable
          columns={columns}
          rows={filteredActivities}
        />
      </section>

      {selectedActivity && (
        <div className="admin-modal-backdrop">
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-dialog-title"
          >
            <div className="admin-modal__header">
              <div>
                <span className="admin-page-header__eyebrow">
                  AUDIT EVENT
                </span>
                <h2 id="audit-dialog-title">
                  {selectedActivity.action}
                </h2>
              </div>

              <button
                className="admin-icon-button"
                aria-label="Close audit details"
                onClick={() => setSelectedActivity(null)}
              >
                ×
              </button>
            </div>

            <dl className="admin-detail-list">
              <div><dt>Event ID</dt><dd>{selectedActivity.id}</dd></div>
              <div><dt>Actor</dt><dd>{selectedActivity.actor}</dd></div>
              <div><dt>Action</dt><dd>{selectedActivity.action}</dd></div>
              <div><dt>Resource</dt><dd>{selectedActivity.resource}</dd></div>
              <div><dt>Description</dt><dd>{selectedActivity.description}</dd></div>
              <div><dt>Date and time</dt><dd>{selectedActivity.date}</dd></div>
              <div><dt>Result</dt><dd><AdminStatus value={selectedActivity.result} /></dd></div>
            </dl>

            <div className="admin-modal__footer">
              <button
                className="admin-button admin-button--secondary"
                onClick={() => setSelectedActivity(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default AuditLogsPage
