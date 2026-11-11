import { useMemo, useState } from 'react'

import {
  Button,
  Search,
  Select,
  SelectItem,
  Tag,
} from '@carbon/react'

import {
  ArrowLeft,
} from '@carbon/icons-react'

import {
  menteeManagementService,
} from '../services/mentee-management.service'

import type {
  MenteeDirectoryRecord,
} from '../types/mentee-management.types'

import '../styles/county-mentor-mentees.scss'

interface MenteesPageProps {
  title: string
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Not recorded'
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getCompetencyTag(
  status: MenteeDirectoryRecord['competencyStatus'],
) {
  switch (status) {
    case 'Competent':
      return 'green'

    case 'Needs Support':
      return 'red'

    default:
      return 'blue'
  }
}

function MenteesPage({ title }: MenteesPageProps) {
  const [search, setSearch] = useState('')
  const [facility, setFacility] = useState('All')
  const [cohort, setCohort] = useState('All')
  const [competencyStatus, setCompetencyStatus] =
    useState('All')
  const [accountStatus, setAccountStatus] =
    useState('All')

  const [selectedMenteeId, setSelectedMenteeId] =
    useState<string | null>(null)

  const mentees = useMemo(
    () => menteeManagementService.getAll(),
    [],
  )

  const summary = useMemo(
    () => menteeManagementService.getSummary(mentees),
    [mentees],
  )

  const facilities = useMemo(
    () =>
      [...new Set(
        mentees.map((mentee) => mentee.facilityName),
      )].sort(),
    [mentees],
  )

  const cohorts = useMemo(
    () =>
      [...new Set(
        mentees.map((mentee) => mentee.cohortName),
      )].sort(),
    [mentees],
  )

  const filteredMentees = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()

    return mentees.filter((mentee) => {
      const matchesSearch =
        mentee.name.toLowerCase().includes(searchTerm) ||
        mentee.email.toLowerCase().includes(searchTerm) ||
        mentee.facilityName.toLowerCase().includes(searchTerm) ||
        mentee.cohortName.toLowerCase().includes(searchTerm) ||
        mentee.professionalRole.toLowerCase().includes(searchTerm) ||
        (mentee.mentorName ?? '')
          .toLowerCase()
          .includes(searchTerm)

      const matchesFacility =
        facility === 'All' ||
        mentee.facilityName === facility

      const matchesCohort =
        cohort === 'All' ||
        mentee.cohortName === cohort

      const matchesCompetency =
        competencyStatus === 'All' ||
        mentee.competencyStatus === competencyStatus

      const matchesAccountStatus =
        accountStatus === 'All' ||
        mentee.status === accountStatus

      return (
        matchesSearch &&
        matchesFacility &&
        matchesCohort &&
        matchesCompetency &&
        matchesAccountStatus
      )
    })
  }, [
    mentees,
    search,
    facility,
    cohort,
    competencyStatus,
    accountStatus,
  ])

  const selectedMentee = mentees.find(
    (mentee) => mentee.id === selectedMenteeId,
  ) ?? null

  function handleViewMentee(mentee: MenteeDirectoryRecord) {
    setSelectedMenteeId(mentee.id)
  }

  function handleBackToDirectory() {
    setSelectedMenteeId(null)
  }

  return (
    <div className="county-mentees">
      {!selectedMentee ? (
        <>
          <header className="county-mentees__header">
            <div>
              <p className="county-mentees__eyebrow">
                COUNTY MENTOR WORKSPACE
              </p>

              <h1>{title}</h1>

              <p>
                Monitor mentee participation, competency development,
                and support requirements across facilities and cohorts.
              </p>
            </div>
          </header>

          {/* SUMMARY */}

          <section className="county-mentees-summary">
            <article className="county-mentees-summary__card">
              <span>Total mentees</span>
              <strong>{summary.totalMentees}</strong>
              <p>Across all available cohorts</p>
            </article>

            <article className="county-mentees-summary__card">
              <span>Competent</span>
              <strong>{summary.competent}</strong>
              <p>Mentees meeting competency status</p>
            </article>

            <article className="county-mentees-summary__card">
              <span>In progress</span>
              <strong>{summary.inProgress}</strong>
              <p>Mentees continuing their training</p>
            </article>

            <article className="county-mentees-summary__card">
              <span>Needs support</span>
              <strong>{summary.needsSupport}</strong>
              <p>Mentees requiring additional attention</p>
            </article>
          </section>

          {/* DIRECTORY */}

          <section className="county-mentees__directory">
            <div className="county-mentees__section-header">
              <div>
                <h2>Mentee directory</h2>
                <p>
                  County-wide view of registered mentees and their
                  mentorship progress.
                </p>
              </div>

              <span className="county-mentees__count">
                {filteredMentees.length} mentees
              </span>
            </div>

            {/* FILTERS */}

            <div className="county-mentees-filters">
              <div className="county-mentees-filters__search">
                <Search
                  id="county-mentee-search"
                  labelText="Search mentees"
                  placeholder="Search name, email, facility or mentor"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div>
                <Select
                  id="county-mentee-facility"
                  labelText="Facility"
                  value={facility}
                  onChange={(event) =>
                    setFacility(event.target.value)
                  }
                >
                  <SelectItem value="All" text="All facilities" />

                  {facilities.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                      text={item}
                    />
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  id="county-mentee-cohort"
                  labelText="Cohort"
                  value={cohort}
                  onChange={(event) =>
                    setCohort(event.target.value)
                  }
                >
                  <SelectItem value="All" text="All cohorts" />

                  {cohorts.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                      text={item}
                    />
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  id="county-mentee-competency"
                  labelText="Competency status"
                  value={competencyStatus}
                  onChange={(event) =>
                    setCompetencyStatus(event.target.value)
                  }
                >
                  <SelectItem value="All" text="All statuses" />
                  <SelectItem value="Competent" text="Competent" />
                  <SelectItem value="In Progress" text="In Progress" />
                  <SelectItem value="Needs Support" text="Needs Support" />
                </Select>
              </div>

              <div>
                <Select
                  id="county-mentee-account-status"
                  labelText="Account status"
                  value={accountStatus}
                  onChange={(event) =>
                    setAccountStatus(event.target.value)
                  }
                >
                  <SelectItem value="All" text="All accounts" />
                  <SelectItem value="Active" text="Active" />
                  <SelectItem value="Inactive" text="Inactive" />
                </Select>
              </div>
            </div>

            {/* TABLE */}

            <div className="county-mentees-table-wrapper">
              {filteredMentees.length > 0 ? (
                <table className="county-mentees-table">
                  <thead>
                    <tr>
                      <th>Mentee</th>
                      <th>Professional role</th>
                      <th>Facility</th>
                      <th>Cohort</th>
                      <th>Assigned mentor</th>
                      <th>Competency</th>
                      <th>Account</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMentees.map((mentee) => (
                      <tr key={mentee.id}>
                        <td>
                          <div className="county-mentees-table__person">
                            <strong>{mentee.name}</strong>
                            <span>{mentee.email}</span>
                          </div>
                        </td>

                        <td>{mentee.professionalRole}</td>

                        <td>{mentee.facilityName}</td>

                        <td>{mentee.cohortName}</td>

                        <td>
                          {mentee.mentorName ?? (
                            <span className="county-mentees__muted">
                              Not assigned
                            </span>
                          )}
                        </td>

                        <td>
                          <Tag
                            type={getCompetencyTag(
                              mentee.competencyStatus,
                            )}
                          >
                            {mentee.competencyStatus}
                          </Tag>
                        </td>

                        <td>
                          <Tag
                            type={
                              mentee.status === 'Active'
                                ? 'green'
                                : 'gray'
                            }
                          >
                            {mentee.status}
                          </Tag>
                        </td>

                        <td>
                          <Button
                            kind="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewMentee(mentee)
                            }
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="county-mentees__empty">
                  <h3>No mentees found</h3>
                  <p>
                    Try changing your search or filter selections.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* MENTEE DETAILS */

        <section className="county-mentee-details">
          <div className="county-mentee-details__header">
            <div>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={ArrowLeft}
                onClick={handleBackToDirectory}
              >
                Back to mentees
              </Button>

              <h1>{selectedMentee.name}</h1>
              <p>{selectedMentee.email}</p>
            </div>

            <div className="county-mentee-details__tags">
              <Tag
                type={getCompetencyTag(
                  selectedMentee.competencyStatus,
                )}
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
            </div>
          </div>

          {/* PROFILE INFORMATION */}

          <div className="county-mentee-details__section">
            <h2>Mentee information</h2>

            <div className="county-mentee-details__grid">
              <article>
                <span>Professional role</span>
                <strong>{selectedMentee.professionalRole}</strong>
              </article>

              <article>
                <span>Facility</span>
                <strong>{selectedMentee.facilityName}</strong>
              </article>

              <article>
                <span>Cohort</span>
                <strong>{selectedMentee.cohortName}</strong>
              </article>

              <article>
                <span>Assigned mentor</span>
                <strong>
                  {selectedMentee.mentorName ?? 'Not assigned'}
                </strong>
              </article>

              <article>
                <span>Phone number</span>
                <strong>
                  {selectedMentee.phone ?? 'Not provided'}
                </strong>
              </article>

              <article>
                <span>Date registered</span>
                <strong>
                  {formatDate(selectedMentee.createdAt)}
                </strong>
              </article>
            </div>
          </div>

          {/* ASSESSMENT SUMMARY */}

          <div className="county-mentee-details__section">
            <h2>Assessment overview</h2>

            <div className="county-mentee-details__assessment-summary">
              <article>
                <span>Total assessments</span>
                <strong>
                  {selectedMentee.assessments.length}
                </strong>
              </article>

              <article>
                <span>Completed assessments</span>
                <strong>
                  {selectedMentee.completedAssessments}
                </strong>
              </article>

              <article>
                <span>Follow-ups required</span>
                <strong>
                  {selectedMentee.followUpRequiredCount}
                </strong>
              </article>

              <article>
                <span>Latest assessment</span>
                <strong>
                  {formatDate(
                    selectedMentee.latestAssessmentDate,
                  )}
                </strong>
              </article>
            </div>
          </div>

          {/* SUPPORT NOTES */}

          <div className="county-mentee-details__section">
            <h2>Mentorship support notes</h2>

            <p className="county-mentee-details__notes">
              {selectedMentee.supportNotes ||
                'No support notes have been recorded.'}
            </p>
          </div>

          {/* ASSESSMENT HISTORY */}

          <div className="county-mentee-details__section">
            <div className="county-mentee-details__section-heading">
              <div>
                <h2>Assessment history</h2>
                <p>
                  Recorded theory and practical assessments for this mentee.
                </p>
              </div>

              <span>
                {selectedMentee.assessments.length} records
              </span>
            </div>

            {selectedMentee.assessments.length > 0 ? (
              <div className="county-mentees-table-wrapper">
                <table className="county-mentees-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Outcome</th>
                      <th>Follow-up</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedMentee.assessments.map(
                      (assessment) => (
                        <tr key={assessment.id}>
                          <td>{assessment.moduleTitle}</td>

                          <td>{assessment.assessmentType}</td>

                          <td>
                            {formatDate(assessment.scheduledDate)}
                          </td>

                          <td>{assessment.status}</td>

                          <td>{assessment.outcome}</td>

                          <td>
                            {assessment.followUpRequired ? (
                              <Tag type="red">Required</Tag>
                            ) : (
                              <Tag type="green">Not required</Tag>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="county-mentees__empty">
                <h3>No assessment records</h3>
                <p>
                  No assessments have been recorded for this mentee yet.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default MenteesPage