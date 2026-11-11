import type { CohortProgressItem } from '../../types/mentor.types'

interface CohortProgressProps {
  cohorts: CohortProgressItem[]
}

function CohortProgress({ cohorts }: CohortProgressProps) {
  return (
    <section className="mentor-panel mentor-cohort-progress">
      <div className="mentor-panel__heading">
        <div>
          <h2>Cohort progress</h2>
          <p>Training and competency progress across your cohorts.</p>
        </div>

        <span className="mentor-panel__count">
          {cohorts.length} cohorts
        </span>
      </div>

      {cohorts.length === 0 ? (
        <div className="mentor-empty">
          No active cohorts have been assigned yet.
        </div>
      ) : (
        <div className="mentor-cohort-list">
          {cohorts.map((cohort) => (
            <article className="mentor-cohort" key={cohort.id}>
              <div className="mentor-cohort__top">
                <div>
                  <h3>{cohort.name}</h3>
                  <span>{cohort.facility}</span>
                </div>

                <strong>{cohort.progress}%</strong>
              </div>

              <div
                className="mentor-progress"
                role="progressbar"
                aria-label={`${cohort.name} progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={cohort.progress}
              >
                <div
                  className="mentor-progress__fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, cohort.progress),
                    )}%`,
                  }}
                />
              </div>

              <div className="mentor-cohort__summary">
                <span>
                  <strong>{cohort.completedCount}</strong> completed
                </span>

                <span>
                  <strong>{cohort.inProgressCount}</strong> in progress
                </span>

                <span>
                  <strong>{cohort.needsSupportCount}</strong> need support
                </span>
              </div>

              <div className="mentor-cohort__footer">
                {cohort.menteesCount} mentees
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default CohortProgress