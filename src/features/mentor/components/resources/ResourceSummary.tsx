
import type { MentorResource } from '../../types/mentor.types'

interface ResourceSummaryProps {
  resources: MentorResource[]
}

export default function ResourceSummary({
  resources,
}: ResourceSummaryProps) {
  const summaryItems = [
    {
      label: 'Total resources',
      value: resources.length,
      description: 'Published learning materials',
    },
    {
      label: 'E-books',
      value: resources.filter((item) => item.type === 'E-book').length,
      description: 'Digital reference materials',
    },
    {
      label: 'Slides',
      value: resources.filter((item) => item.type === 'Slides').length,
      description: 'Presentation materials',
    },
    {
      label: 'Videos',
      value: resources.filter((item) => item.type === 'Video').length,
      description: 'Video learning materials',
    },
  ]

  return (
    <section
      className="resource-summary"
      aria-label="Resource summary"
    >
      {summaryItems.map((item) => (
        <article
          className="resource-summary__card"
          key={item.label}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.description}</p>
        </article>
      ))}
    </section>
  )
}
