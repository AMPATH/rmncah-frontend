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
  CheckmarkFilled,
  Chat,
  Send,
} from '@carbon/icons-react'

import {
  cohortRepository,
  facilityRepository,
} from '../../../core/data/repositories'

import type {
  Feedback,
} from '../../../core/data/models'

import {
  feedbackService,
} from '../services/feedback.service'

import type {
  FeedbackFormData,
  FeedbackRecord,
  FeedbackResponseFormData,
} from '../types/feedback.types'

import '../styles/county-mentor-feedback.scss'

interface FeedbackPageProps {
  title: string
}

const emptyFeedbackForm: FeedbackFormData = {
  subject: '',
  message: '',
  recordType: 'Feedback',
  category: 'General',
  direction: 'Sent',
  priority: 'Medium',
  senderName: 'County Mentor',
  senderRole: 'County Mentor',
  recipientName: '',
  recipientRole: 'Mentor',
  facilityId: '',
  cohortId: '',
  followUp: '',
  dueDate: '',
}

const emptyResponseForm: FeedbackResponseFormData = {
  responderName: 'County Mentor',
  responderRole: 'County Mentor',
  message: '',
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not specified'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function statusTag(status: Feedback['status']) {
  const type =
    status === 'Resolved'
      ? 'green'
      : status === 'In Progress'
        ? 'blue'
        : 'warm-gray'

  return <Tag type={type}>{status}</Tag>
}

function priorityTag(priority: Feedback['priority']) {
  const type =
    priority === 'Urgent'
      ? 'red'
      : priority === 'High'
        ? 'magenta'
        : priority === 'Medium'
          ? 'blue'
          : 'gray'

  return <Tag type={type}>{priority}</Tag>
}

function directionTag(direction: Feedback['direction']) {
  return (
    <Tag type={direction === 'Received' ? 'blue' : 'teal'}>
      {direction}
    </Tag>
  )
}

