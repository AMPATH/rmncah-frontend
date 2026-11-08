
import { Button, Tag } from '@carbon/react'

import type { MentorAssessment } from '../../types/mentor.types'

interface AssessmentDetailsProps {
  assessment: MentorAssessment
  onClose: () => void
  onEdit: () => void
}

export default function AssessmentDetails({
  assessment,
  onClose,
  onEdit,
}: AssessmentDetailsProps) {
  return (
    <section className="assessment-details">
      <div className="assessment-details__header">
        <div>
          <span className="assessment-details__eyebrow">
            ASSESSMENT RECORD
          </span>
          <h2>{assessment.menteeName}</h2>
          <p>{assessment.moduleTitle}</p>
        </div>

        <Button kind="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="assessment-details__tags">
        <Tag type="blue">{assessment.assessmentType}</Tag>
        <Tag type="gray">{assessment.status}</Tag>
        <Tag
          type={
            assessment.outcome === 'Competent'
              ? 'green'
              : assessment.outcome === 'Needs Support'
                ? 'red'
                : 'gray'
          }
        >
          {assessment.outcome}
        </Tag>
      </div>

      <div className="assessment-details__grid">
        <div>
          <span>Cohort</span>
          <strong>{assessment.cohortName}</strong>
        </div>

        <div>
          <span>Facility</span>
          <strong>{assessment.facility}</strong>
        </div>

        <div>
          <span>Assessment date</span>
          <strong>
            {new Date(
              `${assessment.scheduledDate}T00:00:00`,
            ).toLocaleDateString('en-GB')}
          </strong>
        </div>

        <div>
          <span>Assessor</span>
          <strong>{assessment.assessor}</strong>
        </div>

        <div>
          <span>Follow-up required</span>
          <strong>{assessment.followUpRequired ? 'Yes' : 'No'}</strong>
        </div>
      </div>

      <div className="assessment-details__notes">
        <h3>Assessment notes</h3>
        <p>{assessment.notes || 'No assessment notes recorded.'}</p>
      </div>

      <div className="assessment-details__footer">
        <Button kind="secondary" onClick={onClose}>
          Close details
        </Button>

        <Button onClick={onEdit}>
          Update assessment
        </Button>
      </div>
    </section>
  )
}
