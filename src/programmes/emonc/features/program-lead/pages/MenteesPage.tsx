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

import {
  programLeadMenteeService,
} from '../services/program-lead-mentee.service'

import type {
  ProgramLeadMenteeRecord,
} from '../services/program-lead-mentee.service'

import {
  facilityRepository,
} from '../../../data/repositories'

import '../styles/program-lead-mentees.scss'

interface MenteesPageProps {
  title: string
}

const tableHeaders = [
  'Mentee',
  'Professional role',
  'Facility',
  'Cohort',
  'Mentor',
  'Competency',
  'Assessments',
  'Follow-up flags',
  'Details',
]

function formatDate(date: string): string {
  if (!date) return '—'

  const parsedDate = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? `${date}T00:00:00`
      : date,
  )

  if (Number.isNaN(parsedDate.getTime())) {
    return '—'
  }

  return parsedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getCompetencyTagType(status: string) {
  switch (status) {
    case 'Competent':
      return 'green'
    case 'Needs Support':
      return 'red'
    case 'In Progress':
      return 'blue'
    default:
      return 'gray'
  }
}

function getAssessmentStatusTagType(status: string) {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Scheduled':
      return 'purple'
    case 'Cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function getAssessmentOutcomeTagType(outcome: string) {
  switch (outcome) {
    case 'Competent':
      return 'green'
    case 'Needs Support':
      return 'red'
    case 'Pending':
    default:
      return 'gray'
  }
}

