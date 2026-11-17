
import { useMemo } from 'react'

import AssessmentSummary from '../components/assessments/AssessmentSummary'
import AssessmentCard from '../components/assessments/AssessmentCard'

import { menteeAssessmentData } from '../data/menteeAssessmentData'

import '../styles/mentee-assessments.scss'

interface AssessmentsPageProps {
  title: string
}

function getLocalDateKey() {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function AssessmentsPage({ title }: AssessmentsPageProps) {
  const assessments = menteeAssessmentData

  const today = getLocalDateKey()

  const pendingAssessments = useMemo(
    () =>
      assessments.filter(
        (assessment) =>
          assessment.status === 'Scheduled' ||
          assessment.status === 'In Progress',
      ),
    [assessments],
  )

  const assessmentHistory = useMemo(
    () =>
      assessments.filter(
        (assessment) =>
          assessment.status === 'Completed' ||
          assessment.status === 'Cancelled',
      ),
    [assessments],
  )

  return (
    <main className="mentee-assessments">
      <header className="mentee-assessments__header">
        <div>
          <h1>{title}</h1>

          <p>
            Track your competency assessments, review your results,
            and follow the feedback provided by your mentor.
          </p>
        </div>
      </header>

      <AssessmentSummary assessments={assessments} />

      <section className="mentee-assessments__section">
        <div className="mentee-assessments__section-heading">
          <div>
            <h2>Upcoming and pending assessments</h2>
            <p>
              Assessments scheduled or currently being conducted
              by your mentor.
            </p>
          </div>

          <span>{pendingAssessments.length} records</span>
        </div>

        {pendingAssessments.length > 0 ? (
          <div className="mentee-assessments__list">
            {pendingAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                showPendingNotice={
                  assessment.scheduledDate < today
                }
              />
            ))}
          </div>
        ) : (
          <div className="mentee-assessments__empty">
            <h3>No pending assessments</h3>

            <p>
              You currently have no scheduled or in-progress
              assessments recorded by your mentor.
            </p>
          </div>
        )}
      </section>

      <section className="mentee-assessments__section">
        <div className="mentee-assessments__section-heading">
          <div>
            <h2>Assessment history</h2>
            <p>
              Review your completed assessments, competency outcomes
              and mentor feedback.
            </p>
          </div>

          <span>{assessmentHistory.length} records</span>
        </div>

        {assessmentHistory.length > 0 ? (
          <div className="mentee-assessments__list">
            {assessmentHistory.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
              />
            ))}
          </div>
        ) : (
          <div className="mentee-assessments__empty">
            <h3>No assessment history yet</h3>

            <p>
              Your completed assessment records and mentor feedback
              will appear here.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

export default AssessmentsPage
