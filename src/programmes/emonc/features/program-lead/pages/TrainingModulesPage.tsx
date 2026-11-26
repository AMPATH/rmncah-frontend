
import { useMemo, useState } from 'react'

import {
  Button,
  Modal,
  Search,
  Select,
  SelectItem,
  Tag,
  TextInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react'

import {
  Add,
  Edit,
  Document,
  DocumentMultiple_01,
  CheckmarkFilled,
} from '@carbon/icons-react'

import type { ProgramModule } from '../types/program-lead.types.ts'
import type { TrainingModule } from '../../../data/models'

import { useCurriculum } from '../../../data/providers/CurriculumContext'

import '../styles/program-lead-modules.scss'

interface TrainingModulesPageProps {
  title: string
  onNavigate: (path: string) => void
}

type ModuleStatus = ProgramModule['status']

type CurriculumDisplayModule = TrainingModule & {
  displayOrder: number
}

const tableHeaders = [
  'Module ID',
  'Training module',
  'Category',
  'Sections',
  'Materials',
  'Status',
  'Last updated',
  'Actions',
]

const getStatusTagType = (status: ModuleStatus) => {
  switch (status) {
    case 'Completed':
      return 'green' as const

    case 'Incomplete content':
      return 'red' as const

    default:
      return 'gray' as const
  }
}

const formatDate = (date: string) => {
  if (!date) return '—'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const mapTrainingModule = (
  module: TrainingModule,
  sections: ReturnType<typeof useCurriculum>['sections'],
  materials: ReturnType<typeof useCurriculum>['materials'],
): ProgramModule => {
  const sectionsCount = sections.filter(
    (section) => section.moduleId === module.id,
  ).length

  const materialsCount = materials.filter(
    (material) => material.moduleId === module.id,
  ).length

  let status: ModuleStatus

  if (module.status === 'Draft') {
    status = 'Draft'
  } else if (module.status === 'Incomplete content') {
    status = 'Incomplete content'
  } else if (sectionsCount > 0 && materialsCount > 0) {
    status = 'Completed'
  } else {
    status = 'Incomplete content'
  }

  return {
    id: module.id,
    title: module.title,
    category: module.category,
    sectionsCount,
    materialsCount,
    status,
    updatedAt: module.updatedAt,
  }
}

const TrainingModulesPage = ({
  title,
  onNavigate,
}: TrainingModulesPageProps) => {
  const {
    modules: curriculumModules,
    sections,
    materials,
    loading,
    error,
    createModule,
    updateModule,
    refresh,
  } = useCurriculum()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [editingModule, setEditingModule] =
    useState<ProgramModule | null>(null)

  const [selectedModuleId, setSelectedModuleId] =
    useState<string | null>(null)

  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleCategory, setModuleCategory] = useState('EmONC')

  /**
   * Display the official curriculum in its defined sequence.
   */
  const officialModules = useMemo<CurriculumDisplayModule[]>(() => {
    return curriculumModules
      .map((module, index) => ({
        ...module,
        displayOrder: module.sequence ?? index + 1,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }, [curriculumModules])

  /**
   * Derive the directory from the shared curriculum records.
   */
  const modules = useMemo<ProgramModule[]>(() => {
    return curriculumModules.map((module) =>
      mapTrainingModule(module, sections, materials),
    )
  }, [curriculumModules, sections, materials])

  /**
   * Resolve the selected module using its database ID.
   */
  const selectedModule = useMemo(() => {
    if (!selectedModuleId) return null

    return (
      modules.find((module) => module.id === selectedModuleId) ?? null
    )
  }, [modules, selectedModuleId])

  /**
   * Apply search and status filters.
   */
  const filteredModules = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return modules.filter((module) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        module.title.toLowerCase().includes(normalizedSearch) ||
        module.category.toLowerCase().includes(normalizedSearch) ||
        module.id.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'all' || module.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [modules, searchTerm, statusFilter])

  /**
   * Calculate directory statistics.
   */
  const statistics = useMemo(() => {
    return {
      total: modules.length,
      completed: modules.filter(
        (module) => module.status === 'Completed',
      ).length,
      drafts: modules.filter(
        (module) => module.status === 'Draft',
      ).length,
      incomplete: modules.filter(
        (module) => module.status === 'Incomplete content',
      ).length,
    }
  }, [modules])

  /**
   * Open the create module modal.
   */
  const openCreateModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedModuleId(null)

    setEditingModule(null)
    setModuleTitle('')
    setModuleCategory('EmONC')
    setActionError(null)

    setIsModalOpen(true)
  }

  /**
   * Open the edit module modal.
   */
  const openEditModal = (module: ProgramModule) => {
    setIsDetailsModalOpen(false)
    setSelectedModuleId(null)

    setEditingModule(module)
    setModuleTitle(module.title)
    setModuleCategory(module.category)
    setActionError(null)

    setIsModalOpen(true)
  }

  /**
   * Close the create or edit modal.
   */
  const closeModal = () => {
    if (isSaving) return

    setIsModalOpen(false)
    setEditingModule(null)
    setModuleTitle('')
    setModuleCategory('EmONC')
    setActionError(null)
  }

  /**
   * Save module changes through the shared curriculum provider.
   */
  const handleSaveModule = async () => {
    const trimmedTitle = moduleTitle.trim()

    if (!trimmedTitle || isSaving) return

    const currentDate = new Date().toISOString()

    setIsSaving(true)
    setActionError(null)

    try {
      if (editingModule) {
        await updateModule(editingModule.id, {
          title: trimmedTitle,
          category: moduleCategory,
          updatedAt: currentDate,
        })
      } else {
        const newModule: TrainingModule = {
          id: crypto.randomUUID(),
          title: trimmedTitle,
          category: moduleCategory,
          description: '',
          status: 'Draft',
          publishedAt: null,
          createdAt: currentDate,
          updatedAt: currentDate,
        }

        await createModule(newModule)
      }

      await refresh()

      setIsModalOpen(false)
      setEditingModule(null)
      setModuleTitle('')
      setModuleCategory('EmONC')
    } catch (saveError) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save the training module. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Open the selected module details modal.
   */
  const handleViewModule = (module: ProgramModule) => {
    setSelectedModuleId(module.id)
    setIsDetailsModalOpen(true)
  }

  /**
   * Close the module details modal.
   */
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedModuleId(null)
  }

  /**
   * Navigate to module sections.
   */
  const openModuleSections = () => {
    closeDetailsModal()
    onNavigate('/program-lead/module-sections')
  }

  /**
   * Navigate to learning materials.
   */
  const openLearningMaterials = () => {
    closeDetailsModal()
    onNavigate('/program-lead/learning-materials')
  }

  return (
    <div className="program-modules">
      <div className="program-modules__header">
        <div>
          <div className="program-modules__eyebrow">
            PROGRAM CONTENT MANAGEMENT
          </div>

          <h1 className="program-modules__title">{title}</h1>

          <p className="program-modules__description">
            Create, organize and maintain the EmONC training modules used
            throughout the mentorship programme.
          </p>
        </div>

        <Button
          renderIcon={Add}
          onClick={openCreateModal}
          disabled={loading}
        >
          Create module
        </Button>
      </div>

      {error && (
        <div className="program-modules__demo-notice" role="alert">
          <span className="program-modules__demo-indicator" />
          <p>{error}</p>
        </div>
      )}

      {actionError && (
        <div className="program-modules__demo-notice" role="alert">
          <span className="program-modules__demo-indicator" />
          <p>{actionError}</p>
        </div>
      )}

      <section className="program-modules__official-curriculum">
        <div className="program-modules__official-header">
          <div>
            <span className="program-modules__eyebrow">
              APPROVED TRAINING FRAMEWORK
            </span>

            <h2>Official EmONC curriculum</h2>

            <p>
              The approved training modules from the MNCH Mentorship Guide.
              This curriculum is loaded from the shared EmONC curriculum
              database and is also used by the training module directory.
            </p>
          </div>

          <span className="program-modules__official-count">
            {officialModules.length} modules
          </span>
        </div>

        {loading ? (
          <div className="program-modules__empty">
            Loading official curriculum...
          </div>
        ) : officialModules.length === 0 ? (
          <div className="program-modules__empty">
            No curriculum modules are available.
          </div>
        ) : (
          <ol className="program-modules__official-list">
            {officialModules.map((module) => (
              <li
                key={module.id}
                className="program-modules__official-item"
              >
                <span className="program-modules__official-order">
                  {String(module.displayOrder).padStart(2, '0')}
                </span>

                <div className="program-modules__official-copy">
                  <span className="program-modules__official-id">
                    {module.id}
                  </span>

                  <strong>{module.title}</strong>

                  {module.subTrackCount && (
                    <span className="program-modules__official-subtracks">
                      {module.subTrackCount} PPH sub-tracks
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="program-modules__statistics">
        <div className="program-modules__stat-card">
          <div className="program-modules__stat-icon">
            <Document size={20} />
          </div>

          <div>
            <span className="program-modules__stat-label">
              Total modules
            </span>

            <strong className="program-modules__stat-value">
              {statistics.total}
            </strong>
          </div>
        </div>

        <div className="program-modules__stat-card">
          <div className="program-modules__stat-icon program-modules__stat-icon--completed">
            <CheckmarkFilled size={20} />
          </div>

          <div>
            <span className="program-modules__stat-label">
              Completed
            </span>

            <strong className="program-modules__stat-value">
              {statistics.completed}
            </strong>
          </div>
        </div>

        <div className="program-modules__stat-card">
          <div className="program-modules__stat-icon">
            <DocumentMultiple_01 size={20} />
          </div>

          <div>
            <span className="program-modules__stat-label">
              Drafts
            </span>

            <strong className="program-modules__stat-value">
              {statistics.drafts}
            </strong>
          </div>
        </div>

        <div className="program-modules__stat-card">
          <div className="program-modules__stat-icon program-modules__stat-icon--incomplete">
            <Document size={20} />
          </div>

          <div>
            <span className="program-modules__stat-label">
              Incomplete content
            </span>

            <strong className="program-modules__stat-value">
              {statistics.incomplete}
            </strong>
          </div>
        </div>
      </section>

      <section className="program-modules__directory">
        <div className="program-modules__directory-header">
          <div>
            <h2>Training module directory</h2>

            <p>
              Browse and manage the training content available to the
              mentorship programme.
            </p>
          </div>

          <span className="program-modules__record-count">
            {filteredModules.length} of {modules.length} modules
          </span>
        </div>

        <div className="program-modules__toolbar">
          <div className="program-modules__search">
            <Search
              id="module-search"
              labelText="Search modules"
              placeholder="Search by module name, category or ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="program-modules__filter">
            <Select
              id="module-status-filter"
              labelText="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
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

        <div className="program-modules__table-container">
          <Table size="lg" useZebraStyles={false}>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableHeader key={header}>
                    {header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="program-modules__empty">
                      Loading training modules...
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredModules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <span className="program-modules__module-id">
                          {module.id}
                        </span>
                      </TableCell>

                      <TableCell>
                        <button
                          type="button"
                          className="program-modules__module-name"
                          onClick={() => handleViewModule(module)}
                        >
                          {module.title}
                        </button>
                      </TableCell>

                      <TableCell>{module.category}</TableCell>

                      <TableCell>{module.sectionsCount}</TableCell>

                      <TableCell>{module.materialsCount}</TableCell>

                      <TableCell>
                        <Tag type={getStatusTagType(module.status)}>
                          {module.status}
                        </Tag>
                      </TableCell>

                      <TableCell>
                        {formatDate(module.updatedAt)}
                      </TableCell>

                      <TableCell>
                        <div className="program-modules__row-actions">
                          <Button
                            kind="ghost"
                            size="sm"
                            onClick={() => handleViewModule(module)}
                          >
                            View
                          </Button>

                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Edit}
                            iconDescription="Edit module"
                            hasIconOnly
                            onClick={() => openEditModal(module)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredModules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <div className="program-modules__empty">
                          <Document size={28} />

                          <strong>No training modules found</strong>

                          <p>
                            Try changing your search or status filter, or
                            create a new training module.
                          </p>

                          <Button
                            kind="tertiary"
                            size="sm"
                            renderIcon={Add}
                            onClick={openCreateModal}
                          >
                            Create module
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="program-modules__management">
        <div className="program-modules__management-copy">
          <h2>Continue building your training content</h2>

          <p>
            Modules are organized into sections and supported by learning
            materials. Add and complete these resources to improve curriculum
            readiness in the Module Library.
          </p>
        </div>

        <div className="program-modules__management-actions">
          <Button
            kind="tertiary"
            renderIcon={DocumentMultiple_01}
            onClick={openModuleSections}
          >
            Manage module sections
          </Button>

          <Button
            kind="tertiary"
            renderIcon={Document}
            onClick={openLearningMaterials}
          >
            Manage learning materials
          </Button>
        </div>
      </section>

      <div className="program-modules__demo-notice">
        <span className="program-modules__demo-indicator" />

        <p>
          Development mode: curriculum changes are currently stored in the
          local JSON Server development database. Production backend
          integration is planned.
        </p>
      </div>

      {/* View module details */}
      <Modal
        open={isDetailsModalOpen}
        modalHeading="Training module details"
        primaryButtonText="Close"
        onRequestClose={closeDetailsModal}
        onRequestSubmit={closeDetailsModal}
      >
        {selectedModule && (
          <div className="program-modules__details">
            <h3>{selectedModule.title}</h3>

            <p>{selectedModule.id}</p>

            <div className="program-modules__details-grid">
              <div>
                <span>Category</span>
                <strong>{selectedModule.category}</strong>
              </div>

              <div>
                <span>Status</span>
                <Tag type={getStatusTagType(selectedModule.status)}>
                  {selectedModule.status}
                </Tag>
              </div>

              <div>
                <span>Module sections</span>
                <strong>{selectedModule.sectionsCount}</strong>
              </div>

              <div>
                <span>Learning materials</span>
                <strong>{selectedModule.materialsCount}</strong>
              </div>

              <div>
                <span>Last updated</span>
                <strong>{formatDate(selectedModule.updatedAt)}</strong>
              </div>
            </div>

            <div className="program-modules__details-footer">
              <Button
                kind="tertiary"
                onClick={openModuleSections}
              >
                Manage module sections
              </Button>

              <Button
                kind="tertiary"
                onClick={openLearningMaterials}
              >
                Manage learning materials
              </Button>

              <Button
                kind="tertiary"
                renderIcon={Edit}
                onClick={() => openEditModal(selectedModule)}
              >
                Edit module
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create and edit module */}
      <Modal
        open={isModalOpen}
        modalHeading={
          editingModule ? 'Edit training module' : 'Create training module'
        }
        primaryButtonText={
          isSaving
            ? 'Saving...'
            : editingModule
              ? 'Save changes'
              : 'Create module'
        }
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!moduleTitle.trim() || isSaving}
        onRequestClose={closeModal}
        onRequestSubmit={handleSaveModule}
      >
        <div className="program-modules__form">
          <p>
            Provide the basic information for this training module.
            You can add sections and learning materials separately.
          </p>

          <TextInput
            id="training-module-title"
            labelText="Module title"
            placeholder="e.g. Basic Emergency Obstetric Care"
            value={moduleTitle}
            onChange={(event) => setModuleTitle(event.target.value)}
            disabled={isSaving}
          />

          <Select
            id="training-module-category"
            labelText="Module category"
            value={moduleCategory}
            onChange={(event) => setModuleCategory(event.target.value)}
            disabled={isSaving}
          >
            <SelectItem value="EmONC" text="EmONC" />
            <SelectItem value="Basic EmONC" text="Basic EmONC" />
            <SelectItem
              value="Comprehensive EmONC"
              text="Comprehensive EmONC"
            />
            <SelectItem value="Maternal Health" text="Maternal Health" />
            <SelectItem value="Newborn Health" text="Newborn Health" />
            <SelectItem value="Other" text="Other" />
          </Select>

          <div className="program-modules__form-note">
            New modules start as Draft. Add sections and learning
            materials to move a module towards content completion.
          </div>

          {actionError && (
            <p role="alert">{actionError}</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default TrainingModulesPage
