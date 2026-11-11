import type { MentorActivity } from '../../types/mentor.types'

interface RecentActivityProps {
  activities: MentorActivity[]
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section className="mentor-panel mentor-activity">
      <div className="mentor-panel__heading">
        <div>
          <h2>Recent activity</h2>
          <p>Your latest mentorship activities.</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="mentor-empty">
          No recent activities to display.
        </div>
      ) : (
        <div className="mentor-activity-list">
          {activities.map((activity) => (
            <article
              className="mentor-activity-item"
              key={activity.id}
            >
              <span
                className={`mentor-activity-marker mentor-activity-marker--${activity.type}`}
              />

              <div className="mentor-activity-item__content">
                <p>
                  {activity.description}{' '}
                  <strong>{activity.target}</strong>
                </p>

                <small>{activity.timestamp}</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecentActivity