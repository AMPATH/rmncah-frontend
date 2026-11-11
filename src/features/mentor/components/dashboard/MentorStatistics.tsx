import type { MentorStatistic } from '../../types/mentor.types'

interface MentorStatisticsProps {
  statistics: MentorStatistic[]
}

function MentorStatistics({ statistics }: MentorStatisticsProps) {
  return (
    <section
      className="mentor-statistics"
      aria-label="Mentorship statistics"
    >
      {statistics.map((statistic) => (
        <article
          className="mentor-statistics__item"
          key={statistic.id}
        >
          <span className="mentor-statistics__label">
            {statistic.label}
          </span>

          <strong className="mentor-statistics__value">
            {statistic.value}
          </strong>

          <span className="mentor-statistics__description">
            {statistic.description}
          </span>
        </article>
      ))}
    </section>
  )
}

export default MentorStatistics