import type { CountyStatistic } from '../../types/county-mentor.types'

interface CountyStatisticsProps {
  statistics: CountyStatistic[]
}

function CountyStatistics({ statistics }: CountyStatisticsProps) {
  return (
    <section
      className="county-overview__statistics"
      aria-label="County mentorship statistics"
    >
      {statistics.map((statistic) => (
        <article className="county-stat-card" key={statistic.id}>
          <div className="county-stat-card__top">
            <span>{statistic.label}</span>
          </div>

          <strong>{statistic.value}</strong>

          <p>{statistic.description}</p>
        </article>
      ))}
    </section>
  )
}

export default CountyStatistics