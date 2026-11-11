
import type { MentorAssessment } from '../../../mentor/types/mentor.types'

interface AssessmentSummaryProps {
  assessments: MentorAssessment[]
}

export default function AssessmentSummary({
  assessments,
}: AssessmentSummaryProps) {
  const total = assessments.length

  const pending = assessments.filter(
    (assessment) =>
      assessment.status === 'Scheduled' ||
      assessment.status === 'In Progress',
  ).length

  const completed = assessments.filter(
    (assessment) => assessment.status === 'Completed',
  ).length

  const needsSupport = assessments.filter(
    (assessment) => assessment.outcome === 'Needs Support',
  ).length

  const items = [
    {
      label: 'Total assessments',
      value: total,
      description: 'Assessment records assigned to you',
    },
    {
      label: 'Pending',
      value: pending,
      description: 'Awaiting completion or review',
    },
    {
      label: 'Completed',
      value: completed,
      description: 'Assessments completed by your mentor',
    },
    {
      label: 'Needs support',
      value: needsSupport,
      description: 'Competencies requiring further support',
    },
  ]

  return (
    <section
      className="mentee-assessment-summary"
      aria-label="Assessment summary"
    >
      {items.map((item) => (
        <article
          className="mentee-assessment-summary__card"
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
