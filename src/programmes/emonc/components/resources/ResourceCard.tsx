import { Button, Tag } from '@carbon/react'
import type { LearningResource } from '../../data/models/learning-resource.types.ts'

interface ResourceCardProps {
  resource: LearningResource
  onView: (resource: LearningResource) => void
  variant: 'mentor' | 'mentee'
}

export default function ResourceCard({
  resource,
  onView,
  variant,
}: ResourceCardProps) {
  const isMentee = variant === 'mentee'
  const prefix = isMentee ? 'mentee-resource-card' : 'resource-card'

  const formattedDate = new Date(
    `${resource.publishedDate}T00:00:00`,
  ).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const tagType: 'blue' | 'purple' | 'teal' =
    resource.type === 'E-book'
      ? 'blue'
      : resource.type === 'Slides'
        ? 'purple'
        : 'teal'

  return (
    <article className={prefix}>
      <div className={`${prefix}__top`}>
        <Tag type={tagType}>{resource.type}</Tag>
        <span className={isMentee ? undefined : `${prefix}__date`}>
          {formattedDate}
        </span>
      </div>

      <div className={`${prefix}__content`}>
        <h3>{resource.title}</h3>
        <p>{resource.description}</p>

        {isMentee ? (
          <div className={`${prefix}__metadata`}>
            <div>
              <span>Assigned module</span>
              <strong>{resource.moduleTitle}</strong>
            </div>

            <div>
              <span>Learning section</span>
              <strong>{resource.sectionTitle}</strong>
            </div>
          </div>
        ) : (
          <>
            <div className={`${prefix}__module`}>
              <span>Training module</span>
              <strong>{resource.moduleTitle}</strong>
            </div>

            <div className={`${prefix}__section`}>
              <span>Section</span>
              <strong>{resource.sectionTitle}</strong>
            </div>
          </>
        )}
      </div>

      <div className={`${prefix}__footer`}>
        <div className={isMentee ? undefined : `${prefix}__file`}>
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
