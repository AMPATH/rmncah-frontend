
import { Button, Tag } from '@carbon/react'
import { ArrowLeft } from '@carbon/icons-react'

import type {
  MenteeFeedback,
} from '../../data/menteeFeedbackData'

interface FeedbackDetailsProps {
  feedback: MenteeFeedback
  onBack: () => void
}

function formatFeedbackDate(date: string | null) {
  if (!date) return 'Date not recorded'

  const [year, month, day] = date.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}

function FeedbackDetails({
  feedback,
  onBack,
}: FeedbackDetailsProps) {
  return (
    <section className="mentee-feedback-details">
      <div className="mentee-feedback-details__header">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={onBack}
        >
          Back to feedback
        </Button>

        <Tag type="cool-gray">
          {feedback.category}
        </Tag>
      </div>

      <div className="mentee-feedback-details__title">
        <h2>{feedback.title}</h2>

        <p>
          Feedback shared by {feedback.author}
        </p>
      </div>

      <div className="mentee-feedback-details__information">
        <div>
          <span>Feedback source</span>
          <strong>{feedback.source}</strong>
        </div>

        <div>
          <span>Date recorded</span>
          <strong>{formatFeedbackDate(feedback.date)}</strong>
        </div>

        <div>
          <span>Related module</span>
          <strong>{feedback.moduleTitle ?? 'General progress'}</strong>
        </div>

        <div>
          <span>Assessment outcome</span>
          <strong>{feedback.outcome ?? 'Not applicable'}</strong>
        </div>
      </div>

      <div className="mentee-feedback-details__section">
        <h3>Mentor feedback</h3>
        <p>{feedback.message}</p>
      </div>

      {feedback.followUpRequired && (
        <div className="mentee-feedback-details__follow-up">
          <h3>Further support</h3>
          <p>
            Your assessment record indicates that follow-up is
            required. Discuss the next steps with your assigned
            mentor.
          </p>
        </div>
      )}

      {!feedback.followUpRequired && feedback.outcome === 'Competent' && (
        <div className="mentee-feedback-details__outcome">
          <h3>Recorded outcome</h3>
          <p>
            Competency was demonstrated during this assessment.
          </p>
        </div>
      )}
    </section>
  )
}

export default FeedbackDetails
