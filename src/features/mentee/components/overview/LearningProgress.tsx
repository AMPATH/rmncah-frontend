
import { Checkmark } from '@carbon/icons-react'
import type { MentorLearningPlan } from '../../../mentor/types/mentor.types'

type LearningModule = MentorLearningPlan['modules'][number]

interface LearningProgressProps {
  planTitle: string
  modules: LearningModule[]
  totalSections: number
  completedSections: number
  progress: number
}

function LearningProgress({
  planTitle,
  modules,
  totalSections,
  completedSections,
  progress,
}: LearningProgressProps) {
  const completedModules = modules.filter(
    (module) => module.status === 'Completed',
  ).length

  const remainingSections = Math.max(
    totalSections - completedSections,
    0,
  )

  return (
    <section
      className="mentee-panel mentee-learning"
      aria-labelledby="mentee-learning-title"
    >
      <div className="mentee-panel__heading">
        <div>
          <span className="mentee-panel__eyebrow">
            LEARNING PLAN
          </span>
          <h2 id="mentee-learning-title">My learning progress</h2>
          <p>{planTitle}</p>
        </div>

        <span className="mentee-panel__count">
          {modules.length} modules
        </span>
      </div>

      <div className="mentee-learning__summary">
        <div className="mentee-learning__percentage">
          <strong>{progress}%</strong>
          <span>Overall completion</span>
        </div>

        <div className="mentee-learning__completion">
          <div className="mentee-learning__completion-stat">
            <div>
              <span>Sections completed</span>
              <strong>
                {completedSections} of {totalSections}
              </strong>
            </div>
          </div>

          <div className="mentee-learning__completion-stat">
            <div>
              <span>Modules completed</span>
              <strong>
                {completedModules} of {modules.length}
              </strong>
            </div>
          </div>

          <div className="mentee-learning__completion-stat">
            <div>
              <span>Sections remaining</span>
              <strong>{remainingSections}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="mentee-learning__modules">
        <div className="mentee-learning__modules-heading">
          <h3>Assigned modules</h3>
          <span>Module status</span>
        </div>

        {modules.length === 0 ? (
          <div className="mentee-empty">
            <h3>No learning modules assigned</h3>
            <p>
              Your assigned modules will appear here when
              they become available.
            </p>
          </div>
        ) : (
          modules.map((module, index) => {
            const isCompleted = module.status === 'Completed'

            return (
              <article
                className="mentee-learning-module"
                key={module.id}
              >
                <div className="mentee-learning-module__number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="mentee-learning-module__content">
                  <div className="mentee-learning-module__top">
                    <div>
                      <h3>{module.title}</h3>
                      <p className="mentee-learning-module__description">
                        {module.description}
                      </p>
                    </div>

                    <span
                      className={`mentee-learning-module__status ${
                        isCompleted
                          ? 'mentee-learning-module__status--completed'
                          : ''
                      }`}
                    >
                      {isCompleted && (
                        <Checkmark
                          size={14}
                          aria-hidden="true"
                        />
                      )}
                      {module.status}
                    </span>
                  </div>

                  <div className="mentee-learning-module__details">
                    <span>
                      {module.completedSections} of{' '}
                      {module.sectionsCount} sections completed
                    </span>

                    {module.competencyRequired && (
                      <span>
                        Competency:{' '}
                        <strong>
                          {module.competencyAchieved
                            ? 'Achieved'
                            : 'Awaiting assessment'}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}

export default LearningProgress
