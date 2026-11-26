
import { useMemo, useState } from 'react'

import {
  Button,
  Modal,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  TextInput,
  TextArea,
} from '@carbon/react'

import {
  Add,
  Edit,
  TrashCan,
  ArrowUp,
  ArrowDown,
  Document,
  CheckmarkFilled,
} from '@carbon/icons-react'

import type {
  TrainingModule,
  TrainingSection,
} from '../../../data/models'

import { useCurriculum } from '../../../data/providers/CurriculumContext'

import '../styles/program-lead-sections.scss'

interface ModuleSectionsPageProps {
  title: string
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

const ModuleSectionsPage = ({
  title,
}: ModuleSectionsPageProps) => {
  const {
    modules,
    sections,
    materials,
    loading,
    error,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
  } = useCurriculum()

  const [selectedModuleId, setSelectedModuleId] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editingSection, setEditingSection] =
    useState<TrainingSection | null>(null)

  const [sectionToDelete, setSectionToDelete] =
    useState<TrainingSection | null>(null)

  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')

  const [actionError, setActionError] = useState<string | null>(null)

  /**
   * Use the selected module when valid.
   * Otherwise, fall back to the first available module.
   *
   * This avoids synchronizing React state inside an effect.
   */
  const selectedModule = useMemo<TrainingModule | undefined>(() => {
    return (
      modules.find((module) => module.id === selectedModuleId) ??
      modules[0]
    )
  }, [modules, selectedModuleId])

  const activeModuleId = selectedModule?.id ?? ''

  /**
   * Sections are derived from the shared curriculum records.
   * Sorting is based on their persisted sequence.
   */
  const moduleSections = useMemo(() => {
    return sections
      .filter((section) => section.moduleId === activeModuleId)
      .sort((a, b) => a.sequence - b.sequence)
  }, [sections, activeModuleId])

  const statistics = useMemo(() => {
    const modulesWithSections = new Set(
      sections.map((section) => section.moduleId),
    )

    return {
      totalSections: sections.length,
      modulesWithSections: modulesWithSections.size,
      modulesWithoutSections: Math.max(
        modules.length - modulesWithSections.size,
        0,
      ),
    }
  }, [sections, modules])

