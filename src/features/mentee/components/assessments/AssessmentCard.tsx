
import { Tag } from '@carbon/react'

import type { MentorAssessment } from '../../../mentor/types/mentor.types'

interface AssessmentCardProps {
  assessment: MentorAssessment
  showPendingNotice?: boolean
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}

function getOutcomeTag(outcome: MentorAssessment['outcome']) {
  switch (outcome) {
    case 'Competent':
      return 'green'
    case 'Needs Support':
      return 'red'
    default:
      return 'gray'
  }
}

function getStatusTag(status: MentorAssessment['status']) {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Scheduled':
      return 'cool-gray'
    case 'Cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function AssessmentCard({
  assessment,
  showPendingNotice = false,
}: AssessmentCardProps) {
  return (
    <article className="mentee-assessment-card">
      <div className="mentee-assessment-card__top">
        <div className="mentee-assessment-card__heading">
          <span className="mentee-assessment-card__eyebrow">
            {assessment.assessmentType} assessment
          </span>

          <h3>{assessment.moduleTitle}</h3>

          <p>
            Scheduled for {formatDate(assessment.scheduledDate)}
          </p>
        </div>

        <div className="mentee-assessment-card__tags">
          <Tag type={getStatusTag(assessment.status)}>
            {assessment.status}
          </Tag>

          <Tag type={getOutcomeTag(assessment.outcome)}>
            {assessment.outcome}
          </Tag>
        </div>
      </div>

      {showPendingNotice && (
        <div className="mentee-assessment-card__notice">
          The scheduled date has passed, but your mentor has not yet
          updated this assessment record.
        </div>
      )}

      <div className="mentee-assessment-card__details">
        <div>
          <span>Assessor</span>
          <strong>{assessment.assessor}</strong>
        </div>

        <div>
          <span>Facility</span>
          <strong>{assessment.facility}</strong>
        </div>

        <div>
          <span>Assessment date</span>
          <strong>{formatDate(assessment.scheduledDate)}</strong>
        </div>

        <div>
          <span>Follow-up required</span>
          <strong>
            {assessment.followUpRequired ? 'Yes' : 'No'}
          </strong>
        </div>
      </div>

      <div className="mentee-assessment-card__feedback">
        <h4>Mentor feedback and assessment notes</h4>

        <p>
          {assessment.notes || 'No feedback has been recorded yet.'}
        </p>
      </div>

      {assessment.followUpRequired && (
        <div className="mentee-assessment-card__follow-up">
          <strong>Further support required</strong>
          <p>
            Your mentor has indicated that additional support or
            reassessment is required.
          </p>
        </div>
      )}
    </article>
  )
}

export default AssessmentCard
