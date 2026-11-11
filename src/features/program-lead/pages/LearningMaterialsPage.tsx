import { useMemo, useState } from 'react'

import {
  Button,
  Modal,
  Search,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  TextArea,
  TextInput,
} from '@carbon/react'

import {
  Add,
  Edit,
  TrashCan,
  Document,
  Video,
  CheckmarkFilled,
} from '@carbon/icons-react'

import type {
  ProgramLearningMaterial,
  LearningMaterialType,
} from '../types/program-lead.types'

import { programModules } from '../data/programLeadDashboardData'
import { initialModuleSections } from '../data/moduleSectionsData'
import { initialLearningMaterials } from '../data/learningMaterialsData'

import '../styles/program-lead-learning-materials.scss'

interface LearningMaterialsPageProps {
  title: string
}

const materialTypes: LearningMaterialType[] = [
  'E-book',
  'Slides',
  'Video',
]

const tableHeaders = [
  'Resource',
  'Module',
  'Section',
  'Type',
  'File',
  'Last updated',
  'Actions',
]

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

const getMaterialTagType = (type: LearningMaterialType) => {
  switch (type) {
    case 'E-book':
      return 'blue' as const

    case 'Slides':
      return 'purple' as const

    case 'Video':
      return 'teal' as const

    default:
      return 'gray' as const
  }
}

