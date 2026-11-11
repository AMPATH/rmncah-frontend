
import type { MentorAssessment } from '../../types/mentor.types'

interface AssessmentSummaryProps {
  assessments: MentorAssessment[]
}

export default function AssessmentSummary({
  assessments,
}: AssessmentSummaryProps) {
  const total = assessments.length

  const scheduled = assessments.filter(
    (item) => item.status === 'Scheduled',
  ).length

  const completed = assessments.filter(
    (item) => item.status === 'Completed',
  ).length

  const needingSupport = assessments.filter(
    (item) => item.outcome === 'Needs Support',
  ).length

  const summaryItems = [
    {
      label: 'Total assessments',
      value: total,
      description: 'Assessment records across your mentees',
    },
    {
      label: 'Scheduled',
      value: scheduled,
      description: 'Assessments awaiting completion',
    },
    {
      label: 'Completed',
      value: completed,
      description: 'Assessments marked as completed',
    },
    {
      label: 'Needs support',
      value: needingSupport,
      description: 'Outcomes requiring additional support',
    },
  ]

  return (
    <section
      className="assessment-summary"
      aria-label="Assessment summary"
    >
      {summaryItems.map((item) => (
        <article
          className="assessment-summary__card"
          key={item.label}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.description}</p>
        </article>
      ))}
    </section>
  )
}
