import { useMemo, useState } from 'react'

import {
  Button,
  Modal,
  Search,
  Select,
  SelectItem,
  Tag,
  TextArea,
  TextInput,
} from '@carbon/react'

import {
  Add,
  ArrowLeft,
  Building,
  CheckmarkFilled,
  Edit,
  TrashCan,
} from '@carbon/icons-react'

import {
  facilityRepository,
} from '../../../core/data/repositories'

import {
  siteAssessmentService,
} from '../services/site-assessment.service'

import type {
  SiteAssessmentRecord,
  SiteAssessmentFormData,
  SiteAssessmentFindingFormData,
} from '../types/site-assessment.types'

import type {
  SiteAssessmentFinding,
  SiteAssessmentStatus,
} from '../../../core/data/models'

import '../styles/county-mentor-site-assessments.scss'

interface SiteAssessmentsPageProps {
  title: string
}

const emptyAssessmentForm: SiteAssessmentFormData = {
  facilityId: '',
  assessmentDate: new Date().toISOString().slice(0, 10),
  assessorName: '',
  status: 'Scheduled',
  summary: '',
  nextFollowUpDate: '',
}

const emptyFindingForm: SiteAssessmentFindingFormData = {
  title: '',
  description: '',
  assignedTo: '',
  dueDate: '',
  status: 'Open',
  resolutionNotes: '',
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not scheduled'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function statusTag(status: string) {
  const type =
    status === 'Completed' || status === 'Resolved'
      ? 'green'
      : status === 'In Progress'
        ? 'blue'
        : status === 'Cancelled' || status === 'Deferred'
          ? 'gray'
          : 'warm-gray'

  return <Tag type={type}>{status}</Tag>
}

