import {
  CheckmarkFilled,
  Document,
  UserMultiple,
} from '@carbon/icons-react'

import type { CountyActivity } from '../../types/county-mentor.types'

interface RecentActivityProps {
  activities: CountyActivity[]
}

function RecentActivity({ activities }: RecentActivityProps) {
  const activityIcons = {
    submission: Document,
    assessment: CheckmarkFilled,
    mentorship: UserMultiple,
  }

  return (
    <section className="county-panel county-activity">
      <div className="county-panel__heading">
        <div>
          <h2>Recent activity</h2>
          <p>Latest recorded programme updates.</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="county-empty">
          No recent programme activities.
        </div>
      ) : (
        <div className="county-activity__list">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]

            return (
              <article
                className="county-activity-item"
                key={activity.id}
              >
                <span className="county-activity-item__icon">
                  <Icon size={17} />
                </span>

                <div>
                  <strong>{activity.title}</strong>
                  <span>{activity.detail}</span>
                  <small>{activity.time}</small>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default RecentActivity