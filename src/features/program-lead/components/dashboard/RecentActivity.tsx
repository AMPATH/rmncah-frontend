import { Time } from '@carbon/icons-react'

import type { ProgramActivity } from '../../types/program-lead.types'

interface RecentActivityProps {
  activities: ProgramActivity[]
}

function RecentActivity({
  activities,
}: RecentActivityProps) {
  return (
    <section className="program-panel recent-activity">
      <div className="program-panel__header">
        <div>
          <h2>Recent activity</h2>
          <p>Latest actions within the program workspace</p>
        </div>

        <Time size={20} />
      </div>

      <div className="recent-activity__list">
        {activities.map((activity) => (
          <article
            className="recent-activity__item"
            key={activity.id}
          >
            <span className="recent-activity__indicator" />

            <div className="recent-activity__content">
              <h3>{activity.action}</h3>

              <p>{activity.description}</p>

              <div className="recent-activity__meta">
                <span>{activity.actor}</span>
                <span>{activity.date}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentActivity