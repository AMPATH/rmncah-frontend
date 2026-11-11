
import { Checkmark } from '@carbon/icons-react'

import type { menteeLearningData } from '../../data/menteeLearningData'

import LearningSectionChecklist from './LearningSectionChecklist'

type LearningModule = (typeof menteeLearningData.modules)[number]

interface LearningModuleItemProps {
  module: LearningModule
  index: number
}

function LearningModuleItem({
  module,
  index,
}: LearningModuleItemProps) {
  const isCompleted = module.status === 'Completed'

  return (
    <article className="mentee-learning-module">
      <div className="mentee-learning-module__header">
        <div className="mentee-learning-module__title-group">
          <span className="mentee-learning-module__number">
            {String(index + 1).padStart(2, '0')}
          </span>

          <div>
            <h3>{module.title}</h3>

            <p>{module.description}</p>
          </div>
        </div>

        {isCompleted && (
          <span
            className="mentee-learning-module__completed"
            aria-label="Module completed"
            title="Module completed"
          >
            <Checkmark size={20} />
          </span>
        )}
      </div>

      <div className="mentee-learning-module__details">
        <span>
          {module.completedSections} of {module.sectionsCount} sections
          completed
        </span>

        <span>
          {isCompleted
            ? 'Completed'
            : `${module.sectionsCount - module.completedSections} sections remaining`}
        </span>
      </div>

      <LearningSectionChecklist sections={module.sections} />

      {module.competencyRequired && (
        <div className="mentee-learning-module__competency">
          <span>Required competency</span>

          <strong>
            {module.competencyAchieved
              ? 'Achieved'
              : 'Not yet achieved'}
          </strong>
        </div>
      )}
    </article>
  )
}

export default LearningModuleItem
