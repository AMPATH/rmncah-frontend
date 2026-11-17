
interface FeedbackSummaryProps {
  totalFeedback: number
  assessmentFeedback: number
  mentorObservations: number
  competencyStatus: string
}

function FeedbackSummary({
  totalFeedback,
  assessmentFeedback,
  mentorObservations,
  competencyStatus,
}: FeedbackSummaryProps) {
  return (
    <section
      className="mentee-feedback-summary"
      aria-label="Feedback summary"
    >
      <article>
        <span>Total feedback</span>
        <strong>{totalFeedback}</strong>
        <p>Available feedback records</p>
      </article>

      <article>
        <span>Assessment feedback</span>
        <strong>{assessmentFeedback}</strong>
        <p>Feedback from competency assessments</p>
      </article>

      <article>
        <span>Mentor observations</span>
        <strong>{mentorObservations}</strong>
        <p>Progress guidance from your mentor</p>
      </article>

      <article>
        <span>Competency status</span>
        <strong className="mentee-feedback-summary__status">
          {competencyStatus}
        </strong>
        <p>Current recorded status</p>
      </article>
    </section>
  )
}

export default FeedbackSummary
