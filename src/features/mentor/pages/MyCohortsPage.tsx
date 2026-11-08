import { useMemo, useState } from 'react'

import CohortSummary from '../components/cohorts/CohortSummary'
import CohortFilters from '../components/cohorts/CohortFilters'
import CohortTable from '../components/cohorts/CohortTable'

import { mentorCohortsData } from '../data/mentorCohortsData'

import type { MentorCohort } from '../types/mentor.types'

import '../styles/mentor-cohorts.scss'

interface MyCohortsPageProps {
  title: string
}

function MyCohortsPage({ title }: MyCohortsPageProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [selectedCohort, setSelectedCohort] =
    useState<MentorCohort | null>(null)

  const filteredCohorts = useMemo(() => {
    return mentorCohortsData.filter((cohort) => {
      const matchesSearch =
        cohort.name.toLowerCase().includes(search.toLowerCase()) ||
        cohort.facility.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        status === 'All' || cohort.status === status

      return matchesSearch && matchesStatus
    })
  }, [search, status])

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`))
  }

  return (
    <div className="mentor-cohorts">
      <header className="mentor-cohorts__header">
        <div>
          <span className="mentor-cohorts__eyebrow">
            MENTOR WORKSPACE
          </span>

          <h1>{title}</h1>

          <p>
            View and manage the cohorts assigned to you,
            monitor training progress and follow up on mentees.
          </p>
        </div>
      </header>

      <CohortSummary cohorts={mentorCohortsData} />

      <section className="mentor-cohorts__directory">
        <div className="mentor-cohorts__directory-header">
          <div>
            <h2>Cohort directory</h2>

            <p>
              Your assigned mentorship cohorts and their current status.
            </p>
          </div>

          <span className="mentor-cohorts__result-count">
            {filteredCohorts.length} cohorts
          </span>
        </div>

        <CohortFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />

        <CohortTable
          cohorts={filteredCohorts}
          onViewCohort={setSelectedCohort}
        />
      </section>

      {selectedCohort && (
        <section
          className="mentor-cohort-details"
          aria-labelledby="cohort-details-heading"
        >
          <div className="mentor-cohort-details__header">
            <div>
              <span className="mentor-cohorts__eyebrow">
                COHORT DETAILS
              </span>

              <h2 id="cohort-details-heading">
                {selectedCohort.name}
              </h2>

              <p>{selectedCohort.facility}</p>
            </div>

            <button
              type="button"
              className="mentor-cohort-details__close"
              onClick={() => setSelectedCohort(null)}
            >
              Close details
            </button>
          </div>

          <p className="mentor-cohort-details__description">
            {selectedCohort.description}
          </p>

          <div className="mentor-cohort-details__grid">
            <div>
              <span>Assigned mentees</span>
              <strong>{selectedCohort.menteesCount}</strong>
            </div>

            <div>
              <span>Completed</span>
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

          <div className="mentor-cohort-details__dates">
            <div>
              <span>Start date</span>
              <strong>{formatDate(selectedCohort.startDate)}</strong>
            </div>

            <div>
              <span>Expected end date</span>
              <strong>{formatDate(selectedCohort.endDate)}</strong>
            </div>

            <div>
              <span>Next session</span>
              <strong>
                {selectedCohort.nextSession
                  ? formatDate(selectedCohort.nextSession)
                  : 'Not scheduled'}
              </strong>
            </div>
          </div>

          <div className="mentor-cohort-details__modules">
            <h3>Training modules</h3>

            <ul>
              {selectedCohort.trainingModules.map((module) => (
                <li key={module}>{module}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

export default MyCohortsPage