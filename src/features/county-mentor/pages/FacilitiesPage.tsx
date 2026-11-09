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
  facilityManagementService,
} from '../services/facility-management.service'

import type {
  FacilityDirectoryRecord,
} from '../types/facility-management.types'

import '../styles/county-mentor-facilities.scss'

interface FacilitiesPageProps {
  title: string
}

function FacilitiesPage({ title }: FacilitiesPageProps) {
  const [search, setSearch] = useState('')
  const [county, setCounty] = useState('All')
  const [facilityStatus, setFacilityStatus] = useState('All')
  const [coverageStatus, setCoverageStatus] = useState('All')

  const [selectedFacilityId, setSelectedFacilityId] =
    useState<string | null>(null)

  const facilities = useMemo(
    () => facilityManagementService.getAll(),
    [],
  )

  const summary = useMemo(
    () => facilityManagementService.getSummary(facilities),
    [facilities],
  )

  const counties = useMemo(
    () =>
      [...new Set(
        facilities.map((facility) => facility.county),
      )].sort(),
    [facilities],
  )

  const filteredFacilities = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()

    return facilities.filter((facility) => {
      const matchesSearch =
        facility.name.toLowerCase().includes(searchTerm) ||
        facility.county.toLowerCase().includes(searchTerm) ||
        (facility.subCounty ?? '')
          .toLowerCase()
          .includes(searchTerm) ||
        (facility.facilityCode ?? '')
          .toLowerCase()
          .includes(searchTerm)

      const matchesCounty =
        county === 'All' ||
        facility.county === county

      const matchesStatus =
        facilityStatus === 'All' ||
        facility.status === facilityStatus

      const matchesCoverage =
        coverageStatus === 'All' ||
        facility.coverageStatus === coverageStatus

      return (
        matchesSearch &&
        matchesCounty &&
        matchesStatus &&
        matchesCoverage
      )
    })
  }, [
    facilities,
    search,
    county,
    facilityStatus,
    coverageStatus,
  ])

  const selectedFacility =
    facilities.find(
      (facility) => facility.id === selectedFacilityId,
    ) ?? null

  function handleViewFacility(
    facility: FacilityDirectoryRecord,
  ) {
    setSelectedFacilityId(facility.id)
  }

  function handleBackToDirectory() {
    setSelectedFacilityId(null)
  }

  return (
    <div className="county-facilities">
      {!selectedFacility ? (
        <>
          <header className="county-facilities__header">
            <div>
              <p className="county-facilities__eyebrow">
                COUNTY MENTOR WORKSPACE
              </p>

              <h1>{title}</h1>

              <p>
                Monitor participating facilities, mentorship coverage,
                mentor availability and mentee distribution across the
                programme.
              </p>
            </div>
          </header>

          {/* SUMMARY */}

          <section className="county-facilities-summary">
            <article className="county-facilities-summary__card">
              <span>Total facilities</span>
              <strong>{summary.totalFacilities}</strong>
              <p>Registered programme facilities</p>
            </article>

            <article className="county-facilities-summary__card">
              <span>Active facilities</span>
              <strong>{summary.activeFacilities}</strong>
              <p>Facilities with active status</p>
            </article>

            <article className="county-facilities-summary__card">
              <span>With active mentors</span>
              <strong>{summary.facilitiesWithMentors}</strong>
              <p>Facilities with assigned active mentors</p>
            </article>

            <article className="county-facilities-summary__card">
              <span>Without active cohorts</span>
              <strong>{summary.facilitiesWithoutActiveCohorts}</strong>
              <p>Facilities with no active cohort records</p>
            </article>
          </section>

          {/* DIRECTORY */}

          <section className="county-facilities__directory">
            <div className="county-facilities__section-header">
              <div>
                <h2>Facility directory</h2>
                <p>
                  Review facility information and mentorship coverage.
                </p>
              </div>

              <span className="county-facilities__count">
                {filteredFacilities.length} facilities
              </span>
            </div>

            {/* FILTERS */}

            <div className="county-facilities-filters">
              <div className="county-facilities-filters__search">
                <Search
                  id="county-facility-search"
                  labelText="Search facilities"
                  placeholder="Search name, county or facility code"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div>
                <Select
                  id="county-facility-county"
                  labelText="County"
                  value={county}
                  onChange={(event) =>
                    setCounty(event.target.value)
                  }
                >
                  <SelectItem value="All" text="All counties" />

                  {counties.map((item) => (
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
                  id="county-facility-status"
                  labelText="Facility status"
                  value={facilityStatus}
                  onChange={(event) =>
                    setFacilityStatus(event.target.value)
                  }
                >
                  <SelectItem value="All" text="All statuses" />
                  <SelectItem value="Active" text="Active" />
                  <SelectItem value="Inactive" text="Inactive" />
                </Select>
              </div>

              <div>
                <Select
                  id="county-facility-coverage"
                  labelText="Mentorship coverage"
                  value={coverageStatus}
                  onChange={(event) =>
                    setCoverageStatus(event.target.value)
                  }
                >
                  <SelectItem value="All" text="All coverage" />
                  <SelectItem value="Covered" text="Has active cohort" />
                  <SelectItem
                    value="No active cohort"
                    text="No active cohort"
                  />
                </Select>
              </div>
            </div>

            {/* TABLE */}

            <div className="county-facilities-table-wrapper">
              {filteredFacilities.length > 0 ? (
                <table className="county-facilities-table">
                  <thead>
                    <tr>
                      <th>Facility</th>
                      <th>County</th>
                      <th>Sub-county</th>
                      <th>Mentors</th>
                      <th>Cohorts</th>
                      <th>Mentees</th>
                      <th>Coverage</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredFacilities.map((facility) => (
                      <tr key={facility.id}>
                        <td>
                          <div className="county-facilities-table__identity">
                            <strong>{facility.name}</strong>
                            <span>
                              {facility.facilityCode ??
                                'Code not recorded'}
                            </span>
                          </div>
                        </td>

                        <td>{facility.county}</td>

                        <td>
                          {facility.subCounty ?? 'Not recorded'}
                        </td>

                        <td>
                          <div className="county-facilities-table__count">
                            <strong>{facility.mentors.length}</strong>
                            <span>
                              {facility.activeMentors} active
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="county-facilities-table__count">
                            <strong>{facility.cohorts.length}</strong>
                            <span>
                              {facility.activeCohorts} active
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="county-facilities-table__count">
                            <strong>{facility.mentees.length}</strong>
                            <span>
                              {facility.activeMentees} active
                            </span>
                          </div>
                        </td>

                        <td>
                          <Tag
                            type={
                              facility.coverageStatus === 'Covered'
                                ? 'green'
                                : 'warm-gray'
                            }
                          >
                            {facility.coverageStatus}
                          </Tag>
                        </td>

                        <td>
                          <Tag
                            type={
                              facility.status === 'Active'
                                ? 'green'
                                : 'gray'
                            }
                          >
                            {facility.status}
                          </Tag>
                        </td>

                        <td>
                          <Button
                            kind="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewFacility(facility)
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
                <div className="county-facilities__empty">
                  <h3>No facilities found</h3>
                  <p>
                    Try changing your search or filter selections.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* FACILITY DETAILS */

        <section className="county-facility-details">
          <div className="county-facility-details__header">
            <div>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={ArrowLeft}
                onClick={handleBackToDirectory}
              >
                Back to facilities
              </Button>

              <h1>{selectedFacility.name}</h1>

              <p>
                {selectedFacility.county}
                {selectedFacility.subCounty
                  ? ` · ${selectedFacility.subCounty}`
                  : ''}
              </p>
            </div>

            <Tag
              type={
                selectedFacility.status === 'Active'
                  ? 'green'
                  : 'gray'
              }
            >
              {selectedFacility.status}
            </Tag>
          </div>

          {/* FACILITY INFORMATION */}

          <div className="county-facility-details__section">
            <h2>Facility information</h2>

            <div className="county-facility-details__grid">
              <article>
                <span>Facility name</span>
                <strong>{selectedFacility.name}</strong>
              </article>

              <article>
                <span>County</span>
                <strong>{selectedFacility.county}</strong>
              </article>

              <article>
                <span>Sub-county</span>
                <strong>
                  {selectedFacility.subCounty ?? 'Not recorded'}
                </strong>
              </article>

              <article>
                <span>Facility code</span>
                <strong>
                  {selectedFacility.facilityCode ?? 'Not recorded'}
                </strong>
              </article>

              <article>
                <span>Registered</span>
                <strong>
                  {new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }).format(
                    new Date(selectedFacility.createdAt),
                  )}
                </strong>
              </article>

              <article>
                <span>Mentorship coverage</span>
                <strong>{selectedFacility.coverageStatus}</strong>
              </article>
            </div>
          </div>

          {/* COVERAGE SUMMARY */}

          <div className="county-facility-details__section">
            <h2>Mentorship coverage</h2>

            <div className="county-facility-details__metrics">
              <article>
                <span>Total mentors</span>
                <strong>{selectedFacility.mentors.length}</strong>
                <small>
                  {selectedFacility.activeMentors} active
                </small>
              </article>

              <article>
                <span>Total cohorts</span>
                <strong>{selectedFacility.cohorts.length}</strong>
                <small>
                  {selectedFacility.activeCohorts} active
                </small>
              </article>

              <article>
                <span>Total mentees</span>
                <strong>{selectedFacility.mentees.length}</strong>
                <small>
                  {selectedFacility.activeMentees} active
                </small>
              </article>
            </div>
          </div>

          {/* MENTORS */}

          <div className="county-facility-details__section">
            <div className="county-facility-details__section-heading">
              <div>
                <h2>Assigned mentors</h2>
                <p>Mentors registered at this facility.</p>
              </div>

              <span>
                {selectedFacility.mentors.length} mentors
              </span>
            </div>

            {selectedFacility.mentors.length > 0 ? (
              <div className="county-facilities-table-wrapper">
                <table className="county-facilities-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Professional role</th>
                      <th>Specialty</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedFacility.mentors.map((mentor) => (
                      <tr key={mentor.id}>
                        <td>{mentor.name}</td>
                        <td>{mentor.professionalRole}</td>
                        <td>{mentor.specialty}</td>
                        <td>
                          <Tag
                            type={
                              mentor.status === 'Active'
                                ? 'green'
                                : 'gray'
                            }
                          >
                            {mentor.status}
                          </Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="county-facilities__empty">
                <h3>No mentors registered</h3>
                <p>
                  No mentor records are currently linked to this facility.
                </p>
              </div>
            )}
          </div>

          {/* COHORTS */}

          <div className="county-facility-details__section">
            <div className="county-facility-details__section-heading">
              <div>
                <h2>Facility cohorts</h2>
                <p>
                  Cohorts associated with this facility.
                </p>
              </div>

              <span>
                {selectedFacility.cohorts.length} cohorts
              </span>
            </div>

            {selectedFacility.cohorts.length > 0 ? (
              <div className="county-facilities-table-wrapper">
                <table className="county-facilities-table">
                  <thead>
                    <tr>
                      <th>Cohort</th>
                      <th>Start date</th>
                      <th>End date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedFacility.cohorts.map((cohort) => (
                      <tr key={cohort.id}>
                        <td>{cohort.name}</td>
                        <td>{cohort.startDate}</td>
                        <td>{cohort.endDate}</td>
                        <td>
                          <Tag
                            type={
                              cohort.status === 'Active'
                                ? 'green'
                                : cohort.status === 'Completed'
                                  ? 'blue'
                                  : 'warm-gray'
                            }
                          >
                            {cohort.status}
                          </Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="county-facilities__empty">
                <h3>No cohorts recorded</h3>
                <p>
                  No cohorts are currently associated with this facility.
                </p>
              </div>
            )}
          </div>

          {/* MENTEES */}

          <div className="county-facility-details__section">
            <div className="county-facility-details__section-heading">
              <div>
                <h2>Registered mentees</h2>
                <p>
                  Mentees currently linked to this facility.
                </p>
              </div>

              <span>
                {selectedFacility.mentees.length} mentees
              </span>
            </div>

            {selectedFacility.mentees.length > 0 ? (
              <div className="county-facilities-table-wrapper">
                <table className="county-facilities-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Professional role</th>
                      <th>Cohort</th>
                      <th>Competency</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedFacility.mentees.map((mentee) => {
                      const cohort = selectedFacility.cohorts.find(
                        (item) => item.id === mentee.cohortId,
                      )

                      return (
                        <tr key={mentee.id}>
                          <td>{mentee.name}</td>
                          <td>{mentee.professionalRole}</td>
                          <td>
                            {cohort?.name ?? 'Not assigned'}
                          </td>
                          <td>
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
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="county-facilities__empty">
                <h3>No mentees registered</h3>
                <p>
                  No mentees are currently linked to this facility.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default FacilitiesPage