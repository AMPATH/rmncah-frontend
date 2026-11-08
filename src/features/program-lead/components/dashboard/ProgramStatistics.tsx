import {
  Document,
  CheckmarkFilled,
  Catalog,
  CloudUpload,
} from '@carbon/icons-react'

import type { ProgramDashboardStatistics } from '../../types/program-lead.types'

interface ProgramStatisticsProps {
  statistics: ProgramDashboardStatistics
}

function ProgramStatistics({ statistics }: ProgramStatisticsProps) {
  const items = [
    {
      label: 'Training modules',
      value: statistics.totalModules,
      description: 'Total modules created',
      icon: Document,
    },
    {
      label: 'Published modules',
      value: statistics.publishedModules,
      description: 'Available in the Module Library',
      icon: CheckmarkFilled,
    },
    {
      label: 'Module sections',
      value: statistics.totalSections,
      description: 'Sections across all modules',
      icon: Catalog,
    },
    {
      label: 'Learning materials',
      value: statistics.totalMaterials,
      description: 'E-books, slides and videos',
      icon: CloudUpload,
    },
  ]

  return (
    <section className="program-statistics">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <article className="program-statistics__card" key={item.label}>
            <div className="program-statistics__top">
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

export default ProgramStatistics