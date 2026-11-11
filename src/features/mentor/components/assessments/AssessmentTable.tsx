
import { Button, Tag } from '@carbon/react'
import type { MentorAssessment } from '../../types/mentor.types'

interface AssessmentTableProps {
  assessments: MentorAssessment[]
  onView: (assessment: MentorAssessment) => void
}

function getStatusType(status: MentorAssessment['status']) {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Scheduled':
      return 'purple'
    case 'Cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function getOutcomeType(outcome: MentorAssessment['outcome']) {
  switch (outcome) {
    case 'Competent':
      return 'green'
    case 'Needs Support':
      return 'red'
    case 'Pending':
      return 'gray'
    default:
      return 'gray'
  }
}

export default function AssessmentTable({
  assessments,
  onView,
}: AssessmentTableProps) {
  if (assessments.length === 0) {
    return (
      <div className="assessment-empty">
        <h3>No assessments found</h3>
        <p>
          Try adjusting your search or filters to find an assessment.
        </p>
      </div>
    )
  }

  return (
    <div className="assessment-table-wrapper">
      <table className="assessment-table">
        <thead>
          <tr>
            <th>Mentee</th>
            <th>Cohort / Facility</th>
            <th>Module</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Outcome</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {assessments.map((assessment) => (
            <tr key={assessment.id}>
              <td>
                <strong>{assessment.menteeName}</strong>
              </td>

              <td>
                <div>{assessment.cohortName}</div>
                <small>{assessment.facility}</small>
              </td>

              <td>{assessment.moduleTitle}</td>

              <td>{assessment.assessmentType}</td>

              <td>
                {new Date(
                  `${assessment.scheduledDate}T00:00:00`,
                ).toLocaleDateString('en-GB')}
              </td>

              <td>
                <Tag type={getStatusType(assessment.status)}>
                  {assessment.status}
                </Tag>
              </td>

              <td>
                <Tag type={getOutcomeType(assessment.outcome)}>
                  {assessment.outcome}
                </Tag>
              </td>

              <td>
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => onView(assessment)}
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