const LearningMaterialsPage = ({
  title,
}: LearningMaterialsPageProps) => {
  const [materials, setMaterials] =
    useState<ProgramLearningMaterial[]>(initialLearningMaterials)

  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [editingMaterial, setEditingMaterial] =
    useState<ProgramLearningMaterial | null>(null)

  const [materialToDelete, setMaterialToDelete] =
    useState<ProgramLearningMaterial | null>(null)

  const [materialTitle, setMaterialTitle] = useState('')
  const [materialDescription, setMaterialDescription] = useState('')
  const [materialType, setMaterialType] =
    useState<LearningMaterialType>('E-book')

  const [materialModuleId, setMaterialModuleId] = useState(
    programModules[0]?.id ?? '',
  )

  const [materialSectionId, setMaterialSectionId] = useState('')

  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')

  const availableSections = useMemo(() => {
    return initialModuleSections
      .filter((section) => section.moduleId === materialModuleId)
      .sort((a, b) => a.sequence - b.sequence)
  }, [materialModuleId])

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return materials.filter((material) => {
      const module = programModules.find(
        (item) => item.id === material.moduleId,
      )

      const section = initialModuleSections.find(
        (item) => item.id === material.sectionId,
      )

      const matchesSearch =
        normalizedSearch.length === 0 ||
        material.title.toLowerCase().includes(normalizedSearch) ||
        material.fileName.toLowerCase().includes(normalizedSearch) ||
        material.id.toLowerCase().includes(normalizedSearch) ||
        (module?.title.toLowerCase().includes(normalizedSearch) ?? false) ||
        (section?.title.toLowerCase().includes(normalizedSearch) ?? false)

      const matchesModule =
        moduleFilter === 'all' || material.moduleId === moduleFilter

      const matchesType =
        typeFilter === 'all' || material.type === typeFilter

      return matchesSearch && matchesModule && matchesType
    })
  }, [materials, searchTerm, moduleFilter, typeFilter])

  const statistics = useMemo(() => {
    return {
      total: materials.length,
      ebooks: materials.filter(
        (material) => material.type === 'E-book',
      ).length,
      slides: materials.filter(
        (material) => material.type === 'Slides',
      ).length,
      videos: materials.filter(
        (material) => material.type === 'Video',
      ).length,
    }
  }, [materials])

  const getModuleTitle = (moduleId: string) => {
    return (
      programModules.find((module) => module.id === moduleId)?.title ??
      'Unknown module'
    )
  }

  const getSectionTitle = (sectionId: string) => {
    if (!sectionId) return 'Module-level resource'

    return (
      initialModuleSections.find(
        (section) => section.id === sectionId,
      )?.title ?? 'Unknown section'
    )
  }

  const resetForm = () => {
    setMaterialTitle('')
    setMaterialDescription('')
    setMaterialType('E-book')
    setMaterialModuleId(programModules[0]?.id ?? '')
    setMaterialSectionId('')
    setFileName('')
    setFileSize('')
    setResourceUrl('')
    setEditingMaterial(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (material: ProgramLearningMaterial) => {
    setEditingMaterial(material)
    setMaterialTitle(material.title)
    setMaterialDescription(material.description)
    setMaterialType(material.type)
    setMaterialModuleId(material.moduleId)
    setMaterialSectionId(material.sectionId)
    setFileName(material.fileName)
    setFileSize(material.fileSize)
    setResourceUrl(material.resourceUrl)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) return

    const sizeInMB = selectedFile.size / (1024 * 1024)

    setFileName(selectedFile.name)

    setFileSize(
      sizeInMB < 1
        ? `${Math.max(1, Math.round(selectedFile.size / 1024))} KB`
        : `${sizeInMB.toFixed(1)} MB`,
    )
  }

  const handleSaveMaterial = () => {
    const trimmedTitle = materialTitle.trim()

    if (!trimmedTitle || !materialModuleId || !fileName) return

    const now = new Date().toISOString().slice(0, 10)

    if (editingMaterial) {
      const updatedMaterial: ProgramLearningMaterial = {
        ...editingMaterial,
        title: trimmedTitle,
        description: materialDescription.trim(),
        type: materialType,
        moduleId: materialModuleId,
        sectionId: materialSectionId,
        fileName,
        fileSize,
        resourceUrl: resourceUrl.trim(),
        updatedAt: now,
      }

      setMaterials((currentMaterials) =>
        currentMaterials.map((material) =>
          material.id === editingMaterial.id
            ? updatedMaterial
            : material,
        ),
      )
    } else {
      const newMaterial: ProgramLearningMaterial = {
        id: `MAT-${Date.now().toString().slice(-6)}`,
        title: trimmedTitle,
        description: materialDescription.trim(),
        type: materialType,
        moduleId: materialModuleId,
        sectionId: materialSectionId,
        fileName,
        fileSize,
        resourceUrl: resourceUrl.trim(),
        updatedAt: now,
      }

      setMaterials((currentMaterials) => [
        newMaterial,
        ...currentMaterials,
      ])
    }

    closeModal()
  }

  const handleDeleteMaterial = () => {
    if (!materialToDelete) return

    setMaterials((currentMaterials) =>
      currentMaterials.filter(
        (material) => material.id !== materialToDelete.id,
      ),
    )

    setMaterialToDelete(null)
  }

  const handleModuleChange = (moduleId: string) => {
    setMaterialModuleId(moduleId)
    setMaterialSectionId('')
  }

  const isFormValid =
    materialTitle.trim().length > 0 &&
    materialModuleId.length > 0 &&
    fileName.length > 0

  return (
    <div className="program-learning-materials">
      <header className="program-learning-materials__header">
        <div>
          <span className="program-learning-materials__eyebrow">
            PROGRAM CONTENT MANAGEMENT
          </span>

          <h1 className="program-learning-materials__title">
            {title}
          </h1>

          <p className="program-learning-materials__description">
            Organize e-books, presentation slides and training videos
            under their relevant modules and learning sections.
          </p>
        </div>

        <Button
          renderIcon={Add}
          onClick={openCreateModal}
        >
          Add learning material
        </Button>
      </header>

      <section className="program-learning-materials__statistics">
        <div className="program-learning-materials__stat-card">
          <div className="program-learning-materials__stat-icon">
            <Document size={20} />
          </div>

          <div>
            <span>Total materials</span>
            <strong>{statistics.total}</strong>
          </div>
        </div>

        <div className="program-learning-materials__stat-card">
          <div className="program-learning-materials__stat-icon program-learning-materials__stat-icon--ebook">
            <Document size={20} />
          </div>

          <div>
            <span>E-books</span>
            <strong>{statistics.ebooks}</strong>
          </div>
        </div>

        <div className="program-learning-materials__stat-card">
          <div className="program-learning-materials__stat-icon program-learning-materials__stat-icon--slides">
            <Document size={20} />
          </div>

          <div>
            <span>Slide decks</span>
            <strong>{statistics.slides}</strong>
          </div>
        </div>

        <div className="program-learning-materials__stat-card">
          <div className="program-learning-materials__stat-icon program-learning-materials__stat-icon--video">
            <Video size={20} />
          </div>

          <div>
            <span>Training videos</span>
            <strong>{statistics.videos}</strong>
          </div>
        </div>
      </section>

      <section className="program-learning-materials__directory">
        <div className="program-learning-materials__directory-header">
          <div>
            <h2>Learning material directory</h2>

            <p>
              Browse and manage resources assigned to the training
              programme.
            </p>
          </div>

          <span className="program-learning-materials__record-count">
            {filteredMaterials.length} of {materials.length} materials
          </span>
        </div>

        <div className="program-learning-materials__toolbar">
          <div className="program-learning-materials__search">
            <Search
              id="learning-material-search"
              labelText="Search learning materials"
              placeholder="Search by title, file, module or section"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="program-learning-materials__filter">
            <Select
              id="learning-material-module-filter"
              labelText="Filter by module"
              value={moduleFilter}
              onChange={(event) =>
                setModuleFilter(event.target.value)
              }
            >
              <SelectItem value="all" text="All modules" />

              {programModules.map((module) => (
                <SelectItem
                  key={module.id}
                  value={module.id}
                  text={module.title}
                />
              ))}
            </Select>
          </div>

          <div className="program-learning-materials__filter">
            <Select
              id="learning-material-type-filter"
              labelText="Filter by type"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <SelectItem value="all" text="All types" />

              {materialTypes.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  text={type}
                />
              ))}
            </Select>
          </div>
        </div>

        <div className="program-learning-materials__table-container">
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
              {filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <div className="program-learning-materials__resource">
                      <strong>{material.title}</strong>
                      <span>{material.id}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="program-learning-materials__module-name">
                      {getModuleTitle(material.moduleId)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="program-learning-materials__section-name">
                      {getSectionTitle(material.sectionId)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Tag type={getMaterialTagType(material.type)}>
                      {material.type}
                    </Tag>
                  </TableCell>

                  <TableCell>
                    <div className="program-learning-materials__file">
                      <span>{material.fileName}</span>
                      <small>{material.fileSize}</small>
                    </div>
                  </TableCell>

                  <TableCell>
                    {formatDate(material.updatedAt)}
                  </TableCell>

                  <TableCell>
                    <div className="program-learning-materials__actions">
                      {material.resourceUrl && (
                        <a
                          className="program-learning-materials__resource-link"
                          href={material.resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      )}

                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={Edit}
                        iconDescription="Edit material"
                        tooltipPosition="left"
                        onClick={() => openEditModal(material)}
                      />

                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={TrashCan}
                        iconDescription="Delete material"
                        tooltipPosition="left"
                        onClick={() =>
                          setMaterialToDelete(material)
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredMaterials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length}>
                    <div className="program-learning-materials__empty">
                      <Document size={32} />

                      <h3>No learning materials found</h3>

                      <p>
                        Try changing your search or filters, or add a
                        new learning material.
                      </p>

                      <Button
                        kind="tertiary"
                        renderIcon={Add}
                        onClick={openCreateModal}
                      >
                        Add learning material
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="program-learning-materials__notice">
        <CheckmarkFilled size={18} />

        <p>
          <strong>Resource organization:</strong> Materials are associated
          with their training module and optional learning section.
          Actual file uploads will be connected to backend storage.
        </p>
      </div>

      <Modal
        open={isModalOpen}
        modalHeading={
          editingMaterial
            ? 'Edit learning material'
            : 'Add learning material'
        }
        primaryButtonText={
          editingMaterial ? 'Save changes' : 'Add material'
        }
        secondaryButtonText="Cancel"
        onRequestClose={closeModal}
        onRequestSubmit={handleSaveMaterial}
        primaryButtonDisabled={!isFormValid}
        size="lg"
      >
        <div className="program-learning-materials__form">
          <TextInput
            id="material-title"
            labelText="Material title"
            placeholder="Enter a descriptive resource title"
            value={materialTitle}
            onChange={(event) =>
              setMaterialTitle(event.target.value)
            }
          />

          <TextArea
            id="material-description"
            labelText="Description"
            placeholder="Describe what this resource covers"
            rows={3}
            value={materialDescription}
            onChange={(event) =>
              setMaterialDescription(event.target.value)
            }
          />

          <div className="program-learning-materials__form-row">
            <Select
              id="material-type"
              labelText="Material type"
              value={materialType}
              onChange={(event) =>
                setMaterialType(
                  event.target.value as LearningMaterialType,
                )
              }
            >
              {materialTypes.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  text={type}
                />
              ))}
            </Select>

            <Select
              id="material-module"
              labelText="Training module"
              value={materialModuleId}
              onChange={(event) =>
                handleModuleChange(event.target.value)
              }
            >
              {programModules.map((module) => (
                <SelectItem
                  key={module.id}
                  value={module.id}
                  text={module.title}
                />
              ))}
            </Select>
          </div>

          <Select
            id="material-section"
            labelText="Module section (optional)"
            value={materialSectionId}
            onChange={(event) =>
              setMaterialSectionId(event.target.value)
            }
          >
            <SelectItem
              value=""
              text="Module-level resource"
            />

            {availableSections.map((section) => (
              <SelectItem
                key={section.id}
                value={section.id}
                text={`${section.sequence}. ${section.title}`}
              />
            ))}
          </Select>

          <div className="program-learning-materials__file-field">
            <label htmlFor="material-file">
              Select resource file
            </label>

            <input
              id="material-file"
              type="file"
              accept=".pdf,.ppt,.pptx,.mp4,.mov,.webm"
              onChange={handleFileSelection}
            />

            <span>
              Supported formats: PDF, PPT, PPTX, MP4, MOV and WEBM.
            </span>

            {fileName && (
              <div className="program-learning-materials__selected-file">
                <Document size={18} />

                <div>
                  <strong>{fileName}</strong>
                  <span>{fileSize}</span>
                </div>
              </div>
            )}
          </div>

          <TextInput
            id="material-resource-url"
            labelText="External resource URL (optional)"
            placeholder="https://example.com/resource"
            value={resourceUrl}
            onChange={(event) =>
              setResourceUrl(event.target.value)
            }
          />

          <p className="program-learning-materials__form-note">
            Demo mode: selecting a file records its name and size only.
            It does not upload or permanently store the file.
          </p>
        </div>
      </Modal>

      <Modal
        open={Boolean(materialToDelete)}
        modalHeading="Delete learning material?"
        primaryButtonText="Delete material"
        secondaryButtonText="Cancel"
        danger
        onRequestClose={() => setMaterialToDelete(null)}
        onRequestSubmit={handleDeleteMaterial}
      >
        <p>
          Are you sure you want to delete{' '}
          <strong>{materialToDelete?.title}</strong>? This action will
          remove the material from this demo directory.
        </p>
      </Modal>
    </div>
  )
}

export default LearningMaterialsPage