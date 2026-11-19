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
  programLeadMentorService,
} from '../services/program-lead-mentor.service'

import type {
  ProgramLeadMentorRecord,
} from '../services/program-lead-mentor.service'

import {
  facilityRepository,
} from '../../../data/repositories'

import '../styles/program-lead-mentors.scss'

interface MentorsPageProps {
  title: string
}

const tableHeaders = [
  'Mentor',
  'Professional role',
  'Facility',
  'County',
  'Cohorts',
  'Mentees',
  'Status',
  'Details',
]

function formatDate(date: string): string {
  if (!date) return '—'

  const parsedDate = new Date(date)

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

function MentorsPage({ title }: MentorsPageProps) {
  const [mentors] = useState<ProgramLeadMentorRecord[]>(
    () => programLeadMentorService.getAll(),
  )

  const facilities = useMemo(
    () =>
      facilityRepository
        .getAll()
        .sort((first, second) =>
          first.name.localeCompare(second.name),
        ),
    [],
  )

  const summary = useMemo(
    () => programLeadMentorService.getSummary(mentors),
    [mentors],
  )

  const counties = useMemo(
    () =>
      [...new Set(
        mentors
          .map((mentor) => mentor.county)
          .filter(Boolean),
      )].sort((first, second) => first.localeCompare(second)),
    [mentors],
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [countyFilter, setCountyFilter] = useState('all')
  const [facilityFilter, setFacilityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [selectedMentor, setSelectedMentor] =
    useState<ProgramLeadMentorRecord | null>(null)

  const filteredMentors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return mentors.filter((mentor) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        mentor.name.toLowerCase().includes(normalizedSearch) ||
        (mentor.email ?? '').toLowerCase().includes(normalizedSearch) ||
        mentor.id.toLowerCase().includes(normalizedSearch) ||
        mentor.facility.toLowerCase().includes(normalizedSearch) ||
        mentor.professionalRole.toLowerCase().includes(normalizedSearch) ||
        mentor.specialty.toLowerCase().includes(normalizedSearch)

      const matchesCounty =
        countyFilter === 'all' ||
        mentor.county === countyFilter

      const matchesFacility =
        facilityFilter === 'all' ||
        mentor.facilityId === facilityFilter

      const matchesStatus =
        statusFilter === 'all' ||
        mentor.status === statusFilter

      return (
        matchesSearch &&
        matchesCounty &&
        matchesFacility &&
        matchesStatus
      )
    })
  }, [
    mentors,
    searchTerm,
    countyFilter,
    facilityFilter,
    statusFilter,
  ])

  return (
    <div className="program-lead-mentors">

      <header className="program-lead-mentors__header">
        <div>
          <p className="program-lead-mentors__eyebrow">
            PROGRAMME MANAGEMENT
          </p>

          <h1>{title}</h1>

          <p className="program-lead-mentors__description">
            View mentors across the programme, their professional
            backgrounds, facilities and confirmed cohort assignments.
          </p>
        </div>
      </header>


      <section
        className="program-lead-mentors__summary"
        aria-label="Mentor statistics"
      >
        <article className="program-lead-mentors__summary-card">
          <span>Total mentors</span>
          <strong>{summary.total}</strong>
          <small>Registered programme mentors</small>
        </article>

        <article className="program-lead-mentors__summary-card">
          <span>Active mentors</span>
          <strong>{summary.active}</strong>
          <small>Currently active accounts</small>
        </article>

        <article className="program-lead-mentors__summary-card">
          <span>Inactive mentors</span>
          <strong>{summary.inactive}</strong>
          <small>Currently inactive accounts</small>
        </article>

        <article className="program-lead-mentors__summary-card">
          <span>Confirmed cohort assignments</span>
          <strong>{summary.assignedCohorts}</strong>
          <small>Based on recorded mentor-to-cohort links</small>
        </article>
      </section>

      <section className="program-lead-mentors__directory">

        <div className="program-lead-mentors__section-header">
          <div>
            <h2>Mentor directory</h2>
            <p>
              Search and review mentor records across programme facilities.
            </p>
          </div>

          <span className="program-lead-mentors__result-count">
            {filteredMentors.length} of {mentors.length} mentors
          </span>
        </div>

        <div className="program-lead-mentors__filters">

          <div className="program-lead-mentors__search">
            <Search
              size="lg"
              labelText="Search mentors"
              placeholder="Search name, email, ID, role or facility"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.currentTarget.value)
              }
            />
          </div>

          <div className="program-lead-mentors__filter">
            <Select
              id="program-lead-mentor-county-filter"
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

          <div className="program-lead-mentors__filter">
            <Select
              id="program-lead-mentor-facility-filter"
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

          <div className="program-lead-mentors__filter">
            <Select
              id="program-lead-mentor-status-filter"
              labelText="Account status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.currentTarget.value)
              }
            >
              <SelectItem value="all" text="All statuses" />
              <SelectItem value="Active" text="Active" />
              <SelectItem value="Inactive" text="Inactive" />
            </Select>
          </div>

        </div>

        <div className="program-lead-mentors__table-wrapper">
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
              {filteredMentors.map((mentor) => (
                <TableRow key={mentor.id}>
                  <TableCell>
                    <div className="program-lead-mentors__identity">
                      <div className="program-lead-mentors__avatar">
                        {getInitials(mentor.name)}
                      </div>

                      <div>
                        <strong>{mentor.name}</strong>
                        <span>{mentor.id}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {mentor.professionalRole || '—'}
                  </TableCell>

                  <TableCell>
                    {mentor.facility}
                  </TableCell>

                  <TableCell>
                    {mentor.county || '—'}
                  </TableCell>

                  <TableCell>
                    {mentor.cohortsAssigned}
                  </TableCell>

                  <TableCell>
                    {mentor.menteesAssigned}
                  </TableCell>

                  <TableCell>
                    <Tag
                      type={
                        mentor.status === 'Active'
                          ? 'green'
                          : 'gray'
                      }
                    >
                      {mentor.status}
                    </Tag>
                  </TableCell>

                  <TableCell>
                    <Button
                      kind="ghost"
                      size="sm"
                      hasIconOnly
                      renderIcon={View}
                      iconDescription={`View ${mentor.name}`}
                      onClick={() => setSelectedMentor(mentor)}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {filteredMentors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length}>
                    <div className="program-lead-mentors__empty">
                      <UserMultiple size={28} />

                      <strong>No mentors found</strong>

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

      {selectedMentor && (
        <section className="program-lead-mentor-details">

          <div className="program-lead-mentor-details__header">
            <div>
              <p>MENTOR PROFILE</p>
              <h2>{selectedMentor.name}</h2>
              <span>{selectedMentor.id}</span>
            </div>

            <div className="program-lead-mentor-details__actions">
              <Tag
                type={
                  selectedMentor.status === 'Active'
                    ? 'green'
                    : 'gray'
                }
              >
                {selectedMentor.status}
              </Tag>

              <Button
                kind="ghost"
                size="sm"
                onClick={() => setSelectedMentor(null)}
              >
                Close details
              </Button>
            </div>
          </div>

          <div className="program-lead-mentor-details__grid">
            <article>
              <span>Email address</span>
              <strong>{selectedMentor.email || '—'}</strong>
            </article>

            <article>
              <span>Phone number</span>
              <strong>{selectedMentor.phone || '—'}</strong>
            </article>

            <article>
              <span>Professional role</span>
              <strong>{selectedMentor.professionalRole || '—'}</strong>
            </article>

            <article>
              <span>Specialty</span>
              <strong>{selectedMentor.specialty || '—'}</strong>
            </article>

            <article>
              <span>Facility</span>
              <strong>{selectedMentor.facility}</strong>
            </article>

            <article>
              <span>County</span>
              <strong>{selectedMentor.county || '—'}</strong>
            </article>

            <article>
              <span>Confirmed cohort assignments</span>
              <strong>{selectedMentor.cohortsAssigned}</strong>
            </article>

            <article>
              <span>Mentees in assigned cohorts</span>
              <strong>{selectedMentor.menteesAssigned}</strong>
            </article>

            <article>
              <span>Account created</span>
              <strong>{formatDate(selectedMentor.createdAt)}</strong>
            </article>
          </div>

          <div className="program-lead-mentor-details__footer">
            <p>
              Programme oversight
              <span>
                Account changes and mentor management remain with the
                responsible operational role.
              </span>
            </p>
          </div>

        </section>
      )}

    </div>
  )
}

export default MentorsPage
