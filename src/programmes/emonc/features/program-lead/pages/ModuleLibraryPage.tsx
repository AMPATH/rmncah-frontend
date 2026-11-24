
import { useMemo, useState } from 'react'

import {
  Button,
  Modal,
  Search,
  Select,
  SelectItem,
  Tag,
} from '@carbon/react'

import {
  Catalog,
  Document,
  Video,
  CheckmarkFilled,
  WarningAlt,
  View,
  ArrowRight,
} from '@carbon/icons-react'

import type {
  TrainingModule,
  TrainingModuleStatus,
  TrainingSection,
  LearningMaterial,
} from '../../../data/models'

import { useCurriculum } from '../../../data/providers/CurriculumContext'

import '../styles/program-lead-library.scss'

interface ModuleLibraryPageProps {
  title: string
  onNavigate: (path: string) => void
}

type LibraryFilter = 'all' | 'Completed' | 'Draft' | 'Incomplete content'

interface LibraryModule extends Omit<TrainingModule, 'status'> {
  status: 'Completed' | 'Draft' | 'Incomplete content'
  sections: TrainingSection[]
  materials: LearningMaterial[]
  isReady: boolean
}

const getStatusTagType = (
  status: TrainingModuleStatus | LibraryModule['status'],
) => {
  switch (status) {
    case 'Completed':
      return 'green' as const

    case 'Incomplete content':
      return 'red' as const

    default:
      return 'gray' as const
  }
}

