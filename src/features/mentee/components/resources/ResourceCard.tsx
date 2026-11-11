
import { Button, Tag } from '@carbon/react'
import type { MentorResource } from '../../../mentor/types/mentor.types'

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

  const tagType =
    resource.type === 'E-book'
      ? 'blue'
      : resource.type === 'Slides'
        ? 'purple'
        : 'teal'

  return (
    <article className="mentee-resource-card">
      <div className="mentee-resource-card__top">
        <Tag type={tagType}>{resource.type}</Tag>

        <span>{formattedDate}</span>
      </div>

      <div className="mentee-resource-card__content">
        <h3>{resource.title}</h3>

        <p>{resource.description}</p>

        <div className="mentee-resource-card__metadata">
          <div>
            <span>Assigned module</span>
            <strong>{resource.moduleTitle}</strong>
          </div>

          <div>
            <span>Learning section</span>
            <strong>{resource.sectionTitle}</strong>
          </div>
        </div>
      </div>

      <div className="mentee-resource-card__footer">
        <div>
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