function SiteAssessmentsPage({
  title,
}: SiteAssessmentsPageProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [facilityFilter, setFacilityFilter] = useState('All')

  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState<string | null>(null)

  const [assessmentModalOpen, setAssessmentModalOpen] =
    useState(false)

  const [findingModalOpen, setFindingModalOpen] =
    useState(false)

  const [editingAssessmentId, setEditingAssessmentId] =
    useState<string | null>(null)

  const [editingFindingId, setEditingFindingId] =
    useState<string | null>(null)

  const [assessmentForm, setAssessmentForm] =
    useState<SiteAssessmentFormData>(emptyAssessmentForm)

  const [findingForm, setFindingForm] =
    useState<SiteAssessmentFindingFormData>(emptyFindingForm)

  const [formError, setFormError] = useState('')
  const [findingError, setFindingError] = useState('')

  const facilities = useMemo(
    () => facilityRepository.getAll(),
    [refreshKey],
  )

  const assessments = useMemo(
    () => siteAssessmentService.getAll(),
    [refreshKey],
  )

  const summary = useMemo(
    () => siteAssessmentService.getSummary(),
    [refreshKey],
  )

  const filteredAssessments = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()

    return assessments.filter((assessment) => {
      const matchesSearch =
        assessment.facility?.name
          .toLowerCase()
          .includes(searchTerm) ||
        assessment.assessorName
          .toLowerCase()
          .includes(searchTerm) ||
        assessment.summary
          .toLowerCase()
          .includes(searchTerm)

      const matchesStatus =
        statusFilter === 'All' ||
        assessment.status === statusFilter

      const matchesFacility =
        facilityFilter === 'All' ||
        assessment.facilityId === facilityFilter

      return matchesSearch && matchesStatus && matchesFacility
    })
  }, [
    assessments,
    search,
    statusFilter,
    facilityFilter,
  ])

  const selectedAssessment =
    selectedAssessmentId
      ? siteAssessmentService.getById(selectedAssessmentId)
      : null

  function refresh() {
    setRefreshKey((current) => current + 1)
  }

  function openCreateAssessment() {
    setEditingAssessmentId(null)
    setAssessmentForm({
      ...emptyAssessmentForm,
      assessmentDate: new Date().toISOString().slice(0, 10),
    })
    setFormError('')
    setAssessmentModalOpen(true)
  }

  function openEditAssessment(assessment: SiteAssessmentRecord) {
    setEditingAssessmentId(assessment.id)

    setAssessmentForm({
      facilityId: assessment.facilityId,
      assessmentDate: assessment.assessmentDate,
      assessorName: assessment.assessorName,
      status: assessment.status,
      summary: assessment.summary,
      nextFollowUpDate: assessment.nextFollowUpDate ?? '',
    })

    setFormError('')
    setAssessmentModalOpen(true)
  }

  function closeAssessmentModal() {
    setAssessmentModalOpen(false)
    setEditingAssessmentId(null)
    setAssessmentForm(emptyAssessmentForm)
    setFormError('')
  }

  function handleSaveAssessment() {
    if (
      !assessmentForm.facilityId ||
      !assessmentForm.assessmentDate ||
      !assessmentForm.assessorName.trim() ||
      !assessmentForm.summary.trim()
    ) {
      setFormError('Complete all required fields.')
      return
    }

    try {
      if (editingAssessmentId) {
        siteAssessmentService.update(
          editingAssessmentId,
          assessmentForm,
        )
      } else {
        siteAssessmentService.create(assessmentForm)
      }

      closeAssessmentModal()
      refresh()
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save the assessment.',
      )
    }
  }

  function handleDeleteAssessment(id: string) {
    const confirmed = window.confirm(
      'Delete this assessment and all its associated findings?',
    )

    if (!confirmed) return

    siteAssessmentService.delete(id)

    setSelectedAssessmentId(null)
    refresh()
  }

  function handleStatusChange(
    id: string,
    status: SiteAssessmentStatus,
  ) {
    siteAssessmentService.updateStatus(id, status)
    refresh()
  }

  function openCreateFinding() {
    if (!selectedAssessment) return

    setEditingFindingId(null)
    setFindingForm(emptyFindingForm)
    setFindingError('')
    setFindingModalOpen(true)
  }

  function openEditFinding(finding: SiteAssessmentFinding) {
    setEditingFindingId(finding.id)

    setFindingForm({
      title: finding.title,
      description: finding.description,
      assignedTo: finding.assignedTo,
      dueDate: finding.dueDate ?? '',
      status: finding.status,
      resolutionNotes: finding.resolutionNotes,
    })

    setFindingError('')
    setFindingModalOpen(true)
  }

  function closeFindingModal() {
    setFindingModalOpen(false)
    setEditingFindingId(null)
    setFindingForm(emptyFindingForm)
    setFindingError('')
  }

  function handleSaveFinding() {
    if (
      !findingForm.title.trim() ||
      !findingForm.description.trim() ||
      !findingForm.assignedTo.trim()
    ) {
      setFindingError(
        'Enter a title, description and responsible person.',
      )
      return
    }

    if (!selectedAssessment) return

    try {
      if (editingFindingId) {
        siteAssessmentService.updateFinding(
          editingFindingId,
          findingForm,
        )
      } else {
        siteAssessmentService.createFinding(
          selectedAssessment.id,
          findingForm,
        )
      }

      closeFindingModal()
      refresh()
    } catch (error) {
      setFindingError(
        error instanceof Error
          ? error.message
          : 'Unable to save the finding.',
      )
    }
  }

  function handleDeleteFinding(id: string) {
    if (!window.confirm('Delete this finding?')) return

    siteAssessmentService.deleteFinding(id)
    refresh()
  }

  function renderAssessmentModal() {
    return (
      <Modal
        open={assessmentModalOpen}
        modalHeading={
          editingAssessmentId
            ? 'Edit site assessment'
            : 'Record site assessment'
        }
        primaryButtonText="Save assessment"
        secondaryButtonText="Cancel"
        onRequestClose={closeAssessmentModal}
        onRequestSubmit={handleSaveAssessment}
        size="md"
      >
        <div className="site-assessment-form">
          {formError && (
            <p className="site-assessment-form__error">
              {formError}
            </p>
          )}

          <Select
            id="site-assessment-facility"
            labelText="Facility *"
            value={assessmentForm.facilityId}
            onChange={(event) =>
              setAssessmentForm((current) => ({
                ...current,
                facilityId: event.target.value,
              }))
            }
          >
            <SelectItem value="" text="Select a facility" />

            {facilities.map((facility) => (
              <SelectItem
                key={facility.id}
                value={facility.id}
                text={facility.name}
              />
            ))}
          </Select>

          <TextInput
            id="site-assessment-date"
            type="date"
            labelText="Assessment date *"
            value={assessmentForm.assessmentDate}
            onChange={(event) =>
              setAssessmentForm((current) => ({
                ...current,
                assessmentDate: event.target.value,
              }))
            }
          />

          <TextInput
            id="site-assessment-assessor"
            labelText="Assessor / assessment team *"
            placeholder="Enter assessor name"
            value={assessmentForm.assessorName}
            onChange={(event) =>
              setAssessmentForm((current) => ({
                ...current,
                assessorName: event.target.value,
              }))
            }
          />

          <Select
            id="site-assessment-status"
            labelText="Assessment status *"
            value={assessmentForm.status}
            onChange={(event) =>
              setAssessmentForm((current) => ({
                ...current,
                status: event.target.value as SiteAssessmentStatus,
              }))
            }
          >
            <SelectItem value="Scheduled" text="Scheduled" />
            <SelectItem value="In Progress" text="In Progress" />
            <SelectItem value="Completed" text="Completed" />
            <SelectItem value="Cancelled" text="Cancelled" />
          </Select>

          <TextArea
            id="site-assessment-summary"
            labelText="Assessment summary *"
            placeholder="Enter a summary of the assessment..."
            value={assessmentForm.summary}
            onChange={(event) =>
              setAssessmentForm((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            rows={4}
          />

          <TextInput
            id="site-assessment-follow-up"
            type="date"
            labelText="Next follow-up date"
            value={assessmentForm.nextFollowUpDate}
            onChange={(event) =>
              setAssessmentForm((current) => ({
                ...current,
                nextFollowUpDate: event.target.value,
              }))
            }
          />

          <p className="site-assessment-form__hint">
            This is a general assessment record. The official
            programme checklist and assessment criteria will be
            incorporated when supplied.
          </p>
        </div>
      </Modal>
    )
  }

  function renderFindingModal() {
    return (
      <Modal
        open={findingModalOpen}
        modalHeading={
          editingFindingId
            ? 'Edit finding'
            : 'Record a finding'
        }
        primaryButtonText="Save finding"
        secondaryButtonText="Cancel"
        onRequestClose={closeFindingModal}
        onRequestSubmit={handleSaveFinding}
        size="md"
      >
        <div className="site-assessment-form">
          {findingError && (
            <p className="site-assessment-form__error">
              {findingError}
            </p>
          )}

          <TextInput
            id="finding-title"
            labelText="Finding title *"
            value={findingForm.title}
            onChange={(event) =>
              setFindingForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />

          <TextArea
            id="finding-description"
            labelText="Description *"
            value={findingForm.description}
            onChange={(event) =>
              setFindingForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={4}
          />

          <TextInput
            id="finding-assigned-to"
            labelText="Responsible person / team *"
            value={findingForm.assignedTo}
            onChange={(event) =>
              setFindingForm((current) => ({
                ...current,
                assignedTo: event.target.value,
              }))
            }
          />

          <TextInput
            id="finding-due-date"
            type="date"
            labelText="Target date"
            value={findingForm.dueDate}
            onChange={(event) =>
              setFindingForm((current) => ({
                ...current,
                dueDate: event.target.value,
              }))
            }
          />

          <Select
            id="finding-status"
            labelText="Follow-up status"
            value={findingForm.status}
            onChange={(event) =>
              setFindingForm((current) => ({
                ...current,
                status: event.target.value as SiteAssessmentFindingFormData['status'],
              }))
            }
          >
            <SelectItem value="Open" text="Open" />
            <SelectItem value="In Progress" text="In Progress" />
            <SelectItem value="Resolved" text="Resolved" />
            <SelectItem value="Deferred" text="Deferred" />
          </Select>

          <TextArea
            id="finding-resolution"
            labelText="Resolution / progress notes"
            value={findingForm.resolutionNotes}
            onChange={(event) =>
              setFindingForm((current) => ({
                ...current,
                resolutionNotes: event.target.value,
              }))
            }
            rows={3}
          />
        </div>
      </Modal>
    )
  }

  return (
    <div className="county-site-assessments">
      {!selectedAssessment ? (
        <>
          <header className="county-site-assessments__header">
            <div>
              <p className="county-site-assessments__eyebrow">
                COUNTY MENTOR WORKSPACE
              </p>

              <h1>{title}</h1>

              <p>
                Monitor facility assessments, document findings
                and follow up on improvement actions.
              </p>
            </div>

            <Button
              renderIcon={Add}
              onClick={openCreateAssessment}
            >
              Record assessment
            </Button>
          </header>

          <section className="site-assessment-summary">
            <article className="site-assessment-summary__card">
              <span>Total assessments</span>
              <strong>{summary.totalAssessments}</strong>
              <p>Assessment records</p>
            </article>

            <article className="site-assessment-summary__card">
              <span>Facilities assessed</span>
              <strong>{summary.facilitiesAssessed}</strong>
              <p>With completed assessments</p>
            </article>

            <article className="site-assessment-summary__card">
              <span>Pending assessments</span>
              <strong>{summary.pendingAssessments}</strong>
              <p>Scheduled or in progress</p>
            </article>

            <article className="site-assessment-summary__card">
              <span>Open follow-ups</span>
              <strong>{summary.openFollowUps}</strong>
              <p>Open or in-progress findings</p>
            </article>
          </section>

          <section className="site-assessment-register">
            <div className="site-assessment-register__heading">
              <div>
                <h2>Assessment register</h2>
                <p>
                  Review and manage facility assessment records.
                </p>
              </div>

              <span>{filteredAssessments.length} records</span>
            </div>

            <div className="site-assessment-filters">
              <Search
                id="site-assessment-search"
                labelText="Search assessments"
                placeholder="Search facility, assessor or summary"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              <Select
                id="site-assessment-status-filter"
                labelText="Assessment status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <SelectItem value="All" text="All statuses" />
                <SelectItem value="Scheduled" text="Scheduled" />
                <SelectItem value="In Progress" text="In Progress" />
                <SelectItem value="Completed" text="Completed" />
                <SelectItem value="Cancelled" text="Cancelled" />
              </Select>

              <Select
                id="site-assessment-facility-filter"
                labelText="Facility"
                value={facilityFilter}
                onChange={(event) =>
                  setFacilityFilter(event.target.value)
                }
              >
                <SelectItem value="All" text="All facilities" />

                {facilities.map((facility) => (
                  <SelectItem
                    key={facility.id}
                    value={facility.id}
                    text={facility.name}
                  />
                ))}
              </Select>
            </div>

            <div className="site-assessment-table-wrap">
              <table className="site-assessment-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Assessment date</th>
                    <th>Assessor</th>
                    <th>Status</th>
                    <th>Open findings</th>
                    <th>Next follow-up</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment.id}>
                      <td>
                        <button
                          className="site-assessment-facility-link"
                          onClick={() =>
                            setSelectedAssessmentId(assessment.id)
                          }
                        >
                          <Building size={17} />
                          {assessment.facility?.name ?? 'Unknown facility'}
                        </button>

                        <small>
                          {assessment.facility?.county ?? 'County not recorded'}
                        </small>
                      </td>

                      <td>{formatDate(assessment.assessmentDate)}</td>

                      <td>{assessment.assessorName}</td>

                      <td>{statusTag(assessment.status)}</td>

                      <td>
                        <strong>{assessment.openFindings}</strong>
                      </td>

                      <td>{formatDate(assessment.nextFollowUpDate)}</td>

                      <td>
                        <div className="site-assessment-actions">
                          <Button
                            kind="ghost"
                            size="sm"
                            hasIconOnly
                            renderIcon={Edit}
                            iconDescription="Edit assessment"
                            onClick={() =>
                              openEditAssessment(assessment)
                            }
                          />

                          <Button
                            kind="ghost"
                            size="sm"
                            hasIconOnly
                            renderIcon={TrashCan}
                            iconDescription="Delete assessment"
                            onClick={() =>
                              handleDeleteAssessment(assessment.id)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredAssessments.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="site-assessment-empty">
                          <Building size={28} />
                          <strong>No assessments found</strong>
                          <p>
                            Try changing your filters or record a
                            new assessment.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="site-assessment-detail">
          <div className="site-assessment-detail__top">
            <Button
              kind="ghost"
              renderIcon={ArrowLeft}
              onClick={() => setSelectedAssessmentId(null)}
            >
              Back to assessments
            </Button>

            <div className="site-assessment-actions">
              <Button
                kind="secondary"
                renderIcon={Edit}
                onClick={() => openEditAssessment(selectedAssessment)}
              >
                Edit assessment
              </Button>

              <Button
                kind="danger--tertiary"
                renderIcon={TrashCan}
                onClick={() =>
                  handleDeleteAssessment(selectedAssessment.id)
                }
              >
                Delete
              </Button>
            </div>
          </div>

          <header className="site-assessment-detail__header">
            <div>
              <p className="county-site-assessments__eyebrow">
                FACILITY ASSESSMENT
              </p>

              <h1>
                {selectedAssessment.facility?.name ?? 'Unknown facility'}
              </h1>

              <p>
                {selectedAssessment.facility?.county ?? 'County not recorded'}
                {' · '}
                {formatDate(selectedAssessment.assessmentDate)}
              </p>
            </div>

            {statusTag(selectedAssessment.status)}
          </header>

          <div className="site-assessment-detail__grid">
            <article>
              <span>Assessor</span>
              <strong>{selectedAssessment.assessorName}</strong>
            </article>

            <article>
              <span>Open findings</span>
              <strong>{selectedAssessment.openFindings}</strong>
            </article>

            <article>
              <span>Resolved findings</span>
              <strong>{selectedAssessment.resolvedFindings}</strong>
            </article>

            <article>
              <span>Next follow-up</span>
              <strong>
                {formatDate(selectedAssessment.nextFollowUpDate)}
              </strong>
            </article>
          </div>

          <section className="site-assessment-detail__section">
            <h2>Assessment summary</h2>
            <p>{selectedAssessment.summary}</p>

            <div className="site-assessment-status-control">
              <Select
                id="site-assessment-detail-status"
                labelText="Update assessment status"
                value={selectedAssessment.status}
                onChange={(event) =>
                  handleStatusChange(
                    selectedAssessment.id,
                    event.target.value as SiteAssessmentStatus,
                  )
                }
              >
                <SelectItem value="Scheduled" text="Scheduled" />
                <SelectItem value="In Progress" text="In Progress" />
                <SelectItem value="Completed" text="Completed" />
                <SelectItem value="Cancelled" text="Cancelled" />
              </Select>
            </div>
          </section>

          <section className="site-assessment-detail__section">
            <div className="site-assessment-register__heading">
              <div>
                <h2>Findings and follow-ups</h2>
                <p>
                  Record improvement items, assign responsibility
                  and track resolution.
                </p>
              </div>

              <Button
                renderIcon={Add}
                onClick={openCreateFinding}
              >
                Add finding
              </Button>
            </div>

            <div className="site-assessment-findings">
              {selectedAssessment.findings.map((finding) => (
                <article
                  className="site-assessment-finding"
                  key={finding.id}
                >
                  <div className="site-assessment-finding__top">
                    <div>
                      <h3>{finding.title}</h3>
                      {statusTag(finding.status)}
                    </div>

                    <div className="site-assessment-actions">
                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={Edit}
                        iconDescription="Edit finding"
                        onClick={() => openEditFinding(finding)}
                      />

                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={TrashCan}
                        iconDescription="Delete finding"
                        onClick={() => handleDeleteFinding(finding.id)}
                      />
                    </div>
                  </div>

                  <p>{finding.description}</p>

                  <div className="site-assessment-finding__meta">
                    <span>
                      Responsible: <strong>{finding.assignedTo}</strong>
                    </span>

                    <span>
                      Target date: <strong>{formatDate(finding.dueDate)}</strong>
                    </span>
                  </div>

                  {finding.resolutionNotes && (
                    <div className="site-assessment-finding__resolution">
                      <CheckmarkFilled size={16} />
                      {finding.resolutionNotes}
                    </div>
                  )}
                </article>
              ))}

              {selectedAssessment.findings.length === 0 && (
                <div className="site-assessment-empty">
                  <CheckmarkFilled size={28} />
                  <strong>No findings recorded</strong>
                  <p>
                    Findings can be added when the assessment has
                    been reviewed.
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>
      )}

      {renderAssessmentModal()}
      {renderFindingModal()}

      <div className="site-assessment-demo-note">
        <span>LOCAL DEMO STORAGE</span>
        Assessment records are currently saved in this browser.
        Official assessment criteria will be added when supplied.
      </div>
    </div>
  )
}

export default SiteAssessmentsPage