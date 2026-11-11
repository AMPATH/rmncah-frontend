import type { MentorCohort } from '../../types/mentor.types'

interface CohortSummaryProps {
  cohorts: MentorCohort[]
}

function CohortSummary({ cohorts }: CohortSummaryProps) {
  const totalCohorts = cohorts.length

  const activeCohorts = cohorts.filter(
    (cohort) => cohort.status === 'Active',
  ).length

  const totalMentees = cohorts.reduce(
    (total, cohort) => total + cohort.menteesCount,
    0,
  )

  const summaryItems = [
    {
      label: 'Total cohorts',
      value: totalCohorts,
    },
    {
      label: 'Active cohorts',
      value: activeCohorts,
    },
    {
      label: 'Assigned mentees',
      value: totalMentees,
    },
  ]

  return (
    <section
      className="mentor-cohort-summary"
      aria-label="Cohort summary"
    >
      {summaryItems.map((item) => (
        <article
          className="mentor-cohort-summary__item"
          key={item.label}
        >
          <span>{item.label}</span>

          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  )
}

export default CohortSummary