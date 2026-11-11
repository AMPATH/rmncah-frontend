
import type { MentorLearningPlan } from '../../types/mentor.types'

interface LearningPlanSummaryProps {
  plans: MentorLearningPlan[]
}

function LearningPlanSummary({ plans }: LearningPlanSummaryProps) {
  const totalPlans = plans.length

  const activePlans = plans.filter(
    (plan) =>
      plan.status === 'In Progress' ||
      plan.status === 'Needs Attention',
  ).length

  const completedPlans = plans.filter(
    (plan) => plan.status === 'Completed',
  ).length

  const modulesRequiringSupport = plans.reduce(
    (total, plan) =>
      total +
      plan.modules.filter(
        (module) => module.status === 'Needs Support',
      ).length,
    0,
  )

  const summaryItems = [
    { id: 'total', label: 'Total learning plans', value: totalPlans },
    { id: 'active', label: 'Active plans', value: activePlans },
    { id: 'completed', label: 'Completed plans', value: completedPlans },
    {
      id: 'support',
      label: 'Modules needing support',
      value: modulesRequiringSupport,
    },
  ]

  return (
    <section
      className="learning-plan-summary"
      aria-label="Learning plan summary"
    >
      {summaryItems.map((item) => (
        <article
          className="learning-plan-summary__item"
          key={item.id}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  )
}

export default LearningPlanSummary
