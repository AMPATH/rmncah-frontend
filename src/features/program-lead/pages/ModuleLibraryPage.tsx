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
  ProgramModule,
  ProgramModuleStatus,
} from '../types/program-lead.types'

import { programModules } from '../data/programLeadDashboardData'
import { initialModuleSections } from '../data/moduleSectionsData'
import { initialLearningMaterials } from '../data/learningMaterialsData'

import '../styles/program-lead-library.scss'

interface ModuleLibraryPageProps {
  title: string
  onNavigate: (path: string) => void
}

type LibraryFilter = 'all' | 'Published' | 'Draft' | 'Incomplete content'

const getStatusTagType = (status: ProgramModuleStatus) => {
  switch (status) {
    case 'Published':
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
  const [modules, setModules] =
    useState<ProgramModule[]>(programModules)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<LibraryFilter>('all')

  const [selectedModule, setSelectedModule] =
    useState<ProgramModule | null>(null)

  const moduleContent = useMemo(() => {
    return modules.map((module) => {
      const sections = initialModuleSections
        .filter((section) => section.moduleId === module.id)
        .sort((a, b) => a.sequence - b.sequence)

      const materials = initialLearningMaterials.filter(
        (material) => material.moduleId === module.id,
      )

      const isReady = sections.length > 0 && materials.length > 0

      return {
        ...module,
        sections,
        materials,
        actualSectionsCount: sections.length,
        actualMaterialsCount: materials.length,
        isReady,
      }
    })
  }, [modules])

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

  const statistics = useMemo(() => {
    return {
      total: modules.length,
      published: modules.filter(
        (module) => module.status === 'Published',
      ).length,
      drafts: modules.filter(
        (module) => module.status === 'Draft',
      ).length,
      incomplete: modules.filter(
        (module) => module.status === 'Incomplete content',
      ).length,
    }
  }, [modules])

  const handlePublish = (module: ProgramModule) => {
    const sections = initialModuleSections.filter(
      (section) => section.moduleId === module.id,
    )

    const materials = initialLearningMaterials.filter(
      (material) => material.moduleId === module.id,
    )

    if (sections.length === 0 || materials.length === 0) {
      return
    }

    setModules((currentModules) =>
      currentModules.map((currentModule) =>
        currentModule.id === module.id
          ? {
              ...currentModule,
              status: 'Published',
              updatedAt: new Date().toISOString(),
            }
          : currentModule,
      ),
    )

    setSelectedModule((currentSelected) =>
      currentSelected?.id === module.id
        ? {
            ...currentSelected,
            status: 'Published',
            updatedAt: new Date().toISOString(),
          }
        : currentSelected,
    )
  }

  const handleUnpublish = (module: ProgramModule) => {
    setModules((currentModules) =>
      currentModules.map((currentModule) =>
        currentModule.id === module.id
          ? {
              ...currentModule,
              status: 'Draft',
              updatedAt: new Date().toISOString(),
            }
          : currentModule,
      ),
    )

    setSelectedModule((currentSelected) =>
      currentSelected?.id === module.id
        ? {
            ...currentSelected,
            status: 'Draft',
            updatedAt: new Date().toISOString(),
          }
        : currentSelected,
    )
  }

  const handleOpenDetails = (module: ProgramModule) => {
    setSelectedModule(module)
  }

  const handleCloseDetails = () => {
    setSelectedModule(null)
  }

  const getModuleSections = (moduleId: string) =>
    initialModuleSections
      .filter((section) => section.moduleId === moduleId)
      .sort((a, b) => a.sequence - b.sequence)

  const getModuleMaterials = (moduleId: string) =>
    initialLearningMaterials.filter(
      (material) => material.moduleId === moduleId,
    )

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
            Review training content and manage which EmONC modules are
            available to mentors through the Module Library.
          </p>
        </div>

        <Button
          kind="secondary"
          renderIcon={ArrowRight}
          onClick={() => onNavigate('/program-lead/training-modules')}
        >
          Manage training modules
        </Button>
      </header>

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
              {statistics.total}
            </strong>
          </div>
        </div>

        <div className="program-module-library__stat-card">
          <div className="program-module-library__stat-icon program-module-library__stat-icon--published">
            <CheckmarkFilled size={20} />
          </div>

          <div>
            <span className="program-module-library__stat-label">
              Published
            </span>

            <strong className="program-module-library__stat-value">
              {statistics.published}
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
              {statistics.drafts}
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
              {statistics.incomplete}
            </strong>
          </div>
        </div>
      </section>

      <section className="program-module-library__directory">
        <div className="program-module-library__directory-header">
          <div>
            <h2>Training module library</h2>

            <p>
              Review module content and control publication availability.
            </p>
          </div>

          <Tag type="blue">
            {filteredModules.length} modules
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
              labelText="Publication status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as LibraryFilter)
              }
            >
              <SelectItem value="all" text="All statuses" />
              <SelectItem value="Published" text="Published" />
              <SelectItem value="Draft" text="Draft" />
              <SelectItem
                value="Incomplete content"
                text="Incomplete content"
              />
            </Select>
          </div>
        </div>

        {filteredModules.length === 0 ? (
          <div className="program-module-library__empty">
            <Catalog size={32} />

            <h3>No modules found</h3>

            <p>
              Try another search term or change the publication status
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
                      Add at least one section and one learning material
                      before publishing.
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

                  {module.status === 'Published' ? (
                    <Button
                      kind="tertiary"
                      size="sm"
                      onClick={() => handleUnpublish(module)}
                    >
                      Unpublish
                    </Button>
                  ) : (
                    <Button
                      kind="primary"
                      size="sm"
                      disabled={!module.isReady}
                      onClick={() => handlePublish(module)}
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={selectedModule !== null}
        modalHeading={selectedModule?.title ?? 'Module details'}
        modalLabel="MODULE LIBRARY PREVIEW"
        primaryButtonText={
          selectedModule?.status === 'Published'
            ? 'Unpublish module'
            : 'Publish module'
        }
        secondaryButtonText="Close"
        primaryButtonDisabled={
          selectedModule?.status !== 'Published' &&
          selectedModule !== null &&
          (
            getModuleSections(selectedModule.id).length === 0 ||
            getModuleMaterials(selectedModule.id).length === 0
          )
        }
        onRequestClose={handleCloseDetails}
        onRequestSubmit={() => {
          if (!selectedModule) return

          if (selectedModule.status === 'Published') {
            handleUnpublish(selectedModule)
          } else {
            handlePublish(selectedModule)
          }
        }}
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
                <span>Publication status</span>
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

              {getModuleSections(selectedModule.id).length === 0 ? (
                <p className="program-module-library__preview-empty">
                  No sections have been added to this module.
                </p>
              ) : (
                <ol className="program-module-library__section-list">
                  {getModuleSections(selectedModule.id).map((section) => (
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

              {getModuleMaterials(selectedModule.id).length === 0 ? (
                <p className="program-module-library__preview-empty">
                  No learning materials have been added to this module.
                </p>
              ) : (
                <div className="program-module-library__material-list">
                  {getModuleMaterials(selectedModule.id).map((material) => (
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
                          {material.type} · {material.fileName}
                        </span>
                      </div>

                      <Tag type="gray">{material.type}</Tag>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedModule.status !== 'Published' &&
              (
                getModuleSections(selectedModule.id).length === 0 ||
                getModuleMaterials(selectedModule.id).length === 0
              ) && (
                <div className="program-module-library__readiness program-module-library__readiness--warning">
                  <WarningAlt size={16} />

                  <span>
                    This module is not ready for publication. Add at least
                    one section and one learning material first.
                  </span>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ModuleLibraryPage