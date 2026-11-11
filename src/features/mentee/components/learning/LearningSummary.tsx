
import { Tile } from '@carbon/react'

interface LearningSummaryProps {
  totalModules: number
  completedModules: number
  completedSections: number
  totalSections: number
}

function LearningSummary({
  totalModules,
  completedModules,
  completedSections,
  totalSections,
}: LearningSummaryProps) {
  const statistics = [
    {
      id: 'modules',
      value: totalModules.toString().padStart(2, '0'),
      label: 'Assigned modules',
    },
    {
      id: 'completed',
      value: completedModules.toString().padStart(2, '0'),
      label: 'Completed modules',
    },
    {
      id: 'sections',
      value: `${completedSections}/${totalSections}`,
      label: 'Sections completed',
    },
  ]

  return (
    <section
      className="mentee-learning-summary"
      aria-label="Learning summary"
    >
      {statistics.map((statistic) => (
        <Tile
          key={statistic.id}
          className="mentee-learning-summary__tile"
        >
          <strong>{statistic.value}</strong>
          <span>{statistic.label}</span>
        </Tile>
      ))}
    </section>
  )
}

export default LearningSummary
