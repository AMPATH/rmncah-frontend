import { useMemo, useState } from 'react'

import {
  Button,
  Tag,
} from '@carbon/react'

import {
  ArrowLeft,
} from '@carbon/icons-react'

import MenteeSummary from '../components/mentees/MenteeSummary'
import MenteeFilters from '../components/mentees/MenteeFilters'
import MenteeTable from '../components/mentees/MenteeTable'

import { mentorMenteesData } from '../data/mentorMenteesData'

import type { MentorMentee } from '../types/mentor.types'

import '../styles/mentor-mentees.scss'

interface MenteesPageProps {
  title: string
}

function MenteesPage({ title }: MenteesPageProps) {
  const [search, setSearch] = useState('')
  const [cohort, setCohort] = useState('All')
  const [competencyStatus, setCompetencyStatus] = useState('All')
  const [selectedMentee, setSelectedMentee] =
    useState<MentorMentee | null>(null)

  const filteredMentees = useMemo(() => {
    return mentorMenteesData.filter((mentee) => {
      const searchTerm = search.toLowerCase().trim()

      const matchesSearch =
        mentee.name.toLowerCase().includes(searchTerm) ||
        mentee.facility.toLowerCase().includes(searchTerm) ||
        mentee.email.toLowerCase().includes(searchTerm)

      const matchesCohort =
        cohort === 'All' || mentee.cohort === cohort

      const matchesStatus =
        competencyStatus === 'All' ||
        mentee.competencyStatus === competencyStatus

      return matchesSearch && matchesCohort && matchesStatus
    })
  }, [search, cohort, competencyStatus])

  const handleViewMentee = (mentee: MentorMentee) => {
    setSelectedMentee(mentee)
  }

  return (
    <div className="mentor-mentees">
      <header className="mentor-mentees__header">
        <div>
          <p className="mentor-mentees__eyebrow">
            MENTOR WORKSPACE
          </p>

          <h1>{title}</h1>

          <p>
            Monitor mentee learning progress, competency development,
            and follow-up needs across your assigned cohorts.
          </p>
        </div>
      </header>

      <MenteeSummary mentees={mentorMenteesData} />

      <section className="mentor-mentees__directory">
        <div className="mentor-mentees__section-header">
          <div>
            <h2>Mentee directory</h2>
            <p>
              View and monitor mentees assigned to your cohorts.
            </p>
          </div>

          <span className="mentor-mentees__count">
            {filteredMentees.length} mentees
          </span>
        </div>

        <MenteeFilters
          search={search}
          cohort={cohort}
          competencyStatus={competencyStatus}
          onSearchChange={setSearch}
          onCohortChange={setCohort}
          onCompetencyStatusChange={setCompetencyStatus}
        />

        <MenteeTable
          mentees={filteredMentees}
          onViewMentee={handleViewMentee}
        />
      </section>

      {selectedMentee && (
        <section className="mentee-details">
          <div className="mentee-details__header">
            <div>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={ArrowLeft}
                onClick={() => setSelectedMentee(null)}
              >
                Back to mentees
              </Button>

              <h2>{selectedMentee.name}</h2>
              <p>{selectedMentee.email}</p>
            </div>

            {selectedMentee.competencyStatus === 'Competent' ? (
              <Tag type="green">Competent</Tag>
            ) : selectedMentee.competencyStatus === 'Needs Support' ? (
              <Tag type="red">Needs Support</Tag>
            ) : (
              <Tag type="blue">In Progress</Tag>
            )}
          </div>

          <div className="mentee-details__grid">
            <article>
              <span>Facility</span>
              <strong>{selectedMentee.facility}</strong>
            </article>

            <article>
              <span>Cohort</span>
              <strong>{selectedMentee.cohort}</strong>
            </article>

            <article>
              <span>Professional role</span>
              <strong>{selectedMentee.role}</strong>
            </article>

            <article>
              <span>Last activity</span>
              <strong>
                {new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(
                  new Date(`${selectedMentee.lastActivity}T00:00:00`),
                )}
              </strong>
            </article>
          </div>

          <div className="mentee-details__progress">
            <div>
              <h3>Learning progress</h3>
              <strong>{selectedMentee.progress}%</strong>
            </div>

            <div className="mentee-details__progress-track">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, selectedMentee.progress),
                  )}%`,
                }}
              />
            </div>

            <p>
              {selectedMentee.modulesCompleted} of{' '}
              {selectedMentee.modulesAssigned} assigned modules completed.
            </p>
          </div>

          <div className="mentee-details__support">
            <h3>Mentor follow-up notes</h3>
            <p>{selectedMentee.supportNotes}</p>
          </div>
        </section>
      )}
    </div>
  )
}

export default MenteesPage