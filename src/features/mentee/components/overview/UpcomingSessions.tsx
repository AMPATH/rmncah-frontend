
import { Calendar, Location, Time } from '@carbon/icons-react'

interface MenteeSession {
  id: string
  title: string
  moduleTitle: string
  sessionType: string
  scheduledDate: string
  startTime: string
  endTime: string
  location: string
}

interface UpcomingSessionsProps {
  sessions: MenteeSession[]
}

function formatSessionDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatSessionTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time
  }

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
    'en-KE',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  )
}

function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  return (
    <section
      className="mentee-panel mentee-sessions"
      aria-labelledby="mentee-sessions-title"
    >
      <div className="mentee-panel__heading">
        <div>
          <span className="mentee-panel__eyebrow">
            YOUR SCHEDULE
          </span>
          <h2 id="mentee-sessions-title">Upcoming sessions</h2>
          <p>Your next scheduled mentorship activities.</p>
        </div>

        <span className="mentee-panel__count">
          {sessions.length} scheduled
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="mentee-empty">
          <h3>No upcoming sessions</h3>
          <p>
            Your scheduled mentorship activities will appear here.
          </p>
        </div>
      ) : (
        <div className="mentee-session-list">
          {sessions.map((session) => (
            <article
              className="mentee-session"
              key={session.id}
            >
              <div className="mentee-session__date">
                <Calendar size={16} aria-hidden="true" />
                <strong>
                  {formatSessionDate(session.scheduledDate)}
                </strong>
              </div>

              <div className="mentee-session__details">
                <div className="mentee-session__top">
                  <h3>{session.title}</h3>
                  <span>{session.sessionType}</span>
                </div>

                <p>{session.moduleTitle}</p>

                <div className="mentee-session__meta">
                  <span>
                    <Time size={14} aria-hidden="true" />
                    {formatSessionTime(session.startTime)} –{' '}
                    {formatSessionTime(session.endTime)}
                  </span>

                  <span>
                    <Location size={14} aria-hidden="true" />
                    {session.location}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default UpcomingSessions
