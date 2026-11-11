import { Tag } from '@carbon/react'

import type { LearningPlanSession } from '../../../mentor/types/mentor.types'

interface NextSessionProps {
  session: LearningPlanSession | null
}

function formatSessionDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'long',
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

function NextSession({ session }: NextSessionProps) {
  if (!session) {
    return (
      <section className="mentee-next-session mentee-next-session--empty">
        <span className="mentee-next-session__eyebrow">
          NEXT MENTORSHIP SESSION
        </span>

        <h2>No upcoming session</h2>

        <p>
          Your mentor has not scheduled another session for your
          learning plan.
        </p>
      </section>
    )
  }

  return (
    <section className="mentee-next-session">
      <div className="mentee-next-session__heading">
        <div>
          <span className="mentee-next-session__eyebrow">
            NEXT MENTORSHIP SESSION
          </span>

          <h2>{session.title}</h2>
          <p>{session.moduleTitle}</p>
        </div>

        <Tag type={getStatusTagType(session.status)}>
          {session.status}
        </Tag>
      </div>

      <div className="mentee-next-session__details">
        <div>
          <span>Date</span>
          <strong>{formatSessionDate(session.scheduledDate)}</strong>
          <small>{formatSessionDay(session.scheduledDate)}</small>
        </div>

        <div>
          <span>Time</span>
          <strong>
            {session.startTime} – {session.endTime}
          </strong>
        </div>

        <div>
          <span>Session type</span>
          <strong>{session.sessionType}</strong>
        </div>

        <div>
          <span>Location</span>
          <strong>{session.location}</strong>
        </div>
      </div>
    </section>
  )
}

export default NextSession