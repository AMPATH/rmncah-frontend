
import { Button, Tag } from '@carbon/react'
import type { MentorLearningPlan } from '../../types/mentor.types'
import LearningPlanModuleList from './LearningPlanModuleList'
import LearningPlanSessions from './LearningPlanSessions'

interface LearningPlanCardProps {
  plan: MentorLearningPlan
  expanded: boolean
  onToggle: () => void
}

function getPlanTagType(
  status: MentorLearningPlan['status'],
): 'gray' | 'blue' | 'green' | 'red' {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Needs Attention':
      return 'red'
    default:
      return 'gray'
  }
}

function LearningPlanCard({
  plan,
  expanded,
  onToggle,
}: LearningPlanCardProps) {
  const completedModules = plan.modules.filter(
    (module) => module.status === 'Completed',
  ).length

  const progress =
    plan.modules.length > 0
      ? Math.round((completedModules / plan.modules.length) * 100)
      : 0

  return (
    <article className="learning-plan-card">
      <div className="learning-plan-card__main">
        <div className="learning-plan-card__heading">
          <div>
            <div className="learning-plan-card__title-row">
              <h3>{plan.title}</h3>
              <Tag type={getPlanTagType(plan.status)}>
                {plan.status}
              </Tag>
            </div>

            <p>{plan.description}</p>
          </div>
        </div>

        <div className="learning-plan-card__meta">
          <span>
            <strong>Cohort:</strong> {plan.cohortName}
          </span>
          <span>
            <strong>Facility:</strong> {plan.facility}
          </span>
          <span>
            <strong>Period:</strong> {plan.startDate} – {plan.endDate}
          </span>
        </div>

        <div className="learning-plan-card__progress">
          <div>
            <span>Completed modules</span>
            <strong>
              {completedModules}/{plan.modules.length}
            </strong>
          </div>

          <div
            className="learning-plan-card__progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${plan.title} completed modules`}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="learning-plan-card__footer">
          <span>
            {plan.sessions.length} scheduled sessions
          </span>

          <Button
            kind="ghost"
            size="sm"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide details' : 'View details'}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="learning-plan-card__details">
          <LearningPlanModuleList modules={plan.modules} />
          <LearningPlanSessions sessions={plan.sessions} />
        </div>
      )}
    </article>
  )
}

export default LearningPlanCard
