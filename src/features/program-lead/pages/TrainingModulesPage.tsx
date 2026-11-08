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

import type { ProgramModule } from '../types/program-lead.types'

import { programModules as initialModules } from '../data/programLeadDashboardData'

import '../styles/program-lead-modules.scss'

interface TrainingModulesPageProps {
  title: string
  onNavigate: (path: string) => void
}

type ModuleStatus = 'Draft' | 'Published' | 'Incomplete content'

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
    case 'Published':
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

const TrainingModulesPage = ({
  title,
  onNavigate,
}: TrainingModulesPageProps) => {
  const [modules, setModules] = useState<ProgramModule[]>(initialModules)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModule, setEditingModule] =
    useState<ProgramModule | null>(null)

  const [selectedModule, setSelectedModule] =
    useState<ProgramModule | null>(null)

  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleCategory, setModuleCategory] = useState('EmONC')

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

  const openCreateModal = () => {
    setEditingModule(null)
    setModuleTitle('')
    setModuleCategory('EmONC')
    setIsModalOpen(true)
  }

  const openEditModal = (module: ProgramModule) => {
    setEditingModule(module)
    setModuleTitle(module.title)
    setModuleCategory(module.category)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingModule(null)
    setModuleTitle('')
    setModuleCategory('EmONC')
  }

  const handleSaveModule = () => {
    const trimmedTitle = moduleTitle.trim()

    if (!trimmedTitle) return

    const currentDate = new Date().toISOString()

    if (editingModule) {
      const updatedModule: ProgramModule = {
        ...editingModule,
        title: trimmedTitle,
        category: moduleCategory,
        updatedAt: currentDate,
      }

      setModules((currentModules) =>
        currentModules.map((module) =>
          module.id === editingModule.id ? updatedModule : module,
        ),
      )

      setSelectedModule((currentSelected) =>
        currentSelected?.id === editingModule.id
          ? updatedModule
          : currentSelected,
      )
    } else {
      const newModule: ProgramModule = {
        id: `MOD-${Date.now().toString().slice(-6)}`,
        title: trimmedTitle,
        category: moduleCategory,
        sectionsCount: 0,
        materialsCount: 0,
        status: 'Draft',
        updatedAt: currentDate,
      }

      setModules((currentModules) => [newModule, ...currentModules])
      setSelectedModule(newModule)
    }

    closeModal()
  }

  const handleViewModule = (module: ProgramModule) => {
    setSelectedModule(module)
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
        >
          Create module
        </Button>
      </div>

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
          <div className="program-modules__stat-icon program-modules__stat-icon--published">
            <CheckmarkFilled size={20} />
          </div>

          <div>
            <span className="program-modules__stat-label">
              Published
            </span>

            <strong className="program-modules__stat-value">
              {statistics.published}
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
              <SelectItem value="Published" text="Published" />
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
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="program-modules__management">
        <div className="program-modules__management-copy">
          <h2>Continue building your training content</h2>

          <p>
            Modules are organized into sections and supported by learning
            materials. Complete these steps before publishing content to
            the Module Library.
          </p>
        </div>

        <div className="program-modules__management-actions">
          <Button
            kind="tertiary"
            renderIcon={DocumentMultiple_01}
            onClick={() =>
              onNavigate('/program-lead/module-sections')
            }
          >
            Manage module sections
          </Button>

          <Button
            kind="tertiary"
            renderIcon={Document}
            onClick={() =>
              onNavigate('/program-lead/learning-materials')
            }
          >
            Manage learning materials
          </Button>
        </div>
      </section>

      {selectedModule && (
        <section className="program-modules__details">
          <div className="program-modules__details-header">
            <div>
              <span className="program-modules__eyebrow">
                MODULE DETAILS
              </span>

              <h2>{selectedModule.title}</h2>

              <p>{selectedModule.id}</p>
            </div>

            <div className="program-modules__details-actions">
              <Button
                kind="tertiary"
                size="sm"
                renderIcon={Edit}
                onClick={() => openEditModal(selectedModule)}
              >
                Edit module
              </Button>

              <Button
                kind="ghost"
                size="sm"
                onClick={() => setSelectedModule(null)}
              >
                Close
              </Button>
            </div>
          </div>

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
              size="sm"
              onClick={() =>
                onNavigate('/program-lead/module-sections')
              }
            >
              Open module sections
            </Button>

            <Button
              kind="tertiary"
              size="sm"
              onClick={() =>
                onNavigate('/program-lead/learning-materials')
              }
            >
              Open learning materials
            </Button>
          </div>
        </section>
      )}

      <div className="program-modules__demo-notice">
        <span className="program-modules__demo-indicator" />

        <p>
          Demonstration mode: module changes are held in local page state.
          They are not yet saved to the backend.
        </p>
      </div>

      <Modal
        open={isModalOpen}
        modalHeading={
          editingModule ? 'Edit training module' : 'Create training module'
        }
        primaryButtonText={
          editingModule ? 'Save changes' : 'Create module'
        }
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!moduleTitle.trim()}
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
          />

          <Select
            id="training-module-category"
            labelText="Module category"
            value={moduleCategory}
            onChange={(event) => setModuleCategory(event.target.value)}
          >
            <SelectItem value="EmONC" text="EmONC" />
            <SelectItem value="Basic EmONC" text="Basic EmONC" />
            <SelectItem value="Comprehensive EmONC" text="Comprehensive EmONC" />
            <SelectItem value="Maternal Health" text="Maternal Health" />
            <SelectItem value="Newborn Health" text="Newborn Health" />
            <SelectItem value="Other" text="Other" />
          </Select>

          <div className="program-modules__form-note">
            New modules are created with Draft status. Add the required
            sections and learning materials before publishing.
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TrainingModulesPage