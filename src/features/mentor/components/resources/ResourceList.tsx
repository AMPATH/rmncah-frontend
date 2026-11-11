
import type { MentorResource } from '../../types/mentor.types'
import ResourceCard from './ResourceCard'

interface ResourceListProps {
  resources: MentorResource[]
  onView: (resource: MentorResource) => void
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
          key={resource.id}
          resource={resource}
          onView={onView}
        />
      ))}
    </div>
  )
}