  const openCreateModal = () => {
    setEditingSection(null)
    setSectionTitle('')
    setSectionDescription('')
    setActionError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (section: TrainingSection) => {
    setEditingSection(section)
    setSectionTitle(section.title)
    setSectionDescription(section.description)
    setActionError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return

    setIsModalOpen(false)
    setEditingSection(null)
    setSectionTitle('')
    setSectionDescription('')
    setActionError(null)
  }

  /**
   * Create or update a section through the shared curriculum provider.
   */
  const handleSaveSection = async () => {
    const trimmedTitle = sectionTitle.trim()

    if (!trimmedTitle || !activeModuleId || isSaving) return

    const now = new Date().toISOString()

    setIsSaving(true)
    setActionError(null)

    try {
      if (editingSection) {
        await updateSection(editingSection.id, {
          title: trimmedTitle,
          description: sectionDescription.trim(),
          updatedAt: now,
        })
      } else {
        const newSection: TrainingSection = {
          id: crypto.randomUUID(),
          moduleId: activeModuleId,
          title: trimmedTitle,
          description: sectionDescription.trim(),
          sequence: moduleSections.length + 1,
          createdAt: now,
          updatedAt: now,
        }

        await createSection(newSection)
      }

      setIsModalOpen(false)
      setEditingSection(null)
      setSectionTitle('')
      setSectionDescription('')
    } catch (saveError) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save the module section. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Persist section ordering through the shared provider.
   */
  const handleMoveSection = async (
    sectionId: string,
    direction: 'up' | 'down',
  ) => {
    if (isSaving) return

    const currentIndex = moduleSections.findIndex(
      (section) => section.id === sectionId,
    )

    if (currentIndex === -1) return

    const nextIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (nextIndex < 0 || nextIndex >= moduleSections.length) return

    const reorderedSections = [...moduleSections]

    const [movedSection] = reorderedSections.splice(currentIndex, 1)

    reorderedSections.splice(nextIndex, 0, movedSection)

    setIsSaving(true)
    setActionError(null)

    try {
      await reorderSections(reorderedSections)
    } catch (reorderError) {
      setActionError(
        reorderError instanceof Error
          ? reorderError.message
          : 'Unable to reorder the module sections.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Delete only sections that have no learning materials attached.
   * This prevents orphaned material.sectionId references.
   */
  const handleDeleteSection = async () => {
    if (!sectionToDelete || isSaving) return

    const linkedMaterials = materials.filter(
      (material) => material.sectionId === sectionToDelete.id,
    )

    if (linkedMaterials.length > 0) {
      setActionError(
        `This section cannot be deleted because ${linkedMaterials.length} learning material(s) are attached to it. Remove or reassign those materials first.`,
      )

      setSectionToDelete(null)
      return
    }

    setIsSaving(true)
    setActionError(null)

    try {
      const remainingSections = moduleSections.filter(
        (section) => section.id !== sectionToDelete.id,
      )

      await deleteSection(sectionToDelete.id)

      // Keep the remaining sections in a continuous sequence.
      if (remainingSections.length > 0) {
        await reorderSections(remainingSections)
      }

      setSectionToDelete(null)
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete the module section.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="program-sections">
      <header className="program-sections__header">
        <div>
          <span className="program-sections__eyebrow">
            PROGRAM CONTENT MANAGEMENT
          </span>

          <h1 className="program-sections__title">{title}</h1>

          <p className="program-sections__description">
            Organize training modules into structured learning sections.
            Define the sequence in which mentors will deliver the content.
          </p>
        </div>

        <Button
          renderIcon={Add}
          onClick={openCreateModal}
          disabled={!activeModuleId || loading}
        >
          Add section
        </Button>
      </header>

      {(error || actionError) && (
        <div className="program-sections__notice" role="alert">
          <span />
          <p>{actionError || error}</p>
        </div>
      )}

      <section className="program-sections__statistics">
        <div className="program-sections__stat-card">
          <div className="program-sections__stat-icon">
            <Document size={20} />
          </div>

          <div>
            <span>Total sections</span>
            <strong>{statistics.totalSections}</strong>
          </div>
        </div>

        <div className="program-sections__stat-card">
          <div className="program-sections__stat-icon program-sections__stat-icon--complete">
            <CheckmarkFilled size={20} />
          </div>

          <div>
            <span>Modules with sections</span>
            <strong>{statistics.modulesWithSections}</strong>
          </div>
        </div>

        <div className="program-sections__stat-card">
          <div className="program-sections__stat-icon program-sections__stat-icon--empty">
            <Document size={20} />
          </div>

          <div>
            <span>Modules without sections</span>
            <strong>{statistics.modulesWithoutSections}</strong>
          </div>
        </div>
      </section>

      <section className="program-sections__workspace">
        <div className="program-sections__workspace-header">
          <div>
            <h2>Section management</h2>

            <p>
              Select a training module to manage its learning sections.
            </p>
          </div>
        </div>

        <div className="program-sections__module-selector">
          <Select
            id="sections-module-selector"
            labelText="Select training module"
            value={activeModuleId}
            disabled={loading || modules.length === 0}
            onChange={(event) =>
              setSelectedModuleId(event.target.value)
            }
          >
            {modules.map((module) => (
              <SelectItem
                key={module.id}
                value={module.id}
                text={`${module.id} — ${module.title}`}
              />
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="program-sections__empty">
            Loading curriculum sections...
          </div>
        ) : modules.length === 0 ? (
          <div className="program-sections__empty">
            <Document size={30} />

            <strong>No training modules available</strong>

            <p>
              Create a training module before adding learning sections.
            </p>
          </div>
        ) : (
          <>
            {selectedModule && (
              <div className="program-sections__module-summary">
                <div>
                  <span className="program-sections__module-category">
                    {selectedModule.category}
                  </span>

                  <h3>{selectedModule.title}</h3>

                  <p>
                    {selectedModule.id} · {moduleSections.length} sections
                  </p>
                </div>

                <Tag
                  type={moduleSections.length > 0 ? 'green' : 'red'}
                >
                  {moduleSections.length > 0
                    ? 'Sections available'
                    : 'No sections'}
                </Tag>
              </div>
            )}

            <div className="program-sections__table-header">
              <div>
                <h3>Learning sequence</h3>

                <p>
                  Use the arrow controls to arrange sections in the intended
                  teaching order.
                </p>
              </div>

              <span>{moduleSections.length} sections</span>
            </div>

            <div className="program-sections__table-container">
              <Table size="lg" useZebraStyles={false}>
                <TableHead>
                  <TableRow>
                    <TableHeader>Order</TableHeader>
                    <TableHeader>Section title</TableHeader>
                    <TableHeader>Description</TableHeader>
                    <TableHeader>Last updated</TableHeader>
                    <TableHeader>Reorder</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {moduleSections.map((section, index) => (
                    <TableRow key={section.id}>
                      <TableCell>
                        <span className="program-sections__sequence">
                          {String(section.sequence).padStart(2, '0')}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="program-sections__section-title">
                          {section.title}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="program-sections__section-description">
                          {section.description || 'No description provided'}
                        </span>
                      </TableCell>

                      <TableCell>
                        {formatDate(section.updatedAt)}
                      </TableCell>

                      <TableCell>
                        <div className="program-sections__reorder">
                          <Button
                            kind="ghost"
                            size="sm"
                            hasIconOnly
                            renderIcon={ArrowUp}
                            iconDescription="Move section up"
                            disabled={index === 0 || isSaving}
                            onClick={() =>
                              handleMoveSection(section.id, 'up')
                            }
                          />

                          <Button
                            kind="ghost"
                            size="sm"
                            hasIconOnly
                            renderIcon={ArrowDown}
                            iconDescription="Move section down"
                            disabled={
                              index === moduleSections.length - 1 ||
                              isSaving
                            }
                            onClick={() =>
                              handleMoveSection(section.id, 'down')
                            }
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="program-sections__actions">
                          <Button
                            kind="ghost"
                            size="sm"
                            hasIconOnly
                            renderIcon={Edit}
                            iconDescription="Edit section"
                            disabled={isSaving}
                            onClick={() => openEditModal(section)}
                          />

                          <Button
                            kind="ghost"
                            size="sm"
                            hasIconOnly
                            renderIcon={TrashCan}
                            iconDescription="Delete section"
                            disabled={isSaving}
                            onClick={() => {
                              setActionError(null)
                              setSectionToDelete(section)
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {moduleSections.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="program-sections__empty">
                          <Document size={30} />

                          <strong>No sections created yet</strong>

                          <p>
                            Start organizing this module by adding its first
                            learning section.
                          </p>

                          <Button
                            size="sm"
                            renderIcon={Add}
                            onClick={openCreateModal}
                          >
                            Add first section
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>

      <div className="program-sections__notice">
        <span />

        <p>
          Development mode: curriculum sections are currently stored in the
          local JSON Server development database. Production backend
          integration is planned.
        </p>
      </div>

      <Modal
        open={isModalOpen}
        modalHeading={
          editingSection ? 'Edit module section' : 'Create module section'
        }
        primaryButtonText={
          isSaving
            ? 'Saving...'
            : editingSection
              ? 'Save changes'
              : 'Create section'
        }
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!sectionTitle.trim() || isSaving}
        onRequestClose={closeModal}
        onRequestSubmit={handleSaveSection}
      >
        <div className="program-sections__form">
          <p>
            Add the section information for{' '}
            <strong>{selectedModule?.title}</strong>.
          </p>

          <TextInput
            id="section-title"
            labelText="Section title"
            placeholder="Enter the section title"
            value={sectionTitle}
            disabled={isSaving}
            onChange={(event) =>
              setSectionTitle(event.target.value)
            }
          />

          <TextArea
            id="section-description"
            labelText="Section description"
            placeholder="Describe the learning content covered in this section"
            rows={4}
            value={sectionDescription}
            disabled={isSaving}
            onChange={(event) =>
              setSectionDescription(event.target.value)
            }
          />
        </div>

        {actionError && (
          <p role="alert">{actionError}</p>
        )}
      </Modal>

      <Modal
        open={Boolean(sectionToDelete)}
        danger
        modalHeading="Delete section"
        primaryButtonText={isSaving ? 'Deleting...' : 'Delete section'}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isSaving}
        onRequestClose={() => {
          if (!isSaving) setSectionToDelete(null)
        }}
        onRequestSubmit={handleDeleteSection}
      >
        <p>
          Are you sure you want to delete{' '}
          <strong>{sectionToDelete?.title}</strong>?
        </p>

        <p>
          A section with attached learning materials cannot be deleted.
          Those materials must be reassigned or removed first.
        </p>
      </Modal>
    </div>
  )
}

export default ModuleSectionsPage
