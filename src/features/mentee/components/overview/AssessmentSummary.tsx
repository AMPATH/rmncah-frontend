
import { Checkmark } from '@carbon/icons-react'

interface LatestAssessment {
  moduleTitle: string
  assessmentType: string
  scheduledDate: string
  status: string
  outcome: string
}

interface AssessmentSummaryProps {
  total: number
  completed: number
  pending: number
  latest: LatestAssessment | null
}

function formatAssessmentDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function AssessmentSummary({
  total,
  completed,
  pending,
  latest,
}: AssessmentSummaryProps) {
  return (
    <section
      className="mentee-panel mentee-assessments"
      aria-labelledby="mentee-assessments-title"
    >
      <div className="mentee-panel__heading">
        <div>
          <span className="mentee-panel__eyebrow">
            COMPETENCY TRACKING
          </span>
          <h2 id="mentee-assessments-title">
            Assessment overview
          </h2>
          <p>Review your assessment activities and outcomes.</p>
        </div>

        <span className="mentee-panel__count">
          {total} total
        </span>
      </div>

      <div className="mentee-assessments__statistics">
        <div className="mentee-assessment-stat">
          <strong className="mentee-assessment-stat__value">
            {completed}
          </strong>
          <span className="mentee-assessment-stat__label">
            Completed
          </span>
        </div>

        <div className="mentee-assessment-stat">
          <strong className="mentee-assessment-stat__value">
            {pending}
          </strong>
          <span className="mentee-assessment-stat__label">
            Pending
          </span>
        </div>
      </div>

      <div className="mentee-assessments__latest">
        <div className="mentee-assessments__latest-heading">
          <h3>Latest assessment</h3>
          {latest?.status === 'Completed' && (
            <Checkmark size={16} aria-label="Completed" />
          )}
        </div>

        {latest ? (
          <div className="mentee-assessment-record">
            <div className="mentee-assessment-record__details">
              <strong>{latest.moduleTitle}</strong>
              <span>{latest.assessmentType} assessment</span>
              <span>
                Scheduled: {formatAssessmentDate(latest.scheduledDate)}
              </span>
            </div>

            <div className="mentee-assessment-record__result">
              <span>{latest.status}</span>
              <strong>{latest.outcome}</strong>
            </div>
          </div>
        ) : (
          <div className="mentee-empty">
            <h3>No assessment records</h3>
            <p>
              Your assessment records will appear here when
              they are available.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default AssessmentSummary
