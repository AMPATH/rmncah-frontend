import { useMemo, useState } from 'react'

import { cohortManagementService } from '../services/cohort-management.service'

import type {
  CohortDirectoryRecord,
  CohortStatusFilter,
} from '../types/cohort-management.types'

import '../styles/county-mentor-cohorts.scss'

interface CohortsPageProps {
  title: string
}

function formatDate(date: string | null | undefined): string {
  if (!date) {
    return 'Not recorded'
  }

  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not recorded'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function CohortsPage({ title }: CohortsPageProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] =
    useState<CohortStatusFilter>('All')
  const [facility, setFacility] = useState('All')
  const [selectedCohort, setSelectedCohort] =
    useState<CohortDirectoryRecord | null>(null)

  const cohorts = useMemo(
    () => cohortManagementService.getAll(),
    [],
  )

  const summary = useMemo(
    () => cohortManagementService.getSummary(cohorts),
    [cohorts],
  )

  const facilities = useMemo(
    () =>
      [...new Set(
        cohorts
          .map((cohort) => cohort.facilityName)
          .filter(
            (name) => name !== 'Facility not assigned',
          ),
      )].sort(),
    [cohorts],
  )

  const filteredCohorts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return cohorts.filter((cohort) => {
      const matchesSearch =
        cohort.name.toLowerCase().includes(normalizedSearch) ||
        cohort.facilityName
          .toLowerCase()
          .includes(normalizedSearch) ||
        (cohort.mentorName ?? '')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        status === 'All' || cohort.status === status

      const matchesFacility =
        facility === 'All' ||
        cohort.facilityName === facility

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFacility
      )
    })
  }, [cohorts, search, status, facility])

  function handleCloseDetails() {
    setSelectedCohort(null)
  }

  return (
    <div className="county-cohorts">
      <header className="county-cohorts__header">
        <div>
          <span className="county-cohorts__eyebrow">
            COUNTY OVERSIGHT
          </span>

          <h1>{title}</h1>

          <p>
            Monitor mentorship cohorts across facilities,
            review mentee competency progress, and track
            programme training coverage.
          </p>
        </div>
      </header>

      {/* Cohort overview */}
      <section
        className="county-cohort-summary"
        aria-label="Cohort statistics"
      >
        <article className="county-cohort-summary__card">
          <span>Total cohorts</span>
          <strong>{summary.totalCohorts}</strong>
          <small>All registered cohorts</small>
        </article>

        <article className="county-cohort-summary__card">
          <span>Active cohorts</span>
          <strong>{summary.activeCohorts}</strong>
          <small>Currently in progress</small>
        </article>

        <article className="county-cohort-summary__card">
          <span>Completed cohorts</span>
          <strong>{summary.completedCohorts}</strong>
          <small>Marked as completed</small>
        </article>

        <article className="county-cohort-summary__card">
          <span>Paused cohorts</span>
          <strong>{summary.pausedCohorts}</strong>
          <small>Temporarily inactive</small>
        </article>

        <article className="county-cohort-summary__card">
          <span>Assigned mentees</span>
          <strong>{summary.totalMentees}</strong>
          <small>Across all cohorts</small>
        </article>
      </section>

      {/* Cohort directory */}
      <section className="county-cohorts__directory">
        <div className="county-cohorts__directory-header">
          <div>
            <h2>Cohort directory</h2>

            <p>
              Cohort assignments and competency progress
              across participating facilities.
            </p>
          </div>

          <span className="county-cohorts__result-count">
            {filteredCohorts.length}{' '}
            {filteredCohorts.length === 1
              ? 'cohort'
              : 'cohorts'}
          </span>
        </div>

        <div className="county-cohort-filters">
          <div className="county-cohort-filters__search">
            <label htmlFor="county-cohort-search">
              Search cohorts
            </label>

            <input
              id="county-cohort-search"
              type="search"
              placeholder="Search cohort, facility or Mentor..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="county-cohort-filters__field">
            <label htmlFor="county-cohort-status">
              Status
            </label>

            <select
              id="county-cohort-status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as CohortStatusFilter,
                )
              }
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          <div className="county-cohort-filters__field">
            <label htmlFor="county-cohort-facility">
              Facility
            </label>

            <select
              id="county-cohort-facility"
              value={facility}
              onChange={(event) =>
                setFacility(event.target.value)
              }
            >
              <option value="All">All facilities</option>

              {facilities.map((facilityName) => (
                <option
                  key={facilityName}
                  value={facilityName}
                >
                  {facilityName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="county-cohort-table-wrapper">
          <table className="county-cohort-table">
            <thead>
              <tr>
                <th scope="col">Cohort</th>
                <th scope="col">Facility</th>
                <th scope="col">Assigned Mentor</th>
                <th scope="col">Mentees</th>
                <th scope="col">Competency progress</th>
                <th scope="col">Status</th>
                <th scope="col">Start date</th>
                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCohorts.map((cohort) => (
                <tr key={cohort.id}>
                  <td>
                    <strong className="county-cohort-table__name">
                      {cohort.name}
                    </strong>

                    <span className="county-cohort-table__id">
                      {cohort.id}
                    </span>
                  </td>

                  <td>{cohort.facilityName}</td>

                  <td>
                    {cohort.mentorName ?? (
                      <span className="county-cohort-table__unassigned">
                        Not assigned
                      </span>
                    )}
                  </td>

                  <td>{cohort.menteesCount}</td>

                  <td>
                    <div className="county-cohort-table__progress">
                      <div className="county-cohort-table__progress-track">
                        <div
                          className="county-cohort-table__progress-fill"
                          style={{
                            width: `${cohort.progress}%`,
                          }}
                        />
                      </div>

                      <span>{cohort.progress}%</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`county-cohort-status county-cohort-status--${cohort.status.toLowerCase()}`}
                    >
                      {cohort.status}
                    </span>
                  </td>

                  <td>{formatDate(cohort.startDate)}</td>

                  <td>
                    <button
                      type="button"
                      className="county-cohort-table__view"
                      onClick={() =>
                        setSelectedCohort(cohort)
                      }
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCohorts.length === 0 && (
            <div className="county-cohort-table__empty">
              <strong>No cohorts found</strong>

              <p>
                Try changing your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Selected cohort details */}
      {selectedCohort && (
        <section
          className="county-cohort-details"
          aria-labelledby="county-cohort-details-heading"
        >
          <div className="county-cohort-details__header">
            <div>
              <span className="county-cohorts__eyebrow">
                COHORT OVERVIEW
              </span>

              <h2 id="county-cohort-details-heading">
                {selectedCohort.name}
              </h2>

              <p>{selectedCohort.facilityName}</p>
            </div>

            <button
              type="button"
              className="county-cohort-details__close"
              onClick={handleCloseDetails}
            >
              Close details
            </button>
          </div>

          <p className="county-cohort-details__description">
            {selectedCohort.description ||
              'No cohort description has been provided.'}
          </p>

          <div className="county-cohort-details__assignment">
            <div>
              <span>Assigned Mentor</span>

              <strong>
                {selectedCohort.mentorName ?? 'Not assigned'}
              </strong>
            </div>

            <div>
              <span>Facility</span>

              <strong>
                {selectedCohort.facilityName}
              </strong>
            </div>

            <div>
              <span>Cohort status</span>

              <strong>{selectedCohort.status}</strong>
            </div>
          </div>

          <div className="county-cohort-details__section">
            <h3>Mentee competency overview</h3>

            <div className="county-cohort-details__stats">
              <div>
                <span>Assigned mentees</span>
                <strong>{selectedCohort.menteesCount}</strong>
              </div>

              <div>
                <span>Competent</span>
                <strong>{selectedCohort.completedCount}</strong>
              </div>

              <div>
                <span>In progress</span>
                <strong>{selectedCohort.inProgressCount}</strong>
              </div>

              <div>
                <span>Needs support</span>
                <strong>{selectedCohort.needsSupportCount}</strong>
              </div>
            </div>

            <div className="county-cohort-details__overall-progress">
              <div>
                <span>Competency achievement</span>
                <strong>{selectedCohort.progress}%</strong>
              </div>

              <div className="county-cohort-details__progress-track">
                <div
                  className="county-cohort-details__progress-fill"
                  style={{
                    width: `${selectedCohort.progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="county-cohort-details__section">
            <h3>Training schedule</h3>

            <div className="county-cohort-details__dates">
              <div>
                <span>Start date</span>
                <strong>
                  {formatDate(selectedCohort.startDate)}
                </strong>
              </div>

              <div>
                <span>Expected end date</span>
                <strong>
                  {formatDate(selectedCohort.endDate)}
                </strong>
              </div>

              <div>
                <span>Next scheduled session</span>
                <strong>
                  {formatDate(selectedCohort.nextSession)}
                </strong>
              </div>
            </div>
          </div>

          <div className="county-cohort-details__section">
            <h3>Training modules</h3>

            {selectedCohort.trainingModules.length > 0 ? (
              <ul className="county-cohort-details__modules">
                {selectedCohort.trainingModules.map(
                  (module, index) => (
                    <li key={`${module}-${index}`}>
                      {module}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="county-cohort-details__empty">
                No learning plan modules are currently linked
                to this cohort.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default CohortsPage