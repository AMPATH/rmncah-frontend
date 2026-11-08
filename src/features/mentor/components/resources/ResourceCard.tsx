
import { Button, Tag } from '@carbon/react'
import type { MentorResource } from '../../types/mentor.types'

interface ResourceCardProps {
  resource: MentorResource
  onView: (resource: MentorResource) => void
}

export default function ResourceCard({
  resource,
  onView,
}: ResourceCardProps) {
  const formattedDate = new Date(
    `${resource.publishedDate}T00:00:00`,
  ).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="resource-card">
      <div className="resource-card__top">
        <Tag
          type={
            resource.type === 'E-book'
              ? 'blue'
              : resource.type === 'Slides'
                ? 'purple'
                : 'teal'
          }
        >
          {resource.type}
        </Tag>

        <span className="resource-card__date">
          {formattedDate}
        </span>
      </div>

      <div className="resource-card__content">
        <h3>{resource.title}</h3>

        <p>{resource.description}</p>

        <div className="resource-card__module">
          <span>Training module</span>
          <strong>{resource.moduleTitle}</strong>
        </div>

        <div className="resource-card__section">
          <span>Section</span>
          <strong>{resource.sectionTitle}</strong>
        </div>
      </div>

      <div className="resource-card__footer">
        <div className="resource-card__file">
          <strong>{resource.fileSize}</strong>
          {resource.duration && (
            <span>{resource.duration}</span>
          )}
        </div>

        <Button
          kind="tertiary"
          size="sm"
          onClick={() => onView(resource)}
        >
          View details
        </Button>
      </div>
    </article>
  )
}
