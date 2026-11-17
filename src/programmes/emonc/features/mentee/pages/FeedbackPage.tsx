
import { useMemo, useState } from 'react'
import { Search } from '@carbon/react'

import FeedbackSummary from '../components/feedback/FeedbackSummary'
import FeedbackCard from '../components/feedback/FeedbackCard'
import FeedbackDetails from '../components/feedback/FeedbackDetails'

import {
  menteeFeedbackData,
  menteeFeedbackProfile,
} from '../data/menteeFeedbackData'

import type {
  MenteeFeedback,
  MenteeFeedbackCategory,
} from '../data/menteeFeedbackData'

import '../styles/mentee-feedback.scss'

interface FeedbackPageProps {
  title: string
}

function FeedbackPage({ title }: FeedbackPageProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedCategory, setSelectedCategory] = useState<
    'All' | MenteeFeedbackCategory
  >('All')

  const [selectedFeedbackId, setSelectedFeedbackId] = useState<
    string | null
  >(null)

  const filteredFeedback = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return menteeFeedbackData.filter((feedback) => {
      const matchesSearch =
        feedback.title.toLowerCase().includes(normalizedSearch) ||
        feedback.message.toLowerCase().includes(normalizedSearch) ||
        feedback.author.toLowerCase().includes(normalizedSearch) ||
        (feedback.moduleTitle ?? '')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesCategory =
        selectedCategory === 'All' ||
        feedback.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const selectedFeedback = menteeFeedbackData.find(
    (feedback) => feedback.id === selectedFeedbackId,
  )

  const assessmentFeedbackCount = menteeFeedbackData.filter(
    (feedback) => feedback.category === 'Assessment',
  ).length

  const mentorObservationCount = menteeFeedbackData.filter(
    (feedback) => feedback.category === 'Mentor observation',
  ).length

  function handleView(feedback: MenteeFeedback) {
    setSelectedFeedbackId(feedback.id)
  }

  function handleBack() {
    setSelectedFeedbackId(null)
  }

  return (
    <main className="mentee-feedback-page">
      <header className="mentee-feedback-page__header">
        <div>
          <span className="mentee-feedback-page__eyebrow">
            MENTEE WORKSPACE
          </span>

          <h1>{title}</h1>

          <p>
            Review feedback, guidance and competency observations
            shared by your assigned mentor throughout your
            mentorship journey.
          </p>
        </div>

        <div className="mentee-feedback-page__context">
          <span>{menteeFeedbackProfile.cohort}</span>
          <strong>{menteeFeedbackProfile.facility}</strong>
        </div>
      </header>

      <FeedbackSummary
        totalFeedback={menteeFeedbackData.length}
        assessmentFeedback={assessmentFeedbackCount}
        mentorObservations={mentorObservationCount}
        competencyStatus={menteeFeedbackProfile.competencyStatus}
      />

      <section className="mentee-feedback-workspace">
        {selectedFeedback ? (
          <FeedbackDetails
            key={selectedFeedback.id}
            feedback={selectedFeedback}
            onBack={handleBack}
          />
        ) : (
          <>
            <div className="mentee-feedback-workspace__header">
              <div>
                <h2>Feedback and guidance</h2>
                <p>
                  Feedback recorded during your mentorship and
                  competency development.
                </p>
              </div>

              <span>
                {filteredFeedback.length}{' '}
                {filteredFeedback.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            <div className="mentee-feedback-filters">
              <div className="mentee-feedback-filters__search">
                <Search
                  size="lg"
                  labelText="Search feedback"
                  placeholder="Search feedback, mentor or module"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <div className="mentee-feedback-filters__field">
                <label htmlFor="mentee-feedback-category">
                  Feedback category
                </label>

                <select
                  id="mentee-feedback-category"
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value as
                        | 'All'
                        | MenteeFeedbackCategory,
                    )
                  }
                >
                  <option value="All">All feedback</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Mentor observation">
                    Mentor observations
                  </option>
                </select>
              </div>
            </div>

            {filteredFeedback.length > 0 ? (
              <div className="mentee-feedback-list">
                {filteredFeedback.map((feedback) => (
                  <FeedbackCard
                    key={feedback.id}
                    feedback={feedback}
                    onView={handleView}
                  />
                ))}
              </div>
            ) : (
              <div className="mentee-feedback-empty">
                <h3>No feedback found</h3>
                <p>
                  Try changing your search term or selecting another
                  feedback category.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="mentee-feedback-page__footer">
        <span>
          Feedback from your mentorship and competency records.
        </span>

        <span>
          {menteeFeedbackProfile.cohort}
        </span>
      </footer>
    </main>
  )
}

export default FeedbackPage