function FeedbackPage({ title }: FeedbackPageProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [directionFilter, setDirectionFilter] = useState('All')

  const [selectedFeedbackId, setSelectedFeedbackId] =
    useState<string | null>(null)

  const [feedbackModalOpen, setFeedbackModalOpen] =
    useState(false)

  const [responseModalOpen, setResponseModalOpen] =
    useState(false)

  const [resolveModalOpen, setResolveModalOpen] =
    useState(false)

  const [feedbackForm, setFeedbackForm] =
    useState<FeedbackFormData>(emptyFeedbackForm)

  const [responseForm, setResponseForm] =
    useState<FeedbackResponseFormData>(emptyResponseForm)

  const [resolutionNotes, setResolutionNotes] = useState('')

  const [formError, setFormError] = useState('')
  const [responseError, setResponseError] = useState('')
  const [resolutionError, setResolutionError] = useState('')

  const facilities = useMemo(
    () => facilityRepository.getAll(),
    [refreshKey],
  )

  const cohorts = useMemo(
    () => cohortRepository.getAll(),
    [refreshKey],
  )

  const feedbackRecords = useMemo(
    () => feedbackService.getAll(),
    [refreshKey],
  )

  const summary = useMemo(
    () => feedbackService.getSummary(),
    [refreshKey],
  )

  const filteredFeedback = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()

    return feedbackRecords.filter((feedback) => {
      const matchesSearch =
        feedback.subject.toLowerCase().includes(searchTerm) ||
        feedback.message.toLowerCase().includes(searchTerm) ||
        feedback.senderName.toLowerCase().includes(searchTerm) ||
        feedback.recipientName.toLowerCase().includes(searchTerm) ||
        feedback.category.toLowerCase().includes(searchTerm)

      const matchesStatus =
        statusFilter === 'All' ||
        feedback.status === statusFilter

      const matchesType =
        typeFilter === 'All' ||
        feedback.recordType === typeFilter

      const matchesPriority =
        priorityFilter === 'All' ||
        feedback.priority === priorityFilter

      const matchesCategory =
        categoryFilter === 'All' ||
        feedback.category === categoryFilter

      const matchesDirection =
        directionFilter === 'All' ||
        feedback.direction === directionFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesPriority &&
        matchesCategory &&
        matchesDirection
      )
    })
  }, [
    feedbackRecords,
    search,
    statusFilter,
    typeFilter,
    priorityFilter,
    categoryFilter,
    directionFilter,
  ])

  const selectedFeedback = useMemo(
    () =>
      selectedFeedbackId
        ? feedbackRecords.find(
            (feedback) => feedback.id === selectedFeedbackId,
          ) ?? null
        : null,
    [feedbackRecords, selectedFeedbackId],
  )

  function refresh() {
    setRefreshKey((current) => current + 1)
  }

  function openCreateFeedback() {
    setFeedbackForm({
      ...emptyFeedbackForm,
      senderName: 'County Mentor',
      senderRole: 'County Mentor',
    })

    setFormError('')
    setFeedbackModalOpen(true)
  }

  function closeFeedbackModal() {
    setFeedbackModalOpen(false)
    setFeedbackForm(emptyFeedbackForm)
    setFormError('')
  }

  function handleSaveFeedback() {
    if (
      !feedbackForm.subject.trim() ||
      !feedbackForm.message.trim() ||
      !feedbackForm.recipientName.trim()
    ) {
      setFormError(
        'Enter a subject, message and recipient name.',
      )
      return
    }

    try {
      feedbackService.create({
        ...feedbackForm,
        direction: 'Sent',
      })

      closeFeedbackModal()
      refresh()
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to create the record.',
      )
    }
  }

  function openResponseModal() {
    setResponseForm(emptyResponseForm)
    setResponseError('')
    setResponseModalOpen(true)
  }

  function closeResponseModal() {
    setResponseModalOpen(false)
    setResponseForm(emptyResponseForm)
    setResponseError('')
  }

  function handleAddResponse() {
    if (!selectedFeedback) return

    if (!responseForm.message.trim()) {
      setResponseError('Enter a response before submitting.')
      return
    }

    try {
      feedbackService.addResponse(
        selectedFeedback.id,
        responseForm,
      )

      closeResponseModal()
      refresh()
    } catch (error) {
      setResponseError(
        error instanceof Error
          ? error.message
          : 'Unable to submit the response.',
      )
    }
  }

  function openResolveModal() {
    setResolutionNotes('')
    setResolutionError('')
    setResolveModalOpen(true)
  }

  function closeResolveModal() {
    setResolveModalOpen(false)
    setResolutionNotes('')
    setResolutionError('')
  }

  function handleResolveFeedback() {
    if (!selectedFeedback) return

    if (!resolutionNotes.trim()) {
      setResolutionError(
        'Add a short resolution note before closing this record.',
      )
      return
    }

    try {
      feedbackService.updateStatus(
        selectedFeedback.id,
        'Resolved',
        resolutionNotes,
      )

      closeResolveModal()
      refresh()
    } catch (error) {
      setResolutionError(
        error instanceof Error
          ? error.message
          : 'Unable to resolve this record.',
      )
    }
  }

  function getFacilityName(facilityId: string | null) {
    if (!facilityId) return 'Not linked'

    return (
      facilities.find((facility) => facility.id === facilityId)
        ?.name ?? 'Facility unavailable'
    )
  }

  function getCohortName(cohortId: string | null) {
    if (!cohortId) return 'Not linked'

    return (
      cohorts.find((cohort) => cohort.id === cohortId)
        ?.name ?? 'Cohort unavailable'
    )
  }

  function renderFeedbackModal() {
    return (
      <Modal
        open={feedbackModalOpen}
        modalHeading="Create feedback or challenge"
        primaryButtonText="Create record"
        secondaryButtonText="Cancel"
        onRequestClose={closeFeedbackModal}
        onRequestSubmit={handleSaveFeedback}
        size="lg"
      >
        <div className="county-feedback-form">
          {formError && (
            <p className="county-feedback-form__error">
              {formError}
            </p>
          )}

          <div className="county-feedback-form__grid">
            <Select
              id="feedback-record-type"
              labelText="Record type *"
              value={feedbackForm.recordType}
              onChange={(event) =>
                setFeedbackForm((current) => ({
                  ...current,
                  recordType: event.target.value as FeedbackFormData['recordType'],
                }))
              }
            >
              <SelectItem value="Feedback" text="Feedback" />
              <SelectItem value="Challenge" text="Challenge" />
            </Select>

            <Select
              id="feedback-category"
              labelText="Category *"
              value={feedbackForm.category}
              onChange={(event) =>
                setFeedbackForm((current) => ({
                  ...current,
                  category: event.target.value as FeedbackFormData['category'],
                }))
              }
            >
              <SelectItem value="Training" text="Training" />
              <SelectItem value="Assessment" text="Assessment" />
              <SelectItem value="Cohort" text="Cohort" />
              <SelectItem value="Support" text="Support" />
              <SelectItem value="Facility" text="Facility" />
              <SelectItem value="General" text="General" />
            </Select>

            <Select
              id="feedback-priority"
              labelText="Priority *"
              value={feedbackForm.priority}
              onChange={(event) =>
                setFeedbackForm((current) => ({
                  ...current,
                  priority: event.target.value as FeedbackFormData['priority'],
                }))
              }
            >
              <SelectItem value="Low" text="Low" />
              <SelectItem value="Medium" text="Medium" />
              <SelectItem value="High" text="High" />
              <SelectItem value="Urgent" text="Urgent" />
            </Select>

            <Select
              id="feedback-recipient-role"
              labelText="Recipient role *"
              value={feedbackForm.recipientRole}
              onChange={(event) =>
                setFeedbackForm((current) => ({
                  ...current,
                  recipientRole: event.target.value as FeedbackFormData['recipientRole'],
                }))
              }
            >
              <SelectItem value="Program Lead" text="Program Lead" />
              <SelectItem value="Mentor" text="Mentor" />
              <SelectItem value="Mentee" text="Mentee" />
              <SelectItem
                value="County Mentor"
                text="County Mentor"
              />
              <SelectItem
                value="System Administrator"
                text="System Administrator"
              />
            </Select>
          </div>

          <TextInput
            id="feedback-subject"
            labelText="Subject *"
            placeholder="Enter a clear subject"
            value={feedbackForm.subject}
            onChange={(event) =>
              setFeedbackForm((current) => ({
                ...current,
                subject: event.target.value,
              }))
            }
          />

          <TextArea
            id="feedback-message"
            labelText="Description / message *"
            placeholder="Describe the feedback or challenge..."
            value={feedbackForm.message}
            onChange={(event) =>
              setFeedbackForm((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            rows={5}
          />

          <TextInput
            id="feedback-recipient-name"
            labelText="Recipient name *"
            placeholder="Enter recipient name"
            value={feedbackForm.recipientName}
            onChange={(event) =>
              setFeedbackForm((current) => ({
                ...current,
                recipientName: event.target.value,
              }))
            }
          />

          <div className="county-feedback-form__grid">
            <Select
              id="feedback-facility"
              labelText="Related facility"
              value={feedbackForm.facilityId ?? ''}
              onChange={(event) =>
                setFeedbackForm((current) => ({
                  ...current,
                  facilityId: event.target.value || null,
                }))
              }
            >
              <SelectItem value="" text="No facility selected" />

              {facilities.map((facility) => (
                <SelectItem
                  key={facility.id}
                  value={facility.id}
                  text={facility.name}
                />
              ))}
            </Select>

            <Select
              id="feedback-cohort"
              labelText="Related cohort"
              value={feedbackForm.cohortId ?? ''}
              onChange={(event) =>
                setFeedbackForm((current) => ({
                  ...current,
                  cohortId: event.target.value || null,
                }))
              }
            >
              <SelectItem value="" text="No cohort selected" />

              {cohorts.map((cohort) => (
                <SelectItem
                  key={cohort.id}
                  value={cohort.id}
                  text={cohort.name}
                />
              ))}
            </Select>

            <TextInput
              id="feedback-due-date"
              type="date"
              labelText="Target follow-up date"
              value={feedbackForm.dueDate ?? ''}
              onChange={(event) =>
                setFeedbackForm((current) => ({
                  ...current,
                  dueDate: event.target.value || null,
                }))
              }
            />
          </div>

          <TextArea
            id="feedback-follow-up"
            labelText="Expected follow-up / requested action"
            placeholder="Describe the expected follow-up, if applicable..."
            value={feedbackForm.followUp ?? ''}
            onChange={(event) =>
              setFeedbackForm((current) => ({
                ...current,
                followUp: event.target.value,
              }))
            }
            rows={3}
          />

          <p className="county-feedback-form__hint">
            This record will be created as a sent item from the
            County Mentor workspace. It will initially have
            Pending status.
          </p>
        </div>
      </Modal>
    )
  }

  function renderResponseModal() {
    return (
      <Modal
        open={responseModalOpen}
        modalHeading="Add a response"
        primaryButtonText="Send response"
        secondaryButtonText="Cancel"
        onRequestClose={closeResponseModal}
        onRequestSubmit={handleAddResponse}
        size="md"
      >
        <div className="county-feedback-form">
          {responseError && (
            <p className="county-feedback-form__error">
              {responseError}
            </p>
          )}

          <TextArea
            id="feedback-response-message"
            labelText="Response *"
            placeholder="Write your response..."
            value={responseForm.message}
            onChange={(event) =>
              setResponseForm((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            rows={5}
          />

          <p className="county-feedback-form__hint">
            Your response will be added to this record's
            conversation history.
          </p>
        </div>
      </Modal>
    )
  }

  function renderResolveModal() {
    return (
      <Modal
        open={resolveModalOpen}
        modalHeading="Resolve record"
        primaryButtonText="Confirm resolution"
        secondaryButtonText="Cancel"
        onRequestClose={closeResolveModal}
        onRequestSubmit={handleResolveFeedback}
        size="md"
      >
        <div className="county-feedback-form">
          {resolutionError && (
            <p className="county-feedback-form__error">
              {resolutionError}
            </p>
          )}

          <TextArea
            id="feedback-resolution-notes"
            labelText="Resolution notes *"
            placeholder="Explain how this feedback or challenge was resolved..."
            value={resolutionNotes}
            onChange={(event) =>
              setResolutionNotes(event.target.value)
            }
            rows={5}
          />

          <p className="county-feedback-form__hint">
            Resolving a record closes it. The resolution note
            will be retained with the feedback record.
          </p>
        </div>
      </Modal>
    )
  }

  function renderFeedbackList() {
    return (
      <>
        <header className="county-feedback__header">
          <div>
            <p className="county-feedback__eyebrow">
              COUNTY MENTOR WORKSPACE
            </p>

            <h1>{title}</h1>

            <p>
              Track feedback, raise challenges and follow
              responses across the mentorship programme.
            </p>
          </div>

          <Button
            renderIcon={Add}
            onClick={openCreateFeedback}
          >
            Create record
          </Button>
        </header>

        <section className="county-feedback-summary">
          <article className="county-feedback-summary__card">
            <span>Total records</span>
            <strong>{summary.totalFeedback}</strong>
            <p>Feedback and challenges</p>
          </article>

          <article className="county-feedback-summary__card">
            <span>Challenges</span>
            <strong>{summary.totalChallenges}</strong>
            <p>Challenges raised</p>
          </article>

          <article className="county-feedback-summary__card">
            <span>Pending</span>
            <strong>{summary.pending}</strong>
            <p>Awaiting a response</p>
          </article>

          <article className="county-feedback-summary__card">
            <span>In progress</span>
            <strong>{summary.inProgress}</strong>
            <p>Being addressed</p>
          </article>

          <article className="county-feedback-summary__card">
            <span>Resolved</span>
            <strong>{summary.resolved}</strong>
            <p>Closed records</p>
          </article>

          <article className="county-feedback-summary__card">
            <span>Urgent</span>
            <strong>{summary.urgent}</strong>
            <p>Require priority attention</p>
          </article>
        </section>

        <section className="county-feedback-register">
          <div className="county-feedback-register__heading">
            <div>
              <h2>Feedback register</h2>
              <p>
                Review incoming and outgoing feedback and
                challenges.
              </p>
            </div>

            <span>{filteredFeedback.length} records</span>
          </div>

          <div className="county-feedback-filters">
            <Search
              id="county-feedback-search"
              labelText="Search records"
              placeholder="Search subject, message or person"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <Select
              id="county-feedback-direction-filter"
              labelText="Direction"
              value={directionFilter}
              onChange={(event) =>
                setDirectionFilter(event.target.value)
              }
            >
              <SelectItem value="All" text="All directions" />
              <SelectItem value="Received" text="Received" />
              <SelectItem value="Sent" text="Sent" />
            </Select>

            <Select
              id="county-feedback-status-filter"
              labelText="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <SelectItem value="All" text="All statuses" />
              <SelectItem value="Pending" text="Pending" />
              <SelectItem value="In Progress" text="In Progress" />
              <SelectItem value="Resolved" text="Resolved" />
            </Select>

            <Select
              id="county-feedback-type-filter"
              labelText="Record type"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <SelectItem value="All" text="All types" />
              <SelectItem value="Feedback" text="Feedback" />
              <SelectItem value="Challenge" text="Challenge" />
            </Select>

            <Select
              id="county-feedback-priority-filter"
              labelText="Priority"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
            >
              <SelectItem value="All" text="All priorities" />
              <SelectItem value="Low" text="Low" />
              <SelectItem value="Medium" text="Medium" />
              <SelectItem value="High" text="High" />
              <SelectItem value="Urgent" text="Urgent" />
            </Select>

            <Select
              id="county-feedback-category-filter"
              labelText="Category"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <SelectItem value="All" text="All categories" />
              <SelectItem value="Training" text="Training" />
              <SelectItem value="Assessment" text="Assessment" />
              <SelectItem value="Cohort" text="Cohort" />
              <SelectItem value="Support" text="Support" />
              <SelectItem value="Facility" text="Facility" />
              <SelectItem value="General" text="General" />
            </Select>
          </div>

          <div className="county-feedback-table-wrap">
            <table className="county-feedback-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Type / category</th>
                  <th>Direction</th>
                  <th>Person</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Responses</th>
                </tr>
              </thead>

              <tbody>
                {filteredFeedback.map((feedback) => (
                  <tr
                    key={feedback.id}
                    className="county-feedback-table__row"
                    onClick={() =>
                      setSelectedFeedbackId(feedback.id)
                    }
                  >
                    <td>
                      <button
                        type="button"
                        className="county-feedback-table__subject"
                        onClick={() =>
                          setSelectedFeedbackId(feedback.id)
                        }
                      >
                        {feedback.subject}
                      </button>
                      <small>
                        {feedback.message.length > 85
                          ? `${feedback.message.slice(0, 85)}...`
                          : feedback.message}
                      </small>
                    </td>

                    <td>
                      <strong>{feedback.recordType}</strong>
                      <small>{feedback.category}</small>
                    </td>

                    <td>{directionTag(feedback.direction)}</td>

                    <td>
                      <strong>
                        {feedback.direction === 'Received'
                          ? feedback.senderName
                          : feedback.recipientName}
                      </strong>
                      <small>
                        {feedback.direction === 'Received'
                          ? feedback.senderRole
                          : feedback.recipientRole}
                      </small>
                    </td>

                    <td>{priorityTag(feedback.priority)}</td>

                    <td>{statusTag(feedback.status)}</td>

                    <td>{formatDate(feedback.updatedAt)}</td>

                    <td>{feedback.responseCount}</td>
                  </tr>
                ))}

                {filteredFeedback.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="county-feedback-empty">
                        <Chat size={28} />
                        <strong>No matching records</strong>
                        <p>
                          Try changing your filters or create
                          a new feedback record.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="county-feedback-demo-note">
          <span>DEMO DATA</span>
          Records are currently stored in this browser's local
          storage. Shared multi-user communication will require
          backend integration.
        </div>
      </>
    )
  }

  function renderFeedbackDetails(feedback: FeedbackRecord) {
    const relatedFacility = getFacilityName(feedback.facilityId)
    const relatedCohort = getCohortName(feedback.cohortId)

    return (
      <div className="county-feedback-detail">
        <div className="county-feedback-detail__top">
          <Button
            kind="ghost"
            renderIcon={ArrowLeft}
            onClick={() => setSelectedFeedbackId(null)}
          >
            Back to register
          </Button>

          <div className="county-feedback-detail__actions">
            {feedback.status !== 'Resolved' && (
              <>
                <Button
                  kind="secondary"
                  renderIcon={Send}
                  onClick={openResponseModal}
                >
                  Add response
                </Button>

                <Button
                  renderIcon={CheckmarkFilled}
                  onClick={openResolveModal}
                >
                  Resolve
                </Button>
              </>
            )}
          </div>
        </div>

        <section className="county-feedback-detail__hero">
          <div>
            <div className="county-feedback-detail__tags">
              <Tag type="cool-gray">{feedback.recordType}</Tag>
              <Tag type="purple">{feedback.category}</Tag>
              {directionTag(feedback.direction)}
              {priorityTag(feedback.priority)}
              {statusTag(feedback.status)}
            </div>

            <h1>{feedback.subject}</h1>

            <p>
              Created {formatDate(feedback.createdAt)}
            </p>
          </div>
        </section>

        <section className="county-feedback-detail__grid">
          <article>
            <span>From</span>
            <strong>{feedback.senderName}</strong>
            <small>{feedback.senderRole}</small>
          </article>

          <article>
            <span>To</span>
            <strong>{feedback.recipientName}</strong>
            <small>{feedback.recipientRole}</small>
          </article>

          <article>
            <span>Related facility</span>
            <strong>{relatedFacility}</strong>
          </article>

          <article>
            <span>Related cohort</span>
            <strong>{relatedCohort}</strong>
          </article>

          <article>
            <span>Follow-up date</span>
            <strong>{formatDate(feedback.dueDate)}</strong>
          </article>

          <article>
            <span>Assigned to</span>
            <strong>
              {feedback.assignedToName || 'Not assigned'}
            </strong>
          </article>
        </section>

        <section className="county-feedback-detail__section">
          <h2>Feedback / challenge description</h2>
          <p className="county-feedback-detail__message">
            {feedback.message}
          </p>

          {feedback.followUp && (
            <div className="county-feedback-detail__follow-up">
              <strong>Expected follow-up</strong>
              <p>{feedback.followUp}</p>
            </div>
          )}
        </section>

        <section className="county-feedback-detail__section">
          <div className="county-feedback-detail__section-heading">
            <div>
              <h2>Conversation history</h2>
              <p>
                {feedback.responseCount}{' '}
                {feedback.responseCount === 1
                  ? 'response'
                  : 'responses'}
              </p>
            </div>

            {feedback.status !== 'Resolved' && (
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Add}
                onClick={openResponseModal}
              >
                Add response
              </Button>
            )}
          </div>

          {feedback.responses.length > 0 ? (
            <div className="county-feedback-conversation">
              {feedback.responses.map((response) => (
                <article
                  key={response.id}
                  className="county-feedback-response"
                >
                  <div className="county-feedback-response__header">
                    <div>
                      <strong>{response.responderName}</strong>
                      <span>{response.responderRole}</span>
                    </div>

                    <time>{formatDate(response.createdAt)}</time>
                  </div>

                  <p>{response.message}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="county-feedback-empty">
              <Chat size={28} />
              <strong>No responses yet</strong>
              <p>
                Responses added to this record will appear here.
              </p>
            </div>
          )}
        </section>

        {feedback.status === 'Resolved' && (
          <section className="county-feedback-detail__resolution">
            <CheckmarkFilled size={20} />
            <div>
              <strong>Record resolved</strong>
              <p>{feedback.resolutionNotes || 'No resolution notes provided.'}</p>
              <small>
                Resolved {formatDate(feedback.resolvedAt)}
              </small>
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="county-feedback">
      {selectedFeedback
        ? renderFeedbackDetails(selectedFeedback)
        : renderFeedbackList()}

      {renderFeedbackModal()}
      {renderResponseModal()}
      {renderResolveModal()}
    </div>
  )
}

export default FeedbackPage