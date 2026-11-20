
import type { ProgramDashboardStatistics } from '../../types/program-lead.types.ts'

interface ModuleStatusOverviewProps {
  statistics: ProgramDashboardStatistics
}

function ModuleStatusOverview({
  statistics,
}: ModuleStatusOverviewProps) {
  const statuses = [
    {
      label: 'Completed',
      count: statistics.completeModules,
      className: 'completed',
    },
    {
      label: 'Draft',
      count: statistics.draftModules,
      className: 'draft',
    },
    {
      label: 'Incomplete content',
      count: statistics.incompleteModules,
      className: 'incomplete',
    },
  ]

  return (
    <section className="program-panel module-status">
      <div className="program-panel__header">
        <div>
          <h2>Module Status</h2>
          <p>Overall status of EmONC training modules</p>
        </div>

        <span className="module-status__total">
          {statistics.totalModules} modules
        </span>
      </div>

      <div className="module-status__bar">
        {statuses.map((status) => (
          <div
            key={status.label}
            className={`module-status__segment module-status__segment--${status.className}`}
            style={{
              width: `${
                statistics.totalModules > 0
                  ? (status.count / statistics.totalModules) * 100
                  : 0
              }%`,
            }}
          />
        ))}
      </div>

      <div className="module-status__legend">
        {statuses.map((status) => (
          <div
            className="module-status__legend-item"
            key={status.label}
          >
            <span
              className={`module-status__dot module-status__dot--${status.className}`}
            />

            <span>{status.label}</span>

            <strong>{status.count}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ModuleStatusOverview
