import {
  CheckmarkFilled,
  Document,
  UserMultiple,
  Activity,
} from '@carbon/icons-react'

import type { CountyActivity } from '../../types/county-mentor.types.ts'

interface RecentActivityProps {
  activities: CountyActivity[]
}

const activityIcons = {
  submission: Document,
  assessment: CheckmarkFilled,
  mentorship: UserMultiple,
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section className="county-panel county-activity">
      <div className="county-panel__heading">
        <div>
          <span className="county-panel__eyebrow">LATEST UPDATES</span>
          <h2>Recent activity</h2>
          <p>Latest recorded programme updates.</p>
        </div>
        <span className="county-panel__heading-icon">
          <Activity size={20} />
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="county-empty">
          <span>No recent programme activities.</span>
        </div>
      ) : (
        <div className="county-activity__list">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]

            return (
              <article className="county-activity-item" key={activity.id}>
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
