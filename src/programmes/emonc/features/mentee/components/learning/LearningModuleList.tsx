
import type { menteeLearningData } from '../../data/menteeLearningData'

import LearningModuleItem from './LearningModuleItem'

type LearningModule = (typeof menteeLearningData.modules)[number]

interface LearningModuleListProps {
  modules: LearningModule[]
}

function LearningModuleList({
  modules,
}: LearningModuleListProps) {
  return (
    <section className="mentee-learning-list">
      <div className="mentee-learning-list__heading">
        <div>
          <h2>Assigned learning modules</h2>
          <p>
            Work through your assigned modules and review your
            completed sections.
          </p>
        </div>

        <span>{modules.length} modules</span>
      </div>

      {modules.length === 0 ? (
        <div className="mentee-learning-list__empty">
          <h3>No learning modules assigned</h3>
          <p>
            Your assigned learning modules will appear here when
            they become available.
          </p>
        </div>
      ) : (
        <div className="mentee-learning-list__items">
          {modules.map((module, index) => (
            <LearningModuleItem
              key={module.id}
              module={module}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default LearningModuleList
