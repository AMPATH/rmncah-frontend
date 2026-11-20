
import {
  Document,
  Catalog,
  CloudUpload,
  ArrowRight,
} from '@carbon/icons-react'

import { Button } from '@carbon/react'

import type { ProgramDashboardStatistics } from '../../types/program-lead.types.ts'

interface ProgramStatisticsProps {
  statistics: ProgramDashboardStatistics
  onNavigate: (path: string) => void
}

function ProgramStatistics({
  statistics,
  onNavigate,
}: ProgramStatisticsProps) {
  const items = [
    {
      label: 'Training modules',
      value: statistics.totalModules,
      description: 'Total modules created',
      icon: Document,
      actionLabel: 'Manage modules',
      path: '/program-lead/training-modules',
    },
    {
      label: 'Complete modules',
      value: statistics.completeModules,
      description: 'Modules with sections and learning materials',
      icon: Document,
      actionLabel: 'View modules',
      path: '/program-lead/training-modules',
    },
    {
      label: 'Module sections',
      value: statistics.totalSections,
      description: 'Sections across all modules',
      icon: Catalog,
      actionLabel: 'Manage sections',
      path: '/program-lead/module-sections',
    },
    {
      label: 'Learning materials',
      value: statistics.totalMaterials,
      description: 'E-books, slides and videos',
      icon: CloudUpload,
      actionLabel: 'Manage materials',
      path: '/program-lead/learning-materials',
    },
  ]

  return (
    <section className="program-statistics">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <article
            className="program-statistics__card"
            key={item.label}
          >
            <div className="program-statistics__top">
              <span>{item.label}</span>
              <Icon size={20} />
            </div>

            <strong>{item.value}</strong>

            <p>{item.description}</p>

            <Button
              kind="ghost"
              size="sm"
              renderIcon={ArrowRight}
              onClick={() => onNavigate(item.path)}
            >
              {item.actionLabel}
            </Button>
          </article>
        )
      })}
    </section>
  )
}

export default ProgramStatistics
