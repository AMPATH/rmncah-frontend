import {
  Hospital,
  UserMultiple,
  User,
  Group,
} from '@carbon/icons-react'

import type { CountyStatistic } from '../../types/county-mentor.types.ts'

interface CountyStatisticsProps {
  statistics: CountyStatistic[]
}

const statisticIcons = [User, UserMultiple, Hospital, Group]

function CountyStatistics({ statistics }: CountyStatisticsProps) {
  return (
    <section
      className="county-overview__statistics"
      aria-label="County mentorship statistics"
    >
      {statistics.map((statistic, index) => {
        const Icon = statisticIcons[index] ?? ChartFallback

        return (
          <article className="county-stat-card" key={statistic.id}>
            <div className="county-stat-card__top">
              <span>{statistic.label}</span>
              <span className="county-stat-card__icon">
                <Icon size={20} />
              </span>
            </div>

            <strong>{statistic.value}</strong>
            <p>{statistic.description}</p>
          </article>
        )
      })}
    </section>
  )
}

function ChartFallback() {
  return <Hospital size={20} />
}

export default CountyStatistics
