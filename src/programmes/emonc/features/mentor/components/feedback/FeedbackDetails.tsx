
import { useState } from 'react'
import { Button, Tag } from '@carbon/react'
import { ArrowLeft, Send } from '@carbon/icons-react'

import type { MentorFeedback } from '../../data/mentorFeedbackData'

interface FeedbackDetailsProps {
  feedback: MentorFeedback
  onBack: () => void
  onRespond: (id: string, response: string) => void
}

function FeedbackDetails({
  feedback,
  onBack,
  onRespond,
}: FeedbackDetailsProps) {
  const [response, setResponse] = useState(feedback.response ?? '')

  const canRespond =
    feedback.direction === 'Received' &&
    feedback.status !== 'Resolved'

  function handleSubmit() {
    if (!response.trim()) return

    onRespond(feedback.id, response.trim())
  }

  return (
    <section className="mentor-feedback-details">
      <div className="feedback-details-header">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={onBack}
        >
          Back to feedback
        </Button>

        <Tag type={feedback.status === 'Resolved' ? 'green' : 'blue'}>
          {feedback.status}
        </Tag>
      </div>

      <div className="feedback-details-title">
        <div className="feedback-details-tags">
          <Tag type={feedback.direction === 'Received' ? 'blue' : 'cool-gray'}>
            {feedback.direction}
          </Tag>
          <Tag type="outline">{feedback.category}</Tag>
        </div>

        <h2>{feedback.subject}</h2>
        <p>{feedback.cohortName}</p>
      </div>

      <div className="feedback-details-information">
        <div>
          <span>{feedback.direction === 'Received' ? 'From' : 'To'}</span>
          <strong>{feedback.sender}</strong>
        </div>

        <div>
          <span>Date</span>
          <strong>
            {new Date(feedback.createdAt).toLocaleDateString()}
          </strong>
        </div>

        <div>
          <span>Related cohort</span>
          <strong>{feedback.cohortName}</strong>
        </div>

        <div>
          <span>Category</span>
          <strong>{feedback.category}</strong>
        </div>
      </div>

      <div className="feedback-details-section">
        <h3>Feedback message</h3>
        <p>{feedback.message}</p>
      </div>

      {feedback.followUp && (
        <div className="feedback-details-follow-up">
          <h3>Requested follow-up</h3>
          <p>{feedback.followUp}</p>
        </div>
      )}

      {feedback.response && (
        <div className="feedback-details-response">
          <h3>Your response</h3>
          <p>{feedback.response}</p>
        </div>
      )}

      {canRespond && (
        <div className="feedback-details-section">
          <h3>Submit a response</h3>

          <textarea
            rows={5}
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder="Write your response..."
          />

          <div className="feedback-details-actions">
            <Button
              kind="primary"
              renderIcon={Send}
              disabled={!response.trim()}
              onClick={handleSubmit}
            >
              Submit response
            </Button>
          </div>
        </div>
      )}

      {!canRespond && feedback.direction === 'Received' && (
        <p className="feedback-details-locked">
          This feedback has been resolved.
        </p>
      )}
    </section>
  )
}

export default FeedbackDetails
