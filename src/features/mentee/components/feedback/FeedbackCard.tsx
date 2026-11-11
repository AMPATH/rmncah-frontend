
import { Button, Tag } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'

import type {
  MenteeFeedback,
} from '../../data/menteeFeedbackData'

interface FeedbackCardProps {
  feedback: MenteeFeedback
  onView: (feedback: MenteeFeedback) => void
}

function formatFeedbackDate(date: string | null) {
  if (!date) return 'Date not recorded'

  const [year, month, day] = date.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  )
}

function FeedbackCard({
  feedback,
  onView,
}: FeedbackCardProps) {
  return (
    <article className="mentee-feedback-card">
      <div className="mentee-feedback-card__main">
        <div className="mentee-feedback-card__tags">
          <Tag type="cool-gray">
            {feedback.category}
          </Tag>

          {feedback.outcome && (
            <Tag
              type={
                feedback.outcome === 'Competent'
                  ? 'green'
                  : feedback.outcome === 'Needs Support'
                    ? 'warm-gray'
                    : 'blue'
              }
            >
              {feedback.outcome}
            </Tag>
          )}

          {feedback.followUpRequired && (
            <Tag type="warm-gray">
              Follow-up required
            </Tag>
          )}
        </div>

        <h3>{feedback.title}</h3>

        <p className="mentee-feedback-card__message">
          {feedback.message}
        </p>

        <div className="mentee-feedback-card__metadata">
          <span>
            <strong>From:</strong> {feedback.author}
          </span>

          <span>
            <strong>Source:</strong> {feedback.source}
          </span>

          <span>
            <strong>Date:</strong>{' '}
            {formatFeedbackDate(feedback.date)}
          </span>
        </div>
      </div>

      <div className="mentee-feedback-card__action">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowRight}
          onClick={() => onView(feedback)}
        >
          View feedback
        </Button>
      </div>
    </article>
  )
}

export default FeedbackCard
