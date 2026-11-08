import type { MentorMentee } from '../../types/mentor.types'

interface MenteeSummaryProps {
  mentees: MentorMentee[]
}

function MenteeSummary({ mentees }: MenteeSummaryProps) {
  const totalMentees = mentees.length

  const competent = mentees.filter(
    (mentee) => mentee.competencyStatus === 'Competent',
  ).length

  const inProgress = mentees.filter(
    (mentee) => mentee.competencyStatus === 'In Progress',
  ).length

  const needsSupport = mentees.filter(
    (mentee) => mentee.competencyStatus === 'Needs Support',
  ).length

  const summaryItems = [
    {
      label: 'Total mentees',
      value: totalMentees,
    },
    {
      label: 'Competent',
      value: competent,
    },
    {
      label: 'In progress',
      value: inProgress,
    },
    {
      label: 'Needs support',
      value: needsSupport,
    },
  ]

  return (
    <section
      className="mentee-summary"
      aria-label="Mentee summary"
    >
      {summaryItems.map((item) => (
        <article className="mentee-summary__item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  )
}

export default MenteeSummary