
import { Button, Tag } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'

import type { MentorFeedback } from '../../data/mentorFeedbackData'

interface FeedbackCardProps {
  feedback: MentorFeedback
  onView: (feedback: MentorFeedback) => void
}

function getStatusType(status: MentorFeedback['status']) {
  switch (status) {
    case 'Resolved':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Pending':
      return 'warm-gray'
    default:
      return 'gray'
  }
}

function FeedbackCard({ feedback, onView }: FeedbackCardProps) {
  return (
    <article className="mentor-feedback-card">
      <div className="mentor-feedback-card__main">
        <div className="mentor-feedback-card__heading">
          <div>
            <div className="mentor-feedback-card__tags">
              <Tag type={feedback.direction === 'Received' ? 'blue' : 'cool-gray'}>
                {feedback.direction}
              </Tag>

              <Tag type={getStatusType(feedback.status)}>
                {feedback.status}
              </Tag>
            </div>

            <h3>{feedback.subject}</h3>
            <p className="mentor-feedback-card__description">
              {feedback.message}
            </p>
          </div>
        </div>

        <div className="mentor-feedback-card__metadata">
          <span>
            <strong>{feedback.direction === 'Received' ? 'From' : 'To'}:</strong>{' '}
            {feedback.sender}
          </span>

          <span>
            <strong>Category:</strong> {feedback.category}
          </span>

          <span>
            <strong>Cohort:</strong> {feedback.cohortName}
          </span>

          <span>
            <strong>Date:</strong>{' '}
            {new Date(feedback.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mentor-feedback-card__action">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowRight}
          onClick={() => onView(feedback)}
        >
          View details
        </Button>
      </div>
    </article>
  )
}

export default FeedbackCard