const ModuleLibraryPage = ({
  title,
  onNavigate,
}: ModuleLibraryPageProps) => {
  const {
    modules,
    sections,
    materials,
    loading,
    error,
  } = useCurriculum()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<LibraryFilter>('all')

  const [selectedModule, setSelectedModule] =
    useState<LibraryModule | null>(null)

  // Keep modules in their official curriculum sequence.
  const orderedModules = useMemo(
    () =>
      [...modules].sort(
        (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0),
      ),
    [modules],
  )

  // Build the library from the shared curriculum records.
  const moduleContent = useMemo<LibraryModule[]>(
    () =>
      orderedModules.map((module) => {
        const moduleSections = sections
          .filter((section) => section.moduleId === module.id)
          .sort((a, b) => a.sequence - b.sequence)

        const moduleMaterials = materials.filter(
          (material) => material.moduleId === module.id,
        )

        // Match the readiness rules used by Training Modules.
        let status: LibraryModule['status']

        if (module.status === 'Draft') {
          status = 'Draft'
        } else if (module.status === 'Incomplete content') {
          status = 'Incomplete content'
        } else if (
          moduleSections.length > 0 &&
          moduleMaterials.length > 0
        ) {
          status = 'Completed'
        } else {
          status = 'Incomplete content'
        }

        return {
          ...module,
          sections: moduleSections,
          materials: moduleMaterials,
          status,
          isReady: status === 'Completed',
        }
      }),
    [orderedModules, sections, materials],
  )

  // Search and filter the shared curriculum modules.
  const filteredModules = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return moduleContent.filter((module) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        module.title.toLowerCase().includes(normalizedSearch) ||
        module.category.toLowerCase().includes(normalizedSearch) ||
        module.id.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'all' || module.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [moduleContent, searchTerm, statusFilter])

  // Calculate statistics from the same records displayed in the library.
  const statistics = useMemo(
    () => ({
      total: moduleContent.length,
      completed: moduleContent.filter(
        (module) => module.status === 'Completed',
      ).length,
      drafts: moduleContent.filter(
        (module) => module.status === 'Draft',
      ).length,
      incomplete: moduleContent.filter(
        (module) => module.status === 'Incomplete content',
      ).length,
    }),
    [moduleContent],
  )

  const handleOpenDetails = (module: LibraryModule) => {
    setSelectedModule(module)
  }

  const handleCloseDetails = () => {
    setSelectedModule(null)
  }

  return (
    <div className="program-module-library">
      <header className="program-module-library__header">
        <div>
          <div className="program-module-library__eyebrow">
            PROGRAM CONTENT MANAGEMENT
          </div>

          <h1 className="program-module-library__title">
            {title}
          </h1>

          <p className="program-module-library__description">
            Explore the EmONC curriculum, review module structure and
            monitor the completeness of training content.
          </p>
        </div>

        <Button
          kind="secondary"
          renderIcon={ArrowRight}
          onClick={() =>
            onNavigate('/program-lead/training-modules')
          }
        >
          Manage training modules
        </Button>
      </header>

      {error && (
        <p role="alert">
          Unable to load curriculum data: {error}
        </p>
      )}

      <section className="program-module-library__statistics">
        <div className="program-module-library__stat-card">
          <div className="program-module-library__stat-icon">
            <Catalog size={20} />
          </div>

          <div>
            <span className="program-module-library__stat-label">
              Total modules
            </span>

            <strong className="program-module-library__stat-value">
              {loading ? '—' : statistics.total}
            </strong>
          </div>
        </div>

        <div className="program-module-library__stat-card">
          <div className="program-module-library__stat-icon program-module-library__stat-icon--completed">
            <CheckmarkFilled size={20} />
          </div>

          <div>
            <span className="program-module-library__stat-label">
              Completed
            </span>

            <strong className="program-module-library__stat-value">
              {loading ? '—' : statistics.completed}
            </strong>
          </div>
        </div>

        <div className="program-module-library__stat-card">
          <div className="program-module-library__stat-icon">
            <Document size={20} />
          </div>

          <div>
            <span className="program-module-library__stat-label">
              Drafts
            </span>

            <strong className="program-module-library__stat-value">
              {loading ? '—' : statistics.drafts}
            </strong>
          </div>
        </div>

        <div className="program-module-library__stat-card">
          <div className="program-module-library__stat-icon program-module-library__stat-icon--incomplete">
            <WarningAlt size={20} />
          </div>

          <div>
            <span className="program-module-library__stat-label">
              Incomplete
            </span>

            <strong className="program-module-library__stat-value">
              {loading ? '—' : statistics.incomplete}
            </strong>
          </div>
        </div>
      </section>

      <section className="program-module-library__directory">
        <div className="program-module-library__directory-header">
          <div>
            <h2>Training module library</h2>

            <p>
              Browse module sections and learning materials, and review
              content readiness.
            </p>
          </div>

          <Tag type="blue">
            {loading ? 'Loading...' : `${filteredModules.length} modules`}
          </Tag>
        </div>

        <div className="program-module-library__toolbar">
          <div className="program-module-library__search">
            <Search
              size="lg"
              labelText="Search modules"
              placeholder="Search by module name, category or ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="program-module-library__filter">
            <Select
              id="library-status-filter"
              labelText="Content readiness"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as LibraryFilter)
              }
            >
              <SelectItem value="all" text="All statuses" />
              <SelectItem value="Completed" text="Completed" />
              <SelectItem value="Draft" text="Draft" />
              <SelectItem
                value="Incomplete content"
                text="Incomplete content"
              />
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="program-module-library__empty">
            <Catalog size={32} />

            <h3>Loading module library</h3>

            <p>
              Loading modules and curriculum content from the EmONC
              database.
            </p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="program-module-library__empty">
            <Catalog size={32} />

            <h3>No modules found</h3>

            <p>
              Try another search term or change the content readiness
              filter.
            </p>
          </div>
        ) : (
          <div className="program-module-library__grid">
            {filteredModules.map((module) => (
              <article
                className="program-module-library__card"
                key={module.id}
              >
                <div className="program-module-library__card-top">
                  <div className="program-module-library__card-icon">
                    <Catalog size={22} />
                  </div>

                  <Tag type={getStatusTagType(module.status)}>
                    {module.status}
                  </Tag>
                </div>

                <div className="program-module-library__card-content">
                  <span className="program-module-library__module-id">
                    {module.id}
                  </span>

                  <h3>{module.title}</h3>

                  <p className="program-module-library__category">
                    {module.category}
                  </p>

                  <p className="program-module-library__card-description">
                    {module.sections.length} sections ·{' '}
                    {module.materials.length} learning materials
                  </p>
                </div>

                {!module.isReady && (
                  <div className="program-module-library__readiness program-module-library__readiness--warning">
                    <WarningAlt size={16} />

                    <span>
                      {module.status === 'Draft'
                        ? 'No sections or learning materials have been added yet.'
                        : 'This module still needs sections or learning materials.'}
                    </span>
                  </div>
                )}

                <div className="program-module-library__card-actions">
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={View}
                    onClick={() => handleOpenDetails(module)}
                  >
                    Preview
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={selectedModule !== null}
        modalHeading={selectedModule?.title ?? 'Module details'}
        modalLabel="CURRICULUM OVERVIEW"
        primaryButtonText="Close"
        onRequestClose={handleCloseDetails}
        onRequestSubmit={handleCloseDetails}
      >
        {selectedModule && (
          <div className="program-module-library__preview">
            <div className="program-module-library__preview-summary">
              <div>
                <span>Module ID</span>
                <strong>{selectedModule.id}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{selectedModule.category}</strong>
              </div>

              <div>
                <span>Content readiness</span>
                <Tag type={getStatusTagType(selectedModule.status)}>
                  {selectedModule.status}
                </Tag>
              </div>
            </div>

            <div className="program-module-library__preview-section">
              <div className="program-module-library__preview-heading">
                <h3>Module sections</h3>

                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => {
                    handleCloseDetails()
                    onNavigate('/program-lead/module-sections')
                  }}
                >
                  Manage sections
                </Button>
              </div>

              {selectedModule.sections.length === 0 ? (
                <p className="program-module-library__preview-empty">
                  No sections have been added to this module.
                </p>
              ) : (
                <ol className="program-module-library__section-list">
                  {selectedModule.sections.map((section) => (
                    <li key={section.id}>
                      <div>
                        <strong>{section.title}</strong>
                        <p>{section.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="program-module-library__preview-section">
              <div className="program-module-library__preview-heading">
                <h3>Learning materials</h3>

                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => {
                    handleCloseDetails()
                    onNavigate('/program-lead/learning-materials')
                  }}
                >
                  Manage materials
                </Button>
              </div>

              {selectedModule.materials.length === 0 ? (
                <p className="program-module-library__preview-empty">
                  No learning materials have been added to this module.
                </p>
              ) : (
                <div className="program-module-library__material-list">
                  {selectedModule.materials.map((material) => (
                    <div
                      className="program-module-library__material-item"
                      key={material.id}
                    >
                      <div className="program-module-library__material-icon">
                        {material.type === 'Video' ? (
                          <Video size={20} />
                        ) : (
                          <Document size={20} />
                        )}
                      </div>

                      <div>
                        <strong>{material.title}</strong>
                        <span>
                          {material.type} ·{' '}
                          {material.fileName || 'External resource'}
                        </span>
                      </div>

                      <Tag type="gray">{material.type}</Tag>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ModuleLibraryPage
