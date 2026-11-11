import { Button, ProgressBar, Tag } from '@carbon/react'
import { View } from '@carbon/icons-react'

import type { MentorCohortSubmission } from '../../types/mentor.types'

interface CohortSubmissionTableProps {
  submissions: MentorCohortSubmission[]
  onView: (submission: MentorCohortSubmission) => void
}

function getStatusType(status: MentorCohortSubmission['status']) {
  switch (status) {
    case 'Approved':
      return 'green'

    case 'Submitted':
    case 'Under Review':
      return 'blue'

    case 'Returned':
      return 'red'

    case 'Draft':
      return 'cool-gray'

    case 'Not Ready':
      return 'warm-gray'

    default:
      return 'gray'
  }
}

function CohortSubmissionTable({
  submissions,
  onView,
}: CohortSubmissionTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="cohort-submission-empty">
        <h3>No cohort submissions found</h3>
        <p>
          Try changing your search term or submission status filter.
        </p>
      </div>
    )
  }

  return (
    <div className="cohort-submission-table-wrapper">
      <table className="cohort-submission-table">
        <thead>
          <tr>
            <th>Cohort</th>
            <th>Facility</th>
            <th>Mentees</th>
            <th>Competency</th>
            <th>Module completion</th>
            <th>Status</th>
            <th>Last submitted</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td>
                <div className="submission-cohort-name">
                  <strong>{submission.cohortName}</strong>
                  <span>{submission.mentorName}</span>
                </div>
              </td>

              <td>{submission.facility}</td>

              <td>{submission.menteesCount}</td>

              <td>
                <div className="submission-competency">
                  <strong>
                    {submission.competentMentees}/
                    {submission.menteesCount}
                  </strong>

                  <span>Competent</span>
                </div>
              </td>

              <td>
                <div className="submission-progress">
                  <div className="submission-progress__label">
                    <span>
                      {submission.completedModules}/
                      {submission.totalModules} modules
                    </span>

                    <strong>{submission.completionPercentage}%</strong>
                  </div>

                  <ProgressBar
                    value={submission.completionPercentage}
                    max={100}
                    label="Module completion"
                    hideLabel
                  />
                </div>
              </td>

              <td>
                <Tag type={getStatusType(submission.status)}>
                  {submission.status}
                </Tag>
              </td>

              <td>
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString()
                  : 'Not submitted'}
              </td>

              <td>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={View}
                  iconDescription="View submission"
                  hasIconOnly={false}
                  onClick={() => onView(submission)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CohortSubmissionTable