function MenteesPage({ title }: MenteesPageProps) {
  const [mentees] = useState<ProgramLeadMenteeRecord[]>(
    () => programLeadMenteeService.getAll(),
  )

  const facilities = useMemo(() => {
    const menteeFacilityIds = new Set(
      mentees.map((mentee) => mentee.facilityId),
    )

    return facilityRepository
      .getAll()
      .filter((facility) => menteeFacilityIds.has(facility.id))
      .sort((first, second) =>
        first.name.localeCompare(second.name),
      )
  }, [mentees])

  const summary = useMemo(
    () => programLeadMenteeService.getSummary(mentees),
    [mentees],
  )

  const counties = useMemo(
    () =>
      [...new Set(
        mentees
          .map((mentee) => mentee.county)
          .filter((county) => county && county !== '—'),
      )].sort((first, second) => first.localeCompare(second)),
    [mentees],
  )

  const cohorts = useMemo(() => {
    const cohortOptions = new Map(
      mentees.map((mentee) => [
        mentee.cohortId,
        { id: mentee.cohortId, name: mentee.cohort },
      ]),
    )

    return [...cohortOptions.values()].sort(
      (first, second) => first.name.localeCompare(second.name),
    )
  }, [mentees])

  const [searchTerm, setSearchTerm] = useState('')
  const [countyFilter, setCountyFilter] = useState('all')
  const [facilityFilter, setFacilityFilter] = useState('all')
  const [cohortFilter, setCohortFilter] = useState('all')
  const [competencyFilter, setCompetencyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [selectedMentee, setSelectedMentee] =
    useState<ProgramLeadMenteeRecord | null>(null)

  const filteredMentees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return mentees.filter((mentee) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        mentee.name.toLowerCase().includes(normalizedSearch) ||
        mentee.email.toLowerCase().includes(normalizedSearch) ||
        mentee.id.toLowerCase().includes(normalizedSearch) ||
        mentee.professionalRole.toLowerCase().includes(normalizedSearch) ||
        mentee.facility.toLowerCase().includes(normalizedSearch) ||
        mentee.cohort.toLowerCase().includes(normalizedSearch) ||
        mentee.mentor.toLowerCase().includes(normalizedSearch)

      const matchesCounty =
        countyFilter === 'all' ||
        mentee.county === countyFilter

      const matchesFacility =
        facilityFilter === 'all' ||
        mentee.facilityId === facilityFilter

      const matchesCohort =
        cohortFilter === 'all' ||
        mentee.cohortId === cohortFilter

      const matchesCompetency =
        competencyFilter === 'all' ||
        mentee.competencyStatus === competencyFilter

      const matchesStatus =
        statusFilter === 'all' ||
        mentee.status === statusFilter

      return (
        matchesSearch &&
        matchesCounty &&
        matchesFacility &&
        matchesCohort &&
        matchesCompetency &&
        matchesStatus
      )
    })
  }, [
    mentees,
    searchTerm,
    countyFilter,
    facilityFilter,
    cohortFilter,
    competencyFilter,
    statusFilter,
  ])

  return (
    <div className="program-lead-mentees">

      <header className="program-lead-mentees__header">
        <div>
          <p className="program-lead-mentees__eyebrow">
            PROGRAMME MANAGEMENT
          </p>

          <h1>{title}</h1>

          <p className="program-lead-mentees__description">
            Monitor individual mentee placement, competency development,
            assessment activity and follow-up needs across the programme.
          </p>
        </div>
      </header>


      <section
        className="program-lead-mentees__summary"
        aria-label="Mentee statistics"
      >
        <article className="program-lead-mentees__summary-card">
          <span>Total mentees</span>
          <strong>{summary.total}</strong>
          <small>Individual mentee records</small>
        </article>

        <article className="program-lead-mentees__summary-card">
          <span>Competent</span>
          <strong>{summary.competent}</strong>
          <small>Recorded as competent</small>
        </article>

        <article className="program-lead-mentees__summary-card">
          <span>In progress</span>
          <strong>{summary.inProgress}</strong>
          <small>Continuing competency development</small>
        </article>

        <article className="program-lead-mentees__summary-card">
          <span>Needs support</span>
          <strong>{summary.needsSupport}</strong>
          <small>Recorded follow-up support category</small>
        </article>
      </section>

      <section className="program-lead-mentees__directory">

        <div className="program-lead-mentees__section-header">
          <div>
            <h2>Mentee directory</h2>
            <p>
              Search and review individual mentee records across
              programme facilities and cohorts.
            </p>
          </div>

          <span className="program-lead-mentees__result-count">
            {filteredMentees.length} of {mentees.length} mentees
          </span>
        </div>

        <div className="program-lead-mentees__filters">

          <div className="program-lead-mentees__search">
            <Search
              size="lg"
              labelText="Search mentees"
              placeholder="Search name, email, ID, role or placement"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.currentTarget.value)
              }
            />
          </div>

          <div className="program-lead-mentees__filter">
            <Select
              id="program-lead-mentee-county-filter"
              labelText="County"
              value={countyFilter}
              onChange={(event) =>
                setCountyFilter(event.currentTarget.value)
              }
            >
              <SelectItem value="all" text="All counties" />

              {counties.map((county) => (
                <SelectItem
                  key={county}
                  value={county}
                  text={county}
                />
              ))}
            </Select>
          </div>

          <div className="program-lead-mentees__filter">
            <Select
              id="program-lead-mentee-facility-filter"
              labelText="Facility"
              value={facilityFilter}
              onChange={(event) =>
                setFacilityFilter(event.currentTarget.value)
              }
            >
              <SelectItem value="all" text="All facilities" />

              {facilities.map((facility) => (
                <SelectItem
                  key={facility.id}
                  value={facility.id}
                  text={facility.name}
                />
              ))}
            </Select>
          </div>

          <div className="program-lead-mentees__filter">
            <Select
              id="program-lead-mentee-cohort-filter"
              labelText="Cohort"
              value={cohortFilter}
              onChange={(event) =>
                setCohortFilter(event.currentTarget.value)
              }
            >
              <SelectItem value="all" text="All cohorts" />

              {cohorts.map((cohort) => (
                <SelectItem
                  key={cohort.id}
                  value={cohort.id}
                  text={cohort.name}
                />
              ))}
            </Select>
          </div>

          <div className="program-lead-mentees__filter">
            <Select
              id="program-lead-mentee-competency-filter"
              labelText="Competency"
              value={competencyFilter}
              onChange={(event) =>
                setCompetencyFilter(event.currentTarget.value)
              }
            >
              <SelectItem value="all" text="All competency statuses" />
              <SelectItem value="Competent" text="Competent" />
              <SelectItem value="In Progress" text="In Progress" />
              <SelectItem value="Needs Support" text="Needs Support" />
            </Select>
          </div>

          <div className="program-lead-mentees__filter">
            <Select
              id="program-lead-mentee-status-filter"
              labelText="Account status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.currentTarget.value)
              }
            >
              <SelectItem value="all" text="All account statuses" />
              <SelectItem value="Active" text="Active" />
              <SelectItem value="Inactive" text="Inactive" />
            </Select>
          </div>

        </div>

        <div className="program-lead-mentees__table-wrapper">
          <Table>
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
              {filteredMentees.map((mentee) => (
                <TableRow key={mentee.id}>
                  <TableCell>
                    <div className="program-lead-mentees__identity">
                      <div className="program-lead-mentees__avatar">
                        {getInitials(mentee.name)}
                      </div>

                      <div>
                        <strong>{mentee.name}</strong>
                        <span>{mentee.id}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {mentee.professionalRole || '—'}
                  </TableCell>

                  <TableCell>
                    {mentee.facility}
                  </TableCell>

                  <TableCell>
                    {mentee.cohort}
                  </TableCell>

                  <TableCell>
                    {mentee.mentor}
                  </TableCell>

                  <TableCell>
                    <Tag type={getCompetencyTagType(mentee.competencyStatus)}>
                      {mentee.competencyStatus}
                    </Tag>
                  </TableCell>

                  <TableCell>
                    {mentee.assessmentCount}
                  </TableCell>

                  <TableCell>
                    {mentee.followUpsRequired}
                  </TableCell>

                  <TableCell>
                    <Button
                      kind="ghost"
                      size="sm"
                      hasIconOnly
                      renderIcon={View}
                      iconDescription={`View ${mentee.name}`}
                      onClick={() => setSelectedMentee(mentee)}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {filteredMentees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length}>
                    <div className="program-lead-mentees__empty">
                      <UserMultiple size={28} />

                      <strong>No mentees found</strong>

                      <span>
                        Try changing your search or filters.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {selectedMentee && (
        <section className="program-lead-mentee-details">

          <div className="program-lead-mentee-details__header">
            <div>
              <p>MENTEE PROFILE</p>
              <h2>{selectedMentee.name}</h2>
              <span>{selectedMentee.id}</span>
            </div>

            <div className="program-lead-mentee-details__actions">
              <Tag
                type={getCompetencyTagType(selectedMentee.competencyStatus)}
              >
                {selectedMentee.competencyStatus}
              </Tag>

              <Tag
                type={
                  selectedMentee.status === 'Active'
                    ? 'green'
                    : 'gray'
                }
              >
                {selectedMentee.status}
              </Tag>

              <Button
                kind="ghost"
                size="sm"
                onClick={() => setSelectedMentee(null)}
              >
                Close details
              </Button>
            </div>
          </div>

          <div className="program-lead-mentee-details__grid">
            <article>
              <span>Email address</span>
              <strong>{selectedMentee.email || '—'}</strong>
            </article>

            <article>
              <span>Phone number</span>
              <strong>{selectedMentee.phone || '—'}</strong>
            </article>

            <article>
              <span>Professional role</span>
              <strong>{selectedMentee.professionalRole || '—'}</strong>
            </article>

            <article>
              <span>Facility</span>
              <strong>{selectedMentee.facility}</strong>
            </article>

            <article>
              <span>County</span>
              <strong>{selectedMentee.county}</strong>
            </article>

            <article>
              <span>Cohort</span>
              <strong>{selectedMentee.cohort}</strong>
            </article>

            <article>
              <span>Confirmed mentor</span>
              <strong>{selectedMentee.mentor}</strong>
            </article>

            <article>
              <span>Account created</span>
              <strong>{formatDate(selectedMentee.createdAt)}</strong>
            </article>

            <article>
              <span>Last record update</span>
              <strong>{formatDate(selectedMentee.updatedAt)}</strong>
            </article>
          </div>

          <div className="program-lead-mentee-details__metrics">
            <article>
              <span>Recorded assessments</span>
              <strong>{selectedMentee.assessmentCount}</strong>
            </article>

            <article>
              <span>Completed assessments</span>
              <strong>{selectedMentee.completedAssessments}</strong>
            </article>

            <article>
              <span>Assessments flagged for follow-up</span>
              <strong>{selectedMentee.followUpsRequired}</strong>
            </article>
          </div>

          <div className="program-lead-mentee-details__assessments">
            <div className="program-lead-mentee-details__section-heading">
              <div>
                <h3>Assessment history</h3>
                <p>
                  Individual theory and practical assessment records
                  linked to this mentee.
                </p>
              </div>

              <span>
                {selectedMentee.assessments.length} records
              </span>
            </div>

            {selectedMentee.assessments.length > 0 ? (
              <div className="program-lead-mentee-details__table-wrapper">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Module</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Outcome</TableHeader>
                      <TableHeader>Assessor</TableHeader>
                      <TableHeader>Follow-up</TableHeader>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedMentee.assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          {assessment.moduleTitle}
                        </TableCell>

                        <TableCell>
                          <Tag type="blue">
                            {assessment.assessmentType}
                          </Tag>
                        </TableCell>

                        <TableCell>
                          {formatDate(assessment.scheduledDate)}
                        </TableCell>

                        <TableCell>
                          <Tag
                            type={getAssessmentStatusTagType(assessment.status)}
                          >
                            {assessment.status}
                          </Tag>
                        </TableCell>

                        <TableCell>
                          <Tag
                            type={getAssessmentOutcomeTagType(assessment.outcome)}
                          >
                            {assessment.outcome}
                          </Tag>
                        </TableCell>

                        <TableCell>
                          {assessment.assessorId
                            ? assessment.assessorName || '—'
                            : `${assessment.assessorName || 'Not recorded'} (unverified)`}
                        </TableCell>

                        <TableCell>
                          {assessment.followUpRequired ? 'Yes' : 'No'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="program-lead-mentee-details__empty">
                No individual assessment records are currently linked
                to this mentee.
              </div>
            )}
          </div>

          <div className="program-lead-mentee-details__notes">
            <h3>Recorded support notes</h3>
            <p>
              {selectedMentee.supportNotes ||
                'No support notes recorded.'}
            </p>
          </div>

          <div className="program-lead-mentee-details__footer">
            <p>
              Programme oversight
              <span>
                Assessment records and competency results are displayed
                for monitoring. Assessment changes and mentee account
                management remain with the responsible operational roles.
              </span>
            </p>
          </div>

        </section>
      )}

    </div>
  )
}

export default MenteesPage
