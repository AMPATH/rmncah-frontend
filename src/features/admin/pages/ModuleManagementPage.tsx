
import { useMemo, useState } from 'react'

import AdminPageHeader from '../components/shared/AdminPageHeader'
import AdminDataTable from '../components/shared/AdminDataTable'
import AdminStatus from '../components/shared/AdminStatus'
import type { AdminTableColumn } from '../components/shared/AdminDataTable'

import { adminModules } from '../data/adminData'
import type { AdminModule } from '../types/admin.types'

import '../styles/ModuleManagementPage.scss'

interface ModuleManagementPageProps {
  title: string
}

function ModuleManagementPage({ title }: ModuleManagementPageProps) {
  const [modules, setModules] = useState(adminModules)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch =
        `${module.title} ${module.owner} ${module.category}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesStatus =
        status === 'All' || module.status === status

      return matchesSearch && matchesStatus
    })
  }, [modules, search, status])

  function archiveModule(module: AdminModule) {
    if (module.status === 'Archived') return

    if (!window.confirm(
      `Archive "${module.title}" in this demonstration?`,
    )) {
      return
    }

    setModules((current) =>
      current.map((item) =>
        item.id === module.id
          ? { ...item, status: 'Archived' }
          : item,
      ),
    )
  }

  const columns: AdminTableColumn<AdminModule>[] = [
    {
      key: 'title',
      label: 'Training module',
      render: (module) => (
        <div>
          <strong>{module.title}</strong>
          <small className="admin-cell-subtitle">{module.id}</small>
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    { key: 'owner', label: 'Owner' },
    { key: 'sections', label: 'Sections' },
    {
      key: 'status',
      label: 'Status',
      render: (module) => <AdminStatus value={module.status} />,
    },
    { key: 'updatedAt', label: 'Last updated' },
    {
      key: 'id',
      label: 'Action',
      render: (module) => (
        <button
          className="admin-text-button"
          disabled={module.status === 'Archived'}
          onClick={() => archiveModule(module)}
        >
          Archive
        </button>
      ),
    },
  ]

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={title}
        description="Monitor training module availability, ownership and publication status across the platform."
      />

      <div className="admin-demo-notice">
        Demonstration module records. Educational content authoring remains the responsibility of the Program Lead.
      </div>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <label htmlFor="module-search">Search modules</label>
            <input
              id="module-search"
              placeholder="Search title, owner or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="admin-filter">
            <label htmlFor="module-status">Publication status</label>
            <select
              id="module-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All</option>
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
          </div>
        </div>

        <div className="admin-table-heading">
          <div>
            <h2>All training modules</h2>
            <p>{filteredModules.length} modules found</p>
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          rows={filteredModules}
        />
      </section>
    </div>
  )
}

export default ModuleManagementPage
