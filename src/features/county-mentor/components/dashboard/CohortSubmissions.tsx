import { Button } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'

import type { CohortSubmission } from '../../types/county-mentor.types'

interface CohortSubmissionsProps {
  submissions: CohortSubmission[]
  onNavigate: (path: string) => void
}

function CohortSubmissions({
  submissions,
  onNavigate,
}: CohortSubmissionsProps) {
  return (
    <section className="county-panel county-submissions">
      <div className="county-panel__heading">
        <div>
          <h2>Cohort submissions</h2>
          <p>
            Completed cohorts submitted by mentors for county review.
          </p>
        </div>

        <Button
          kind="tertiary"
          size="sm"
          renderIcon={ArrowRight}
          onClick={() => onNavigate('/county-mentor/cohorts')}
        >
          View all cohorts
        </Button>
      </div>

      {submissions.length === 0 ? (
        <div className="county-empty">
          No cohort submissions are currently awaiting review.
        </div>
      ) : (
        <div className="county-table-wrapper">
          <table className="county-table">
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Facility</th>
                <th>Submitted by</th>
                <th>Submission date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>
                    <strong>{submission.cohort}</strong>
                  </td>

                  <td>{submission.facility}</td>

                  <td>{submission.mentor}</td>

                  <td>{submission.submitted}</td>

                  <td>
                    <span
                      className={`county-status county-status--${submission.tone}`}
                    >
                      {submission.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default CohortSubmissions