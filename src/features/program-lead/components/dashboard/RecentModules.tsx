import { Button, Tag } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'

import type { ProgramModule } from '../../types/program-lead.types'

interface RecentModulesProps {
  modules: ProgramModule[]
  onViewAll?: () => void
}

function RecentModules({
  modules,
  onViewAll,
}: RecentModulesProps) {
  function getStatusType(status: ProgramModule['status']) {
    switch (status) {
      case 'Published':
        return 'green' as const

      case 'Incomplete content':
        return 'red' as const

      default:
        return 'gray' as const
    }
  }

  return (
    <section className="program-panel recent-modules">
      <div className="program-panel__header">
        <div>
          <h2>Recently updated modules</h2>
          <p>Latest changes to training modules</p>
        </div>

        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowRight}
          onClick={onViewAll}
        >
          View all
        </Button>
      </div>

      <div className="recent-modules__list">
        {modules.map((module) => (
          <article
            className="recent-modules__item"
            key={module.id}
          >
            <div className="recent-modules__main">
              <div className="recent-modules__identity">
                <span className="recent-modules__id">
                  {module.id}
                </span>

                <Tag type={getStatusType(module.status)}>
                  {module.status}
                </Tag>
              </div>

              <h3>{module.title}</h3>

              <p>{module.category}</p>

              <div className="recent-modules__metadata">
                <span>{module.sectionsCount} sections</span>
                <span>{module.materialsCount} materials</span>
                <span>Updated {module.updatedAt}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentModules