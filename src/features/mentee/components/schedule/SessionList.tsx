import { Tag } from '@carbon/react'

import type { LearningPlanSession } from '../../../mentor/types/mentor.types'

interface SessionListProps {
  eyebrow: string
  title: string
  description: string
  sessions: LearningPlanSession[]
  emptyTitle: string
  emptyDescription: string
  showStatusNotice?: boolean
}

function formatSessionDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatSessionDay(date: string): string {
  const [year, month, day] = date.split('-').map(Number)

  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
  }).format(new Date(year, month - 1, day))
}

function getStatusTagType(
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

function SessionCard({
  session,
}: {
  session: LearningPlanSession
}) {
  return (
    <article className="mentee-session-card">
      <div className="mentee-session-card__date">
        <strong>{formatSessionDate(session.scheduledDate)}</strong>
        <span>{formatSessionDay(session.scheduledDate)}</span>
      </div>

      <div className="mentee-session-card__content">
        <div className="mentee-session-card__heading">
          <div>
            <h3>{session.title}</h3>
            <p>{session.moduleTitle}</p>
          </div>

          <Tag type={getStatusTagType(session.status)}>
            {session.status}
          </Tag>
        </div>

        <div className="mentee-session-card__meta">
          <div>
            <span>Session type</span>
            <strong>{session.sessionType}</strong>
          </div>

          <div>
            <span>Time</span>
            <strong>
              {session.startTime} – {session.endTime}
            </strong>
          </div>

          <div>
            <span>Location</span>
            <strong>{session.location}</strong>
          </div>
        </div>
      </div>
    </article>
  )
}

function SessionList({
  eyebrow,
  title,
  description,
  sessions,
  emptyTitle,
  emptyDescription,
  showStatusNotice = false,
}: SessionListProps) {
  const hasUnupdatedStatuses = sessions.some(
    (session) =>
      session.status === 'Scheduled' ||
      session.status === 'Rescheduled',
  )

  return (
    <section className="mentee-session-list">
      <div className="mentee-session-list__heading">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span className="mentee-session-list__count">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </span>
      </div>

      {sessions.length > 0 ? (
        <>
          <div className="mentee-session-list__items">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>

          {showStatusNotice && hasUnupdatedStatuses && (
            <p className="mentee-session-list__notice">
              Some previous session dates still have a Scheduled or
              Rescheduled status. Their status will remain unchanged
              until your mentor updates the record.
            </p>
          )}
        </>
      ) : (
        <div className="mentee-session-list__empty">
          <h3>{emptyTitle}</h3>
          <p>{emptyDescription}</p>
        </div>
      )}
    </section>
  )
}

export default SessionList