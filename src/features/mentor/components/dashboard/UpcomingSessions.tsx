import type { UpcomingSession } from '../../types/mentor.types'

interface UpcomingSessionsProps {
  sessions: UpcomingSession[]
}

function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  return (
    <section className="mentor-panel mentor-upcoming">
      <div className="mentor-panel__heading">
        <div>
          <h2>Upcoming sessions</h2>
          <p>Your scheduled mentorship activities.</p>
        </div>

        <span className="mentor-panel__count">
          {sessions.length} scheduled
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="mentor-empty">
          No upcoming training sessions.
        </div>
      ) : (
        <div className="mentor-session-list">
          {sessions.map((session) => (
            <article className="mentor-session" key={session.id}>
              <div className="mentor-session__date">
                <span>{session.date}</span>
                <strong>{session.time}</strong>
              </div>

              <div className="mentor-session__details">
                <h3>{session.title}</h3>

                <p>
                  {session.cohort} · {session.facility}
                </p>

                <div className="mentor-session__meta">
                  <span className="mentor-session__type">
                    {session.sessionType}
                  </span>

                  <span>{session.location}</span>
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