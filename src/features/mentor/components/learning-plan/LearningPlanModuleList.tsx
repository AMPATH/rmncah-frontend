
import { ProgressBar, Tag } from '@carbon/react'
import type { LearningPlanModule } from '../../types/mentor.types'

interface LearningPlanModuleListProps {
  modules: LearningPlanModule[]
}

function getModuleTagType(
  status: LearningPlanModule['status'],
): 'gray' | 'blue' | 'green' | 'red' {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Needs Support':
      return 'red'
    default:
      return 'gray'
  }
}

function LearningPlanModuleList({
  modules,
}: LearningPlanModuleListProps) {
  return (
    <div className="learning-plan-modules">
      <div className="learning-plan-modules__header">
        <h4>Training modules</h4>
        <span>{modules.length} modules</span>
      </div>

      {modules.map((module) => {
        const progress =
          module.sectionsCount > 0
            ? Math.round(
                (module.completedSections / module.sectionsCount) * 100,
              )
            : 0

        return (
          <article
            className="learning-plan-module"
            key={module.id}
          >
            <div className="learning-plan-module__top">
              <div>
                <h5>{module.title}</h5>
                <p>{module.description}</p>
              </div>

              <Tag type={getModuleTagType(module.status)}>
                {module.status}
              </Tag>
            </div>

            <div className="learning-plan-module__progress">
              <ProgressBar
                label={`${module.title} progress`}
                value={progress}
                max={100}
                size="small"
                hideLabel
              />

              <span>
                {module.completedSections}/{module.sectionsCount} sections
              </span>
            </div>

            {module.competencyRequired && (
              <p className="learning-plan-module__competency">
                Competency assessment:{' '}
                <strong>
                  {module.competencyAchieved
                    ? 'Achieved'
                    : 'Pending'}
                </strong>
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}

export default LearningPlanModuleList
