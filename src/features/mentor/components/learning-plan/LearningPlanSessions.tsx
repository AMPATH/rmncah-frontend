
import { Tag } from '@carbon/react'
import type { LearningPlanSession } from '../../types/mentor.types'

interface LearningPlanSessionsProps {
  sessions: LearningPlanSession[]
}

function getSessionTagType(
  status: LearningPlanSession['status'],
): 'gray' | 'blue' | 'green' | 'red' {
  switch (status) {
    case 'Scheduled':
      return 'blue'
    case 'Completed':
      return 'green'
    case 'Rescheduled':
      return 'gray'
    case 'Cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function LearningPlanSessions({
  sessions,
}: LearningPlanSessionsProps) {
  return (
    <div className="learning-plan-sessions">
      <div className="learning-plan-sessions__header">
        <h4>Scheduled sessions</h4>
        <span>{sessions.length} sessions</span>
      </div>

      {sessions.length === 0 ? (
        <p className="learning-plan-sessions__empty">
          No sessions have been scheduled for this learning plan.
        </p>
      ) : (
        <div className="learning-plan-sessions__list">
          {sessions.map((session) => (
            <article
              className="learning-plan-session"
              key={session.id}
            >
              <div className="learning-plan-session__date">
                <strong>{session.scheduledDate}</strong>
                <span>
                  {session.startTime} – {session.endTime}
                </span>
              </div>

              <div className="learning-plan-session__details">
                <strong>{session.title}</strong>
                <span>
                  {session.moduleTitle} · {session.sessionType}
                </span>
                <span>{session.location}</span>
              </div>

              <Tag type={getSessionTagType(session.status)}>
                {session.status}
              </Tag>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default LearningPlanSessions
