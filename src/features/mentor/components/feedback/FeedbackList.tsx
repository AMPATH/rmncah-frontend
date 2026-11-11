
import type { MentorFeedback } from '../../data/mentorFeedbackData'
import FeedbackCard from './FeedbackCard'

interface FeedbackListProps {
  feedback: MentorFeedback[]
  onView: (feedback: MentorFeedback) => void
}

function FeedbackList({ feedback, onView }: FeedbackListProps) {
  if (feedback.length === 0) {
    return (
      <div className="mentor-feedback-empty">
        <h3>No feedback found</h3>
        <p>
          Try adjusting your search or changing the selected filters.
        </p>
      </div>
    )
  }

  return (
    <div className="mentor-feedback-list">
      {feedback.map((item) => (
        <FeedbackCard
          key={item.id}
          feedback={item}
          onView={onView}
        />
      ))}
    </div>
  )
}

export default FeedbackList
