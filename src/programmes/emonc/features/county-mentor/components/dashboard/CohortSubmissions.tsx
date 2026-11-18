import { ArrowRight, Document, Time } from '@carbon/icons-react'
import { Button } from '@carbon/react'

import type { CohortSubmission } from '../../types/county-mentor.types.ts'

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
          <span className="county-panel__eyebrow">COHORT MANAGEMENT</span>
          <h2>Cohort submissions</h2>
          <p>Completed cohorts submitted by mentors for county review.</p>
        </div>

        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowRight}
          onClick={() => onNavigate('/county-mentor/cohorts')}
        >
          View all cohorts
        </Button>
      </div>

      {submissions.length === 0 ? (
        <div className="county-empty">
          <Document size={24} />
          <strong>No submissions to review</strong>
          <span>No cohort submissions are currently awaiting review.</span>
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
                  <td>
                    <span className="county-table__date">
                      <Time size={14} />
                      {submission.submitted}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`county-status county-status--${submission.tone}`}
                    >
                      <span className="county-status__dot" />
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
