import type { MentorCohort } from '../../types/mentor.types'

interface CohortTableProps {
  cohorts: MentorCohort[]
  onViewCohort: (cohort: MentorCohort) => void
}

function CohortTable({
  cohorts,
  onViewCohort,
}: CohortTableProps) {
  function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`))
  }

  return (
    <div className="mentor-cohort-table-wrapper">
      <table className="mentor-cohort-table">
        <thead>
          <tr>
            <th scope="col">Cohort</th>
            <th scope="col">Facility</th>
            <th scope="col">Mentees</th>
            <th scope="col">Progress</th>
            <th scope="col">Status</th>
            <th scope="col">Start date</th>
            <th scope="col">Action</th>
          </tr>
        </thead>

        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort.id}>
              <td>
                <strong className="mentor-cohort-table__name">
                  {cohort.name}
                </strong>
                <span className="mentor-cohort-table__id">
                  {cohort.id}
                </span>
              </td>

              <td>{cohort.facility}</td>

              <td>{cohort.menteesCount}</td>

              <td>
                <div className="mentor-cohort-table__progress">
                  <div className="mentor-cohort-table__progress-track">
                    <div
                      className="mentor-cohort-table__progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, cohort.progress),
                        )}%`,
                      }}
                    />
                  </div>

                  <span>{cohort.progress}%</span>
                </div>
              </td>

              <td>
                <span
                  className={`mentor-cohort-status mentor-cohort-status--${cohort.status.toLowerCase()}`}
                >
                  {cohort.status}
                </span>
              </td>

              <td>{formatDate(cohort.startDate)}</td>

              <td>
                <button
                  type="button"
                  className="mentor-cohort-table__view"
                  onClick={() => onViewCohort(cohort)}
                >
                  View details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {cohorts.length === 0 && (
        <div className="mentor-cohort-table__empty">
          <strong>No cohorts found</strong>
          <p>
            Try changing your search or status filter.
          </p>
        </div>
      )}
    </div>
  )
}

export default CohortTable