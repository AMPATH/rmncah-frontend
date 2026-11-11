
import type { MentorLearningPlan } from '../../types/mentor.types'
import LearningPlanCard from './LearningPlanCard'

interface LearningPlanListProps {
  plans: MentorLearningPlan[]
  expandedPlanId: string | null
  onTogglePlan: (planId: string) => void
}

function LearningPlanList({
  plans,
  expandedPlanId,
  onTogglePlan,
}: LearningPlanListProps) {
  if (plans.length === 0) {
    return (
      <div className="learning-plan-empty">
        <h3>No learning plans found</h3>
        <p>
          Try changing your search term or filters to find a learning plan.
        </p>
      </div>
    )
  }

  return (
    <section className="learning-plan-list">
      <div className="learning-plan-list__header">
        <div>
          <h2>Learning plans</h2>
          <p>Monitor training progress and scheduled learning activities.</p>
        </div>

        <span>{plans.length} plans</span>
      </div>

      <div className="learning-plan-list__items">
        {plans.map((plan) => (
          <LearningPlanCard
            key={plan.id}
            plan={plan}
            expanded={expandedPlanId === plan.id}
            onToggle={() => onTogglePlan(plan.id)}
          />
        ))}
      </div>
    </section>
  )
}

export default LearningPlanList
