
import type { LearningResource } from '../../../../data/models/learning-resource.types.ts'
import ResourceCard from '../../../../components/resources/ResourceCard'

interface ResourceListProps {
  resources: LearningResource[]
  onView: (resource: LearningResource) => void
}

export default function ResourceList({
  resources,
  onView,
}: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <div className="resource-empty">
        <h3>No resources found</h3>
        <p>
          No learning materials match your search or selected filters.
          Try changing your search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="resource-list">
      {resources.map((resource) => (
        <ResourceCard
          variant="mentor"
          key={resource.id}
          resource={resource}
          onView={onView}
        />
      ))}
    </div>
  )
}
