import { useMemo, useState } from 'react'
import {
  Button,
  Search,
  Select,
  SelectItem,
  Tag,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react'
import { View, UserMultiple } from '@carbon/icons-react'

import { programLeadCohortService } from '../services/program-lead-cohort.service'

import '../styles/program-lead-cohorts.scss'

interface CohortsPageProps {
  title: string
}

const tableHeaders = [
  'Cohort',
  'Facility',
  'Mentor',
  'Linked mentees',
  'Competency breakdown',
  'Learning plans',
  'Status',
  'Details',
]

function formatDate(date?: string | null): string {
  if (!date) return '—'

  const parsedDate = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date,
  )

  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function formatTime(time?: string): string {
  if (!time) return ''

  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return new Intl.DateTimeFormat('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getCohortStatusTagType(status: string) {
  switch (status) {
    case 'Active':
      return 'green'
    case 'Completed':
      return 'blue'
    case 'Paused':
      return 'warm-gray'
    default:
      return 'gray'
  }
}

function getPlanStatusTagType(status: string) {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Needs Attention':
    case 'Needs Support':
      return 'red'
    case 'Paused':
      return 'warm-gray'
    default:
      return 'gray'
  }
}

function getSubmissionTagType(status: string) {
  switch (status) {
    case 'Approved':
      return 'green'
    case 'Submitted':
    case 'Under Review':
      return 'blue'
    case 'Returned':
      return 'red'
    case 'Draft':
      return 'purple'
    case 'Not Ready':
      return 'warm-gray'
    default:
      return 'gray'
  }
}

function getSessionTagType(status: string) {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'Scheduled':
      return 'blue'
    case 'Rescheduled':
      return 'purple'
    case 'Cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function CohortsPage({ title }: CohortsPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [facilityFilter, setFacilityFilter] = useState('all')
  const [mentorFilter, setMentorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null)

  const cohorts = useMemo(
    () => programLeadCohortService.getAll(),
    [],
  )

  const summary = useMemo(
    () => programLeadCohortService.getSummary(cohorts),
    [cohorts],
  )

  const facilities = useMemo(
    () =>
      Array.from(
        new Map(
          cohorts
            .filter((cohort) => cohort.facility)
            .map((cohort) => [
              cohort.facility!.id,
              cohort.facility!.name,
            ]),
        ),
      ).sort((a, b) => a[1].localeCompare(b[1])),
    [cohorts],
  )

  const mentors = useMemo(
    () =>
      Array.from(
        new Map(
          cohorts
            .filter((cohort) => cohort.mentor)
            .map((cohort) => [
              cohort.mentor!.id,
              cohort.mentor!.name,
            ]),
        ),
      ).sort((a, b) => a[1].localeCompare(b[1])),
    [cohorts],
  )

  const filteredCohorts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return cohorts.filter((cohort) => {
      const matchesSearch =
        !query ||
        [
          cohort.name,
          cohort.facility?.name,
          cohort.facility?.county,
          cohort.mentor?.name,
          cohort.description,
        ].some((value) => value?.toLowerCase().includes(query))

      const matchesFacility =
        facilityFilter === 'all' ||
        cohort.facilityId === facilityFilter

      const matchesMentor =
        mentorFilter === 'all' ||
        (mentorFilter === 'unassigned'
          ? !cohort.mentor
          : cohort.mentor?.id === mentorFilter)

      const matchesStatus =
        statusFilter === 'all' ||
        cohort.status === statusFilter

      return (
        matchesSearch &&
        matchesFacility &&
        matchesMentor &&
        matchesStatus
      )
    })
  }, [
    cohorts,
    searchTerm,
    facilityFilter,
    mentorFilter,
    statusFilter,
  ])

  const selectedCohort = useMemo(
    () =>
      selectedCohortId
        ? cohorts.find((cohort) => cohort.id === selectedCohortId) ?? null
        : null,
    [cohorts, selectedCohortId],
  )

  return (
    <main className="program-lead-cohorts">
      <header className="program-lead-cohorts__header">
        <p className="program-lead-cohorts__eyebrow">
          PROGRAMME MANAGEMENT
        </p>
        <h1>{title || 'Cohorts'}</h1>
        <p className="program-lead-cohorts__description">
          Monitor programme cohorts, their linked mentees, learning plans,
          training sessions and submission progress.
        </p>
      </header>


      <section
        className="program-lead-cohorts__summary"
        aria-label="Cohort summary"
      >
        <article className="program-lead-cohorts__summary-card">
          <span>Total cohorts</span>
          <strong>{summary.total}</strong>
          <small>Records in the shared cohort directory</small>
        </article>

        <article className="program-lead-cohorts__summary-card">
          <span>Active cohorts</span>
          <strong>{summary.active}</strong>
          <small>Currently marked active</small>
        </article>

        <article className="program-lead-cohorts__summary-card">
          <span>Completed cohorts</span>
          <strong>{summary.completed}</strong>
          <small>Marked completed in the cohort records</small>
        </article>

        <article className="program-lead-cohorts__summary-card">
          <span>Paused cohorts</span>
          <strong>{summary.paused}</strong>
          <small>Currently marked paused</small>
        </article>

        <article className="program-lead-cohorts__summary-card">
          <span>Linked mentees</span>
          <strong>{summary.linkedMentees}</strong>
          <small>Individual mentee records linked to these cohorts</small>
        </article>
      </section>

      <section className="program-lead-cohorts__directory">
        <div className="program-lead-cohorts__section-header">
          <div>
            <h2>Cohort directory</h2>
            <p>
              Search and review cohorts across the programme.
            </p>
          </div>

          <span className="program-lead-cohorts__result-count">
            {filteredCohorts.length} of {cohorts.length} cohorts
          </span>
        </div>

        <div className="program-lead-cohorts__filters">
          <Search
            id="program-lead-cohort-search"
            labelText="Search cohorts"
            placeholder="Search cohort, facility or mentor"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            className="program-lead-cohorts__search"
          />

          <Select
            id="program-lead-cohort-facility"
            labelText="Facility"
            value={facilityFilter}
            onChange={(event) => setFacilityFilter(event.target.value)}
            className="program-lead-cohorts__filter"
          >
            <SelectItem value="all" text="All facilities" />
            {facilities.map(([id, name]) => (
              <SelectItem key={id} value={id} text={name} />
            ))}
          </Select>

          <Select
            id="program-lead-cohort-mentor"
            labelText="Mentor assignment"
            value={mentorFilter}
            onChange={(event) => setMentorFilter(event.target.value)}
            className="program-lead-cohorts__filter"
          >
            <SelectItem value="all" text="All assignments" />
            <SelectItem value="unassigned" text="Not assigned" />
            {mentors.map(([id, name]) => (
              <SelectItem key={id} value={id} text={name} />
            ))}
          </Select>

          <Select
            id="program-lead-cohort-status"
            labelText="Cohort status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="program-lead-cohorts__filter"
          >
            <SelectItem value="all" text="All statuses" />
            <SelectItem value="Active" text="Active" />
            <SelectItem value="Completed" text="Completed" />
            <SelectItem value="Paused" text="Paused" />
          </Select>
        </div>

        <div className="program-lead-cohorts__table-wrapper">
          {filteredCohorts.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header) => (
                    <TableHeader key={header}>{header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCohorts.map((cohort) => (
                  <TableRow key={cohort.id}>
                    <TableCell>
                      <div className="program-lead-cohorts__identity">
                        <div className="program-lead-cohorts__avatar">
                          {getInitials(cohort.name)}
                        </div>
                        <div>
                          <strong>{cohort.name}</strong>
                          <span>{cohort.id}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="program-lead-cohorts__cell-stack">
                        <strong>{cohort.facility?.name ?? 'Not recorded'}</strong>
                        <span>{cohort.facility?.county ?? 'County not recorded'}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {cohort.mentor?.name ?? 'Not assigned'}
                    </TableCell>

                    <TableCell>
                      <strong>{cohort.menteeCount}</strong>
                    </TableCell>

                    <TableCell>
                      <div className="program-lead-cohorts__competency">
                        <span>
                          <strong>{cohort.competentMentees}</strong> competent
                        </span>
                        <span>
                          <strong>{cohort.inProgressMentees}</strong> in progress
                        </span>
                        <span>
                          <strong>{cohort.menteesNeedingSupport}</strong> need support
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {cohort.learningPlans.length}
                    </TableCell>

                    <TableCell>
                      <Tag type={getCohortStatusTagType(cohort.status)}>
                        {cohort.status}
                      </Tag>
                    </TableCell>

                    <TableCell>
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={View}
                        onClick={() => setSelectedCohortId(cohort.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="program-lead-cohorts__empty">
              <UserMultiple size={28} />
              <strong>No cohorts found</strong>
              <span>Try adjusting your search or filters.</span>
            </div>
          )}
        </div>
      </section>

      {selectedCohort && (
        <section className="program-lead-cohort-details">
          <div className="program-lead-cohort-details__header">
            <div>
              <p>COHORT DETAILS</p>
              <h2>{selectedCohort.name}</h2>
              <span>
                {selectedCohort.facility?.name ?? 'Facility not recorded'}
                {' · '}
                {selectedCohort.id}
              </span>
            </div>

            <div className="program-lead-cohort-details__actions">
              <Tag type={getCohortStatusTagType(selectedCohort.status)}>
                {selectedCohort.status}
              </Tag>
              <Button
                kind="ghost"
                size="sm"
                onClick={() => setSelectedCohortId(null)}
              >
                Close details
              </Button>
            </div>
          </div>

          <div className="program-lead-cohort-details__grid">
            <article>
              <span>Facility</span>
              <strong>{selectedCohort.facility?.name ?? 'Not recorded'}</strong>
            </article>
            <article>
              <span>County</span>
              <strong>{selectedCohort.facility?.county ?? 'Not recorded'}</strong>
            </article>
            <article>
              <span>Assigned mentor</span>
              <strong>{selectedCohort.mentor?.name ?? 'Not assigned'}</strong>
            </article>
            <article>
              <span>Start date</span>
              <strong>{formatDate(selectedCohort.startDate)}</strong>
            </article>
            <article>
              <span>End date</span>
              <strong>{formatDate(selectedCohort.endDate)}</strong>
            </article>
            <article>
              <span>Linked mentees</span>
              <strong>{selectedCohort.menteeCount}</strong>
            </article>
          </div>

          {selectedCohort.description && (
            <div className="program-lead-cohort-details__description">
              <h3>Cohort overview</h3>
              <p>{selectedCohort.description}</p>
            </div>
          )}

          <div className="program-lead-cohort-details__metrics">
            <article>
              <span>Competent mentees</span>
              <strong>{selectedCohort.competentMentees}</strong>
            </article>
            <article>
              <span>In progress</span>
              <strong>{selectedCohort.inProgressMentees}</strong>
            </article>
            <article>
              <span>Needing support</span>
              <strong>{selectedCohort.menteesNeedingSupport}</strong>
            </article>
          </div>

          <section className="program-lead-cohort-details__section">
            <div className="program-lead-cohort-details__section-heading">
              <div>
                <h3>Linked mentees</h3>
                <p>Individual mentee records currently linked to this cohort.</p>
              </div>
              <span>{selectedCohort.mentees.length} records</span>
            </div>

            {selectedCohort.mentees.length > 0 ? (
              <div className="program-lead-cohort-details__table-wrapper">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Mentee</TableHeader>
                      <TableHeader>Professional role</TableHeader>
                      <TableHeader>Competency status</TableHeader>
                      <TableHeader>Account status</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCohort.mentees.map((mentee) => (
                      <TableRow key={mentee.id}>
                        <TableCell>
                          <div className="program-lead-cohorts__cell-stack">
                            <strong>{mentee.name}</strong>
                            <span>{mentee.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{mentee.professionalRole}</TableCell>
                        <TableCell>
                          <Tag
                            type={
                              mentee.competencyStatus === 'Competent'
                                ? 'green'
                                : mentee.competencyStatus === 'Needs Support'
                                  ? 'red'
                                  : 'blue'
                            }
                          >
                            {mentee.competencyStatus}
                          </Tag>
                        </TableCell>
                        <TableCell>
                          <Tag
                            type={mentee.status === 'Active' ? 'green' : 'gray'}
                          >
                            {mentee.status}
                          </Tag>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="program-lead-cohort-details__empty">
                No individual mentee records are currently linked to this cohort.
              </p>
            )}
          </section>

          <section className="program-lead-cohort-details__section">
            <div className="program-lead-cohort-details__section-heading">
              <div>
                <h3>Learning plans and modules</h3>
                <p>
                  Module and section figures belong to the cohort learning
                  plans; they are not individual mentee completion figures.
                </p>
              </div>
              <span>
                {selectedCohort.learningPlans.length} learning plans
              </span>
            </div>

            {selectedCohort.learningPlans.length > 0 ? (
              selectedCohort.learningPlans.map((plan) => {
                const planModules =
                  selectedCohort.learningPlanModules.filter(
                    (module) => module.learningPlanId === plan.id,
                  )

                return (
                  <article
                    className="program-lead-cohort-details__plan"
                    key={plan.id}
                  >
                    <div className="program-lead-cohort-details__plan-header">
                      <div>
                        <strong>{plan.title}</strong>
                        <span>
                          {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
                        </span>
                      </div>
                      <Tag type={getPlanStatusTagType(plan.status)}>
                        {plan.status}
                      </Tag>
                    </div>

                    {plan.description && <p>{plan.description}</p>}

                    {planModules.length > 0 ? (
                      <div className="program-lead-cohort-details__module-list">
                        {planModules.map((module) => (
                          <div
                            className="program-lead-cohort-details__module"
                            key={module.id}
                          >
                            <div>
                              <strong>{module.title}</strong>
                              <span>
                                {module.completedSections} of {module.sectionsCount}{' '}
                                sections recorded as completed
                              </span>
                            </div>
                            <div className="program-lead-cohort-details__module-status">
                              <Tag type={getPlanStatusTagType(module.status)}>
                                {module.status}
                              </Tag>
                              {module.competencyRequired && (
                                <Tag
                                  type={module.competencyAchieved ? 'green' : 'warm-gray'}
                                >
                                  {module.competencyAchieved
                                    ? 'Competency achieved'
                                    : 'Competency pending'}
                                </Tag>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="program-lead-cohort-details__empty">
                        No modules are recorded for this learning plan.
                      </p>
                    )}
                  </article>
                )
              })
            ) : (
              <p className="program-lead-cohort-details__empty">
                No learning plans are linked to this cohort.
              </p>
            )}
          </section>

          <section className="program-lead-cohort-details__section">
            <div className="program-lead-cohort-details__section-heading">
              <div>
                <h3>Training schedule</h3>
                <p>Sessions recorded against this cohort's learning plans.</p>
              </div>
              <span>{selectedCohort.sessions.length} sessions</span>
            </div>

            {selectedCohort.sessions.length > 0 ? (
              <div className="program-lead-cohort-details__table-wrapper">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Session</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Time</TableHeader>
                      <TableHeader>Location</TableHeader>
                      <TableHeader>Status</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCohort.sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.title}</TableCell>
                        <TableCell>{session.sessionType}</TableCell>
                        <TableCell>{formatDate(session.scheduledDate)}</TableCell>
                        <TableCell>
                          {formatTime(session.startTime)}
                          {session.endTime && ` – ${formatTime(session.endTime)}`}
                        </TableCell>
                        <TableCell>{session.location || '—'}</TableCell>
                        <TableCell>
                          <Tag type={getSessionTagType(session.status)}>
                            {session.status}
                          </Tag>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="program-lead-cohort-details__empty">
                No training sessions are recorded for this cohort.
              </p>
            )}
          </section>

          <section className="program-lead-cohort-details__section">
            <div className="program-lead-cohort-details__section-heading">
              <div>
                <h3>Cohort submissions</h3>
                <p>
                  Submission records and review information currently linked
                  to this cohort.
                </p>
              </div>
              <span>{selectedCohort.submissions.length} records</span>
            </div>

            {selectedCohort.submissions.length > 0 ? (
              selectedCohort.submissions.map((submission) => (
                <article
                  className="program-lead-cohort-details__submission"
                  key={submission.id}
                >
                  <div className="program-lead-cohort-details__submission-header">
                    <div>
                      <strong>Submission {submission.id}</strong>
                      <span>
                        Submitted: {formatDate(submission.submittedAt)}
                      </span>
                    </div>
                    <Tag type={getSubmissionTagType(submission.status)}>
                      {submission.status}
                    </Tag>
                  </div>

                  {submission.mentorNotes && (
                    <div>
                      <span>Mentor notes</span>
                      <p>{submission.mentorNotes}</p>
                    </div>
                  )}

                  {submission.reviewFeedback && (
                    <div>
                      <span>Review feedback</span>
                      <p>{submission.reviewFeedback}</p>
                    </div>
                  )}

                  {(submission.reviewerName || submission.reviewedAt) && (
                    <small>
                      Reviewer: {submission.reviewerId
                        ? submission.reviewerName || 'Recorded'
                        : `${submission.reviewerName || 'Not verified'} (unverified)`}
                      {' · '}
                      Reviewed: {formatDate(submission.reviewedAt)}
                    </small>
                  )}
                </article>
              ))
            ) : (
              <p className="program-lead-cohort-details__empty">
                No cohort submission records are available.
              </p>
            )}
          </section>

          <section className="program-lead-cohort-details__section">
            <div className="program-lead-cohort-details__section-heading">
              <div>
                <h3>Assessment records</h3>
                <p>
                  Assessment entries linked to this cohort. Individual
                  completion requirements must be evaluated from the
                  appropriate mentee-level records.
                </p>
              </div>
              <span>{selectedCohort.assessments.length} assessments</span>
            </div>

            {selectedCohort.assessments.length > 0 ? (
              <div className="program-lead-cohort-details__table-wrapper">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Mentee</TableHeader>
                      <TableHeader>Module</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Outcome</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCohort.assessments.map((assessment) => {
                      const mentee = selectedCohort.mentees.find(
                        (record) => record.id === assessment.menteeId,
                      )

                      return (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            {mentee?.name ?? 'Mentee record unavailable'}
                          </TableCell>
                          <TableCell>{assessment.moduleTitle}</TableCell>
                          <TableCell>{assessment.assessmentType}</TableCell>
                          <TableCell>
                            {formatDate(assessment.scheduledDate)}
                          </TableCell>
                          <TableCell>{assessment.status}</TableCell>
                          <TableCell>{assessment.outcome}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="program-lead-cohort-details__empty">
                No assessment records are linked to this cohort.
              </p>
            )}
          </section>

          <div className="program-lead-cohort-details__footer">
            <p>
              Data interpretation
              <span>
                Cohort and mentee counts are derived from linked shared
                records. Learning-plan module progress is not an individual
                competency result. Submission demo records may contain
                illustrative figures that have not been reconciled with
                individual mentee records.
              </span>
            </p>
          </div>
        </section>
      )}
    </main>
  )
}

export default CohortsPage
