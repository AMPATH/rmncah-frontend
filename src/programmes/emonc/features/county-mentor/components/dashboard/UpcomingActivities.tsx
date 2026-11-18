import { Calendar, Time } from '@carbon/icons-react'

import type { UpcomingCountyActivity } from '../../types/county-mentor.types.ts'

interface UpcomingActivitiesProps {
  activities: UpcomingCountyActivity[]
}

function UpcomingActivities({ activities }: UpcomingActivitiesProps) {
  return (
    <section className="county-panel county-upcoming">
      <div className="county-panel__heading">
        <div>
          <span className="county-panel__eyebrow">COUNTY CALENDAR</span>
          <h2>Upcoming activities</h2>
          <p>Planned county coordination activities.</p>
        </div>
        <span className="county-panel__heading-icon">
          <Calendar size={20} />
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="county-empty">
          <span>No upcoming county activities.</span>
        </div>
      ) : (
        <div className="county-upcoming__list">
          {activities.map((activity) => (
            <article className="county-upcoming-item" key={activity.id}>
              <span className="county-upcoming-item__date">
                <Time size={15} />
                {activity.date}
              </span>
              <strong>{activity.title}</strong>
              <span>{activity.location}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default UpcomingActivities
