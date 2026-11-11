
import { useMemo, useState } from 'react'

import ResourceSummary from '../components/resources/ResourceSummary'
import ResourceFilters from '../components/resources/ResourceFilters'
import ResourceList from '../components/resources/ResourceList'
import ResourceDetails from '../components/resources/ResourceDetails'

import { mentorResourcesData } from '../data/mentorResourcesData'

import type { MentorResource } from '../types/mentor.types'

import '../styles/mentor-resources.scss'

interface ResourcesPageProps {
  title: string
}

export default function ResourcesPage({
  title,
}: ResourcesPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState('All modules')
  const [selectedType, setSelectedType] = useState('All types')
  const [selectedResource, setSelectedResource] =
    useState<MentorResource | null>(null)

  const moduleOptions = useMemo(
    () =>
      Array.from(
        new Set(
          mentorResourcesData.map((resource) => resource.moduleTitle),
        ),
      ).sort(),
    [],
  )

  const filteredResources = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return mentorResourcesData.filter((resource) => {
      const matchesSearch =
        normalizedSearch === '' ||
        resource.title.toLowerCase().includes(normalizedSearch) ||
        resource.description.toLowerCase().includes(normalizedSearch) ||
        resource.moduleTitle.toLowerCase().includes(normalizedSearch) ||
        resource.sectionTitle.toLowerCase().includes(normalizedSearch)

      const matchesModule =
        selectedModule === 'All modules' ||
        resource.moduleTitle === selectedModule

      const matchesType =
        selectedType === 'All types' ||
        resource.type === selectedType

      return matchesSearch && matchesModule && matchesType
    })
  }, [searchTerm, selectedModule, selectedType])

  function handleClearFilters() {
    setSearchTerm('')
    setSelectedModule('All modules')
    setSelectedType('All types')
  }

  function handleViewResource(resource: MentorResource) {
    setSelectedResource(resource)
  }

  function handleCloseDetails() {
    setSelectedResource(null)
  }

  return (
    <section className="mentor-resources">
      <div className="mentor-resources__header">
        <div>
          <span className="mentor-resources__eyebrow">
            MENTOR WORKSPACE
          </span>

          <h1>{title}</h1>

          <p>
            Access published learning materials to support your
            training sessions and mentee development.
          </p>
        </div>
      </div>

      <ResourceSummary resources={mentorResourcesData} />

      <section className="resource-directory">
        <div className="resource-directory__header">
          <div>
            <h2>Learning resource library</h2>
            <p>
              Browse learning materials published for your training
              modules.
            </p>
          </div>

          <span className="resource-directory__count">
            {filteredResources.length}{' '}
            {filteredResources.length === 1 ? 'resource' : 'resources'}
          </span>
        </div>

        <ResourceFilters
          searchTerm={searchTerm}
          selectedModule={selectedModule}
          selectedType={selectedType}
          moduleOptions={moduleOptions}
          onSearchChange={setSearchTerm}
          onModuleChange={setSelectedModule}
          onTypeChange={setSelectedType}
          onClear={handleClearFilters}
        />

        <ResourceList
          resources={filteredResources}
          onView={handleViewResource}
        />
      </section>

      {selectedResource && (
        <div className="resource-details-overlay">
          <button
            type="button"
            className="resource-details-overlay__backdrop"
            aria-label="Close resource details"
            onClick={handleCloseDetails}
          />

          <ResourceDetails
            resource={selectedResource}
            onClose={handleCloseDetails}
          />
        </div>
      )}
    </section>
  )
}
