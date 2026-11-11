
import { useMemo, useState } from 'react'
import { Button, Search } from '@carbon/react'

import ResourceCard from '../components/resources/ResourceCard'
import ResourceDetails from '../components/resources/ResourceDetails'

import { menteeResourcesData } from '../data/menteeResourcesData'
import { menteeOverviewData } from '../data/menteeOverviewData'

import type { MentorResource } from '../../mentor/types/mentor.types'

import '../styles/mentee-resources.scss'

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
          menteeResourcesData.map(
            (resource) => resource.moduleTitle,
          ),
        ),
      ).sort(),
    [],
  )

  const filteredResources = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return menteeResourcesData.filter((resource) => {
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

  const summaryItems = [
    {
      label: 'Assigned resources',
      value: menteeResourcesData.length,
      description: 'Materials linked to your learning plan',
    },
    {
      label: 'E-books',
      value: menteeResourcesData.filter(
        (item) => item.type === 'E-book',
      ).length,
      description: 'Digital learning guides',
    },
    {
      label: 'Slides',
      value: menteeResourcesData.filter(
        (item) => item.type === 'Slides',
      ).length,
      description: 'Mentor teaching presentations',
    },
    {
      label: 'Videos',
      value: menteeResourcesData.filter(
        (item) => item.type === 'Video',
      ).length,
      description: 'Practical learning videos',
    },
  ]

  function handleClearFilters() {
    setSearchTerm('')
    setSelectedModule('All modules')
    setSelectedType('All types')
  }

  const hasFilters =
    searchTerm !== '' ||
    selectedModule !== 'All modules' ||
    selectedType !== 'All types'

  return (
    <main className="mentee-resources-page">
      <header className="mentee-resources-page__header">
        <div>
          <span className="mentee-resources-page__eyebrow">
            MENTEE WORKSPACE
          </span>

          <h1>{title}</h1>

          <p>
            Learning materials shared for your assigned training
            modules by your mentorship programme.
          </p>
        </div>

        <div className="mentee-resources-page__context">
          <span>Assigned learning plan</span>
          <strong>
            {menteeOverviewData.learning.planTitle}
          </strong>
          <span>{menteeOverviewData.mentee.cohort}</span>
        </div>
      </header>

      <section
        className="mentee-resource-summary"
        aria-label="Assigned resource summary"
      >
        {summaryItems.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="mentee-resource-library">
        <div className="mentee-resource-library__header">
          <div>
            <h2>Your learning materials</h2>
            <p>
              Browse resources associated with the modules
              assigned by your mentor.
            </p>
          </div>

          <span>
            {filteredResources.length}{' '}
            {filteredResources.length === 1
              ? 'resource'
              : 'resources'}
          </span>
        </div>

        <div className="mentee-resource-filters">
          <div className="mentee-resource-filters__search">
            <Search
              size="lg"
              labelText="Search learning materials"
              placeholder="Search by title, module or keyword"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="mentee-resource-filters__field">
            <label htmlFor="mentee-resource-module">
              Assigned module
            </label>

            <select
              id="mentee-resource-module"
              value={selectedModule}
              onChange={(event) =>
                setSelectedModule(event.target.value)
              }
            >
              <option value="All modules">All modules</option>

              {moduleOptions.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>

          <div className="mentee-resource-filters__field">
            <label htmlFor="mentee-resource-type">
              Resource type
            </label>

            <select
              id="mentee-resource-type"
              value={selectedType}
              onChange={(event) =>
                setSelectedType(event.target.value)
              }
            >
              <option value="All types">All types</option>
              <option value="E-book">E-book</option>
              <option value="Slides">Slides</option>
              <option value="Video">Video</option>
            </select>
          </div>

          <div className="mentee-resource-filters__actions">
            <Button
              kind="ghost"
              size="md"
              disabled={!hasFilters}
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          </div>
        </div>

        {filteredResources.length > 0 ? (
          <div className="mentee-resource-list">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onView={setSelectedResource}
              />
            ))}
          </div>
        ) : (
          <div className="mentee-resource-empty">
            <h3>
              {menteeResourcesData.length === 0
                ? 'No learning materials assigned yet'
                : 'No resources found'}
            </h3>

            <p>
              {menteeResourcesData.length === 0
                ? 'Your assigned mentor has not shared learning materials for your current learning plan.'
                : 'No learning materials match your search or selected filters. Try changing your search criteria.'}
            </p>

            {hasFilters && (
              <Button
                kind="tertiary"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </section>

      <footer className="mentee-resources-page__footer">
        <span>EmONC Mentorship Training System</span>
        <span>Mentee workspace</span>
      </footer>

      {selectedResource && (
        <div className="mentee-resource-overlay">
          <button
            type="button"
            className="mentee-resource-overlay__backdrop"
            aria-label="Close resource details"
            onClick={() => setSelectedResource(null)}
          />

          <ResourceDetails
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
          />
        </div>
      )}
    </main>
  )
}
