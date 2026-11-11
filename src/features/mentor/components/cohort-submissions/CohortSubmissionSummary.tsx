import { useMemo } from 'react'
import { Document, CheckmarkFilled, Pending, WarningAlt } from '@carbon/icons-react'

import type { MentorCohortSubmission } from '../../types/mentor.types'

interface CohortSubmissionSummaryProps {
  submissions: MentorCohortSubmission[]
}

function CohortSubmissionSummary({
  submissions,
}: CohortSubmissionSummaryProps) {
  const summary = useMemo(() => {
    return {
      total: submissions.length,
      ready: submissions.filter(
        (item) =>
          item.completionPercentage === 100 &&
          item.competentMentees === item.menteesCount &&
          item.completedModules === item.totalModules,
      ).length,
      submitted: submissions.filter((item) =>
        ['Submitted', 'Under Review', 'Approved'].includes(item.status),
      ).length,
      returned: submissions.filter(
        (item) => item.status === 'Returned',
      ).length,
    }
  }, [submissions])

  const items = [
    {
      label: 'Total cohorts',
      value: summary.total,
      description: 'Cohorts assigned to you',
      icon: Document,
    },
    {
      label: 'Ready for submission',
      value: summary.ready,
      description: 'All completion requirements met',
      icon: CheckmarkFilled,
    },
    {
      label: 'Submitted',
      value: summary.submitted,
      description: 'Sent for County Mentor review',
      icon: Pending,
    },
    {
      label: 'Returned',
      value: summary.returned,
      description: 'Require your attention',
      icon: WarningAlt,
    },
  ]

  return (
    <section className="cohort-submission-summary">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <article className="submission-summary-card" key={item.label}>
            <div className="submission-summary-card__top">
              <span>{item.label}</span>
              <Icon size={20} />
            </div>

            <strong>{item.value}</strong>

            <p>{item.description}</p>
          </article>
        )
      })}
    </section>
  )
}

export default CohortSubmissionSummary