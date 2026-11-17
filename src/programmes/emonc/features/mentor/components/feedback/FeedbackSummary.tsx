
import {
  Chat,
  CheckmarkFilled,
  Pending,
  WarningAlt,
} from '@carbon/icons-react'

import type { MentorFeedback } from '../../data/mentorFeedbackData'

interface FeedbackSummaryProps {
  feedback: MentorFeedback[]
}

function FeedbackSummary({ feedback }: FeedbackSummaryProps) {
  const received = feedback.filter(
    (item) => item.direction === 'Received',
  )

  const sent = feedback.filter(
    (item) => item.direction === 'Sent',
  )

  const pending = received.filter(
    (item) => item.status === 'Pending',
  )

  const resolved = feedback.filter(
    (item) => item.status === 'Resolved',
  )

  const items = [
    {
      label: 'Total feedback',
      value: feedback.length,
      description: 'All feedback records',
      icon: Chat,
    },
    {
      label: 'Received',
      value: received.length,
      description: 'Feedback from reviewers',
      icon: Pending,
    },
    {
      label: 'Awaiting response',
      value: pending.length,
      description: 'Requires your attention',
      icon: WarningAlt,
    },
    {
      label: 'Resolved',
      value: resolved.length,
      description: 'Feedback closed',
      icon: CheckmarkFilled,
    },
  ]

  return (
    <section className="mentor-feedback-summary">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <article className="feedback-summary-card" key={item.label}>
            <div className="feedback-summary-card__top">
              <span>{item.label}</span>
              <Icon size={20} />
            </div>

            <strong>{item.value}</strong>
            <p>{item.description}</p>
          </article>
        )
      })}

      <span className="feedback-summary-sent-count">
        Feedback submitted by you: {sent.length}
      </span>
    </section>
  )
}

export default FeedbackSummary
