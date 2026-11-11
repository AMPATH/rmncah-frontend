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
  ProgramModule,
  ProgramModuleSection,
} from '../types/program-lead.types'

import { programModules } from '../data/programLeadDashboardData'
import { initialModuleSections } from '../data/moduleSectionsData'

import '../styles/program-lead-sections.scss'

interface ModuleSectionsPageProps {
  title: string
}

const ModuleSectionsPage = ({
  title,
}: ModuleSectionsPageProps) => {
  const [modules] = useState<ProgramModule[]>(programModules)

  const [sections, setSections] =
    useState<ProgramModuleSection[]>(initialModuleSections)

  const [selectedModuleId, setSelectedModuleId] = useState(
    programModules[0]?.id ?? '',
  )

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [editingSection, setEditingSection] =
    useState<ProgramModuleSection | null>(null)

  const [sectionToDelete, setSectionToDelete] =
    useState<ProgramModuleSection | null>(null)

  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')

  const selectedModule = modules.find(
    (module) => module.id === selectedModuleId,
  )

  const moduleSections = useMemo(() => {
    return sections
      .filter((section) => section.moduleId === selectedModuleId)
      .sort((a, b) => a.sequence - b.sequence)
  }, [sections, selectedModuleId])

  const statistics = useMemo(() => {
    const modulesWithSections = new Set(
      sections.map((section) => section.moduleId),
    )

    return {
      totalSections: sections.length,
      modulesWithSections: modulesWithSections.size,
      modulesWithoutSections: modules.length - modulesWithSections.size,
    }
  }, [sections, modules])

  const openCreateModal = () => {
    setEditingSection(null)
    setSectionTitle('')
    setSectionDescription('')
    setIsModalOpen(true)
  }

  const openEditModal = (section: ProgramModuleSection) => {
    setEditingSection(section)
    setSectionTitle(section.title)
    setSectionDescription(section.description)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSection(null)
    setSectionTitle('')
    setSectionDescription('')
  }

  const handleSaveSection = () => {
    const trimmedTitle = sectionTitle.trim()

    if (!trimmedTitle || !selectedModuleId) return

    const now = new Date().toISOString().slice(0, 10)

    if (editingSection) {
      setSections((currentSections) =>
        currentSections.map((section) =>
          section.id === editingSection.id
            ? {
                ...section,
                title: trimmedTitle,
                description: sectionDescription.trim(),
                updatedAt: now,
              }
            : section,
        ),
      )
    } else {
      const newSection: ProgramModuleSection = {
        id: `SEC-${Date.now().toString().slice(-6)}`,
        moduleId: selectedModuleId,
        title: trimmedTitle,
        description: sectionDescription.trim(),
        sequence: moduleSections.length + 1,
        updatedAt: now,
      }

      setSections((currentSections) => [
        ...currentSections,
        newSection,
      ])
    }

    closeModal()
  }

  const handleMoveSection = (
    sectionId: string,
    direction: 'up' | 'down',
  ) => {
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

    setSections((currentSections) => {
      const otherSections = currentSections.filter(
        (section) => section.moduleId !== selectedModuleId,
      )

      const updatedSections = reorderedSections.map(
        (section, index) => ({
          ...section,
          sequence: index + 1,
        }),
      )

      return [...otherSections, ...updatedSections]
    })
  }

  const handleDeleteSection = () => {
    if (!sectionToDelete) return

    const remainingSections = moduleSections.filter(
      (section) => section.id !== sectionToDelete.id,
    )

    const reorderedSections = remainingSections.map(
      (section, index) => ({
        ...section,
        sequence: index + 1,
      }),
    )

    setSections((currentSections) => {
      const otherSections = currentSections.filter(
        (section) =>
          section.moduleId !== selectedModuleId &&
          section.id !== sectionToDelete.id,
      )

      return [...otherSections, ...reorderedSections]
    })

    setSectionToDelete(null)
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
          disabled={!selectedModuleId}
        >
          Add section
        </Button>
      </header>

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
            value={selectedModuleId}
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
              type={
                moduleSections.length > 0 ? 'green' : 'red'
              }
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

          <span>
            {moduleSections.length} sections
          </span>
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
                    {section.updatedAt}
                  </TableCell>

                  <TableCell>
                    <div className="program-sections__reorder">
                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={ArrowUp}
                        iconDescription="Move section up"
                        disabled={index === 0}
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
                        disabled={index === moduleSections.length - 1}
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
                        onClick={() => openEditModal(section)}
                      />

                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={TrashCan}
                        iconDescription="Delete section"
                        onClick={() => setSectionToDelete(section)}
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
      </section>

      <div className="program-sections__notice">
        <span />

        <p>
          Demonstration mode: section changes are held in local page
          state and are not yet saved to the backend.
        </p>
      </div>

      <Modal
        open={isModalOpen}
        modalHeading={
          editingSection ? 'Edit module section' : 'Create module section'
        }
        primaryButtonText={
          editingSection ? 'Save changes' : 'Create section'
        }
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!sectionTitle.trim()}
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
            onChange={(event) =>
              setSectionDescription(event.target.value)
            }
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(sectionToDelete)}
        danger
        modalHeading="Delete section"
        primaryButtonText="Delete section"
        secondaryButtonText="Cancel"
        onRequestClose={() => setSectionToDelete(null)}
        onRequestSubmit={handleDeleteSection}
      >
        <p>
          Are you sure you want to delete{' '}
          <strong>{sectionToDelete?.title}</strong>?
          This action cannot be undone in this demonstration.
        </p>
      </Modal>
    </div>
  )
}

export default ModuleSectionsPage